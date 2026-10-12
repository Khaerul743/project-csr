import {
  BadRequestError,
  ConflictError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { JwtService } from "@/common/jwt/jwt.service";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { InvitationRepository } from "./invitation.repository";
import {
  CreateInvitationDTO,
  AcceptInvitationDTO,
  AcceptInvitationResponseData,
  InvitationWithDetails,
} from "./invitation.interface";
import { Invitation } from "@/db/schema/invitations";
import { UserRole } from "@/db/schema/users";

export class InvitationService {
  private readonly logger = new AppLogger("InvitationService");

  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async sendCompanyInvitation(
    inviterId: string,
    companyId: string | null,
    dto: CreateInvitationDTO
  ): Promise<Invitation> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const targetEmail = dto.email.trim().toLowerCase();
    this.logger.info(`Sending invitation from company ${companyId} to ${targetEmail}`);

    // Cek apakah email tujuan sudah terdaftar di sistem
    const existingUser = await this.authRepository.findByEmail(targetEmail);
    if (existingUser) {
      if (existingUser.companyId === companyId) {
        throw new ConflictError("Pengguna dengan email ini sudah menjadi anggota perusahaan Anda");
      }
      if (existingUser.companyId || existingUser.partnerId) {
        throw new ConflictError("Pengguna dengan email ini sudah terdaftar di organisasi lain");
      }
    }

    // Cek apakah sudah ada undangan PENDING yang masih aktif
    const activeInvite = await this.invitationRepository.findActiveByEmailAndCompany(
      targetEmail,
      companyId
    );
    if (activeInvite) {
      throw new ConflictError(
        "Undangan pending untuk email ini masih aktif. Harap tunggu penerimaan atau batalkan undangan tersebut."
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    const invitation = await this.invitationRepository.createInvitation({
      companyId,
      partnerId: null,
      email: targetEmail,
      role: dto.role || "CSR_ADMIN",
      invitedBy: inviterId,
      status: "PENDING",
      token,
      expiresAt,
    });

    this.logger.info(`Invitation ${invitation.id} created successfully for ${targetEmail}`);
    return invitation;
  }

  async getCompanyInvitations(companyId: string | null): Promise<InvitationWithDetails[]> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    return this.invitationRepository.findByCompanyId(companyId);
  }

  async getMyPendingInvitations(userEmail: string): Promise<InvitationWithDetails[]> {
    return this.invitationRepository.findPendingByEmail(userEmail.trim().toLowerCase());
  }

  async acceptInvitation(
    userId: string,
    userEmail: string,
    userRole: UserRole,
    dto: AcceptInvitationDTO
  ): Promise<AcceptInvitationResponseData> {
    this.logger.info(`User ${userId} (${userEmail}) attempting to accept invitation`);

    // Hanya user di tahap STAGING yang dapat menerima undangan
    if (userRole !== "STAGING") {
      throw new ConflictError(
        `Akun Anda saat ini memiliki peran '${userRole}' dan sudah terhubung ke organisasi.`
      );
    }

    let invitation: Invitation | null = null;

    if (dto.invitationId) {
      invitation = await this.invitationRepository.findById(dto.invitationId);
    } else if (dto.token) {
      invitation = await this.invitationRepository.findByToken(dto.token);
    }

    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan atau token tidak valid");
    }

    if (invitation.status !== "PENDING") {
      throw new BadRequestError(
        `Undangan ini sudah tidak aktif (status: ${invitation.status}).`
      );
    }

    // Periksa kedaluwarsa
    if (new Date() > new Date(invitation.expiresAt)) {
      await this.invitationRepository.updateStatus(invitation.id, "EXPIRED");
      throw new BadRequestError(
        "Undangan ini telah kedaluwarsa. Silakan minta pimpinan perusahaan mengirim undangan baru."
      );
    }

    // Periksa kesesuaian email
    if (invitation.email.toLowerCase() !== userEmail.trim().toLowerCase()) {
      throw new ForBiddenError(
        `Undangan ini ditujukan untuk email ${invitation.email}, bukan untuk akun Anda (${userEmail}).`
      );
    }

    // Eksekusi transaksi database
    const { updatedUser, organization } = await this.invitationRepository.acceptInvitationTx(
      invitation.id,
      userId
    );

    this.logger.info(
      `Invitation ${invitation.id} accepted. User ${userId} promoted to ${updatedUser.role} in ${organization.name}`
    );

    // Buat JWT access token baru yang memuat role dan organisasi baru
    const accessToken = JwtService.sign({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      companyId: updatedUser.companyId,
      partnerId: updatedUser.partnerId,
    });

    const { password: _, ...safeUser } = updatedUser;

    return {
      user: safeUser,
      accessToken,
      organization,
    };
  }

  async rejectInvitation(userEmail: string, invitationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    if (invitation.email.toLowerCase() !== userEmail.trim().toLowerCase()) {
      throw new ForBiddenError("Undangan ini tidak ditujukan untuk email Anda");
    }

    if (invitation.status !== "PENDING") {
      throw new BadRequestError("Undangan ini sudah tidak aktif");
    }

    await this.invitationRepository.updateStatus(invitationId, "REJECTED");
    this.logger.info(`Invitation ${invitationId} rejected by ${userEmail}`);
  }

  async cancelInvitation(
    inviterCompanyId: string | null,
    invitationId: string
  ): Promise<void> {
    if (!inviterCompanyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan tidak ditemukan");
    }

    if (invitation.companyId !== inviterCompanyId) {
      throw new ForBiddenError("Undangan ini bukan milik perusahaan Anda");
    }

    await this.invitationRepository.cancelInvitation(invitationId, inviterCompanyId);
    this.logger.info(`Invitation ${invitationId} cancelled by company ${inviterCompanyId}`);
  }
}

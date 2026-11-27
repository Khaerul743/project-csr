import {
  BadRequestError,
  ConflictError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";
import {
  needPrioritizationService,
  NeedPrioritizationResponse,
  sdgRecommendationService,
  SdgRecommendationRequestDTO,
  SdgRecommendationResponse,
} from "@/modules/ai";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { emailService } from "@/common/email/email.service";
import { partnerRepository } from "@/modules/partners";
import { companyRepository } from "@/modules/companies";
import { templateService } from "@/modules/templates";
import { OpportunityRepository } from "./opportunity.repository";
import {
  CreateOpportunityDTO,
  UpdateOpportunityDTO,
  InvitePartnerDTO,
  OpportunityQueryDTO,
  OpportunityWithDetails,
  OpportunityInvitationWithDetails,
  PartnerOpportunityInvitation,
  CompanyOpportunityInvitation,
  NeedPrioritizationRequestDTO,
} from "./opportunity.interface";
import { Opportunity } from "@/db/schema/opportunities";
import { OpportunityInvitation } from "@/db/schema/opportunity-invitations";

export class OpportunityService {
  private readonly logger = new AppLogger("OpportunityService");

  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async createOpportunity(
    userId: string,
    companyId: string | null,
    dto: CreateOpportunityDTO
  ): Promise<Opportunity> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    this.logger.info(`Company ${companyId} creating opportunity: ${dto.title}`);

    const startDate = dto.startDate ? new Date(dto.startDate) : null;
    const endDate = dto.endDate ? new Date(dto.endDate) : null;
    const deadline = dto.deadline ? new Date(dto.deadline) : null;

    const estimatedBudget =
      dto.estimatedBudget !== undefined && dto.estimatedBudget !== null
        ? String(dto.estimatedBudget)
        : null;

    const created = await this.opportunityRepository.create({
      companyId,
      createdBy: userId,
      title: dto.title.trim(),
      description: dto.description.trim(),
      focusArea: dto.focusArea,
      targetCity: dto.targetCity?.trim() || null,
      targetProvince: dto.targetProvince?.trim() || null,
      estimatedBudget,
      startDate,
      endDate,
      deadline,
      bannerUrl: dto.bannerUrl || null,
      status: dto.status || "OPEN",
    });

    this.logger.info(`Opportunity created successfully: ${created.id}`);
    return created;
  }

  async updateOpportunity(
    opportunityId: string,
    companyId: string | null,
    dto: UpdateOpportunityDTO
  ): Promise<Opportunity> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const existing = await this.opportunityRepository.findById(opportunityId);
    if (!existing) {
      throw new NotFoundError("Opportunity tidak ditemukan");
    }

    if (existing.companyId !== companyId) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk mengubah opportunity ini");
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.description !== undefined) updateData.description = dto.description.trim();
    if (dto.focusArea !== undefined) updateData.focusArea = dto.focusArea;
    if (dto.targetCity !== undefined) updateData.targetCity = dto.targetCity?.trim() || null;
    if (dto.targetProvince !== undefined) updateData.targetProvince = dto.targetProvince?.trim() || null;
    if (dto.estimatedBudget !== undefined) {
      updateData.estimatedBudget = dto.estimatedBudget ? String(dto.estimatedBudget) : null;
    }
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.deadline !== undefined) updateData.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.bannerUrl !== undefined) updateData.bannerUrl = dto.bannerUrl || null;
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.opportunityRepository.update(opportunityId, updateData);
  }

  async deleteOpportunity(opportunityId: string, companyId: string | null): Promise<void> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const existing = await this.opportunityRepository.findById(opportunityId);
    if (!existing) {
      throw new NotFoundError("Opportunity tidak ditemukan");
    }

    if (existing.companyId !== companyId) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk menghapus opportunity ini");
    }

    await this.opportunityRepository.delete(opportunityId);
    this.logger.info(`Opportunity deleted: ${opportunityId}`);
  }

  async getOpportunityById(id: string): Promise<OpportunityWithDetails> {
    const opp = await this.opportunityRepository.findById(id);
    if (!opp) {
      throw new NotFoundError("Opportunity tidak ditemukan");
    }
    return opp;
  }

  async getPublicCatalog(query: OpportunityQueryDTO) {
    // Katalog publik default hanya menampilkan yang OPEN jika tidak ditentukan
    const status = query.status || "OPEN";
    return this.opportunityRepository.findAll({ ...query, status });
  }

  async getCompanyOpportunities(companyId: string | null, query: OpportunityQueryDTO) {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    return this.opportunityRepository.findAll({
      ...query,
      companyId,
    });
  }

  // --- Opportunity Invitations (Undang Mitra) ---

  private formatDeadlineIndonesia(date: Date | null | undefined): string {
    if (!date) return "sesuai jadwal yang ditentukan";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(date));
  }

  private async resolvePartnerRecipientEmails(
    partnerId: string,
    partnerOrgEmail?: string | null
  ): Promise<string[]> {
    const partnerUsers = await db
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.partnerId, partnerId), eq(users.status, "ACTIVE")));

    const recipientSet = new Set<string>();
    if (partnerOrgEmail && partnerOrgEmail.trim()) {
      recipientSet.add(partnerOrgEmail.trim().toLowerCase());
    }
    for (const u of partnerUsers) {
      if (u.email && u.email.trim()) {
        recipientSet.add(u.email.trim().toLowerCase());
      }
    }
    return Array.from(recipientSet);
  }

  private formatFocusAreaLabel(focusArea: string): string {
    const map: Record<string, string> = {
      LINGKUNGAN: "Lingkungan & Alam",
      PENDIDIKAN: "Pendidikan & Literasi",
      KESEHATAN: "Kesehatan Masyarakat",
      PEMBERDAYAAN_EKONOMI: "Pemberdayaan Ekonomi / UMKM",
      INFRASTRUKTUR_SOSIAL: "Infrastruktur Sosial",
      TANGGAP_BENCANA: "Tanggap Kemanusiaan & Bencana",
      LAINNYA: "Inisiatif Lainnya",
    };
    return map[focusArea] || focusArea;
  }

  private async syncAndNotifyOverdue(filter: {
    companyId?: string;
    partnerId?: string;
    opportunityId?: string;
  }): Promise<void> {
    try {
      const transitioned = await this.opportunityRepository.markOverdueInvitations(filter);
      if (transitioned.length === 0) return;

      const templateCache = new Map<string, string | null>();

      for (const item of transitioned) {
        try {
          const recipients = await this.resolvePartnerRecipientEmails(
            item.partnerId,
            item.partnerEmail
          );
          if (recipients.length === 0) continue;

          if (!templateCache.has(item.companyId)) {
            const tpl = await templateService.getDefaultTemplate(
              item.companyId,
              "INVITATION_OVERDUE"
            );
            templateCache.set(item.companyId, tpl?.content ?? null);
          }

          const rawTemplate = templateCache.get(item.companyId);
          const responseDeadlineText = this.formatDeadlineIndonesia(
            item.responseDeadline
          );

          let customBodyText: string | null = null;
          if (rawTemplate) {
            const locationParts = [item.targetCity, item.targetProvince].filter(
              (p) => Boolean(p && p.trim())
            );
            const locationText =
              locationParts.length > 0
                ? locationParts.join(", ")
                : "Seluruh Wilayah Indonesia";

            customBodyText = rawTemplate
              .replace(/\{\{nama_yayasan\}\}/gi, item.partnerName)
              .replace(/\{\{nama_mitra\}\}/gi, item.partnerName)
              .replace(/\{\{nama_perusahaan\}\}/gi, item.companyName)
              .replace(/\{\{nama_program\}\}/gi, item.programName)
              .replace(/\{\{bidang_csr\}\}/gi, this.formatFocusAreaLabel(item.focusArea))
              .replace(/\{\{lokasi_program\}\}/gi, locationText)
              .replace(/\{\{batas_respons\}\}/gi, responseDeadlineText)
              .replace(/\{\{nama_pic\}\}/gi, item.invitedByName || "Tim CSR")
              .replace(
                /\{\{jabatan_pic\}\}/gi,
                item.invitedByPosition || "CSR Administrator"
              );
          }

          await emailService.sendPartnerInvitationOverdueEmail({
            to: recipients,
            partnerName: item.partnerName,
            companyName: item.companyName,
            programName: item.programName,
            responseDeadlineText,
            customBodyText,
          });
        } catch (mailErr) {
          this.logger.error(
            `Failed to send overdue email for invitation ${item.invitationId}`,
            mailErr
          );
        }
      }
    } catch (syncErr) {
      this.logger.error("Failed to sync overdue invitations", syncErr);
    }
  }

  private async dispatchNewInvitationEmail(params: {
    invitationId: string;
    partnerId: string;
    partnerName: string;
    partnerEmail?: string | null;
    companyId: string;
    programTitle: string;
    deadlineDate: Date | null;
  }): Promise<void> {
    try {
      const [company, recipients] = await Promise.all([
        companyRepository.findById(params.companyId),
        this.resolvePartnerRecipientEmails(params.partnerId, params.partnerEmail),
      ]);

      if (recipients.length === 0) {
        this.logger.warn(
          `No email found for partner ${params.partnerId} (${params.partnerName}); invitation email skipped.`
        );
        return;
      }

      await emailService.sendPartnerInvitationEmail({
        to: recipients,
        partnerName: params.partnerName,
        companyName: company?.name || "Perusahaan Mitra",
        programName: params.programTitle,
        responseDeadlineText: this.formatDeadlineIndonesia(params.deadlineDate),
      });
    } catch (mailError) {
      this.logger.error(
        `Failed to dispatch partner invitation email for invitation ${params.invitationId}`,
        mailError
      );
    }
  }

  async invitePartner(
    opportunityId: string,
    inviterId: string,
    companyId: string | null,
    dto: InvitePartnerDTO
  ): Promise<OpportunityInvitation> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const opp = await this.opportunityRepository.findById(opportunityId);
    if (!opp) {
      throw new NotFoundError("Opportunity tidak ditemukan");
    }

    if (opp.companyId !== companyId) {
      throw new ForBiddenError("Opportunity ini bukan milik perusahaan Anda");
    }

    // Pastikan mitra yang diundang terdaftar
    const partner = await partnerRepository.findById(dto.partnerId);
    if (!partner) {
      throw new NotFoundError("Mitra tidak ditemukan");
    }

    // Sinkronkan status overdue terlebih dahulu sebelum cek duplikasi undangan
    await this.syncAndNotifyOverdue({ opportunityId });

    let parsedDeadline: Date | null = null;
    if (dto.responseDeadline) {
      const candidate = new Date(dto.responseDeadline);
      if (!isNaN(candidate.getTime())) {
        parsedDeadline = candidate;
      }
    }

    // Cek apakah sudah ada undangan untuk peluang & mitra ini
    const existingInvite = await this.opportunityRepository.findInvitation(
      opportunityId,
      dto.partnerId
    );

    if (existingInvite) {
      if (existingInvite.status === "INVITED" || existingInvite.status === "ACCEPTED") {
        throw new ConflictError(
          existingInvite.status === "ACCEPTED"
            ? "Mitra ini sudah menerima undangan untuk peluang CSR ini"
            : "Mitra ini sudah memiliki undangan aktif untuk peluang CSR ini"
        );
      }

      // Izinkan undang ulang jika undangan sebelumnya OVERDUE atau DECLINED
      this.logger.info(
        `Re-inviting partner ${dto.partnerId} to opportunity ${opportunityId} (previous status: ${existingInvite.status})`
      );

      const reinvited = await this.opportunityRepository.reinviteExistingInvitation(
        existingInvite.id,
        {
          invitedBy: inviterId,
          message: dto.message || null,
          responseDeadline: parsedDeadline,
        }
      );

      await this.dispatchNewInvitationEmail({
        invitationId: reinvited.id,
        partnerId: partner.id,
        partnerName: partner.name,
        partnerEmail: partner.email,
        companyId,
        programTitle: opp.title,
        deadlineDate: parsedDeadline || opp.deadline,
      });

      return reinvited;
    }

    this.logger.info(`Inviting partner ${dto.partnerId} to opportunity ${opportunityId}`);

    const createdInvitation = await this.opportunityRepository.createInvitation({
      opportunityId,
      companyId,
      partnerId: dto.partnerId,
      invitedBy: inviterId,
      message: dto.message || null,
      responseDeadline: parsedDeadline,
      status: "INVITED",
    });

    await this.dispatchNewInvitationEmail({
      invitationId: createdInvitation.id,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerEmail: partner.email,
      companyId,
      programTitle: opp.title,
      deadlineDate: parsedDeadline || opp.deadline,
    });

    return createdInvitation;
  }

  async getCompanyInvitations(
    companyId: string | null
  ): Promise<CompanyOpportunityInvitation[]> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    await this.syncAndNotifyOverdue({ companyId });
    return this.opportunityRepository.findInvitationsByCompany(companyId);
  }

  async getOpportunityInvitations(
    opportunityId: string,
    companyId: string | null
  ): Promise<OpportunityInvitationWithDetails[]> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const opp = await this.opportunityRepository.findById(opportunityId);
    if (!opp) {
      throw new NotFoundError("Opportunity tidak ditemukan");
    }

    if (opp.companyId !== companyId) {
      throw new ForBiddenError("Opportunity ini bukan milik perusahaan Anda");
    }

    await this.syncAndNotifyOverdue({ opportunityId });
    return this.opportunityRepository.findInvitationsByOpportunity(opportunityId);
  }

  async getPartnerInvitations(
    partnerId: string | null
  ): Promise<PartnerOpportunityInvitation[]> {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    await this.syncAndNotifyOverdue({ partnerId });
    return this.opportunityRepository.findInvitationsByPartner(partnerId);
  }

  async respondOpportunityInvitation(
    invitationId: string,
    partnerId: string | null,
    status: "ACCEPTED" | "DECLINED"
  ): Promise<OpportunityInvitation> {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    // Pastikan status overdue disinkronkan sebelum mitra merespons
    await this.syncAndNotifyOverdue({ partnerId });

    const invitation = await this.opportunityRepository.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan inisiatif tidak ditemukan");
    }

    if (invitation.partnerId !== partnerId) {
      throw new ForBiddenError("Undangan ini bukan ditujukan untuk organisasi Anda");
    }

    if (invitation.status === "OVERDUE") {
      throw new BadRequestError(
        "Undangan kolaborasi ini telah melewati batas waktu tanggapan (Overdue) dan dibatalkan otomatis."
      );
    }

    if (invitation.status !== "INVITED") {
      throw new BadRequestError("Undangan ini sudah Anda respons sebelumnya.");
    }

    this.logger.info(`Partner ${partnerId} responded ${status} to invitation ${invitationId}`);

    return this.opportunityRepository.updateInvitationStatus(invitationId, status);
  }

  async analyzeNeedPrioritization(
    companyId: string | null,
    dto: NeedPrioritizationRequestDTO
  ): Promise<NeedPrioritizationResponse> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    if (!isAiFeatureEnabled()) {
      throw new ForBiddenError(
        "Fitur AI sedang dinonaktifkan oleh administrator sistem (ENABLE_AI_FEATURES / NEXT_PUBLIC_ENABLE_AI = false)"
      );
    }

    const territoryData = await this.opportunityRepository.getTerritoryDataForPrioritization(
      companyId,
      dto.targetProvince,
      dto.targetCity,
      dto.excludeOpportunityId
    );

    return needPrioritizationService.analyze({
      targetProvince: dto.targetProvince,
      targetCity: dto.targetCity,
      selectedFocusArea: dto.focusArea || null,
      draftTitle: dto.title || null,
      draftDescription: dto.description || null,
      estimatedBudget: dto.estimatedBudget ?? null,
      fieldContextNotes: dto.fieldContextNotes || null,
      territoryData,
    });
  }

  async recommendSdgs(
    dto: SdgRecommendationRequestDTO
  ): Promise<SdgRecommendationResponse> {
    if (!isAiFeatureEnabled()) {
      throw new ForBiddenError(
        "Fitur AI sedang dinonaktifkan oleh administrator sistem (ENABLE_AI_FEATURES / NEXT_PUBLIC_ENABLE_AI = false)"
      );
    }

    return sdgRecommendationService.recommend(dto);
  }
}

import { BadRequestError, ConflictError, NotFoundError } from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { JwtService } from "@/common/jwt/jwt.service";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { PartnerRepository } from "./partner.repository";
import { CreatePartnerDTO, UpdatePartnerDTO, PartnerResponseData, PartnerListQuery } from "./partner.interface";
import { Partner } from "@/db/schema/partners";

export class PartnerService {
  private readonly logger = new AppLogger("PartnerService");

  constructor(
    private readonly partnerRepository: PartnerRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async createPartner(userId: string, dto: CreatePartnerDTO): Promise<PartnerResponseData> {
    this.logger.info(`User ${userId} attempting to create partner: ${dto.name}`);

    // Verify user exists
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // User must be in STAGING role
    if (user.role !== "STAGING") {
      throw new ConflictError(`User already has role '${user.role}' and cannot create a new partner`);
    }

    if (user.companyId || user.partnerId) {
      throw new ConflictError("User is already associated with an organization");
    }

    const { partner, updatedUser } = await this.partnerRepository.createPartnerWithAdmin(dto, userId);

    this.logger.info(`Partner ${partner.id} created successfully, user ${userId} promoted to PARTNER_ADMIN`);

    // Generate refreshed access token with new role and partnerId
    const accessToken = JwtService.sign({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      companyId: updatedUser.companyId,
      partnerId: updatedUser.partnerId,
    });

    const { password: _, ...safeUser } = updatedUser;

    return {
      partner,
      user: safeUser,
      accessToken,
    };
  }

  async getCurrentPartner(partnerId: string | null): Promise<Partner> {
    if (!partnerId) {
      throw new BadRequestError("User is not associated with any partner organization");
    }

    const partner = await this.partnerRepository.findById(partnerId);
    if (!partner) {
      throw new NotFoundError("Partner profile not found");
    }

    return partner;
  }

  async getPartnerById(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findById(id);
    if (!partner) {
      throw new NotFoundError("Partner not found");
    }
    return partner;
  }

  async getAllPartners(query: PartnerListQuery) {
    return this.partnerRepository.findAll(query);
  }

  async updatePartner(partnerId: string | null, dto: UpdatePartnerDTO): Promise<Partner> {
    if (!partnerId) {
      throw new BadRequestError("User is not associated with any partner organization");
    }

    const existing = await this.partnerRepository.findById(partnerId);
    if (!existing) {
      throw new NotFoundError("Partner not found");
    }

    return this.partnerRepository.updatePartner(partnerId, dto);
  }
}

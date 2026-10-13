import {
  BadRequestError,
  ConflictError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { partnerRepository } from "@/modules/partners";
import { OpportunityRepository } from "./opportunity.repository";
import {
  CreateOpportunityDTO,
  UpdateOpportunityDTO,
  InvitePartnerDTO,
  OpportunityQueryDTO,
  OpportunityWithDetails,
  OpportunityInvitationWithDetails,
  PartnerOpportunityInvitation,
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

    // Cek apakah sudah pernah diundang
    const existingInvite = await this.opportunityRepository.findInvitation(
      opportunityId,
      dto.partnerId
    );
    if (existingInvite) {
      throw new ConflictError("Mitra ini sudah pernah diundang untuk opportunity ini");
    }

    this.logger.info(`Inviting partner ${dto.partnerId} to opportunity ${opportunityId}`);

    return this.opportunityRepository.createInvitation({
      opportunityId,
      companyId,
      partnerId: dto.partnerId,
      invitedBy: inviterId,
      message: dto.message || null,
      status: "INVITED",
    });
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

    return this.opportunityRepository.findInvitationsByOpportunity(opportunityId);
  }

  async getPartnerInvitations(
    partnerId: string | null
  ): Promise<PartnerOpportunityInvitation[]> {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

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

    const invitation = await this.opportunityRepository.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundError("Undangan inisiatif tidak ditemukan");
    }

    if (invitation.partnerId !== partnerId) {
      throw new ForBiddenError("Undangan ini bukan ditujukan untuk organisasi Anda");
    }

    this.logger.info(`Partner ${partnerId} responded ${status} to invitation ${invitationId}`);

    return this.opportunityRepository.updateInvitationStatus(invitationId, status);
  }
}

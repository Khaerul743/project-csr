import {
  BadRequestError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { CollaborationRepository } from "./collaboration.repository";
import {
  UpdateCollaborationDTO,
  CollaborationListQuery,
  CollaborationWithDetails,
} from "./collaboration.interface";
import { Collaboration } from "@/db/schema/collaborations";

export class CollaborationService {
  private readonly logger = new AppLogger("CollaborationService");

  constructor(private readonly collaborationRepository: CollaborationRepository) {}

  async getCollaborationById(
    id: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ): Promise<CollaborationWithDetails> {
    const collaboration = await this.collaborationRepository.findById(id);
    if (!collaboration) {
      throw new NotFoundError("Kolaborasi tidak ditemukan");
    }

    const isCompanyMember = user.companyId && collaboration.companyId === user.companyId;
    const isPartnerMember = user.partnerId && collaboration.partnerId === user.partnerId;

    if (!isCompanyMember && !isPartnerMember) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk melihat data kolaborasi ini");
    }

    return collaboration;
  }

  async getCompanyCollaborations(
    companyId: string | null,
    query: CollaborationListQuery
  ) {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    return this.collaborationRepository.findByCompanyId(companyId, query);
  }

  async getPartnerCollaborations(
    partnerId: string | null,
    query: CollaborationListQuery
  ) {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    return this.collaborationRepository.findByPartnerId(partnerId, query);
  }

  async updateCollaboration(
    id: string,
    user: { companyId?: string | null; partnerId?: string | null },
    dto: UpdateCollaborationDTO
  ): Promise<Collaboration> {
    const existing = await this.collaborationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Kolaborasi tidak ditemukan");
    }

    const isCompanyMember = user.companyId && existing.companyId === user.companyId;
    const isPartnerMember = user.partnerId && existing.partnerId === user.partnerId;

    if (!isCompanyMember && !isPartnerMember) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk memperbarui kolaborasi ini");
    }

    if (existing.status === "CANCELLED") {
      throw new BadRequestError("Kolaborasi yang telah dibatalkan tidak dapat diperbarui");
    }

    this.logger.info(`Updating collaboration ${id} by user with status ${dto.status || existing.status}`);

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    const finalBudget =
      dto.finalBudget !== undefined && dto.finalBudget !== null
        ? String(dto.finalBudget).replace(/[^\d.]/g, "")
        : undefined;

    const updatePayload: any = {};
    if (finalBudget !== undefined) updatePayload.finalBudget = finalBudget;
    if (dto.targetBeneficiaries !== undefined) updatePayload.targetBeneficiaries = dto.targetBeneficiaries;
    if (startDate !== undefined) updatePayload.startDate = startDate;
    if (endDate !== undefined) updatePayload.endDate = endDate;
    if (dto.mouDocumentUrl !== undefined) updatePayload.mouDocumentUrl = dto.mouDocumentUrl;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;
    if (dto.status !== undefined) updatePayload.status = dto.status;

    // Jika difinalisasi menjadi AGREED
    if (dto.status === "AGREED") {
      return this.collaborationRepository.finalizeAgreement(id, updatePayload, existing);
    }

    return this.collaborationRepository.update(id, updatePayload);
  }
}

export const collaborationService = new CollaborationService(new CollaborationRepository());

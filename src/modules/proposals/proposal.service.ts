import {
  BadRequestError,
  ConflictError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { opportunityRepository } from "@/modules/opportunities";
import { ProposalRepository } from "./proposal.repository";
import {
  CreateProposalDTO,
  UpdateProposalDTO,
  ReviewProposalDTO,
  ProposalListQuery,
  ProposalWithDetails,
} from "./proposal.interface";
import { Proposal, NewProposal } from "@/db/schema/proposals";

export class ProposalService {
  private readonly logger = new AppLogger("ProposalService");

  constructor(private readonly proposalRepository: ProposalRepository) {}

  async submitProposal(
    userId: string,
    partnerId: string | null,
    dto: CreateProposalDTO
  ): Promise<Proposal> {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    this.logger.info(`Partner ${partnerId} submitting proposal for opportunity ${dto.opportunityId}`);

    // 1. Verifikasi opportunity
    const opp = await opportunityRepository.findById(dto.opportunityId);
    if (!opp) {
      throw new NotFoundError("Opportunity tidak ditemukan");
    }

    if (opp.status !== "OPEN" && opp.status !== "IN_REVIEW") {
      throw new BadRequestError(
        `Opportunity ini tidak menerima proposal baru (status: ${opp.status})`
      );
    }

    if (opp.deadline && new Date() > new Date(opp.deadline)) {
      throw new BadRequestError(
        "Batas waktu (deadline) pengajuan proposal untuk inisiatif ini telah berakhir"
      );
    }

    // 2. Cek apakah mitra sudah pernah mengajukan proposal yang masih aktif
    const existing = await this.proposalRepository.findActiveByPartnerAndOpportunity(
      partnerId,
      dto.opportunityId
    );
    if (existing) {
      throw new ConflictError(
        `Mitra Anda sudah memiliki proposal aktif untuk inisiatif ini (status: ${existing.status})`
      );
    }

    // 3. Simpan proposal
    const proposedBudget =
      typeof dto.proposedBudget === "number"
        ? String(dto.proposedBudget)
        : String(dto.proposedBudget).replace(/[^\d.]/g, "");

    const created = await this.proposalRepository.create({
      opportunityId: dto.opportunityId,
      partnerId,
      submittedBy: userId,
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      proposedBudget,
      durationMonths: dto.durationMonths || null,
      targetBeneficiaries: dto.targetBeneficiaries?.trim() || null,
      documentUrl: dto.documentUrl || null,
      status: "SUBMITTED",
    });

    this.logger.info(`Proposal ${created.id} submitted successfully`);
    return created;
  }

  async getProposalById(
    proposalId: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ): Promise<ProposalWithDetails> {
    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new NotFoundError("Proposal tidak ditemukan");
    }

    // Hanya perusahaan pemilik inisiatif atau mitra yang mengajukan yang boleh melihat detail proposal
    const isOwnerPartner = user.partnerId && proposal.partnerId === user.partnerId;
    const isTargetCompany = user.companyId && proposal.companyId === user.companyId;

    if (!isOwnerPartner && !isTargetCompany) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk melihat proposal ini");
    }

    return proposal;
  }

  async getPartnerProposals(partnerId: string | null, query: ProposalListQuery) {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    return this.proposalRepository.findByPartnerId(partnerId, query);
  }

  async getCompanyProposals(companyId: string | null, query: ProposalListQuery) {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    return this.proposalRepository.findByCompanyId(companyId, query);
  }

  async reviewProposal(
    proposalId: string,
    reviewerId: string,
    companyId: string | null,
    dto: ReviewProposalDTO
  ) {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new NotFoundError("Proposal tidak ditemukan");
    }

    if (proposal.companyId !== companyId) {
      throw new ForBiddenError(
        "Proposal ini bukan ditujukan untuk inisiatif perusahaan Anda"
      );
    }

    if (proposal.status === "ACCEPTED") {
      throw new BadRequestError(
        "Proposal ini telah disetujui sebelumnya dan sudah masuk tahap kolaborasi"
      );
    }

    if (proposal.status === "WITHDRAWN") {
      throw new BadRequestError(
        "Proposal ini telah ditarik oleh mitra pelaksana"
      );
    }

    this.logger.info(`Company ${companyId} reviewing proposal ${proposalId} to ${dto.status}`);

    // Jika disetujui, buat kolaborasi & perbarui status undangan
    if (dto.status === "ACCEPTED") {
      return await this.proposalRepository.acceptProposalWithCollaboration(
        proposal,
        reviewerId,
        dto.feedback
      );
    }

    // Jika UNDER_REVIEW atau REJECTED
    const updated = await this.proposalRepository.update(proposalId, {
      status: dto.status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      feedback: dto.feedback || null,
    });

    return { proposal: updated };
  }

  async updateProposal(
    proposalId: string,
    partnerId: string | null,
    dto: UpdateProposalDTO
  ): Promise<Proposal> {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new NotFoundError("Proposal tidak ditemukan");
    }

    if (proposal.partnerId !== partnerId) {
      throw new ForBiddenError("Anda bukan pemilik proposal ini");
    }

    const editableStatuses = ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"];
    if (!editableStatuses.includes(proposal.status)) {
      throw new BadRequestError(
        `Proposal dengan status '${proposal.status}' tidak dapat diubah lagi`
      );
    }

    this.logger.info(`Partner ${partnerId} updating proposal ${proposalId}`);

    const updatePayload: Partial<NewProposal> = {
      // Ketika mitra menyimpan revisi, kembalikan status ke SUBMITTED agar perusahaan tahu ada pembaruan untuk ditinjau
      status: "SUBMITTED",
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updatePayload.title = dto.title.trim();
    if (dto.summary !== undefined) updatePayload.summary = dto.summary.trim();
    if (dto.proposedBudget !== undefined) {
      const cleaned =
        typeof dto.proposedBudget === "number"
          ? String(dto.proposedBudget)
          : String(dto.proposedBudget).replace(/[^\d.]/g, "");
      updatePayload.proposedBudget = cleaned;
    }
    if (dto.durationMonths !== undefined) updatePayload.durationMonths = dto.durationMonths;
    if (dto.targetBeneficiaries !== undefined) {
      updatePayload.targetBeneficiaries = dto.targetBeneficiaries?.trim() || null;
    }
    if (dto.documentUrl !== undefined) {
      updatePayload.documentUrl = dto.documentUrl?.trim() || null;
    }

    return this.proposalRepository.update(proposalId, updatePayload);
  }

  async withdrawProposal(
    proposalId: string,
    partnerId: string | null
  ): Promise<Proposal> {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    const proposal = await this.proposalRepository.findById(proposalId);
    if (!proposal) {
      throw new NotFoundError("Proposal tidak ditemukan");
    }

    if (proposal.partnerId !== partnerId) {
      throw new ForBiddenError("Anda bukan pemilik proposal ini");
    }

    if (
      proposal.status !== "SUBMITTED" &&
      proposal.status !== "UNDER_REVIEW" &&
      proposal.status !== "REVISION_REQUESTED"
    ) {
      throw new BadRequestError(
        `Proposal dengan status '${proposal.status}' tidak dapat ditarik kembali`
      );
    }

    this.logger.info(`Partner ${partnerId} withdrawing proposal ${proposalId}`);

    return this.proposalRepository.update(proposalId, {
      status: "WITHDRAWN",
    });
  }
}

export const proposalService = new ProposalService(new ProposalRepository());

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
import { impactPredictionService } from "@/modules/ai/services/impact-prediction";
import { ImpactPredictionResponse } from "@/modules/ai/ai.interface";
import { db } from "@/db";
import { programs } from "@/db/schema/programs";
import { eq, and, count } from "drizzle-orm";

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

  async predictImpact(
    id: string,
    user: { companyId?: string | null; role: string }
  ): Promise<ImpactPredictionResponse> {
    const existing = await this.collaborationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Kolaborasi tidak ditemukan");
    }

    if (user.companyId && existing.companyId !== user.companyId) {
      throw new ForBiddenError("Anda tidak memiliki hak akses ke data kolaborasi ini");
    }

    // Ekstrak aktivitas & milestone dari proposal jika tersedia
    let milestones: Array<{ title: string; description?: string | null; targetTimeline?: string | null }> = [];
    let methodologySummary = existing.proposalSummary || "";
    if (existing.proposalSummary) {
      try {
        const parsed = JSON.parse(existing.proposalSummary);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.overview === "string") methodologySummary = parsed.overview;
          if (Array.isArray(parsed.activities)) {
            milestones = parsed.activities.map((a: any) => ({
              title: a.title || "Tahapan Kegiatan",
              description: a.description || null,
              targetTimeline: a.targetTimeline || null,
            }));
          }
        }
      } catch {
        // Plain text fallback
      }
    }

    // Hitung durasi bulan
    let durationMonths = existing.proposalDurationMonths || 3;
    if (existing.startDate && existing.endDate) {
      const start = new Date(existing.startDate);
      const end = new Date(existing.endDate);
      const diffMonths = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      durationMonths = diffMonths;
    }

    // Cek jumlah program CSR serupa di kota/kabupaten
    let existingProgramsCountInRegion = 0;
    let existingProgramsInSectorCount = 0;
    if (existing.opportunityTargetCity) {
      try {
        const [regCount] = await db
          .select({ count: count() })
          .from(programs)
          .where(eq(programs.targetCity, existing.opportunityTargetCity));
        existingProgramsCountInRegion = Number(regCount?.count || 0);

        if (existing.opportunityFocusArea) {
          const [secCount] = await db
            .select({ count: count() })
            .from(programs)
            .where(
              and(
                eq(programs.targetCity, existing.opportunityTargetCity),
                eq(programs.focusArea, existing.opportunityFocusArea as any)
              )
            );
          existingProgramsInSectorCount = Number(secCount?.count || 0);
        }
      } catch {
        // Non-blocking
      }
    }

    this.logger.info(`Menjalankan AI Impact Prediction untuk kolaborasi ${id}`);

    const prediction = await impactPredictionService.predictImpact({
      opportunityTitle: existing.opportunityTitle || "Inisiatif CSR",
      focusArea: existing.opportunityFocusArea || "Umum",
      targetCity: existing.opportunityTargetCity,
      targetProvince: existing.opportunityTargetProvince,
      opportunityDescription: existing.opportunityDescription,
      proposalTitle: existing.proposalTitle || "Proposal Program",
      partnerName: existing.partnerName || "Mitra Pelaksana",
      finalBudget: existing.finalBudget || existing.proposedBudget || "0",
      targetBeneficiaries: existing.targetBeneficiaries || existing.proposalTargetBeneficiaries || "Masyarakat Umum",
      startDate: existing.startDate,
      endDate: existing.endDate,
      durationMonths,
      methodologySummary,
      milestones,
      existingProgramsCountInRegion,
      existingProgramsInSectorCount,
    });

    await this.collaborationRepository.saveImpactPrediction(id, JSON.stringify(prediction));

    return prediction;
  }
}

export const collaborationService = new CollaborationService(new CollaborationRepository());

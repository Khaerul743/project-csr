import {
  BadRequestError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { ProgramRepository } from "./program.repository";
import {
  ProgramStageRepository,
  ProgramStageWithCount,
} from "./program-stage.repository";
import {
  SaveStagesDTO,
  UpdateStageDTO,
} from "./program-stage.validation";
import { milestoneExtractorService } from "@/modules/ai";
import { MilestoneExtractionResponse } from "@/modules/ai/ai.interface";
import { ProgramStage, NewProgramStage } from "@/db/schema/program-stages";

export class ProgramStageService {
  private readonly logger = new AppLogger("ProgramStageService");

  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly stageRepository: ProgramStageRepository
  ) {}

  private async verifyProgramAccess(
    programId: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ) {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    const isCompanyMember = !!user.companyId && program.companyId === user.companyId;
    const isPartnerMember = !!user.partnerId && program.partnerId === user.partnerId;

    if (!isCompanyMember && !isPartnerMember) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk program ini");
    }

    return program;
  }

  async getStagesByProgramId(
    programId: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ): Promise<ProgramStageWithCount[]> {
    await this.verifyProgramAccess(programId, user);
    return this.stageRepository.findByProgramId(programId);
  }

  async generateStagesFromProposal(
    programId: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ): Promise<MilestoneExtractionResponse> {
    await this.verifyProgramAccess(programId, user);

    const context = await this.stageRepository.findProgramProposalContext(programId);
    if (!context) {
      throw new NotFoundError("Data konteks program tidak ditemukan");
    }

    this.logger.info(`Menjalankan AI milestone extraction untuk program: "${context.program.title}"`);

    const result = await milestoneExtractorService.extractFromProposal({
      title: context.proposal?.title || context.program.title,
      summary: context.proposal?.summary || context.program.description || "",
      focusArea: context.program.focusArea || context.opportunity?.focusArea || "Umum",
      budget: context.proposal?.proposedBudget || context.program.budget,
      durationMonths: context.proposal?.durationMonths || 3,
      targetBeneficiaries:
        context.proposal?.targetBeneficiaries ||
        context.program.targetBeneficiaries ||
        "Masyarakat sasaran",
      documentUrl: context.proposal?.documentUrl || null,
    });

    return result;
  }

  async saveStages(
    programId: string,
    user: { companyId?: string | null; partnerId?: string | null },
    dto: SaveStagesDTO
  ): Promise<ProgramStageWithCount[]> {
    await this.verifyProgramAccess(programId, user);

    const existingStages = await this.stageRepository.findByProgramId(programId);
    const existingWithActivities = existingStages.filter((s) => s.activityCount > 0);

    if (dto.replaceExisting && existingWithActivities.length > 0) {
      throw new BadRequestError(
        `Terdapat ${existingWithActivities.length} tahapan yang sudah memiliki log kegiatan lapangan. Untuk menjaga integritas data, tahapan tersebut tidak dapat ditimpa otomatis. Ubah atau edit tahapan secara manual.`
      );
    }

    if (dto.replaceExisting && existingStages.length > 0) {
      await this.stageRepository.deleteByProgramId(programId);
    }

    const newStagesToInsert: NewProgramStage[] = dto.stages.map((st, index) => ({
      id: crypto.randomUUID(),
      programId,
      orderIndex: st.orderIndex || index + 1,
      title: st.title,
      description: st.description || null,
      targetTimeline: st.targetTimeline || null,
      expectedEvidence: st.expectedEvidence || null,
      suggestedKpi: st.suggestedKpi || null,
      status: st.status || "PENDING",
      source: st.source || "AI_GENERATED",
    }));

    await this.stageRepository.createBatch(newStagesToInsert);
    this.logger.info(
      `Berhasil menyimpan ${newStagesToInsert.length} tahapan untuk program ${programId}`
    );

    return this.stageRepository.findByProgramId(programId);
  }

  async updateStage(
    stageId: string,
    user: { companyId?: string | null; partnerId?: string | null },
    dto: UpdateStageDTO
  ): Promise<ProgramStage> {
    const stage = await this.stageRepository.findById(stageId);
    if (!stage) {
      throw new NotFoundError("Tahapan program tidak ditemukan");
    }

    await this.verifyProgramAccess(stage.programId, user);

    return this.stageRepository.update(stageId, {
      title: dto.title,
      description: dto.description,
      targetTimeline: dto.targetTimeline,
      expectedEvidence: dto.expectedEvidence,
      suggestedKpi: dto.suggestedKpi,
      status: dto.status,
      orderIndex: dto.orderIndex,
    });
  }

  async deleteStage(
    stageId: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ): Promise<void> {
    const stage = await this.stageRepository.findById(stageId);
    if (!stage) {
      throw new NotFoundError("Tahapan program tidak ditemukan");
    }

    await this.verifyProgramAccess(stage.programId, user);

    const stagesWithCount = await this.stageRepository.findByProgramId(stage.programId);
    const target = stagesWithCount.find((s) => s.id === stageId);

    if (target && target.activityCount > 0) {
      throw new BadRequestError(
        "Tahapan ini tidak dapat dihapus karena sudah memiliki log kegiatan lapangan terlampir"
      );
    }

    await this.stageRepository.delete(stageId);
    this.logger.info(`Tahapan ${stageId} berhasil dihapus`);
  }
}

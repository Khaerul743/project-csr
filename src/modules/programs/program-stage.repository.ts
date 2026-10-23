import { db } from "@/db";
import {
  programStages,
  ProgramStage,
  NewProgramStage,
} from "@/db/schema/program-stages";
import { programActivities } from "@/db/schema/program-activities";
import { programs } from "@/db/schema/programs";
import { collaborations } from "@/db/schema/collaborations";
import { proposals } from "@/db/schema/proposals";
import { opportunities } from "@/db/schema/opportunities";
import { eq, asc, count } from "drizzle-orm";

export interface ProgramStageWithCount extends ProgramStage {
  activityCount: number;
}

export interface ProgramProposalContext {
  program: {
    id: string;
    title: string;
    description: string | null;
    focusArea: string;
    budget: string;
    targetBeneficiaries: string | null;
    companyId: string;
    partnerId: string;
  };
  proposal: {
    id: string;
    title: string;
    summary: string;
    proposedBudget: string;
    durationMonths: number | null;
    targetBeneficiaries: string | null;
    documentUrl: string | null;
  } | null;
  opportunity: {
    id: string;
    title: string;
    focusArea: string;
  } | null;
}

export class ProgramStageRepository {
  async findByProgramId(programId: string): Promise<ProgramStageWithCount[]> {
    const rows = await db
      .select({
        id: programStages.id,
        programId: programStages.programId,
        orderIndex: programStages.orderIndex,
        title: programStages.title,
        description: programStages.description,
        targetTimeline: programStages.targetTimeline,
        expectedEvidence: programStages.expectedEvidence,
        suggestedKpi: programStages.suggestedKpi,
        status: programStages.status,
        source: programStages.source,
        createdAt: programStages.createdAt,
        updatedAt: programStages.updatedAt,
        activityCount: count(programActivities.id),
      })
      .from(programStages)
      .leftJoin(programActivities, eq(programStages.id, programActivities.stageId))
      .where(eq(programStages.programId, programId))
      .groupBy(programStages.id)
      .orderBy(asc(programStages.orderIndex));

    return rows.map((r) => ({
      ...r,
      activityCount: Number(r.activityCount || 0),
    }));
  }

  async findById(id: string): Promise<ProgramStage | null> {
    const rows = await db
      .select()
      .from(programStages)
      .where(eq(programStages.id, id))
      .limit(1);

    return rows[0] || null;
  }

  async createBatch(items: NewProgramStage[]): Promise<ProgramStage[]> {
    if (items.length === 0) return [];

    await db.insert(programStages).values(items);

    // Return the inserted stages
    return db
      .select()
      .from(programStages)
      .where(eq(programStages.programId, items[0].programId))
      .orderBy(asc(programStages.orderIndex));
  }

  async create(data: NewProgramStage): Promise<ProgramStage> {
    await db.insert(programStages).values(data);
    const created = await this.findById(data.id || "");
    if (!created) {
      throw new Error("Gagal membuat tahapan program");
    }
    return created;
  }

  async update(id: string, data: Partial<NewProgramStage>): Promise<ProgramStage> {
    await db
      .update(programStages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(programStages.id, id));

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Tahapan program tidak ditemukan setelah diperbarui");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(programStages).where(eq(programStages.id, id));
  }

  async deleteByProgramId(programId: string): Promise<void> {
    await db.delete(programStages).where(eq(programStages.programId, programId));
  }

  async findProgramProposalContext(
    programId: string
  ): Promise<ProgramProposalContext | null> {
    const rows = await db
      .select({
        programId: programs.id,
        programTitle: programs.title,
        programDescription: programs.description,
        programFocusArea: programs.focusArea,
        programBudget: programs.budget,
        programTargetBeneficiaries: programs.targetBeneficiaries,
        companyId: programs.companyId,
        partnerId: programs.partnerId,
        proposalId: proposals.id,
        proposalTitle: proposals.title,
        proposalSummary: proposals.summary,
        proposalBudget: proposals.proposedBudget,
        proposalDuration: proposals.durationMonths,
        proposalBeneficiaries: proposals.targetBeneficiaries,
        proposalDocumentUrl: proposals.documentUrl,
        opportunityId: opportunities.id,
        opportunityTitle: opportunities.title,
        opportunityFocusArea: opportunities.focusArea,
      })
      .from(programs)
      .leftJoin(collaborations, eq(programs.collaborationId, collaborations.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .where(eq(programs.id, programId))
      .limit(1);

    if (!rows[0]) return null;

    const r = rows[0];
    return {
      program: {
        id: r.programId,
        title: r.programTitle,
        description: r.programDescription,
        focusArea: r.programFocusArea,
        budget: r.programBudget,
        targetBeneficiaries: r.programTargetBeneficiaries,
        companyId: r.companyId,
        partnerId: r.partnerId,
      },
      proposal: r.proposalId
        ? {
            id: r.proposalId,
            title: r.proposalTitle!,
            summary: r.proposalSummary!,
            proposedBudget: r.proposalBudget!,
            durationMonths: r.proposalDuration,
            targetBeneficiaries: r.proposalBeneficiaries,
            documentUrl: r.proposalDocumentUrl,
          }
        : null,
      opportunity: r.opportunityId
        ? {
            id: r.opportunityId,
            title: r.opportunityTitle!,
            focusArea: r.opportunityFocusArea!,
          }
        : null,
    };
  }
}

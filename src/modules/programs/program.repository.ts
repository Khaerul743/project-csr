import { db } from "@/db";
import { programs, Program, NewProgram } from "@/db/schema/programs";
import { collaborations } from "@/db/schema/collaborations";
import { opportunities } from "@/db/schema/opportunities";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { programStages } from "@/db/schema/program-stages";
import { programActivities } from "@/db/schema/program-activities";
import { eq, and, or, like, desc, count, inArray } from "drizzle-orm";
import {
  ProgramWithDetails,
  ProgramListQuery,
  ProgramMetricsSummary,
} from "./program.interface";

export class ProgramRepository {
  private async enrichWithActivityStats(
    programsList: ProgramWithDetails[]
  ): Promise<ProgramWithDetails[]> {
    if (programsList.length === 0) return programsList;

    const programIds = programsList.map((p) => p.id);

    try {
      const [allStages, allActivities] = await Promise.all([
        db
          .select()
          .from(programStages)
          .where(inArray(programStages.programId, programIds)),
        db
          .select()
          .from(programActivities)
          .where(inArray(programActivities.programId, programIds)),
      ]);

      return programsList.map((prog) => {
        const stages = allStages
          .filter((s) => s.programId === prog.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        const activities = allActivities
          .filter((a) => a.programId === prog.id)
          .sort(
            (a, b) =>
              new Date(b.activityDate || b.createdAt).getTime() -
              new Date(a.activityDate || a.createdAt).getTime()
          );

        const totalActivitiesCount = stages.length > 0 ? stages.length : activities.length;
        const completedActivitiesCount =
          stages.length > 0
            ? stages.filter((s) => s.status === "COMPLETED").length
            : activities.filter((a) => a.status === "VERIFIED").length;

        const pendingVerificationCount = activities.filter(
          (a) => a.status === "SUBMITTED"
        ).length;
        const revisionRequestedReportsCount = activities.filter(
          (a) => a.status === "REVISION_REQUESTED"
        ).length;

        const pendingActivitiesCount = Math.max(
          0,
          totalActivitiesCount - completedActivitiesCount
        );

        const activityProgressPercent =
          totalActivitiesCount > 0
            ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100)
            : prog.status === "COMPLETED"
            ? 100
            : 0;

        // Next activity & timeline
        const nextStage = stages.find((s) => s.status !== "COMPLETED");
        const nextActivityTitle = nextStage ? nextStage.title : null;
        const nextActivityDate = nextStage?.targetTimeline || null;

        // Latest report
        const lastReport = activities[0] || null;
        const lastReportStatus = lastReport ? lastReport.status : null;
        const lastReportDate = lastReport
          ? (lastReport.activityDate || lastReport.createdAt).toISOString()
          : null;

        return {
          ...prog,
          totalActivitiesCount,
          completedActivitiesCount,
          pendingActivitiesCount,
          pendingVerificationCount,
          revisionRequestedReportsCount,
          activityProgressPercent,
          nextActivityTitle,
          nextActivityDate,
          lastReportStatus,
          lastReportDate,
        };
      });
    } catch {
      // Fallback silently if stages/activities table query encounters issue
      return programsList;
    }
  }

  async findById(id: string): Promise<ProgramWithDetails | null> {
    const rows = await db
      .select({
        program: programs,
        opportunityTitle: opportunities.title,
        opportunityDescription: opportunities.description,
        collaborationFinalBudget: collaborations.finalBudget,
        collaborationMouUrl: collaborations.mouDocumentUrl,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyCity: companies.city,
        companyEmail: companies.email,
        partnerName: partners.name,
        partnerLogo: partners.logoUrl,
        partnerCity: partners.city,
        partnerEmail: partners.email,
        partnerFocusArea: partners.focusArea,
      })
      .from(programs)
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .leftJoin(collaborations, eq(programs.collaborationId, collaborations.id))
      .leftJoin(companies, eq(programs.companyId, companies.id))
      .leftJoin(partners, eq(programs.partnerId, partners.id))
      .where(eq(programs.id, id))
      .limit(1);

    if (!rows[0]) return null;

    const r = rows[0];
    const baseItem: ProgramWithDetails = {
      ...r.program,
      opportunityTitle: r.opportunityTitle,
      opportunityDescription: r.opportunityDescription,
      collaborationFinalBudget: r.collaborationFinalBudget,
      collaborationMouUrl: r.collaborationMouUrl,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      companyCity: r.companyCity,
      companyEmail: r.companyEmail,
      partnerName: r.partnerName,
      partnerLogo: r.partnerLogo,
      partnerCity: r.partnerCity,
      partnerEmail: r.partnerEmail,
      partnerFocusArea: r.partnerFocusArea,
    };

    const [enriched] = await this.enrichWithActivityStats([baseItem]);
    return enriched || baseItem;
  }

  async findByCompanyId(
    companyId: string,
    query: ProgramListQuery
  ): Promise<{ data: ProgramWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(programs.companyId, companyId)];

    if (query.status) {
      conditions.push(eq(programs.status, query.status));
    }
    if (query.focusArea) {
      conditions.push(eq(programs.focusArea, query.focusArea));
    }
    if (query.search) {
      conditions.push(
        or(
          like(programs.title, `%${query.search}%`),
          like(partners.name, `%${query.search}%`),
          like(opportunities.title, `%${query.search}%`),
          like(programs.targetCity, `%${query.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(programs)
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .leftJoin(partners, eq(programs.partnerId, partners.id))
      .where(whereClause);

    const rows = await db
      .select({
        program: programs,
        opportunityTitle: opportunities.title,
        opportunityDescription: opportunities.description,
        collaborationFinalBudget: collaborations.finalBudget,
        collaborationMouUrl: collaborations.mouDocumentUrl,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyCity: companies.city,
        companyEmail: companies.email,
        partnerName: partners.name,
        partnerLogo: partners.logoUrl,
        partnerCity: partners.city,
        partnerEmail: partners.email,
        partnerFocusArea: partners.focusArea,
      })
      .from(programs)
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .leftJoin(collaborations, eq(programs.collaborationId, collaborations.id))
      .leftJoin(companies, eq(programs.companyId, companies.id))
      .leftJoin(partners, eq(programs.partnerId, partners.id))
      .where(whereClause)
      .orderBy(desc(programs.createdAt))
      .limit(limit)
      .offset(offset);

    const data: ProgramWithDetails[] = rows.map((r) => ({
      ...r.program,
      opportunityTitle: r.opportunityTitle,
      opportunityDescription: r.opportunityDescription,
      collaborationFinalBudget: r.collaborationFinalBudget,
      collaborationMouUrl: r.collaborationMouUrl,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      companyCity: r.companyCity,
      companyEmail: r.companyEmail,
      partnerName: r.partnerName,
      partnerLogo: r.partnerLogo,
      partnerCity: r.partnerCity,
      partnerEmail: r.partnerEmail,
      partnerFocusArea: r.partnerFocusArea,
    }));

    const enriched = await this.enrichWithActivityStats(data);

    return {
      data: enriched,
      total: totalRes?.count ?? 0,
      page,
      limit,
    };
  }

  async findByPartnerId(
    partnerId: string,
    query: ProgramListQuery
  ): Promise<{ data: ProgramWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(programs.partnerId, partnerId)];

    if (query.status) {
      conditions.push(eq(programs.status, query.status));
    }
    if (query.focusArea) {
      conditions.push(eq(programs.focusArea, query.focusArea));
    }
    if (query.search) {
      conditions.push(
        or(
          like(programs.title, `%${query.search}%`),
          like(companies.name, `%${query.search}%`),
          like(opportunities.title, `%${query.search}%`),
          like(programs.targetCity, `%${query.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(programs)
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .leftJoin(companies, eq(programs.companyId, companies.id))
      .where(whereClause);

    const rows = await db
      .select({
        program: programs,
        opportunityTitle: opportunities.title,
        opportunityDescription: opportunities.description,
        collaborationFinalBudget: collaborations.finalBudget,
        collaborationMouUrl: collaborations.mouDocumentUrl,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyCity: companies.city,
        companyEmail: companies.email,
        partnerName: partners.name,
        partnerLogo: partners.logoUrl,
        partnerCity: partners.city,
        partnerEmail: partners.email,
        partnerFocusArea: partners.focusArea,
      })
      .from(programs)
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .leftJoin(collaborations, eq(programs.collaborationId, collaborations.id))
      .leftJoin(companies, eq(programs.companyId, companies.id))
      .leftJoin(partners, eq(programs.partnerId, partners.id))
      .where(whereClause)
      .orderBy(desc(programs.createdAt))
      .limit(limit)
      .offset(offset);

    const data: ProgramWithDetails[] = rows.map((r) => ({
      ...r.program,
      opportunityTitle: r.opportunityTitle,
      opportunityDescription: r.opportunityDescription,
      collaborationFinalBudget: r.collaborationFinalBudget,
      collaborationMouUrl: r.collaborationMouUrl,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      companyCity: r.companyCity,
      companyEmail: r.companyEmail,
      partnerName: r.partnerName,
      partnerLogo: r.partnerLogo,
      partnerCity: r.partnerCity,
      partnerEmail: r.partnerEmail,
      partnerFocusArea: r.partnerFocusArea,
    }));

    const enriched = await this.enrichWithActivityStats(data);

    return {
      data: enriched,
      total: totalRes?.count ?? 0,
      page,
      limit,
    };
  }

  async update(id: string, data: Partial<NewProgram>): Promise<Program> {
    await db
      .update(programs)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id));

    const [updated] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);

    return updated;
  }

  async saveEsgReport(id: string, reportJson: string): Promise<void> {
    await db
      .update(programs)
      .set({
        sustainabilityReport: reportJson,
        reportGeneratedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id));
  }
}


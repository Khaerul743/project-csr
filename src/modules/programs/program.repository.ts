import { db } from "@/db";
import { programs, Program, NewProgram } from "@/db/schema/programs";
import { collaborations } from "@/db/schema/collaborations";
import { opportunities } from "@/db/schema/opportunities";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { eq, and, or, like, desc, count } from "drizzle-orm";
import {
  ProgramWithDetails,
  ProgramListQuery,
  ProgramMetricsSummary,
} from "./program.interface";

export class ProgramRepository {
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
    return {
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

    return {
      data,
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

    return {
      data,
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
}

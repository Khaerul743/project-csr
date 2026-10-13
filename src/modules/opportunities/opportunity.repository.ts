import { eq, and, or, like, desc, count, sql } from "drizzle-orm";
import { db } from "@/db";
import { opportunities, Opportunity, NewOpportunity } from "@/db/schema/opportunities";
import {
  opportunityInvitations,
  OpportunityInvitation,
  NewOpportunityInvitation,
} from "@/db/schema/opportunity-invitations";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { users } from "@/db/schema/users";
import { proposals } from "@/db/schema/proposals";
import {
  OpportunityQueryDTO,
  OpportunityWithDetails,
  OpportunityInvitationWithDetails,
  PartnerOpportunityInvitation,
} from "./opportunity.interface";

export class OpportunityRepository {
  async create(data: NewOpportunity): Promise<Opportunity> {
    const id = data.id || crypto.randomUUID();
    await db.insert(opportunities).values({
      ...data,
      id,
    });

    const result = await this.findById(id);
    if (!result) {
      throw new Error("Gagal mengambil data opportunity yang baru dibuat");
    }
    return result;
  }

  async findById(id: string): Promise<OpportunityWithDetails | null> {
    const rows = await db
      .select({
        opportunity: opportunities,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyCity: companies.city,
        createdByName: users.name,
      })
      .from(opportunities)
      .leftJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(users, eq(opportunities.createdBy, users.id))
      .where(eq(opportunities.id, id))
      .limit(1);

    if (!rows[0]) return null;

    // Hitung proposal & undangan
    const [propCount] = await db
      .select({ count: count() })
      .from(proposals)
      .where(eq(proposals.opportunityId, id));

    const [inviteCount] = await db
      .select({ count: count() })
      .from(opportunityInvitations)
      .where(eq(opportunityInvitations.opportunityId, id));

    return {
      ...rows[0].opportunity,
      companyName: rows[0].companyName,
      companyLogo: rows[0].companyLogo,
      companyCity: rows[0].companyCity,
      createdByName: rows[0].createdByName,
      totalProposals: Number(propCount?.count ?? 0),
      totalInvited: Number(inviteCount?.count ?? 0),
    };
  }

  async update(id: string, data: Partial<NewOpportunity>): Promise<Opportunity> {
    await db.update(opportunities).set(data).where(eq(opportunities.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Opportunity tidak ditemukan setelah pembaruan");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(opportunities).where(eq(opportunities.id, id));
  }

  async findAll(
    query: OpportunityQueryDTO
  ): Promise<{ data: OpportunityWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.companyId) {
      conditions.push(eq(opportunities.companyId, query.companyId));
    }

    if (query.status) {
      conditions.push(eq(opportunities.status, query.status));
    }

    if (query.focusArea) {
      conditions.push(eq(opportunities.focusArea, query.focusArea));
    }

    if (query.targetCity) {
      conditions.push(like(opportunities.targetCity, `%${query.targetCity}%`));
    }

    if (query.search) {
      conditions.push(
        or(
          like(opportunities.title, `%${query.search}%`),
          like(opportunities.description, `%${query.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(opportunities)
      .where(whereClause);

    const total = Number(totalResult?.count ?? 0);

    const rows = await db
      .select({
        opportunity: opportunities,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyCity: companies.city,
        createdByName: users.name,
      })
      .from(opportunities)
      .leftJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(users, eq(opportunities.createdBy, users.id))
      .where(whereClause)
      .orderBy(desc(opportunities.createdAt))
      .limit(limit)
      .offset(offset);

    const data: OpportunityWithDetails[] = rows.map((r) => ({
      ...r.opportunity,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      companyCity: r.companyCity,
      createdByName: r.createdByName,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // --- Opportunity Invitations ---

  async createInvitation(data: NewOpportunityInvitation): Promise<OpportunityInvitation> {
    const id = data.id || crypto.randomUUID();
    await db.insert(opportunityInvitations).values({
      ...data,
      id,
    });

    const [created] = await db
      .select()
      .from(opportunityInvitations)
      .where(eq(opportunityInvitations.id, id))
      .limit(1);

    if (!created) {
      throw new Error("Gagal mengambil data undangan opportunity");
    }
    return created;
  }

  async findInvitation(
    opportunityId: string,
    partnerId: string
  ): Promise<OpportunityInvitation | null> {
    const [result] = await db
      .select()
      .from(opportunityInvitations)
      .where(
        and(
          eq(opportunityInvitations.opportunityId, opportunityId),
          eq(opportunityInvitations.partnerId, partnerId)
        )
      )
      .limit(1);

    return result ?? null;
  }

  async findInvitationsByOpportunity(
    opportunityId: string
  ): Promise<OpportunityInvitationWithDetails[]> {
    const rows = await db
      .select({
        invitation: opportunityInvitations,
        partnerName: partners.name,
        partnerLogo: partners.logoUrl,
        partnerCity: partners.city,
        partnerFocusArea: partners.focusArea,
        invitedByName: users.name,
      })
      .from(opportunityInvitations)
      .leftJoin(partners, eq(opportunityInvitations.partnerId, partners.id))
      .leftJoin(users, eq(opportunityInvitations.invitedBy, users.id))
      .where(eq(opportunityInvitations.opportunityId, opportunityId))
      .orderBy(desc(opportunityInvitations.createdAt));

    return rows.map((r) => ({
      ...r.invitation,
      partnerName: r.partnerName,
      partnerLogo: r.partnerLogo,
      partnerCity: r.partnerCity,
      partnerFocusArea: r.partnerFocusArea,
      invitedByName: r.invitedByName,
    }));
  }

  async findInvitationsByPartner(
    partnerId: string
  ): Promise<PartnerOpportunityInvitation[]> {
    const rows = await db
      .select({
        invitation: opportunityInvitations,
        opportunityTitle: opportunities.title,
        opportunityDescription: opportunities.description,
        opportunityStatus: opportunities.status,
        opportunityFocusArea: opportunities.focusArea,
        opportunityBudget: opportunities.estimatedBudget,
        opportunityDeadline: opportunities.deadline,
        opportunityBanner: opportunities.bannerUrl,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyCity: companies.city,
        invitedByName: users.name,
      })
      .from(opportunityInvitations)
      .innerJoin(opportunities, eq(opportunityInvitations.opportunityId, opportunities.id))
      .leftJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(users, eq(opportunityInvitations.invitedBy, users.id))
      .where(eq(opportunityInvitations.partnerId, partnerId))
      .orderBy(desc(opportunityInvitations.createdAt));

    return rows.map((r) => ({
      ...r.invitation,
      opportunityTitle: r.opportunityTitle,
      opportunityDescription: r.opportunityDescription,
      opportunityStatus: r.opportunityStatus,
      opportunityFocusArea: r.opportunityFocusArea,
      opportunityBudget: r.opportunityBudget,
      opportunityDeadline: r.opportunityDeadline ? r.opportunityDeadline.toISOString() : null,
      opportunityBanner: r.opportunityBanner,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      companyCity: r.companyCity,
      invitedByName: r.invitedByName,
    }));
  }

  async findInvitationById(id: string): Promise<OpportunityInvitation | null> {
    const [invitation] = await db
      .select()
      .from(opportunityInvitations)
      .where(eq(opportunityInvitations.id, id))
      .limit(1);

    return invitation ?? null;
  }

  async updateInvitationStatus(
    id: string,
    status: "ACCEPTED" | "DECLINED"
  ): Promise<OpportunityInvitation> {
    await db
      .update(opportunityInvitations)
      .set({ status })
      .where(eq(opportunityInvitations.id, id));

    const [updated] = await db
      .select()
      .from(opportunityInvitations)
      .where(eq(opportunityInvitations.id, id))
      .limit(1);

    return updated;
  }
}


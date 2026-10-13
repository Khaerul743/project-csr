import { eq, and, or, like, desc, count, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { db } from "@/db";
import { proposals, Proposal, NewProposal } from "@/db/schema/proposals";
import { opportunities } from "@/db/schema/opportunities";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { users } from "@/db/schema/users";
import { collaborations } from "@/db/schema/collaborations";
import { opportunityInvitations } from "@/db/schema/opportunity-invitations";
import { ProposalListQuery, ProposalWithDetails } from "./proposal.interface";

const submitterUser = alias(users, "submitter_user");
const reviewerUser = alias(users, "reviewer_user");

export class ProposalRepository {
  async findById(id: string): Promise<ProposalWithDetails | null> {
    const rows = await db
      .select({
        proposal: proposals,
        opportunityTitle: opportunities.title,
        opportunityStatus: opportunities.status,
        companyId: opportunities.companyId,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        partnerName: partners.name,
        partnerEmail: partners.email,
        partnerCity: partners.city,
        partnerFocusArea: partners.focusArea,
        partnerLogo: partners.logoUrl,
        submittedByName: submitterUser.name,
        reviewedByName: reviewerUser.name,
      })
      .from(proposals)
      .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
      .leftJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(partners, eq(proposals.partnerId, partners.id))
      .leftJoin(submitterUser, eq(proposals.submittedBy, submitterUser.id))
      .leftJoin(reviewerUser, eq(proposals.reviewedBy, reviewerUser.id))
      .where(eq(proposals.id, id))
      .limit(1);

    if (!rows[0]) return null;

    const r = rows[0];
    return {
      ...r.proposal,
      opportunityTitle: r.opportunityTitle,
      opportunityStatus: r.opportunityStatus,
      companyId: r.companyId,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      partnerName: r.partnerName,
      partnerEmail: r.partnerEmail,
      partnerCity: r.partnerCity,
      partnerFocusArea: r.partnerFocusArea,
      partnerLogo: r.partnerLogo,
      submittedByName: r.submittedByName,
      reviewedByName: r.reviewedByName,
    };
  }

  async findActiveByPartnerAndOpportunity(
    partnerId: string,
    opportunityId: string
  ): Promise<Proposal | null> {
    const result = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.partnerId, partnerId),
          eq(proposals.opportunityId, opportunityId),
          inArray(proposals.status, ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED"])
        )
      )
      .limit(1);

    return result[0] || null;
  }

  async create(data: NewProposal): Promise<Proposal> {
    const id = data.id || crypto.randomUUID();
    await db.insert(proposals).values({
      ...data,
      id,
    });

    const created = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id))
      .limit(1);

    if (!created[0]) {
      throw new Error("Gagal membuat proposal");
    }

    return created[0];
  }

  async update(id: string, data: Partial<NewProposal>): Promise<Proposal> {
    await db.update(proposals).set(data).where(eq(proposals.id, id));

    const updated = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id))
      .limit(1);

    if (!updated[0]) {
      throw new Error("Proposal tidak ditemukan setelah diperbarui");
    }

    return updated[0];
  }

  async findByPartnerId(
    partnerId: string,
    query: ProposalListQuery
  ): Promise<{ data: ProposalWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(proposals.partnerId, partnerId)];

    if (query.opportunityId) {
      conditions.push(eq(proposals.opportunityId, query.opportunityId));
    }
    if (query.status) {
      conditions.push(eq(proposals.status, query.status));
    }
    if (query.search) {
      conditions.push(
        or(
          like(proposals.title, `%${query.search}%`),
          like(opportunities.title, `%${query.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(proposals)
      .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
      .where(whereClause);

    const total = Number(totalRes?.count ?? 0);

    const rows = await db
      .select({
        proposal: proposals,
        opportunityTitle: opportunities.title,
        opportunityStatus: opportunities.status,
        companyId: opportunities.companyId,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        partnerName: partners.name,
        partnerEmail: partners.email,
        partnerCity: partners.city,
        partnerFocusArea: partners.focusArea,
        partnerLogo: partners.logoUrl,
        submittedByName: submitterUser.name,
        reviewedByName: reviewerUser.name,
      })
      .from(proposals)
      .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
      .leftJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(partners, eq(proposals.partnerId, partners.id))
      .leftJoin(submitterUser, eq(proposals.submittedBy, submitterUser.id))
      .leftJoin(reviewerUser, eq(proposals.reviewedBy, reviewerUser.id))
      .where(whereClause)
      .orderBy(desc(proposals.createdAt))
      .limit(limit)
      .offset(offset);

    const data: ProposalWithDetails[] = rows.map((r) => ({
      ...r.proposal,
      opportunityTitle: r.opportunityTitle,
      opportunityStatus: r.opportunityStatus,
      companyId: r.companyId,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      partnerName: r.partnerName,
      partnerEmail: r.partnerEmail,
      partnerCity: r.partnerCity,
      partnerFocusArea: r.partnerFocusArea,
      partnerLogo: r.partnerLogo,
      submittedByName: r.submittedByName,
      reviewedByName: r.reviewedByName,
    }));

    return { data, total, page, limit };
  }

  async findByCompanyId(
    companyId: string,
    query: ProposalListQuery
  ): Promise<{ data: ProposalWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(opportunities.companyId, companyId)];

    if (query.opportunityId) {
      conditions.push(eq(proposals.opportunityId, query.opportunityId));
    }
    if (query.status) {
      conditions.push(eq(proposals.status, query.status));
    }
    if (query.search) {
      conditions.push(
        or(
          like(proposals.title, `%${query.search}%`),
          like(partners.name, `%${query.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(proposals)
      .innerJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
      .leftJoin(partners, eq(proposals.partnerId, partners.id))
      .where(whereClause);

    const total = Number(totalRes?.count ?? 0);

    const rows = await db
      .select({
        proposal: proposals,
        opportunityTitle: opportunities.title,
        opportunityStatus: opportunities.status,
        companyId: opportunities.companyId,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        partnerName: partners.name,
        partnerEmail: partners.email,
        partnerCity: partners.city,
        partnerFocusArea: partners.focusArea,
        partnerLogo: partners.logoUrl,
        submittedByName: submitterUser.name,
        reviewedByName: reviewerUser.name,
      })
      .from(proposals)
      .innerJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
      .leftJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(partners, eq(proposals.partnerId, partners.id))
      .leftJoin(submitterUser, eq(proposals.submittedBy, submitterUser.id))
      .leftJoin(reviewerUser, eq(proposals.reviewedBy, reviewerUser.id))
      .where(whereClause)
      .orderBy(desc(proposals.createdAt))
      .limit(limit)
      .offset(offset);

    const data: ProposalWithDetails[] = rows.map((r) => ({
      ...r.proposal,
      opportunityTitle: r.opportunityTitle,
      opportunityStatus: r.opportunityStatus,
      companyId: r.companyId,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      partnerName: r.partnerName,
      partnerEmail: r.partnerEmail,
      partnerCity: r.partnerCity,
      partnerFocusArea: r.partnerFocusArea,
      partnerLogo: r.partnerLogo,
      submittedByName: r.submittedByName,
      reviewedByName: r.reviewedByName,
    }));

    return { data, total, page, limit };
  }

  async acceptProposalWithCollaboration(
    proposal: ProposalWithDetails,
    reviewerId: string,
    feedback?: string | null
  ) {
    return await db.transaction(async (tx) => {
      // 1. Update proposal status
      await tx
        .update(proposals)
        .set({
          status: "ACCEPTED",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          feedback: feedback || null,
        })
        .where(eq(proposals.id, proposal.id));

      // 2. Insert new collaboration record in status NEGOTIATION
      const collaborationId = crypto.randomUUID();
      await tx.insert(collaborations).values({
        id: collaborationId,
        opportunityId: proposal.opportunityId,
        proposalId: proposal.id,
        companyId: proposal.companyId!,
        partnerId: proposal.partnerId,
        finalBudget: proposal.proposedBudget,
        targetBeneficiaries: proposal.targetBeneficiaries,
        status: "NEGOTIATION",
      });

      // 3. If there was an opportunity invitation for this partner, mark it ACCEPTED
      await tx
        .update(opportunityInvitations)
        .set({ status: "ACCEPTED" })
        .where(
          and(
            eq(opportunityInvitations.opportunityId, proposal.opportunityId),
            eq(opportunityInvitations.partnerId, proposal.partnerId)
          )
        );

      const [updatedProposal] = await tx
        .select()
        .from(proposals)
        .where(eq(proposals.id, proposal.id))
        .limit(1);

      const [createdCollab] = await tx
        .select()
        .from(collaborations)
        .where(eq(collaborations.id, collaborationId))
        .limit(1);

      return {
        proposal: updatedProposal,
        collaboration: createdCollab,
      };
    });
  }
}

export const proposalRepository = new ProposalRepository();

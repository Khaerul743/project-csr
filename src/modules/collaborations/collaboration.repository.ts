import { eq, and, or, like, desc, count } from "drizzle-orm";
import { db } from "@/db";
import { collaborations, Collaboration, NewCollaboration } from "@/db/schema/collaborations";
import { opportunities } from "@/db/schema/opportunities";
import { proposals } from "@/db/schema/proposals";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { programs } from "@/db/schema/programs";
import { CollaborationListQuery, CollaborationWithDetails } from "./collaboration.interface";

export class CollaborationRepository {
  async findById(id: string): Promise<CollaborationWithDetails | null> {
    const rows = await db
      .select({
        collaboration: collaborations,
        opportunityTitle: opportunities.title,
        opportunityFocusArea: opportunities.focusArea,
        opportunityTargetCity: opportunities.targetCity,
        proposalTitle: proposals.title,
        proposalSummary: proposals.summary,
        proposedBudget: proposals.proposedBudget,
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
      .from(collaborations)
      .leftJoin(opportunities, eq(collaborations.opportunityId, opportunities.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .leftJoin(companies, eq(collaborations.companyId, companies.id))
      .leftJoin(partners, eq(collaborations.partnerId, partners.id))
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!rows[0]) return null;

    const r = rows[0];
    return {
      ...r.collaboration,
      opportunityTitle: r.opportunityTitle,
      opportunityFocusArea: r.opportunityFocusArea,
      opportunityTargetCity: r.opportunityTargetCity,
      proposalTitle: r.proposalTitle,
      proposalSummary: r.proposalSummary,
      proposedBudget: r.proposedBudget,
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
    query: CollaborationListQuery
  ): Promise<{ data: CollaborationWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(collaborations.companyId, companyId)];

    if (query.status) {
      conditions.push(eq(collaborations.status, query.status));
    }
    if (query.search) {
      conditions.push(
        or(
          like(opportunities.title, `%${query.search}%`),
          like(partners.name, `%${query.search}%`),
          like(proposals.title, `%${query.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(collaborations)
      .leftJoin(opportunities, eq(collaborations.opportunityId, opportunities.id))
      .leftJoin(partners, eq(collaborations.partnerId, partners.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .where(whereClause);

    const total = Number(totalRes?.count ?? 0);

    const rows = await db
      .select({
        collaboration: collaborations,
        opportunityTitle: opportunities.title,
        opportunityFocusArea: opportunities.focusArea,
        opportunityTargetCity: opportunities.targetCity,
        proposalTitle: proposals.title,
        proposalSummary: proposals.summary,
        proposedBudget: proposals.proposedBudget,
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
      .from(collaborations)
      .leftJoin(opportunities, eq(collaborations.opportunityId, opportunities.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .leftJoin(companies, eq(collaborations.companyId, companies.id))
      .leftJoin(partners, eq(collaborations.partnerId, partners.id))
      .where(whereClause)
      .orderBy(desc(collaborations.createdAt))
      .limit(limit)
      .offset(offset);

    const data: CollaborationWithDetails[] = rows.map((r) => ({
      ...r.collaboration,
      opportunityTitle: r.opportunityTitle,
      opportunityFocusArea: r.opportunityFocusArea,
      opportunityTargetCity: r.opportunityTargetCity,
      proposalTitle: r.proposalTitle,
      proposalSummary: r.proposalSummary,
      proposedBudget: r.proposedBudget,
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

    return { data, total, page, limit };
  }

  async findByPartnerId(
    partnerId: string,
    query: CollaborationListQuery
  ): Promise<{ data: CollaborationWithDetails[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [eq(collaborations.partnerId, partnerId)];

    if (query.status) {
      conditions.push(eq(collaborations.status, query.status));
    }
    if (query.search) {
      conditions.push(
        or(
          like(opportunities.title, `%${query.search}%`),
          like(companies.name, `%${query.search}%`),
          like(proposals.title, `%${query.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalRes] = await db
      .select({ count: count() })
      .from(collaborations)
      .leftJoin(opportunities, eq(collaborations.opportunityId, opportunities.id))
      .leftJoin(companies, eq(collaborations.companyId, companies.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .where(whereClause);

    const total = Number(totalRes?.count ?? 0);

    const rows = await db
      .select({
        collaboration: collaborations,
        opportunityTitle: opportunities.title,
        opportunityFocusArea: opportunities.focusArea,
        opportunityTargetCity: opportunities.targetCity,
        proposalTitle: proposals.title,
        proposalSummary: proposals.summary,
        proposedBudget: proposals.proposedBudget,
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
      .from(collaborations)
      .leftJoin(opportunities, eq(collaborations.opportunityId, opportunities.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .leftJoin(companies, eq(collaborations.companyId, companies.id))
      .leftJoin(partners, eq(collaborations.partnerId, partners.id))
      .where(whereClause)
      .orderBy(desc(collaborations.createdAt))
      .limit(limit)
      .offset(offset);

    const data: CollaborationWithDetails[] = rows.map((r) => ({
      ...r.collaboration,
      opportunityTitle: r.opportunityTitle,
      opportunityFocusArea: r.opportunityFocusArea,
      opportunityTargetCity: r.opportunityTargetCity,
      proposalTitle: r.proposalTitle,
      proposalSummary: r.proposalSummary,
      proposedBudget: r.proposedBudget,
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

    return { data, total, page, limit };
  }

  async update(id: string, data: Partial<NewCollaboration>): Promise<Collaboration> {
    await db.update(collaborations).set(data).where(eq(collaborations.id, id));

    const [updated] = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!updated) {
      throw new Error("Kolaborasi tidak ditemukan setelah diperbarui");
    }

    return updated;
  }

  async finalizeAgreement(
    id: string,
    data: Partial<NewCollaboration>,
    collabDetails: CollaborationWithDetails
  ): Promise<Collaboration> {
    return await db.transaction(async (tx) => {
      const updatePayload: Partial<NewCollaboration> = {
        ...data,
        status: "AGREED",
        agreedAt: new Date(),
      };

      await tx.update(collaborations).set(updatePayload).where(eq(collaborations.id, id));

      // Otomatis inisialisasi entri program di tabel programs jika belum ada
      const existingProg = await tx
        .select()
        .from(programs)
        .where(eq(programs.collaborationId, id))
        .limit(1);

      if (!existingProg[0]) {
        const finalBudget = data.finalBudget || collabDetails.finalBudget || "0";
        await tx.insert(programs).values({
          id: crypto.randomUUID(),
          collaborationId: id,
          opportunityId: collabDetails.opportunityId,
          companyId: collabDetails.companyId,
          partnerId: collabDetails.partnerId,
          title: collabDetails.proposalTitle || collabDetails.opportunityTitle || "Program Kemitraan CSR",
          description: collabDetails.proposalSummary || null,
          focusArea: (collabDetails.opportunityFocusArea as any) || "LAINNYA",
          budget: finalBudget,
          spentBudget: "0",
          targetBeneficiaries: data.targetBeneficiaries || collabDetails.targetBeneficiaries || null,
          targetCity: collabDetails.opportunityTargetCity || null,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          status: "PLANNED",
        });
      }

      const [updated] = await tx
        .select()
        .from(collaborations)
        .where(eq(collaborations.id, id))
        .limit(1);

      return updated;
    });
  }
}

export const collaborationRepository = new CollaborationRepository();

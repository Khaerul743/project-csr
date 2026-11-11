import { eq, and, or, like, desc, count, inArray, ne, isNotNull } from "drizzle-orm";
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
import { programs } from "@/db/schema/programs";
import { programReviews } from "@/db/schema/program-reviews";
import { programActivities } from "@/db/schema/program-activities";
import { csrFocusAreaEnum, CsrFocusArea } from "@/db/schema/csr-focus-areas";
import {
  TerritoryDataCoverage,
  TerritoryDataSnapshot,
  TerritoryPartnerSectorCount,
  TerritoryProgramAggregateItem,
} from "@/modules/ai";
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

  private normalizeLocationToken(raw: string): string {
    const cleaned = raw
      .replace(/^(Kab\.|Kabupaten|Kota|Provinsi|DKI|D\.I\.|DI)\s+/gi, "")
      .trim();
    return cleaned.length >= 2 ? cleaned : raw.trim();
  }

  async getTerritoryDataForPrioritization(
    companyId: string,
    targetProvince: string,
    targetCity: string,
    excludeOpportunityId?: string | null
  ): Promise<TerritoryDataSnapshot> {
    const normProv = this.normalizeLocationToken(targetProvince);
    const normCity = this.normalizeLocationToken(targetCity);
    const provPattern = `%${normProv}%`;
    const cityPattern = `%${normCity}%`;
    const normCityLower = normCity.toLowerCase();

    const isCityMatch = (cityVal: string | null | undefined): boolean => {
      if (!cityVal) return false;
      const candidate = this.normalizeLocationToken(cityVal).toLowerCase();
      return candidate === normCityLower || candidate.includes(normCityLower) || normCityLower.includes(candidate);
    };

    const [
      [companyRow],
      [ownOppCountRow],
      ownProgramRows,
      regionalProgramsRows,
      regionalOppRows,
      regionalReviewRows,
      regionalActivityRows,
      regionalPartnerRows,
    ] = await Promise.all([
      db
        .select({
          id: companies.id,
          name: companies.name,
          industry: companies.industry,
          csrVision: companies.csrVision,
        })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1),
      db
        .select({ count: count() })
        .from(opportunities)
        .where(eq(opportunities.companyId, companyId)),
      db
        .select({
          id: programs.id,
          focusArea: programs.focusArea,
        })
        .from(programs)
        .where(eq(programs.companyId, companyId)),
      db
        .select({
          id: programs.id,
          title: programs.title,
          focusArea: programs.focusArea,
          status: programs.status,
          targetCity: programs.targetCity,
          targetProvince: programs.targetProvince,
          targetBeneficiaries: programs.targetBeneficiaries,
        })
        .from(programs)
        .where(
          and(
            ne(programs.status, "CANCELLED"),
            or(
              like(programs.targetProvince, provPattern),
              like(programs.targetCity, cityPattern)
            )
          )
        )
        .orderBy(desc(programs.createdAt))
        .limit(100),
      db
        .select({
          id: opportunities.id,
          title: opportunities.title,
          focusArea: opportunities.focusArea,
          targetCity: opportunities.targetCity,
          targetProvince: opportunities.targetProvince,
          status: opportunities.status,
        })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.status, ["OPEN", "IN_REVIEW"]),
            excludeOpportunityId ? ne(opportunities.id, excludeOpportunityId) : undefined,
            or(
              like(opportunities.targetProvince, provPattern),
              like(opportunities.targetCity, cityPattern)
            )
          )
        )
        .orderBy(desc(opportunities.createdAt))
        .limit(50),
      db
        .select({
          rating: programReviews.rating,
          comment: programReviews.comment,
          sentiment: programReviews.sentiment,
          reviewerRole: programReviews.reviewerRole,
          reviewerCity: programReviews.reviewerCity,
          programFocusArea: programs.focusArea,
          createdAt: programReviews.createdAt,
        })
        .from(programReviews)
        .innerJoin(programs, eq(programReviews.programId, programs.id))
        .where(
          or(
            like(programs.targetProvince, provPattern),
            like(programs.targetCity, cityPattern),
            like(programReviews.reviewerCity, cityPattern)
          )
        )
        .orderBy(desc(programReviews.createdAt))
        .limit(80),
      db
        .select({
          locationName: programActivities.location,
          title: programActivities.title,
          focusArea: programs.focusArea,
        })
        .from(programActivities)
        .innerJoin(programs, eq(programActivities.programId, programs.id))
        .where(
          and(
            isNotNull(programActivities.location),
            or(
              like(programs.targetProvince, provPattern),
              like(programs.targetCity, cityPattern)
            )
          )
        )
        .orderBy(desc(programActivities.activityDate))
        .limit(15),
      db
        .select({
          focusArea: partners.focusArea,
          city: partners.city,
          isVerified: partners.isVerified,
        })
        .from(partners)
        .where(
          and(
            eq(partners.status, "ACTIVE"),
            or(
              like(partners.province, provPattern),
              like(partners.city, cityPattern)
            )
          )
        )
        .limit(100),
    ]);

    // Agregasi program per sektor secara anonim
    const sectorProgramMap = new Map<CsrFocusArea, TerritoryProgramAggregateItem>();
    csrFocusAreaEnum.forEach((area) => {
      sectorProgramMap.set(area, {
        focusArea: area,
        cityProgramsCount: 0,
        provinceProgramsCount: 0,
        activeOrPlannedCount: 0,
        completedCount: 0,
        sampleThemes: [],
        sampleBeneficiaries: [],
      });
    });

    let programsInCity = 0;
    for (const row of regionalProgramsRows) {
      const bucket = sectorProgramMap.get(row.focusArea);
      if (!bucket) continue;

      const matchesCity = isCityMatch(row.targetCity);
      if (matchesCity) {
        bucket.cityProgramsCount += 1;
        programsInCity += 1;
      }
      bucket.provinceProgramsCount += 1;
      if (row.status === "COMPLETED") {
        bucket.completedCount += 1;
      } else {
        bucket.activeOrPlannedCount += 1;
      }
      if (row.title && bucket.sampleThemes.length < 4 && !bucket.sampleThemes.includes(row.title)) {
        bucket.sampleThemes.push(row.title);
      }
      if (
        row.targetBeneficiaries &&
        bucket.sampleBeneficiaries.length < 3 &&
        !bucket.sampleBeneficiaries.includes(row.targetBeneficiaries)
      ) {
        bucket.sampleBeneficiaries.push(row.targetBeneficiaries);
      }
    }

    const programsBySector = Array.from(sectorProgramMap.values()).filter(
      (item) => item.provinceProgramsCount > 0
    );

    const openOpportunities = regionalOppRows.map((o) => ({
      id: o.id,
      title: o.title,
      focusArea: o.focusArea,
      targetCity: o.targetCity,
      targetProvince: o.targetProvince,
      status: o.status,
      isExactCityMatch: isCityMatch(o.targetCity),
    }));
    const openOpportunitiesInCity = openOpportunities.filter((o) => o.isExactCityMatch).length;

    const totalReviewsInProvince = regionalReviewRows.length;
    const avgRatingRaw =
      totalReviewsInProvince > 0
        ? regionalReviewRows.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviewsInProvince
        : 0;
    const negativeReviewsCount = regionalReviewRows.filter(
      (r) => r.sentiment === "NEGATIVE" || r.rating <= 2
    ).length;
    const positiveReviewsCount = regionalReviewRows.filter(
      (r) => r.sentiment === "POSITIVE" || r.rating >= 4
    ).length;

    // Prioritaskan sampel ulasan kritis/negatif agar celah kebutuhan terlihat oleh LLM
    const sortedReviewSamples = [...regionalReviewRows]
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 10)
      .map((r) => ({
        rating: r.rating,
        comment: r.comment,
        sentiment: r.sentiment,
        reviewerRole: r.reviewerRole,
        reviewerCity: r.reviewerCity,
        programFocusArea: r.programFocusArea,
      }));

    // Agregasi mitra aktif lokal per sektor
    const partnerSectorMap = new Map<CsrFocusArea, TerritoryPartnerSectorCount>();
    let activePartnersInCity = 0;
    let verifiedPartnersInProvince = 0;
    for (const p of regionalPartnerRows) {
      if (isCityMatch(p.city)) activePartnersInCity += 1;
      if (p.isVerified) verifiedPartnersInProvince += 1;
      const cur = partnerSectorMap.get(p.focusArea) || {
        focusArea: p.focusArea,
        activeCount: 0,
        verifiedCount: 0,
      };
      cur.activeCount += 1;
      if (p.isVerified) cur.verifiedCount += 1;
      partnerSectorMap.set(p.focusArea, cur);
    }

    const ownFocusCounts = new Map<CsrFocusArea, number>();
    ownProgramRows.forEach((p) => {
      ownFocusCounts.set(p.focusArea, (ownFocusCounts.get(p.focusArea) || 0) + 1);
    });
    const ownProgramFocusAreas = Array.from(ownFocusCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([area]) => area)
      .slice(0, 3);

    let dataCoverage: TerritoryDataCoverage = "LIMITED_DATA";
    if (
      regionalProgramsRows.length === 0 &&
      openOpportunities.length === 0 &&
      totalReviewsInProvince === 0
    ) {
      dataCoverage = "COLD_START";
    } else if (
      programsInCity >= 2 ||
      totalReviewsInProvince >= 3 ||
      (regionalProgramsRows.length >= 3 && regionalPartnerRows.length >= 1)
    ) {
      dataCoverage = "RICH_DATA";
    }

    return {
      targetProvince,
      targetCity,
      dataCoverage,
      companyContext: {
        name: companyRow?.name || "Perusahaan Sponsor",
        industry: companyRow?.industry || null,
        csrVision: companyRow?.csrVision || null,
        ownOpportunitiesCount: Number(ownOppCountRow?.count ?? 0),
        ownProgramsCount: ownProgramRows.length,
        ownProgramFocusAreas,
      },
      regionalStats: {
        programsInCity,
        programsInProvince: regionalProgramsRows.length,
        openOpportunitiesInCity,
        openOpportunitiesInProvince: openOpportunities.length,
        totalReviewsInProvince,
        averageRatingInProvince: Number(avgRatingRaw.toFixed(1)),
        negativeReviewsCount,
        positiveReviewsCount,
        activePartnersInCity,
        activePartnersInProvince: regionalPartnerRows.length,
        verifiedPartnersInProvince,
      },
      programsBySector,
      openOpportunities,
      reviewSamples: sortedReviewSamples,
      activityLocations: regionalActivityRows
        .filter((a): a is { locationName: string; title: string; focusArea: CsrFocusArea } => Boolean(a.locationName))
        .slice(0, 8),
      partnersBySector: Array.from(partnerSectorMap.values()),
    };
  }
}


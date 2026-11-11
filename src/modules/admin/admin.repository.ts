import { db } from "@/db";
import { companies, Company } from "@/db/schema/companies";
import { partners, Partner } from "@/db/schema/partners";
import { users, UserRole, UserStatus } from "@/db/schema/users";
import { opportunities } from "@/db/schema/opportunities";
import { proposals } from "@/db/schema/proposals";
import { collaborations } from "@/db/schema/collaborations";
import { programs } from "@/db/schema/programs";
import { programStages } from "@/db/schema/program-stages";
import { programActivities } from "@/db/schema/program-activities";
import { programDisbursements } from "@/db/schema/program-disbursements";
import { programExpenses } from "@/db/schema/program-expenses";
import { programReviews } from "@/db/schema/program-reviews";
import { adminAuditLogs, NewAdminAuditLog } from "@/db/schema/admin-audit-logs";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { activityRepository } from "@/modules/activities";
import { financeRepository } from "@/modules/finances";
import { reviewRepository } from "@/modules/reviews";
import { eq, and, or, like, desc, asc, count, inArray, ne, isNotNull } from "drizzle-orm";
import {
  AdminAuditLogItem,
  AdminAuditLogsQuery,
  AdminCompaniesQuery,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminImpactOverviewResponse,
  AdminOpportunitiesQuery,
  AdminOpportunityListItem,
  AdminOverviewMonthlyTrend,
  AdminOverviewResponse,
  AdminPartnerDetail,
  AdminPartnerListItem,
  AdminPartnersQuery,
  AdminProgramAuditDetail,
  AdminProgramListItem,
  AdminProgramsQuery,
  AdminProposalListItem,
  AdminProposalsQuery,
  AdminUserListItem,
  AdminUsersQuery,
  PaginatedResult,
} from "./admin.interface";

const MONTH_LABELS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function buildLast6MonthsBuckets(): Array<{
  monthKey: string;
  label: string;
  newCompanies: number;
  newPartners: number;
  newUsers: number;
  newPrograms: number;
}> {
  const buckets: AdminOverviewMonthlyTrend[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_LABELS_ID[d.getMonth()]} ${d.getFullYear()}`;
    buckets.push({
      monthKey,
      label,
      newCompanies: 0,
      newPartners: 0,
      newUsers: 0,
      newPrograms: 0,
    });
  }
  return buckets;
}

function getMonthKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export class AdminRepository {
  async createAuditLog(entry: Omit<NewAdminAuditLog, "id" | "createdAt">): Promise<void> {
    await db.insert(adminAuditLogs).values({
      ...entry,
      id: crypto.randomUUID(),
    });
  }

  async getOverviewData(): Promise<AdminOverviewResponse> {
    const [
      allCompanies,
      allPartners,
      allUsers,
      allOpportunities,
      allProposals,
      allCollaborations,
      allPrograms,
      allDisbursements,
      allExpenses,
      allReviews,
    ] = await Promise.all([
      db
        .select({
          id: companies.id,
          name: companies.name,
          city: companies.city,
          industry: companies.industry,
          status: companies.status,
          isVerified: companies.isVerified,
          createdAt: companies.createdAt,
        })
        .from(companies)
        .orderBy(desc(companies.createdAt)),
      db
        .select({
          id: partners.id,
          name: partners.name,
          city: partners.city,
          focusArea: partners.focusArea,
          status: partners.status,
          isVerified: partners.isVerified,
          createdAt: partners.createdAt,
        })
        .from(partners)
        .orderBy(desc(partners.createdAt)),
      db
        .select({
          id: users.id,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        })
        .from(users),
      db
        .select({
          id: opportunities.id,
          status: opportunities.status,
        })
        .from(opportunities),
      db
        .select({
          id: proposals.id,
          status: proposals.status,
        })
        .from(proposals),
      db
        .select({
          id: collaborations.id,
          status: collaborations.status,
        })
        .from(collaborations),
      db
        .select({
          id: programs.id,
          title: programs.title,
          companyId: programs.companyId,
          partnerId: programs.partnerId,
          focusArea: programs.focusArea,
          budget: programs.budget,
          spentBudget: programs.spentBudget,
          status: programs.status,
          createdAt: programs.createdAt,
          updatedAt: programs.updatedAt,
        })
        .from(programs)
        .orderBy(desc(programs.updatedAt)),
      db
        .select({
          amount: programDisbursements.amount,
          status: programDisbursements.status,
        })
        .from(programDisbursements),
      db
        .select({
          amount: programExpenses.amount,
          verificationStatus: programExpenses.verificationStatus,
        })
        .from(programExpenses),
      db
        .select({
          programId: programReviews.programId,
          rating: programReviews.rating,
          sentiment: programReviews.sentiment,
        })
        .from(programReviews),
    ]);

    const companyMap = new Map(allCompanies.map((c) => [c.id, c.name]));
    const partnerMap = new Map(allPartners.map((p) => [p.id, p.name]));

    // 1. Trends (6 bulan terakhir)
    const monthlyTrends = buildLast6MonthsBuckets();
    const trendMap = new Map(monthlyTrends.map((b) => [b.monthKey, b]));

    for (const c of allCompanies) {
      const b = trendMap.get(getMonthKey(c.createdAt));
      if (b) b.newCompanies += 1;
    }
    for (const p of allPartners) {
      const b = trendMap.get(getMonthKey(p.createdAt));
      if (b) b.newPartners += 1;
    }
    for (const u of allUsers) {
      const b = trendMap.get(getMonthKey(u.createdAt));
      if (b) b.newUsers += 1;
    }
    for (const pr of allPrograms) {
      const b = trendMap.get(getMonthKey(pr.createdAt));
      if (b) b.newPrograms += 1;
    }

    // 2. Focus Area Distribution
    const focusStats = new Map<
      string,
      { programCount: number; committedBudget: number; spentBudget: number }
    >();
    let totalCommittedBudget = 0;
    let totalSpentBudget = 0;

    for (const pr of allPrograms) {
      const budgetNum = Number(pr.budget || 0);
      const spentNum = Number(pr.spentBudget || 0);
      if (pr.status !== "CANCELLED") {
        totalCommittedBudget += budgetNum;
        totalSpentBudget += spentNum;
      }

      const curr = focusStats.get(pr.focusArea) || {
        programCount: 0,
        committedBudget: 0,
        spentBudget: 0,
      };
      curr.programCount += 1;
      curr.committedBudget += budgetNum;
      curr.spentBudget += spentNum;
      focusStats.set(pr.focusArea, curr);
    }

    const focusAreaDistribution = Array.from(focusStats.entries())
      .map(([focusArea, stats]) => ({ focusArea, ...stats }))
      .sort((a, b) => b.programCount - a.programCount);

    // 3. Disbursement & Expense Totals
    let totalDisbursedFunds = 0;
    for (const d of allDisbursements) {
      if (d.status !== "REJECTED") {
        totalDisbursedFunds += Number(d.amount || 0);
      }
    }

    let totalVerifiedExpenses = 0;
    for (const e of allExpenses) {
      if (e.verificationStatus === "VERIFIED") {
        totalVerifiedExpenses += Number(e.amount || 0);
      }
    }

    // 4. Reviews & Low-rated programs
    let ratingSum = 0;
    const reviewAgg = new Map<string, { sum: number; count: number; negatives: number }>();
    for (const r of allReviews) {
      ratingSum += r.rating;
      const curr = reviewAgg.get(r.programId) || { sum: 0, count: 0, negatives: 0 };
      curr.sum += r.rating;
      curr.count += 1;
      if (r.sentiment === "NEGATIVE" || r.rating <= 2) {
        curr.negatives += 1;
      }
      reviewAgg.set(r.programId, curr);
    }

    const lowRatedPrograms = allPrograms
      .map((pr) => {
        const agg = reviewAgg.get(pr.id);
        if (!agg || agg.count === 0) return null;
        const avgRating = Number((agg.sum / agg.count).toFixed(1));
        if (avgRating > 3.2 && agg.negatives === 0) return null;
        return {
          id: pr.id,
          title: pr.title,
          avgRating,
          reviewCount: agg.count,
          companyName: companyMap.get(pr.companyId) ?? null,
          partnerName: partnerMap.get(pr.partnerId) ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 5);

    const openOpportunitiesCount = allOpportunities.filter((o) => o.status === "OPEN").length;
    const agreedCollaborationsCount = allCollaborations.filter((c) => c.status === "AGREED").length;
    const activeOrCompletedProgramsCount = allPrograms.filter(
      (p) => p.status === "IN_PROGRESS" || p.status === "COMPLETED"
    ).length;

    return {
      kpis: {
        totalCompanies: allCompanies.length,
        verifiedCompanies: allCompanies.filter((c) => c.isVerified).length,
        activeCompanies: allCompanies.filter((c) => c.status === "ACTIVE").length,
        suspendedCompanies: allCompanies.filter((c) => c.status === "SUSPENDED").length,
        totalPartners: allPartners.length,
        verifiedPartners: allPartners.filter((p) => p.isVerified).length,
        activePartners: allPartners.filter((p) => p.status === "ACTIVE").length,
        suspendedPartners: allPartners.filter((p) => p.status === "SUSPENDED").length,
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter((u) => u.status === "ACTIVE").length,
        suspendedUsers: allUsers.filter((u) => u.status === "SUSPENDED").length,
        stagingUsers: allUsers.filter((u) => u.role === "STAGING").length,
        superAdmins: allUsers.filter((u) => u.role === "SUPER_ADMIN").length,
        totalOpportunities: allOpportunities.length,
        openOpportunities: openOpportunitiesCount,
        totalProposals: allProposals.length,
        acceptedProposals: allProposals.filter((p) => p.status === "ACCEPTED").length,
        totalCollaborations: allCollaborations.length,
        agreedCollaborations: agreedCollaborationsCount,
        totalPrograms: allPrograms.length,
        plannedPrograms: allPrograms.filter((p) => p.status === "PLANNED").length,
        inProgressPrograms: allPrograms.filter((p) => p.status === "IN_PROGRESS").length,
        completedPrograms: allPrograms.filter((p) => p.status === "COMPLETED").length,
        onHoldPrograms: allPrograms.filter((p) => p.status === "ON_HOLD").length,
        cancelledPrograms: allPrograms.filter((p) => p.status === "CANCELLED").length,
        totalCommittedBudget,
        totalDisbursedFunds,
        totalVerifiedExpenses,
        totalSpentBudget,
        totalReviews: allReviews.length,
        averageRating: allReviews.length > 0 ? Number((ratingSum / allReviews.length).toFixed(1)) : 0,
      },
      monthlyTrends,
      focusAreaDistribution,
      conversionFunnel: {
        openOpportunities: openOpportunitiesCount,
        submittedProposals: allProposals.filter((p) => p.status !== "WITHDRAWN").length,
        agreedCollaborations: agreedCollaborationsCount,
        activeOrCompletedPrograms: activeOrCompletedProgramsCount,
      },
      escalationQueue: {
        unverifiedCompanies: allCompanies
          .filter((c) => !c.isVerified)
          .slice(0, 5)
          .map((c) => ({
            id: c.id,
            name: c.name,
            city: c.city,
            industry: c.industry,
            status: c.status,
            createdAt: c.createdAt,
          })),
        unverifiedPartners: allPartners
          .filter((p) => !p.isVerified)
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            name: p.name,
            city: p.city,
            focusArea: p.focusArea,
            status: p.status,
            createdAt: p.createdAt,
          })),
        flaggedPrograms: allPrograms
          .filter((p) => p.status === "ON_HOLD" || p.status === "CANCELLED")
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            companyName: companyMap.get(p.companyId) ?? null,
            partnerName: partnerMap.get(p.partnerId) ?? null,
            updatedAt: p.updatedAt,
          })),
        lowRatedPrograms,
      },
    };
  }

  async findCompanies(query: AdminCompaniesQuery): Promise<PaginatedResult<AdminCompanyListItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(companies.status, query.status));
    }
    if (query.isVerified !== undefined) {
      conditions.push(eq(companies.isVerified, query.isVerified));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(companies.name, pattern),
          like(companies.city, pattern),
          like(companies.industry, pattern),
          like(companies.email, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db.select({ count: count() }).from(companies).where(whereClause),
      db
        .select()
        .from(companies)
        .where(whereClause)
        .orderBy(desc(companies.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    if (rows.length === 0) {
      return { data: [], total: Number(totalRes?.count ?? 0), page, limit };
    }

    const ids = rows.map((c) => c.id);
    const [memberCounts, oppCounts, progCounts] = await Promise.all([
      db
        .select({ companyId: users.companyId, count: count() })
        .from(users)
        .where(inArray(users.companyId, ids))
        .groupBy(users.companyId),
      db
        .select({ companyId: opportunities.companyId, count: count() })
        .from(opportunities)
        .where(inArray(opportunities.companyId, ids))
        .groupBy(opportunities.companyId),
      db
        .select({ companyId: programs.companyId, count: count() })
        .from(programs)
        .where(inArray(programs.companyId, ids))
        .groupBy(programs.companyId),
    ]);

    const memberMap = new Map(memberCounts.map((r) => [r.companyId, Number(r.count)]));
    const oppMap = new Map(oppCounts.map((r) => [r.companyId, Number(r.count)]));
    const progMap = new Map(progCounts.map((r) => [r.companyId, Number(r.count)]));

    const data: AdminCompanyListItem[] = rows.map((c) => ({
      ...c,
      membersCount: memberMap.get(c.id) ?? 0,
      opportunitiesCount: oppMap.get(c.id) ?? 0,
      programsCount: progMap.get(c.id) ?? 0,
    }));

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }

  async findCompanyById(id: string): Promise<Company | null> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return company ?? null;
  }

  async findCompanyDetail(id: string): Promise<AdminCompanyDetail | null> {
    const company = await this.findCompanyById(id);
    if (!company) return null;

    const [members, companyOpportunities, companyPrograms] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          position: users.position,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.companyId, id))
        .orderBy(desc(users.createdAt)),
      db
        .select()
        .from(opportunities)
        .where(eq(opportunities.companyId, id))
        .orderBy(desc(opportunities.createdAt)),
      db
        .select({
          id: programs.id,
          title: programs.title,
          focusArea: programs.focusArea,
          status: programs.status,
          budget: programs.budget,
          spentBudget: programs.spentBudget,
          partnerName: partners.name,
          createdAt: programs.createdAt,
        })
        .from(programs)
        .leftJoin(partners, eq(programs.partnerId, partners.id))
        .where(eq(programs.companyId, id))
        .orderBy(desc(programs.createdAt)),
    ]);

    return {
      ...company,
      membersCount: members.length,
      opportunitiesCount: companyOpportunities.length,
      programsCount: companyPrograms.length,
      members,
      opportunities: companyOpportunities,
      programs: companyPrograms,
    };
  }

  async updateCompanyStatus(
    id: string,
    data: Partial<Pick<Company, "status" | "isVerified" | "verifiedAt" | "verifiedBy" | "verificationNotes">>
  ): Promise<Company> {
    await db
      .update(companies)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id));

    const updated = await this.findCompanyById(id);
    if (!updated) throw new Error("Failed to fetch updated company record");
    return updated;
  }

  async findPartners(query: AdminPartnersQuery): Promise<PaginatedResult<AdminPartnerListItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(partners.status, query.status));
    }
    if (query.focusArea) {
      conditions.push(eq(partners.focusArea, query.focusArea as CsrFocusArea));
    }
    if (query.isVerified !== undefined) {
      conditions.push(eq(partners.isVerified, query.isVerified));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(partners.name, pattern),
          like(partners.city, pattern),
          like(partners.organizationType, pattern),
          like(partners.email, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db.select({ count: count() }).from(partners).where(whereClause),
      db
        .select()
        .from(partners)
        .where(whereClause)
        .orderBy(desc(partners.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    if (rows.length === 0) {
      return { data: [], total: Number(totalRes?.count ?? 0), page, limit };
    }

    const ids = rows.map((p) => p.id);
    const [memberCounts, proposalCounts, progCounts] = await Promise.all([
      db
        .select({ partnerId: users.partnerId, count: count() })
        .from(users)
        .where(inArray(users.partnerId, ids))
        .groupBy(users.partnerId),
      db
        .select({ partnerId: proposals.partnerId, count: count() })
        .from(proposals)
        .where(inArray(proposals.partnerId, ids))
        .groupBy(proposals.partnerId),
      db
        .select({ partnerId: programs.partnerId, count: count() })
        .from(programs)
        .where(inArray(programs.partnerId, ids))
        .groupBy(programs.partnerId),
    ]);

    const memberMap = new Map(memberCounts.map((r) => [r.partnerId, Number(r.count)]));
    const propMap = new Map(proposalCounts.map((r) => [r.partnerId, Number(r.count)]));
    const progMap = new Map(progCounts.map((r) => [r.partnerId, Number(r.count)]));

    const data: AdminPartnerListItem[] = rows.map((p) => ({
      ...p,
      membersCount: memberMap.get(p.id) ?? 0,
      proposalsCount: propMap.get(p.id) ?? 0,
      programsCount: progMap.get(p.id) ?? 0,
    }));

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }

  async findPartnerById(id: string): Promise<Partner | null> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return partner ?? null;
  }

  async findPartnerDetail(id: string): Promise<AdminPartnerDetail | null> {
    const partner = await this.findPartnerById(id);
    if (!partner) return null;

    const [members, partnerProposals, partnerPrograms] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          position: users.position,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.partnerId, id))
        .orderBy(desc(users.createdAt)),
      db
        .select({
          id: proposals.id,
          title: proposals.title,
          status: proposals.status,
          proposedBudget: proposals.proposedBudget,
          aiScore: proposals.aiScore,
          opportunityTitle: opportunities.title,
          companyName: companies.name,
          createdAt: proposals.createdAt,
        })
        .from(proposals)
        .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
        .leftJoin(companies, eq(opportunities.companyId, companies.id))
        .where(eq(proposals.partnerId, id))
        .orderBy(desc(proposals.createdAt)),
      db
        .select({
          id: programs.id,
          title: programs.title,
          focusArea: programs.focusArea,
          status: programs.status,
          budget: programs.budget,
          spentBudget: programs.spentBudget,
          companyName: companies.name,
          createdAt: programs.createdAt,
        })
        .from(programs)
        .leftJoin(companies, eq(programs.companyId, companies.id))
        .where(eq(programs.partnerId, id))
        .orderBy(desc(programs.createdAt)),
    ]);

    return {
      ...partner,
      membersCount: members.length,
      proposalsCount: partnerProposals.length,
      programsCount: partnerPrograms.length,
      members,
      proposals: partnerProposals,
      programs: partnerPrograms,
    };
  }

  async updatePartnerStatus(
    id: string,
    data: Partial<Pick<Partner, "status" | "isVerified" | "verifiedAt" | "verifiedBy" | "verificationNotes">>
  ): Promise<Partner> {
    await db
      .update(partners)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id));

    const updated = await this.findPartnerById(id);
    if (!updated) throw new Error("Failed to fetch updated partner record");
    return updated;
  }

  async findUsers(query: AdminUsersQuery): Promise<PaginatedResult<AdminUserListItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 15));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.role) {
      conditions.push(eq(users.role, query.role));
    }
    if (query.status) {
      conditions.push(eq(users.status, query.status));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(users.name, pattern),
          like(users.email, pattern),
          like(users.position, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db.select({ count: count() }).from(users).where(whereClause),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          position: users.position,
          companyId: users.companyId,
          partnerId: users.partnerId,
          companyName: companies.name,
          companyStatus: companies.status,
          partnerName: partners.name,
          partnerStatus: partners.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .leftJoin(companies, eq(users.companyId, companies.id))
        .leftJoin(partners, eq(users.partnerId, partners.id))
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const data: AdminUserListItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      status: r.status,
      avatarUrl: r.avatarUrl,
      phone: r.phone,
      position: r.position,
      companyId: r.companyId,
      partnerId: r.partnerId,
      organizationName: r.companyName ?? r.partnerName ?? null,
      organizationType: r.companyId ? "COMPANY" : r.partnerId ? "PARTNER" : null,
      organizationStatus: r.companyStatus ?? r.partnerStatus ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }

  async countActiveSuperAdmins(excludeUserId?: string): Promise<number> {
    const conditions = [
      eq(users.role, "SUPER_ADMIN"),
      eq(users.status, "ACTIVE"),
    ];
    if (excludeUserId) {
      conditions.push(ne(users.id, excludeUserId));
    }

    const [res] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    return Number(res?.count ?? 0);
  }

  async findOpportunities(
    query: AdminOpportunitiesQuery
  ): Promise<PaginatedResult<AdminOpportunityListItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(opportunities.status, query.status));
    }
    if (query.focusArea) {
      conditions.push(eq(opportunities.focusArea, query.focusArea as CsrFocusArea));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(opportunities.title, pattern),
          like(opportunities.targetCity, pattern),
          like(companies.name, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db
        .select({ count: count() })
        .from(opportunities)
        .leftJoin(companies, eq(opportunities.companyId, companies.id))
        .where(whereClause),
      db
        .select({
          opportunity: opportunities,
          companyName: companies.name,
          companyLogo: companies.logoUrl,
          companyVerified: companies.isVerified,
        })
        .from(opportunities)
        .leftJoin(companies, eq(opportunities.companyId, companies.id))
        .where(whereClause)
        .orderBy(desc(opportunities.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    if (rows.length === 0) {
      return { data: [], total: Number(totalRes?.count ?? 0), page, limit };
    }

    const oppIds = rows.map((r) => r.opportunity.id);
    const propCounts = await db
      .select({ opportunityId: proposals.opportunityId, count: count() })
      .from(proposals)
      .where(inArray(proposals.opportunityId, oppIds))
      .groupBy(proposals.opportunityId);

    const propMap = new Map(propCounts.map((p) => [p.opportunityId, Number(p.count)]));

    const data: AdminOpportunityListItem[] = rows.map((r) => ({
      ...r.opportunity,
      companyName: r.companyName ?? null,
      companyLogo: r.companyLogo ?? null,
      companyVerified: Boolean(r.companyVerified),
      proposalsCount: propMap.get(r.opportunity.id) ?? 0,
    }));

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }

  async findOpportunityById(id: string) {
    const [row] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);
    return row ?? null;
  }

  async updateOpportunityStatus(id: string, status: "CLOSED" | "OPEN") {
    await db
      .update(opportunities)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(opportunities.id, id));

    return this.findOpportunityById(id);
  }

  async findProposals(query: AdminProposalsQuery): Promise<PaginatedResult<AdminProposalListItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(proposals.status, query.status));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(proposals.title, pattern),
          like(partners.name, pattern),
          like(companies.name, pattern),
          like(opportunities.title, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db
        .select({ count: count() })
        .from(proposals)
        .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
        .leftJoin(companies, eq(opportunities.companyId, companies.id))
        .leftJoin(partners, eq(proposals.partnerId, partners.id))
        .where(whereClause),
      db
        .select({
          proposal: proposals,
          opportunityTitle: opportunities.title,
          companyId: opportunities.companyId,
          companyName: companies.name,
          partnerName: partners.name,
          partnerCity: partners.city,
        })
        .from(proposals)
        .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
        .leftJoin(companies, eq(opportunities.companyId, companies.id))
        .leftJoin(partners, eq(proposals.partnerId, partners.id))
        .where(whereClause)
        .orderBy(desc(proposals.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const data: AdminProposalListItem[] = rows.map((r) => ({
      ...r.proposal,
      opportunityTitle: r.opportunityTitle ?? null,
      companyId: r.companyId ?? null,
      companyName: r.companyName ?? null,
      partnerName: r.partnerName ?? null,
      partnerCity: r.partnerCity ?? null,
    }));

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }

  async findPrograms(query: AdminProgramsQuery): Promise<PaginatedResult<AdminProgramListItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(programs.status, query.status));
    }
    if (query.focusArea) {
      conditions.push(eq(programs.focusArea, query.focusArea as CsrFocusArea));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(programs.title, pattern),
          like(programs.targetCity, pattern),
          like(companies.name, pattern),
          like(partners.name, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db
        .select({ count: count() })
        .from(programs)
        .leftJoin(companies, eq(programs.companyId, companies.id))
        .leftJoin(partners, eq(programs.partnerId, partners.id))
        .where(whereClause),
      db
        .select({
          program: programs,
          companyName: companies.name,
          companyLogo: companies.logoUrl,
          partnerName: partners.name,
          partnerLogo: partners.logoUrl,
          opportunityTitle: opportunities.title,
          collaborationMouUrl: collaborations.mouDocumentUrl,
        })
        .from(programs)
        .leftJoin(companies, eq(programs.companyId, companies.id))
        .leftJoin(partners, eq(programs.partnerId, partners.id))
        .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
        .leftJoin(collaborations, eq(programs.collaborationId, collaborations.id))
        .where(whereClause)
        .orderBy(desc(programs.updatedAt))
        .limit(limit)
        .offset(offset),
    ]);

    if (rows.length === 0) {
      return { data: [], total: Number(totalRes?.count ?? 0), page, limit };
    }

    const programIds = rows.map((r) => r.program.id);
    const [stages, activities, disbursements, expenses] = await Promise.all([
      db.select().from(programStages).where(inArray(programStages.programId, programIds)),
      db.select().from(programActivities).where(inArray(programActivities.programId, programIds)),
      db
        .select({
          programId: programDisbursements.programId,
          amount: programDisbursements.amount,
          status: programDisbursements.status,
        })
        .from(programDisbursements)
        .where(inArray(programDisbursements.programId, programIds)),
      db
        .select({
          programId: programExpenses.programId,
          amount: programExpenses.amount,
          verificationStatus: programExpenses.verificationStatus,
        })
        .from(programExpenses)
        .where(inArray(programExpenses.programId, programIds)),
    ]);

    const data: AdminProgramListItem[] = rows.map((r) => {
      const pId = r.program.id;
      const pStages = stages.filter((s) => s.programId === pId);
      const pActs = activities.filter((a) => a.programId === pId);
      const totalCount = pStages.length > 0 ? pStages.length : pActs.length;
      const completedCount =
        pStages.length > 0
          ? pStages.filter((s) => s.status === "COMPLETED").length
          : pActs.filter((a) => a.status === "VERIFIED").length;
      const pendingVerif = pActs.filter((a) => a.status === "SUBMITTED").length;
      const progressPercent =
        totalCount > 0
          ? Math.round((completedCount / totalCount) * 100)
          : r.program.status === "COMPLETED"
          ? 100
          : 0;

      const disbursedAmount = disbursements
        .filter((d) => d.programId === pId && d.status !== "REJECTED")
        .reduce((sum, d) => sum + Number(d.amount || 0), 0);

      const verifiedExpensesAmount = expenses
        .filter((e) => e.programId === pId && e.verificationStatus === "VERIFIED")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      return {
        ...r.program,
        companyName: r.companyName ?? null,
        companyLogo: r.companyLogo ?? null,
        partnerName: r.partnerName ?? null,
        partnerLogo: r.partnerLogo ?? null,
        opportunityTitle: r.opportunityTitle ?? null,
        collaborationMouUrl: r.collaborationMouUrl ?? null,
        totalActivitiesCount: totalCount,
        completedActivitiesCount: completedCount,
        pendingVerificationCount: pendingVerif,
        activityProgressPercent: progressPercent,
        disbursedAmount,
        verifiedExpensesAmount,
      };
    });

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }

  async findProgramAuditDetail(programId: string): Promise<AdminProgramAuditDetail | null> {
    const [row] = await db
      .select({
        program: programs,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        partnerName: partners.name,
        partnerLogo: partners.logoUrl,
        opportunityTitle: opportunities.title,
        collaborationMouUrl: collaborations.mouDocumentUrl,
      })
      .from(programs)
      .leftJoin(companies, eq(programs.companyId, companies.id))
      .leftJoin(partners, eq(programs.partnerId, partners.id))
      .leftJoin(opportunities, eq(programs.opportunityId, opportunities.id))
      .leftJoin(collaborations, eq(programs.collaborationId, collaborations.id))
      .where(eq(programs.id, programId))
      .limit(1);

    if (!row) return null;

    const [
      stages,
      activities,
      financialSummary,
      disbursements,
      expenses,
      reviews,
      reviewStatsRaw,
    ] = await Promise.all([
      db
        .select()
        .from(programStages)
        .where(eq(programStages.programId, programId))
        .orderBy(asc(programStages.orderIndex)),
      activityRepository.findByProgramId(programId),
      financeRepository.getFinancialSummary(programId),
      financeRepository.findDisbursementsByProgramId(programId),
      financeRepository.findExpensesByProgramId(programId),
      reviewRepository.findByProgramId(programId),
      reviewRepository.getStatsByProgramId(programId),
    ]);

    const totalActivitiesCount = stages.length > 0 ? stages.length : activities.length;
    const completedActivitiesCount =
      stages.length > 0
        ? stages.filter((s) => s.status === "COMPLETED").length
        : activities.filter((a) => a.status === "VERIFIED").length;
    const pendingVerificationCount = activities.filter((a) => a.status === "SUBMITTED").length;
    const activityProgressPercent =
      totalActivitiesCount > 0
        ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100)
        : row.program.status === "COMPLETED"
        ? 100
        : 0;

    const sentimentBreakdown = {
      POSITIVE: reviews.filter((rv) => rv.sentiment === "POSITIVE" || (!rv.sentiment && rv.rating >= 4)).length,
      NEUTRAL: reviews.filter((rv) => rv.sentiment === "NEUTRAL" || (!rv.sentiment && rv.rating === 3)).length,
      NEGATIVE: reviews.filter((rv) => rv.sentiment === "NEGATIVE" || (!rv.sentiment && rv.rating <= 2)).length,
    };

    const programItem: AdminProgramListItem = {
      ...row.program,
      companyName: row.companyName ?? null,
      companyLogo: row.companyLogo ?? null,
      partnerName: row.partnerName ?? null,
      partnerLogo: row.partnerLogo ?? null,
      opportunityTitle: row.opportunityTitle ?? null,
      collaborationMouUrl: row.collaborationMouUrl ?? null,
      totalActivitiesCount,
      completedActivitiesCount,
      pendingVerificationCount,
      activityProgressPercent,
      disbursedAmount: financialSummary.totalDisbursed,
      verifiedExpensesAmount: financialSummary.totalExpensesVerified,
    };

    return {
      program: programItem,
      stages,
      activities,
      financialSummary,
      disbursements,
      expenses,
      reviews,
      reviewStats: {
        totalReviews: reviewStatsRaw.totalReviews,
        averageRating: reviewStatsRaw.averageRating,
        ratingDistribution: reviewStatsRaw.ratingDistribution,
        sentimentBreakdown,
      },
    };
  }

  async getImpactOverview(): Promise<AdminImpactOverviewResponse> {
    const [allPrograms, allReviews] = await Promise.all([
      db
        .select({
          id: programs.id,
          title: programs.title,
          focusArea: programs.focusArea,
          budget: programs.budget,
          targetCity: programs.targetCity,
          targetProvince: programs.targetProvince,
          status: programs.status,
          companyName: companies.name,
          partnerName: partners.name,
        })
        .from(programs)
        .leftJoin(companies, eq(programs.companyId, companies.id))
        .leftJoin(partners, eq(programs.partnerId, partners.id)),
      db
        .select()
        .from(programReviews)
        .orderBy(desc(programReviews.createdAt)),
    ]);

    const programMap = new Map(allPrograms.map((p) => [p.id, p]));

    let ratingSum = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    const reviewedProgramIds = new Set<string>();
    const programReviewStats = new Map<
      string,
      { sum: number; count: number; negativeCount: number }
    >();

    for (const rv of allReviews) {
      reviewedProgramIds.add(rv.programId);
      ratingSum += rv.rating;

      const effectiveSentiment =
        rv.sentiment ?? (rv.rating >= 4 ? "POSITIVE" : rv.rating === 3 ? "NEUTRAL" : "NEGATIVE");
      if (effectiveSentiment === "POSITIVE") positiveCount += 1;
      else if (effectiveSentiment === "NEUTRAL") neutralCount += 1;
      else negativeCount += 1;

      const curr = programReviewStats.get(rv.programId) || { sum: 0, count: 0, negativeCount: 0 };
      curr.sum += rv.rating;
      curr.count += 1;
      if (effectiveSentiment === "NEGATIVE") curr.negativeCount += 1;
      programReviewStats.set(rv.programId, curr);
    }

    // Geo & Focus aggregations
    const geoMap = new Map<
      string,
      { city: string; province: string | null; programCount: number; totalBudget: number; reviewCount: number }
    >();
    const focusMap = new Map<
      string,
      { programCount: number; totalBudget: number; ratingSum: number; reviewCount: number }
    >();

    for (const p of allPrograms) {
      const pBudget = Number(p.budget || 0);
      const pReviews = programReviewStats.get(p.id);
      const cityKey = (p.targetCity || "Lokasi Belum Ditentukan").trim();

      const gCurr = geoMap.get(cityKey) || {
        city: cityKey,
        province: p.targetProvince ?? null,
        programCount: 0,
        totalBudget: 0,
        reviewCount: 0,
      };
      gCurr.programCount += 1;
      gCurr.totalBudget += pBudget;
      gCurr.reviewCount += pReviews?.count ?? 0;
      if (!gCurr.province && p.targetProvince) gCurr.province = p.targetProvince;
      geoMap.set(cityKey, gCurr);

      const fCurr = focusMap.get(p.focusArea) || {
        programCount: 0,
        totalBudget: 0,
        ratingSum: 0,
        reviewCount: 0,
      };
      fCurr.programCount += 1;
      fCurr.totalBudget += pBudget;
      fCurr.ratingSum += pReviews?.sum ?? 0;
      fCurr.reviewCount += pReviews?.count ?? 0;
      focusMap.set(p.focusArea, fCurr);
    }

    const lowRatedOrNegativePrograms = allPrograms
      .map((p) => {
        const stats = programReviewStats.get(p.id);
        if (!stats || stats.count === 0) return null;
        const avgRating = Number((stats.sum / stats.count).toFixed(1));
        if (avgRating > 3.5 && stats.negativeCount === 0) return null;
        return {
          programId: p.id,
          programTitle: p.title,
          companyName: p.companyName ?? null,
          partnerName: p.partnerName ?? null,
          status: p.status,
          avgRating,
          negativeCount: stats.negativeCount,
          totalReviews: stats.count,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.avgRating - b.avgRating || b.negativeCount - a.negativeCount);

    const recentReviews = allReviews.slice(0, 30).map((rv) => {
      const prog = programMap.get(rv.programId);
      return {
        ...rv,
        programTitle: prog?.title ?? null,
        companyName: prog?.companyName ?? null,
        partnerName: prog?.partnerName ?? null,
      };
    });

    return {
      summary: {
        totalReviews: allReviews.length,
        averageRating: allReviews.length > 0 ? Number((ratingSum / allReviews.length).toFixed(1)) : 0,
        positiveCount,
        neutralCount,
        negativeCount,
        totalCitiesCovered: Array.from(geoMap.keys()).filter((c) => c !== "Lokasi Belum Ditentukan").length,
        totalProgramsReviewed: reviewedProgramIds.size,
      },
      geoDistribution: Array.from(geoMap.values()).sort((a, b) => b.programCount - a.programCount),
      focusAreaImpact: Array.from(focusMap.entries())
        .map(([focusArea, f]) => ({
          focusArea,
          programCount: f.programCount,
          totalBudget: f.totalBudget,
          avgRating: f.reviewCount > 0 ? Number((f.ratingSum / f.reviewCount).toFixed(1)) : 0,
          reviewCount: f.reviewCount,
        }))
        .sort((a, b) => b.programCount - a.programCount),
      lowRatedOrNegativePrograms,
      recentReviews,
    };
  }

  async getAiMetrics() {
    const [screenedRes, stagesRes, esgRes, sentimentRes] = await Promise.all([
      db.select({ count: count() }).from(proposals).where(isNotNull(proposals.aiScore)),
      db.select({ count: count() }).from(programStages).where(eq(programStages.source, "AI_GENERATED")),
      db.select({ count: count() }).from(programs).where(isNotNull(programs.sustainabilityReport)),
      db.select({ count: count() }).from(programs).where(isNotNull(programs.sentimentAnalysis)),
    ]);

    return {
      screenedProposalsCount: Number(screenedRes[0]?.count ?? 0),
      aiGeneratedStagesCount: Number(stagesRes[0]?.count ?? 0),
      esgReportsGeneratedCount: Number(esgRes[0]?.count ?? 0),
      sentimentAnalyzedProgramsCount: Number(sentimentRes[0]?.count ?? 0),
    };
  }

  async findAuditLogs(query: AdminAuditLogsQuery): Promise<PaginatedResult<AdminAuditLogItem>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.targetType) {
      conditions.push(eq(adminAuditLogs.targetType, query.targetType));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      conditions.push(
        or(
          like(adminAuditLogs.action, pattern),
          like(adminAuditLogs.targetLabel, pattern),
          like(adminAuditLogs.reason, pattern),
          like(users.name, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [[totalRes], rows] = await Promise.all([
      db
        .select({ count: count() })
        .from(adminAuditLogs)
        .leftJoin(users, eq(adminAuditLogs.adminId, users.id))
        .where(whereClause),
      db
        .select({
          log: adminAuditLogs,
          adminName: users.name,
          adminEmail: users.email,
        })
        .from(adminAuditLogs)
        .leftJoin(users, eq(adminAuditLogs.adminId, users.id))
        .where(whereClause)
        .orderBy(desc(adminAuditLogs.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const data: AdminAuditLogItem[] = rows.map((r) => ({
      ...r.log,
      adminName: r.adminName ?? null,
      adminEmail: r.adminEmail ?? null,
    }));

    return { data, total: Number(totalRes?.count ?? 0), page, limit };
  }
}


import { eq, like, or, count, inArray } from "drizzle-orm";
import { db } from "@/db";
import { companies, Company } from "@/db/schema/companies";
import { users, User } from "@/db/schema/users";
import { opportunities } from "@/db/schema/opportunities";
import { programs } from "@/db/schema/programs";
import { programReviews } from "@/db/schema/program-reviews";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  CompanyListQuery,
  CompanyMetrics,
} from "./company.interface";

export class CompanyRepository {
  async findById(id: string): Promise<Company | null> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findMembers(companyId: string) {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.companyId, companyId));
  }

  async findByName(name: string): Promise<Company | null> {
    const result = await db.select().from(companies).where(eq(companies.name, name)).limit(1);
    return result[0] ?? null;
  }

  async createCompanyWithAdmin(
    dto: CreateCompanyDTO,
    userId: string
  ): Promise<{ company: Company; updatedUser: User }> {
    return await db.transaction(async (tx) => {
      const companyId = crypto.randomUUID();

      await tx.insert(companies).values({
        id: companyId,
        name: dto.name,
        tagline: dto.tagline ?? null,
        description: dto.description ?? null,
        csrVision: dto.csrVision ?? null,
        industry: dto.industry ?? null,
        companySize: dto.companySize ?? null,
        foundedYear: dto.foundedYear ? Number(dto.foundedYear) : null,
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        province: dto.province ?? null,
        website: dto.website || null,
        logoUrl: dto.logoUrl || null,
        coverUrl: dto.coverUrl || null,
        nibNumber: dto.nibNumber ?? null,
        npwpNumber: dto.npwpNumber ?? null,
        sustainabilityReportUrl: dto.sustainabilityReportUrl || null,
        instagramUrl: dto.instagramUrl || null,
        linkedinUrl: dto.linkedinUrl || null,
        csrLeaders: dto.csrLeaders
          ? typeof dto.csrLeaders === "string"
            ? dto.csrLeaders
            : JSON.stringify(dto.csrLeaders)
          : null,
        status: "ACTIVE",
      });

      await tx
        .update(users)
        .set({
          companyId: companyId,
          role: "MANAGEMENT",
        })
        .where(eq(users.id, userId));

      const [company] = await tx.select().from(companies).where(eq(companies.id, companyId)).limit(1);
      const [updatedUser] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!company || !updatedUser) {
        throw new Error("Failed to create company or update user in transaction");
      }

      return { company, updatedUser };
    });
  }

  async updateCompany(id: string, dto: UpdateCompanyDTO): Promise<Company> {
    const updateData: any = { ...dto };

    if (dto.csrLeaders !== undefined) {
      updateData.csrLeaders = dto.csrLeaders
        ? typeof dto.csrLeaders === "string"
          ? dto.csrLeaders
          : JSON.stringify(dto.csrLeaders)
        : null;
    }

    if (dto.foundedYear !== undefined) {
      updateData.foundedYear = dto.foundedYear ? Number(dto.foundedYear) : null;
    }

    await db.update(companies).set(updateData).where(eq(companies.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Company not found after update");
    }
    return updated;
  }

  async getMetrics(companyId: string): Promise<CompanyMetrics> {
    // 1. Opportunities of this company
    const companyOpps = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.companyId, companyId));
    const totalOpportunities = companyOpps.length;

    // 2. Programs of this company
    const companyPrograms = await db
      .select({
        id: programs.id,
        budget: programs.budget,
        status: programs.status,
        partnerId: programs.partnerId,
      })
      .from(programs)
      .where(eq(programs.companyId, companyId));

    const totalPrograms = companyPrograms.length;
    const completedPrograms = companyPrograms.filter((p) => p.status === "COMPLETED").length;

    // Total disbursed/realized budget from completed or in_progress programs
    const totalDisbursedBudget = companyPrograms
      .filter((p) => p.status === "COMPLETED" || p.status === "IN_PROGRESS")
      .reduce((acc, curr) => acc + Number(curr.budget || 0), 0);

    // Distinct partners engaged
    const partnerIds = new Set(companyPrograms.map((p) => p.partnerId).filter(Boolean));
    const totalPartnersEngaged = partnerIds.size;

    if (totalPrograms === 0) {
      return {
        totalDisbursedBudget,
        completedPrograms,
        totalPrograms,
        totalOpportunities,
        totalPartnersEngaged,
        averageRating: 0,
        totalReviews: 0,
      };
    }

    // 3. Beneficiary Reviews from the company's programs
    const programIds = companyPrograms.map((p) => p.id);
    const reviews = await db
      .select({ rating: programReviews.rating })
      .from(programReviews)
      .where(inArray(programReviews.programId, programIds));

    const totalReviews = reviews.length;
    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    return {
      totalDisbursedBudget,
      completedPrograms,
      totalPrograms,
      totalOpportunities,
      totalPartnersEngaged,
      averageRating,
      totalReviews,
    };
  }

  async getOpenOpportunities(companyId: string) {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.companyId, companyId));
  }

  async findAll(query: CompanyListQuery): Promise<{ data: Company[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const condition = query.search
      ? or(
          like(companies.name, `%${query.search}%`),
          like(companies.city, `%${query.search}%`),
          like(companies.industry, `%${query.search}%`)
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(companies)
      .where(condition);

    const total = Number(totalResult?.count ?? 0);

    const data = await db
      .select()
      .from(companies)
      .where(condition)
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}

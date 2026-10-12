import { eq, like, or, count } from "drizzle-orm";
import { db } from "@/db";
import { companies, Company } from "@/db/schema/companies";
import { users, User } from "@/db/schema/users";
import { CreateCompanyDTO, UpdateCompanyDTO, CompanyListQuery } from "./company.interface";

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
        description: dto.description ?? null,
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        province: dto.province ?? null,
        website: dto.website || null,
        logoUrl: dto.logoUrl || null,
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
    await db.update(companies).set(dto).where(eq(companies.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Company not found after update");
    }
    return updated;
  }

  async findAll(query: CompanyListQuery): Promise<{ data: Company[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const condition = query.search
      ? or(
          like(companies.name, `%${query.search}%`),
          like(companies.city, `%${query.search}%`)
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

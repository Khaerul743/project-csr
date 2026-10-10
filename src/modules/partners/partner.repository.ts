import { eq, like, or, count } from "drizzle-orm";
import { db } from "@/db";
import { partners, Partner } from "@/db/schema/partners";
import { users, User } from "@/db/schema/users";
import { CreatePartnerDTO, UpdatePartnerDTO, PartnerListQuery } from "./partner.interface";

export class PartnerRepository {
  async findById(id: string): Promise<Partner | null> {
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByName(name: string): Promise<Partner | null> {
    const result = await db.select().from(partners).where(eq(partners.name, name)).limit(1);
    return result[0] ?? null;
  }

  async createPartnerWithAdmin(
    dto: CreatePartnerDTO,
    userId: string
  ): Promise<{ partner: Partner; updatedUser: User }> {
    return await db.transaction(async (tx) => {
      const partnerId = crypto.randomUUID();

      await tx.insert(partners).values({
        id: partnerId,
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
          partnerId: partnerId,
          role: "PARTNER_ADMIN",
        })
        .where(eq(users.id, userId));

      const [partner] = await tx.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
      const [updatedUser] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!partner || !updatedUser) {
        throw new Error("Failed to create partner or update user in transaction");
      }

      return { partner, updatedUser };
    });
  }

  async updatePartner(id: string, dto: UpdatePartnerDTO): Promise<Partner> {
    await db.update(partners).set(dto).where(eq(partners.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Partner not found after update");
    }
    return updated;
  }

  async findAll(query: PartnerListQuery): Promise<{ data: Partner[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const condition = query.search
      ? or(
          like(partners.name, `%${query.search}%`),
          like(partners.city, `%${query.search}%`)
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(partners)
      .where(condition);

    const total = Number(totalResult?.count ?? 0);

    const data = await db
      .select()
      .from(partners)
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

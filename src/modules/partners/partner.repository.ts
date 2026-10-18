import { eq, like, or, and, count, inArray } from "drizzle-orm";
import { db } from "@/db";
import { partners, Partner } from "@/db/schema/partners";
import { users, User } from "@/db/schema/users";
import { programs } from "@/db/schema/programs";
import { programReviews } from "@/db/schema/program-reviews";
import {
  CreatePartnerDTO,
  UpdatePartnerDTO,
  PartnerListQuery,
  PartnerMetrics,
} from "./partner.interface";

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
        tagline: dto.tagline ?? null,
        description: dto.description ?? null,
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        province: dto.province ?? null,
        website: dto.website || null,
        logoUrl: dto.logoUrl || null,
        coverUrl: dto.coverUrl || null,
        organizationType: dto.organizationType ?? null,
        foundedYear: dto.foundedYear ? Number(dto.foundedYear) : null,
        legalNumber: dto.legalNumber ?? null,
        npwpNumber: dto.npwpNumber ?? null,
        instagramUrl: dto.instagramUrl || null,
        linkedinUrl: dto.linkedinUrl || null,
        youtubeUrl: dto.youtubeUrl || null,
        portfolioDocUrl: dto.portfolioDocUrl || null,
        pastActivities: dto.pastActivities
          ? typeof dto.pastActivities === "string"
            ? dto.pastActivities
            : JSON.stringify(dto.pastActivities)
          : null,
        teamMembers: dto.teamMembers
          ? typeof dto.teamMembers === "string"
            ? dto.teamMembers
            : JSON.stringify(dto.teamMembers)
          : null,
        focusArea: dto.focusArea || "LAINNYA",
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
    const formattedData: any = { ...dto };

    if (dto.pastActivities !== undefined) {
      formattedData.pastActivities = dto.pastActivities
        ? typeof dto.pastActivities === "string"
          ? dto.pastActivities
          : JSON.stringify(dto.pastActivities)
        : null;
    }

    if (dto.teamMembers !== undefined) {
      formattedData.teamMembers = dto.teamMembers
        ? typeof dto.teamMembers === "string"
          ? dto.teamMembers
          : JSON.stringify(dto.teamMembers)
        : null;
    }

    if (dto.foundedYear !== undefined) {
      formattedData.foundedYear = dto.foundedYear ? Number(dto.foundedYear) : null;
    }

    await db.update(partners).set(formattedData).where(eq(partners.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Partner not found after update");
    }
    return updated;
  }

  async getMetrics(partnerId: string): Promise<PartnerMetrics> {
    const partnerPrograms = await db
      .select({ id: programs.id, status: programs.status })
      .from(programs)
      .where(eq(programs.partnerId, partnerId));

    const totalPrograms = partnerPrograms.length;
    const completedPrograms = partnerPrograms.filter((p) => p.status === "COMPLETED").length;

    if (totalPrograms === 0) {
      return {
        completedPrograms: 0,
        totalPrograms: 0,
        averageRating: 0,
        totalReviews: 0,
      };
    }

    const programIds = partnerPrograms.map((p) => p.id);

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
      completedPrograms,
      totalPrograms,
      averageRating,
      totalReviews,
    };
  }

  async findAll(query: PartnerListQuery): Promise<{ data: Partner[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.search) {
      conditions.push(
        or(
          like(partners.name, `%${query.search}%`),
          like(partners.city, `%${query.search}%`)
        )!
      );
    }
    if (query.focusArea) {
      conditions.push(eq(partners.focusArea, query.focusArea as any));
    }

    const condition = conditions.length > 0 ? and(...conditions) : undefined;

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

import { db } from "@/db";
import {
  programReviews,
  ProgramReview,
  NewProgramReview,
} from "@/db/schema/program-reviews";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { ReviewStats } from "./review.interface";

export class ReviewRepository {
  async create(data: NewProgramReview): Promise<ProgramReview> {
    const id = data.id || crypto.randomUUID();
    await db.insert(programReviews).values({
      ...data,
      id,
    });

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Gagal membuat data ulasan masyarakat");
    }
    return created;
  }

  async findById(id: string): Promise<ProgramReview | null> {
    const rows = await db
      .select()
      .from(programReviews)
      .where(eq(programReviews.id, id))
      .limit(1);

    return rows[0] || null;
  }

  async findByProgramId(programId: string): Promise<ProgramReview[]> {
    return db
      .select()
      .from(programReviews)
      .where(eq(programReviews.programId, programId))
      .orderBy(desc(programReviews.createdAt));
  }

  async getStatsByProgramId(programId: string): Promise<ReviewStats> {
    const reviews = await db
      .select({
        rating: programReviews.rating,
      })
      .from(programReviews)
      .where(eq(programReviews.programId, programId));

    const totalReviews = reviews.length;
    const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution,
      };
    }

    let sum = 0;
    for (const r of reviews) {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    }

    const averageRating = Number((sum / totalReviews).toFixed(1));

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }

  async findRecentByIp(
    programId: string,
    ipAddress: string,
    windowMinutes = 2
  ): Promise<ProgramReview | null> {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);

    const rows = await db
      .select()
      .from(programReviews)
      .where(
        and(
          eq(programReviews.programId, programId),
          eq(programReviews.ipAddress, ipAddress),
          gte(programReviews.createdAt, cutoffTime)
        )
      )
      .limit(1);

    return rows[0] || null;
  }
}

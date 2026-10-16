import { ReviewRepository } from "./review.repository";
import { ProgramRepository } from "../programs/program.repository";
import {
  CreateReviewDTO,
  ProgramReviewResponse,
} from "./review.interface";
import { ProgramReview } from "@/db/schema/program-reviews";
import {
  NotFoundError,
  BadRequestError,
} from "@/common/errors/app-error";

export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly programRepository: ProgramRepository
  ) {}

  async getProgramReviewsWithStats(programId: string): Promise<ProgramReviewResponse> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    const [stats, reviews] = await Promise.all([
      this.reviewRepository.getStatsByProgramId(programId),
      this.reviewRepository.findByProgramId(programId),
    ]);

    return {
      program: {
        id: program.id,
        title: program.title,
        description: program.description,
        focusArea: program.focusArea,
        targetCity: program.targetCity,
        targetProvince: program.targetProvince,
        companyName: program.companyName ?? null,
        companyLogo: program.companyLogo ?? null,
        partnerName: program.partnerName ?? null,
        partnerLogo: program.partnerLogo ?? null,
        status: program.status,
      },
      stats,
      reviews,
    };
  }

  async createReview(
    programId: string,
    input: CreateReviewDTO,
    clientMeta: { ipAddress?: string; userAgent?: string }
  ): Promise<ProgramReview> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    // Program status guard: only IN_PROGRESS or COMPLETED programs can receive public reviews
    if (program.status === "PLANNED") {
      throw new BadRequestError(
        "Program ini masih dalam tahap persiapan/perencanaan. Ulasan dan survei kepuasan akan dibuka saat program mulai berjalan di lapangan."
      );
    }

    if (program.status === "CANCELLED") {
      throw new BadRequestError("Program ini berstatus dibatalkan dan tidak menerima ulasan.");
    }

    // Anti-spam rate limiting by IP (2 minutes window)
    if (clientMeta.ipAddress && clientMeta.ipAddress !== "unknown") {
      const recent = await this.reviewRepository.findRecentByIp(
        programId,
        clientMeta.ipAddress,
        2
      );
      if (recent) {
        throw new BadRequestError(
          "Anda baru saja mengirimkan ulasan untuk program ini. Mohon tunggu beberapa menit sebelum mengirimkan ulasan lainnya."
        );
      }
    }

    return this.reviewRepository.create({
      programId,
      reviewerName: input.reviewerName.trim(),
      reviewerRole: input.reviewerRole.trim(),
      reviewerCity: input.reviewerCity?.trim() || null,
      rating: input.rating,
      comment: input.comment.trim(),
      photoUrl: input.photoUrl?.trim() || null,
      ipAddress: clientMeta.ipAddress || null,
      userAgent: clientMeta.userAgent ? clientMeta.userAgent.slice(0, 255) : null,
    });
  }
}

import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { ReviewService } from "./review.service";
import { createReviewSchema } from "./review.validation";

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async getByProgramId(request: Request, programId: string): Promise<NextResponse> {
    try {
      const result = await this.reviewService.getProgramReviewsWithStats(programId);
      return ApiResponse.success(result, "Data ulasan dan kepuasan masyarakat berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async create(request: Request, programId: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedInput = createReviewSchema.parse(body);

      // Extract client network info for anti-spam
      const forwardedFor = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const ipAddress = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : realIp || "unknown";

      const userAgent = request.headers.get("user-agent") || undefined;

      const created = await this.reviewService.createReview(
        programId,
        validatedInput,
        {
          ipAddress,
          userAgent,
        }
      );

      return ApiResponse.created(
        created,
        "Terima kasih atas aspirasi dan penilaian Anda! Ulasan berhasil dikirim."
      );
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

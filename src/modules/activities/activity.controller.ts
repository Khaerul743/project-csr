import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ActivityService } from "./activity.service";
import { createActivitySchema, reviewActivitySchema } from "./activity.validation";

export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  async getByProgramId(request: Request, programId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const list = await this.activityService.getActivitiesByProgramId(programId, authUser);
      return ApiResponse.success(list, "Daftar aktivitas program berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async create(request: Request, programId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = createActivitySchema.parse(body);

      const created = await this.activityService.createActivity(
        programId,
        validatedInput,
        authUser
      );

      return ApiResponse.created(created, "Laporan aktivitas lapangan berhasil diunggah");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async review(request: Request, activityId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validatedInput = reviewActivitySchema.parse(body);

      const updated = await this.activityService.reviewActivity(
        activityId,
        validatedInput,
        authUser
      );

      return ApiResponse.success(updated, "Status verifikasi aktivitas berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async delete(request: Request, activityId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      await this.activityService.deleteActivity(activityId, authUser);
      return ApiResponse.success(null, "Laporan aktivitas berhasil dihapus");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

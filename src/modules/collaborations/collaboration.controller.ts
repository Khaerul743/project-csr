import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { CollaborationService } from "./collaboration.service";
import { updateCollaborationSchema } from "./collaboration.validation";

export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  async getAll(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const url = new URL(request.url);
      const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : 1;
      const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 10;
      const status = (url.searchParams.get("status") as any) || undefined;
      const search = url.searchParams.get("search") || undefined;

      const query = { page, limit, status, search };

      let result;
      if (authUser.role === "PARTNER_ADMIN") {
        result = await this.collaborationService.getPartnerCollaborations(authUser.partnerId, query);
      } else {
        result = await this.collaborationService.getCompanyCollaborations(authUser.companyId, query);
      }

      return ApiResponse.success(result, "Daftar kolaborasi berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getById(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const result = await this.collaborationService.getCollaborationById(id, {
        companyId: authUser.companyId,
        partnerId: authUser.partnerId,
      });

      return ApiResponse.success(result, "Detail kolaborasi berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = updateCollaborationSchema.parse(body);

      const result = await this.collaborationService.updateCollaboration(
        id,
        {
          companyId: authUser.companyId,
          partnerId: authUser.partnerId,
        },
        validatedInput
      );

      const message =
        validatedInput.status === "AGREED"
          ? "Kesepakatan kolaborasi berhasil disahkan! Program resmi diinisiasi."
          : "Informasi kesepakatan kolaborasi berhasil diperbarui.";

      return ApiResponse.success(result, message);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}


import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ProgramService } from "./program.service";
import { updateProgramSchema } from "./program.validation";

export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  async getAll(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const url = new URL(request.url);
      const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : 1;
      const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 10;
      const status = (url.searchParams.get("status") as any) || undefined;
      const focusArea = (url.searchParams.get("focusArea") as any) || undefined;
      const search = url.searchParams.get("search") || undefined;

      const query = { page, limit, status, focusArea, search };

      let result;
      if (authUser.role === "PARTNER_ADMIN") {
        result = await this.programService.getPartnerPrograms(authUser.partnerId, query);
      } else {
        result = await this.programService.getCompanyPrograms(authUser.companyId, query);
      }

      return ApiResponse.success(result, "Daftar program pelaksanaan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getById(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const result = await this.programService.getProgramById(id, {
        companyId: authUser.companyId,
        partnerId: authUser.partnerId,
      });

      return ApiResponse.success(result, "Detail program pelaksanaan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = updateProgramSchema.parse(body);

      const result = await this.programService.updateProgram(
        id,
        {
          companyId: authUser.companyId,
          partnerId: authUser.partnerId,
        },
        validatedInput
      );

      return ApiResponse.success(result, "Data pelaksanaan program berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ProgramStageService } from "./program-stage.service";
import {
  saveStagesSchema,
  updateStageSchema,
} from "./program-stage.validation";

export class ProgramStageController {
  constructor(private readonly programStageService: ProgramStageService) {}

  async getStages(request: Request, programId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const result = await this.programStageService.getStagesByProgramId(programId, {
        companyId: authUser.companyId,
        partnerId: authUser.partnerId,
      });

      return ApiResponse.success(result, "Daftar tahapan kegiatan program berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async generateStages(request: Request, programId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const result = await this.programStageService.generateStagesFromProposal(programId, {
        companyId: authUser.companyId,
        partnerId: authUser.partnerId,
      });

      return ApiResponse.success(
        result,
        "Tahapan kegiatan terstruktur berhasil diekstraksi dari proposal oleh AI"
      );
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async saveStages(request: Request, programId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = saveStagesSchema.parse(body);

      const result = await this.programStageService.saveStages(
        programId,
        {
          companyId: authUser.companyId,
          partnerId: authUser.partnerId,
        },
        validatedInput
      );

      return ApiResponse.success(result, "Tahapan kegiatan berhasil disimpan ke program", 201);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async updateStage(
    request: Request,
    programId: string,
    stageId: string
  ): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = updateStageSchema.parse(body);

      const result = await this.programStageService.updateStage(
        stageId,
        {
          companyId: authUser.companyId,
          partnerId: authUser.partnerId,
        },
        validatedInput
      );

      return ApiResponse.success(result, "Tahapan kegiatan berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async deleteStage(
    request: Request,
    programId: string,
    stageId: string
  ): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN", "PARTNER_ADMIN"]);

      await this.programStageService.deleteStage(stageId, {
        companyId: authUser.companyId,
        partnerId: authUser.partnerId,
      });

      return ApiResponse.success(null, "Tahapan kegiatan berhasil dihapus");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

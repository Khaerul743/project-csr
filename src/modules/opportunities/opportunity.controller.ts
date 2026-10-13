import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { BadRequestError } from "@/common/errors/app-error";
import { AuthGuard } from "@/common/guards/auth.guard";
import { OpportunityService } from "./opportunity.service";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  invitePartnerSchema,
} from "./opportunity.validation";
import { CsrFocusArea } from "@/db/schema/csr-focus-areas";
import { OpportunityStatus } from "@/db/schema/opportunities";

export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  async create(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validatedInput = createOpportunitySchema.parse(body);

      const result = await this.opportunityService.createOpportunity(
        authUser.sub,
        authUser.companyId,
        validatedInput
      );

      return ApiResponse.created(result, "Opportunity berhasil dibuat");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validatedInput = updateOpportunitySchema.parse(body);

      const result = await this.opportunityService.updateOpportunity(
        id,
        authUser.companyId,
        validatedInput
      );

      return ApiResponse.success(result, "Opportunity berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async delete(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      await this.opportunityService.deleteOpportunity(id, authUser.companyId);
      return ApiResponse.success(null, "Opportunity berhasil dihapus");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getById(id: string): Promise<NextResponse> {
    try {
      const result = await this.opportunityService.getOpportunityById(id);
      return ApiResponse.success(result, "Detail opportunity berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getAll(request: Request): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : 1;
      const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 10;
      const search = url.searchParams.get("search") || undefined;
      const focusArea = (url.searchParams.get("focusArea") as CsrFocusArea) || undefined;
      const targetCity = url.searchParams.get("city") || undefined;
      const status = (url.searchParams.get("status") as OpportunityStatus) || undefined;

      const result = await this.opportunityService.getPublicCatalog({
        page,
        limit,
        search,
        focusArea,
        targetCity,
        status,
      });

      return ApiResponse.success(result, "Katalog opportunity berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getMyCompanyOpportunities(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const url = new URL(request.url);
      const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : 1;
      const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 10;
      const search = url.searchParams.get("search") || undefined;
      const status = (url.searchParams.get("status") as OpportunityStatus) || undefined;
      const focusArea = (url.searchParams.get("focusArea") as CsrFocusArea) || undefined;

      const result = await this.opportunityService.getCompanyOpportunities(
        authUser.companyId,
        { page, limit, search, status, focusArea }
      );

      return ApiResponse.success(result, "Daftar opportunity perusahaan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async invitePartner(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validatedInput = invitePartnerSchema.parse(body);

      const result = await this.opportunityService.invitePartner(
        id,
        authUser.sub,
        authUser.companyId,
        validatedInput
      );

      return ApiResponse.created(result, "Mitra berhasil diundang ke opportunity");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getInvitations(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const result = await this.opportunityService.getOpportunityInvitations(
        id,
        authUser.companyId
      );

      return ApiResponse.success(result, "Daftar mitra yang diundang berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getMyInvitations(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const result = await this.opportunityService.getPartnerInvitations(authUser.partnerId);
      return ApiResponse.success(result, "Daftar undangan opportunity berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async respondInvitation(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const body = await request.json();
      const status = body?.status;
      if (status !== "ACCEPTED" && status !== "DECLINED") {
        throw new BadRequestError("Status harus ACCEPTED atau DECLINED");
      }

      const result = await this.opportunityService.respondOpportunityInvitation(
        id,
        authUser.partnerId,
        status
      );

      const msg = status === "ACCEPTED" ? "Undangan inisiatif diterima" : "Undangan inisiatif ditolak";
      return ApiResponse.success(result, msg);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}


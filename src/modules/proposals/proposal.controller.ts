import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ProposalService } from "./proposal.service";
import {
  createProposalSchema,
  updateProposalSchema,
  reviewProposalSchema,
} from "./proposal.validation";

export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  async create(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = createProposalSchema.parse(body);

      const result = await this.proposalService.submitProposal(
        authUser.sub,
        authUser.partnerId,
        validatedInput
      );

      return ApiResponse.created(result, "Proposal berhasil diajukan kepada perusahaan");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = updateProposalSchema.parse(body);

      const result = await this.proposalService.updateProposal(
        id,
        authUser.partnerId,
        validatedInput
      );

      return ApiResponse.success(result, "Proposal berhasil diperbarui dan diajukan kembali");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getById(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const result = await this.proposalService.getProposalById(id, {
        companyId: authUser.companyId,
        partnerId: authUser.partnerId,
      });

      return ApiResponse.success(result, "Detail proposal berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getMyPartnerProposals(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const url = new URL(request.url);
      const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : 1;
      const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 10;
      const opportunityId = url.searchParams.get("opportunityId") || undefined;
      const status = (url.searchParams.get("status") as any) || undefined;
      const search = url.searchParams.get("search") || undefined;

      const result = await this.proposalService.getPartnerProposals(
        authUser.partnerId,
        { page, limit, opportunityId, status, search }
      );

      return ApiResponse.success(result, "Daftar proposal mitra berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getCompanyProposals(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const url = new URL(request.url);
      const page = url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : 1;
      const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : 10;
      const opportunityId = url.searchParams.get("opportunityId") || undefined;
      const status = (url.searchParams.get("status") as any) || undefined;
      const search = url.searchParams.get("search") || undefined;

      const result = await this.proposalService.getCompanyProposals(
        authUser.companyId,
        { page, limit, opportunityId, status, search }
      );

      return ApiResponse.success(result, "Proposal masuk berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async review(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validatedInput = reviewProposalSchema.parse(body);

      const result = await this.proposalService.reviewProposal(
        id,
        authUser.sub,
        authUser.companyId,
        validatedInput
      );

      const message =
        validatedInput.status === "ACCEPTED"
          ? "Proposal berhasil disetujui! Kolaborasi baru telah dibentuk."
          : validatedInput.status === "REVISION_REQUESTED"
          ? "Permintaan revisi proposal berhasil dikirimkan ke mitra."
          : validatedInput.status === "REJECTED"
          ? "Proposal telah ditolak."
          : "Proposal sedang dalam peninjauan.";

      return ApiResponse.success(result, message);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async withdraw(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const result = await this.proposalService.withdrawProposal(
        id,
        authUser.partnerId
      );

      return ApiResponse.success(result, "Proposal berhasil ditarik kembali");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

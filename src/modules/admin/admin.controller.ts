import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { JwtUserPayload } from "@/common/jwt/jwt.interface";
import { CompanyStatus } from "@/db/schema/companies";
import { PartnerStatus } from "@/db/schema/partners";
import { UserRole, UserStatus } from "@/db/schema/users";
import { OpportunityStatus } from "@/db/schema/opportunities";
import { ProposalStatus } from "@/db/schema/proposals";
import { ProgramStatus } from "@/db/schema/programs";
import { AdminAuditTargetType } from "@/db/schema/admin-audit-logs";
import { AdminService } from "./admin.service";
import {
  createSuperAdminSchema,
  moderateOpportunitySchema,
  updateTenantStatusSchema,
  updateUserStatusSchema,
} from "./admin.validation";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private authorizeSuperAdmin(request: Request): JwtUserPayload {
    return AuthGuard.authorize(request, ["SUPER_ADMIN"]);
  }

  private parsePagination(url: URL) {
    const pageRaw = url.searchParams.get("page");
    const limitRaw = url.searchParams.get("limit");
    const page = pageRaw ? parseInt(pageRaw, 10) : 1;
    const limit = limitRaw ? parseInt(limitRaw, 10) : 12;
    const search = url.searchParams.get("search")?.trim() || undefined;
    return {
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 12 : limit,
      search,
    };
  }

  async getOverview(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const data = await this.adminService.getOverview();
      return ApiResponse.success(data, "Ringkasan metrik platform berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getCompanies(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const status = (url.searchParams.get("status") as CompanyStatus | null) || undefined;
      const verifiedParam = url.searchParams.get("isVerified");
      const isVerified =
        verifiedParam === "true" ? true : verifiedParam === "false" ? false : undefined;

      const result = await this.adminService.getCompanies({
        page,
        limit,
        search,
        status,
        isVerified,
      });
      return ApiResponse.success(result, "Daftar perusahaan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getCompanyDetail(request: Request, companyId: string): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const result = await this.adminService.getCompanyDetail(companyId);
      return ApiResponse.success(result, "Detail perusahaan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async updateCompanyStatus(request: Request, companyId: string): Promise<NextResponse> {
    try {
      const admin = this.authorizeSuperAdmin(request);
      const body = await request.json();
      const validated = updateTenantStatusSchema.parse(body);

      const updated = await this.adminService.updateCompanyStatus(admin.sub, companyId, validated);
      return ApiResponse.success(updated, "Status perusahaan berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getPartners(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const status = (url.searchParams.get("status") as PartnerStatus | null) || undefined;
      const focusArea = url.searchParams.get("focusArea") || undefined;
      const verifiedParam = url.searchParams.get("isVerified");
      const isVerified =
        verifiedParam === "true" ? true : verifiedParam === "false" ? false : undefined;

      const result = await this.adminService.getPartners({
        page,
        limit,
        search,
        status,
        focusArea,
        isVerified,
      });
      return ApiResponse.success(result, "Daftar mitra NGO berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getPartnerDetail(request: Request, partnerId: string): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const result = await this.adminService.getPartnerDetail(partnerId);
      return ApiResponse.success(result, "Detail mitra NGO berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async updatePartnerStatus(request: Request, partnerId: string): Promise<NextResponse> {
    try {
      const admin = this.authorizeSuperAdmin(request);
      const body = await request.json();
      const validated = updateTenantStatusSchema.parse(body);

      const updated = await this.adminService.updatePartnerStatus(admin.sub, partnerId, validated);
      return ApiResponse.success(updated, "Status mitra NGO berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getUsers(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const role = (url.searchParams.get("role") as UserRole | null) || undefined;
      const status = (url.searchParams.get("status") as UserStatus | null) || undefined;

      const result = await this.adminService.getUsers({ page, limit, search, role, status });
      return ApiResponse.success(result, "Daftar pengguna sistem berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async createSuperAdmin(request: Request): Promise<NextResponse> {
    try {
      const admin = this.authorizeSuperAdmin(request);
      const body = await request.json();
      const validated = createSuperAdminSchema.parse(body);

      const created = await this.adminService.createSuperAdmin(admin.sub, validated);
      return ApiResponse.created(created, "Akun Super Admin baru berhasil dibuat");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async updateUserStatus(request: Request, userId: string): Promise<NextResponse> {
    try {
      const admin = this.authorizeSuperAdmin(request);
      const body = await request.json();
      const validated = updateUserStatusSchema.parse(body);

      const updated = await this.adminService.updateUserStatus(admin.sub, userId, validated);
      return ApiResponse.success(updated, "Status pengguna berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getOpportunities(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const status = (url.searchParams.get("status") as OpportunityStatus | null) || undefined;
      const focusArea = url.searchParams.get("focusArea") || undefined;

      const result = await this.adminService.getOpportunities({
        page,
        limit,
        search,
        status,
        focusArea,
      });
      return ApiResponse.success(result, "Daftar peluang CSR platform berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async moderateOpportunity(request: Request, opportunityId: string): Promise<NextResponse> {
    try {
      const admin = this.authorizeSuperAdmin(request);
      const body = await request.json();
      const validated = moderateOpportunitySchema.parse(body);

      const updated = await this.adminService.moderateOpportunity(
        admin.sub,
        opportunityId,
        validated
      );
      return ApiResponse.success(updated, "Status moderasi peluang CSR berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getProposals(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const status = (url.searchParams.get("status") as ProposalStatus | null) || undefined;

      const result = await this.adminService.getProposals({ page, limit, search, status });
      return ApiResponse.success(result, "Daftar proposal lintas platform berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getPrograms(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const status = (url.searchParams.get("status") as ProgramStatus | null) || undefined;
      const focusArea = url.searchParams.get("focusArea") || undefined;

      const result = await this.adminService.getPrograms({ page, limit, search, status, focusArea });
      return ApiResponse.success(result, "Daftar program CSR lintas platform berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getProgramAuditDetail(request: Request, programId: string): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const detail = await this.adminService.getProgramAuditDetail(programId);
      return ApiResponse.success(detail, "Detail audit program berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getImpactOverview(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const result = await this.adminService.getImpactOverview();
      return ApiResponse.success(result, "Ringkasan suara warga dan dampak ESG berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getSystemStatus(request: Request): Promise<NextResponse> {
    try {
      this.authorizeSuperAdmin(request);
      const url = new URL(request.url);
      const { page, limit, search } = this.parsePagination(url);
      const targetType =
        (url.searchParams.get("targetType") as AdminAuditTargetType | null) || undefined;

      const result = await this.adminService.getSystemStatus({
        page,
        limit,
        search,
        targetType,
      });
      return ApiResponse.success(result, "Status sistem dan log audit admin berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}


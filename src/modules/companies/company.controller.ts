import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { CompanyService } from "./company.service";
import { createCompanySchema, updateCompanySchema } from "./company.validation";

export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  async create(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["STAGING"]);

      const body = await request.json();
      const validatedInput = createCompanySchema.parse(body);

      const result = await this.companyService.createCompany(authUser.sub, validatedInput);
      return ApiResponse.created(result, "Company created successfully. You are now MANAGEMENT.");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getCurrent(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT", "CSR_ADMIN"]);

      const company = await this.companyService.getCurrentCompany(authUser.companyId);
      return ApiResponse.success(company, "Company profile retrieved successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getById(id: string): Promise<NextResponse> {
    try {
      const company = await this.companyService.getCompanyById(id);
      return ApiResponse.success(company, "Company details retrieved successfully");
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

      const result = await this.companyService.getAllCompanies({ page, limit, search });
      return ApiResponse.success(result, "Companies retrieved successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT"]);

      const body = await request.json();
      const validatedInput = updateCompanySchema.parse(body);

      const updated = await this.companyService.updateCompany(authUser.companyId, validatedInput);
      return ApiResponse.success(updated, "Company profile updated successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

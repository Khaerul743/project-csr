import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { PartnerService } from "./partner.service";
import { createPartnerSchema, updatePartnerSchema } from "./partner.validation";

export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  async create(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["STAGING"]);

      const body = await request.json();
      const validatedInput = createPartnerSchema.parse(body);

      const result = await this.partnerService.createPartner(authUser.sub, validatedInput);
      return ApiResponse.created(result, "Partner created successfully. You are now PARTNER_ADMIN.");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getCurrent(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const partner = await this.partnerService.getCurrentPartner(authUser.partnerId);
      return ApiResponse.success(partner, "Partner profile retrieved successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getById(id: string): Promise<NextResponse> {
    try {
      const partner = await this.partnerService.getPartnerById(id);
      return ApiResponse.success(partner, "Partner details retrieved successfully");
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
      const focusArea = url.searchParams.get("focusArea") || undefined;

      const result = await this.partnerService.getAllPartners({ page, limit, search, focusArea });
      return ApiResponse.success(result, "Partners retrieved successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["PARTNER_ADMIN"]);

      const body = await request.json();
      const validatedInput = updatePartnerSchema.parse(body);

      const updated = await this.partnerService.updatePartner(authUser.partnerId, validatedInput);
      return ApiResponse.success(updated, "Partner profile updated successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

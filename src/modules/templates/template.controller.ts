import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import {
  templateCategoryEnum,
  TemplateCategory,
} from "@/db/schema/company-templates";
import { TemplateService } from "./template.service";
import {
  createTemplateSchema,
  updateTemplateSchema,
} from "./template.validation";

export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  async list(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["CSR_ADMIN", "MANAGEMENT"]);

      const url = new URL(request.url);
      const rawCategory = url.searchParams.get("category");
      let category: TemplateCategory | undefined;
      if (
        rawCategory &&
        (templateCategoryEnum as readonly string[]).includes(rawCategory)
      ) {
        category = rawCategory as TemplateCategory;
      }

      const templates = await this.templateService.listTemplates(
        authUser.companyId,
        category
      );
      return ApiResponse.success(templates, "Daftar template berhasil dimuat");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async create(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["CSR_ADMIN", "MANAGEMENT"]);

      const body = await request.json();
      const validated = createTemplateSchema.parse(body);

      const created = await this.templateService.createTemplate(
        authUser.companyId,
        authUser.sub,
        validated
      );
      return ApiResponse.created(created, "Template berhasil dibuat");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async update(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["CSR_ADMIN", "MANAGEMENT"]);

      const body = await request.json();
      const validated = updateTemplateSchema.parse(body);

      const updated = await this.templateService.updateTemplate(
        authUser.companyId,
        id,
        validated
      );
      return ApiResponse.success(updated, "Template berhasil diperbarui");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async delete(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["CSR_ADMIN", "MANAGEMENT"]);

      await this.templateService.deleteTemplate(authUser.companyId, id);
      return ApiResponse.success(null, "Template berhasil dihapus");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}


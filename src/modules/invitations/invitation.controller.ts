import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { InvitationService } from "./invitation.service";
import {
  createInvitationSchema,
  acceptInvitationSchema,
  rejectInvitationSchema,
} from "./invitation.validation";

export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  async create(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT"]);

      const body = await request.json();
      const validatedInput = createInvitationSchema.parse(body);

      const result = await this.invitationService.sendCompanyInvitation(
        authUser.sub,
        authUser.companyId,
        validatedInput
      );

      return ApiResponse.created(result, "Undangan tim berhasil dikirim");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getCompanyInvitations(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT"]);

      const result = await this.invitationService.getCompanyInvitations(authUser.companyId);
      return ApiResponse.success(result, "Daftar undangan tim berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getMyPending(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const result = await this.invitationService.getMyPendingInvitations(authUser.email);
      return ApiResponse.success(result, "Daftar undangan pending berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async accept(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["STAGING"]);

      const body = await request.json();
      const validatedInput = acceptInvitationSchema.parse(body);

      const result = await this.invitationService.acceptInvitation(
        authUser.sub,
        authUser.email,
        authUser.role,
        validatedInput
      );

      return ApiResponse.success(result, "Undangan berhasil diterima! Selamat bergabung.");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async reject(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);

      const body = await request.json();
      const validatedInput = rejectInvitationSchema.parse(body);

      await this.invitationService.rejectInvitation(
        authUser.email,
        validatedInput.invitationId
      );

      return ApiResponse.success(null, "Undangan berhasil ditolak");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async cancel(request: Request, id: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["MANAGEMENT"]);

      await this.invitationService.cancelInvitation(authUser.companyId, id);
      return ApiResponse.success(null, "Undangan berhasil dibatalkan");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

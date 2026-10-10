import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: Request): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedInput = registerSchema.parse(body);

      const result = await this.authService.register(validatedInput);
      return ApiResponse.created(result, "Registration successful");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async login(request: Request): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedInput = loginSchema.parse(body);

      const result = await this.authService.login(validatedInput);
      return ApiResponse.success(result, "Login successful");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async me(request: Request): Promise<NextResponse> {
    try {
      const user = AuthGuard.authenticate(request);
      const profile = await this.authService.getProfile(user.sub);
      return ApiResponse.success(profile, "User profile retrieved successfully");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

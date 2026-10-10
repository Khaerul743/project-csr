import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

export const authRepository = new AuthRepository();
export const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);

export * from "./auth.interface";
export * from "./auth.validation";
export * from "./auth.repository";
export * from "./auth.service";
export * from "./auth.controller";

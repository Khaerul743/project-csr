import { authRepository } from "@/modules/auth";
import { AdminRepository } from "./admin.repository";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";

export const adminRepository = new AdminRepository();
export const adminService = new AdminService(adminRepository, authRepository);
export const adminController = new AdminController(adminService);

export * from "./admin.interface";
export * from "./admin.validation";
export * from "./admin.repository";
export * from "./admin.service";
export * from "./admin.controller";


import { authRepository } from "@/modules/auth";
import { CompanyRepository } from "./company.repository";
import { CompanyService } from "./company.service";
import { CompanyController } from "./company.controller";

export const companyRepository = new CompanyRepository();
export const companyService = new CompanyService(companyRepository, authRepository);
export const companyController = new CompanyController(companyService);

export * from "./company.interface";
export * from "./company.validation";
export * from "./company.repository";
export * from "./company.service";
export * from "./company.controller";

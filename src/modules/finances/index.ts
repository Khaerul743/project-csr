import { FinanceRepository } from "./finance.repository";
import { FinanceService } from "./finance.service";
import { FinanceController } from "./finance.controller";

export const financeRepository = new FinanceRepository();
export const financeService = new FinanceService(financeRepository);
export const financeController = new FinanceController(financeService);

export * from "./finance.interface";
export * from "./finance.validation";

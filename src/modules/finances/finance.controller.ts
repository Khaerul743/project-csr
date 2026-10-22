import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { FinanceService } from "./finance.service";
import {
  createDisbursementSchema,
  confirmDisbursementSchema,
  createExpenseSchema,
  verifyExpenseSchema,
} from "./finance.validation";

export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  async getProgramFinances(request: Request, programId: string): Promise<NextResponse> {
    try {
      const user = AuthGuard.authenticate(request);
      const data = await this.financeService.getProgramFinances(programId, user);
      return ApiResponse.success(data, "Data keuangan program berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async createDisbursement(request: Request, programId: string): Promise<NextResponse> {
    try {
      const user = AuthGuard.authenticate(request);
      AuthGuard.authorize(user, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validated = createDisbursementSchema.parse(body);

      const result = await this.financeService.createDisbursement(programId, user, validated);
      return ApiResponse.created(result, "Dana termin berhasil disalurkan dan menunggu konfirmasi mitra");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async confirmDisbursement(
    request: Request,
    programId: string,
    disbursementId: string
  ): Promise<NextResponse> {
    try {
      const user = AuthGuard.authenticate(request);
      AuthGuard.authorize(user, ["PARTNER_ADMIN"]);

      const body = await request.json().catch(() => ({}));
      const validated = confirmDisbursementSchema.parse(body);

      const result = await this.financeService.confirmDisbursement(
        programId,
        disbursementId,
        user,
        validated
      );
      return ApiResponse.success(result, "Penerimaan dana termin berhasil dikonfirmasi");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async createExpense(request: Request, programId: string): Promise<NextResponse> {
    try {
      const user = AuthGuard.authenticate(request);
      AuthGuard.authorize(user, ["PARTNER_ADMIN"]);

      const body = await request.json();
      const validated = createExpenseSchema.parse(body);

      const result = await this.financeService.createExpense(programId, user, validated);
      return ApiResponse.created(result, "Bukti pengeluaran berhasil dilaporkan");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async verifyExpense(
    request: Request,
    programId: string,
    expenseId: string
  ): Promise<NextResponse> {
    try {
      const user = AuthGuard.authenticate(request);
      AuthGuard.authorize(user, ["MANAGEMENT", "CSR_ADMIN"]);

      const body = await request.json();
      const validated = verifyExpenseSchema.parse(body);

      const result = await this.financeService.verifyExpense(
        programId,
        expenseId,
        user,
        validated
      );
      return ApiResponse.success(result, `Pengeluaran berhasil di-verifikasi (${validated.verificationStatus})`);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

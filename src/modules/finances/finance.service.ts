import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { AuthUser } from "@/common/guards/auth.guard";
import { FinanceRepository } from "./finance.repository";
import {
  CreateDisbursementDTO,
  ConfirmDisbursementDTO,
  CreateExpenseDTO,
  VerifyExpenseDTO,
  ProgramFinancesResponse,
} from "./finance.interface";

export class FinanceService {
  private readonly logger = new AppLogger("FinanceService");

  constructor(private readonly financeRepository: FinanceRepository) { }

  private async getProgramOrThrow(programId: string) {
    const program = await this.financeRepository.findProgramById(programId);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }
    return program;
  }

  private verifyCompanyAccess(program: any, user: AuthUser) {
    if (user.companyId !== program.companyId) {
      throw new ForbiddenError("Anda tidak memiliki hak akses untuk mengelola keuangan program perusahaan ini");
    }
  }

  private verifyPartnerAccess(program: any, user: AuthUser) {
    if (user.partnerId !== program.partnerId) {
      throw new ForbiddenError("Anda tidak memiliki hak akses untuk mengelola keuangan program mitra ini");
    }
  }

  async getProgramFinances(programId: string, user: AuthUser): Promise<ProgramFinancesResponse> {
    const program = await this.getProgramOrThrow(programId);

    // Ensure user has access (either company or partner)
    const isCompanyOwner = user.companyId === program.companyId;
    const isPartnerOwner = user.partnerId === program.partnerId;

    if (!isCompanyOwner && !isPartnerOwner) {
      throw new ForbiddenError("Akses ditolak untuk melihat data keuangan program ini");
    }

    const [summary, disbursements, expenses] = await Promise.all([
      this.financeRepository.getFinancialSummary(programId),
      this.financeRepository.findDisbursementsByProgramId(programId),
      this.financeRepository.findExpensesByProgramId(programId),
    ]);

    return {
      summary,
      disbursements,
      expenses,
    };
  }

  async createDisbursement(programId: string, user: AuthUser, dto: CreateDisbursementDTO) {
    const program = await this.getProgramOrThrow(programId);
    this.verifyCompanyAccess(program, user);

    const amountNum = Number(dto.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new BadRequestError("Nominal pencairan harus lebih dari 0");
    }

    // STRICT GUARDRAIL: Penyaluran dana tidak boleh melebihi pagu anggaran yang disepakati diawal
    const summary = await this.financeRepository.getFinancialSummary(programId);
    const agreedBudget = summary.agreedBudget;
    const remainingDisbursableBudget = Math.max(0, agreedBudget - summary.totalDisbursed);

    if (remainingDisbursableBudget <= 0) {
      const formattedAgreed = "Rp " + Math.round(agreedBudget).toLocaleString("id-ID");
      throw new BadRequestError(
        `Total pagu anggaran program (${formattedAgreed}) telah disalurkan seluruhnya. Tidak dapat menyalurkan dana melebihi anggaran yang telah disepakati diawal.`
      );
    }

    if (amountNum > remainingDisbursableBudget) {
      const formattedAmt = "Rp " + Math.round(amountNum).toLocaleString("id-ID");
      const formattedRemaining = "Rp " + Math.round(remainingDisbursableBudget).toLocaleString("id-ID");
      const formattedAgreed = "Rp " + Math.round(agreedBudget).toLocaleString("id-ID");
      throw new BadRequestError(
        `Nominal penyaluran (${formattedAmt}) melebihi sisa pagu anggaran yang belum disalurkan (${formattedRemaining}) dari total pagu yang disepakati (${formattedAgreed}).`
      );
    }

    this.logger.info(
      `Company ${user.companyId} creating disbursement of Rp ${amountNum} for program ${programId}`
    );

    const disbursement = await this.financeRepository.createDisbursement(programId, {
      ...dto,
      amount: amountNum,
    });

    return disbursement;
  }

  async confirmDisbursement(
    programId: string,
    disbursementId: string,
    user: AuthUser,
    dto: ConfirmDisbursementDTO
  ) {
    const program = await this.getProgramOrThrow(programId);
    this.verifyPartnerAccess(program, user);

    const disbursement = await this.financeRepository.findDisbursementById(disbursementId);
    if (!disbursement || disbursement.programId !== programId) {
      throw new NotFoundError("Data pencairan dana tidak ditemukan pada program ini");
    }

    if (disbursement.status === "CONFIRMED") {
      throw new BadRequestError("Pencairan dana ini sudah dikonfirmasi sebelumnya");
    }

    this.logger.info(
      `Partner ${user.partnerId} confirmed disbursement ${disbursementId} for program ${programId}`
    );

    const updated = await this.financeRepository.confirmDisbursement(
      disbursementId,
      user.sub,
      dto.confirmedNotes
    );

    return updated;
  }

  async createExpense(programId: string, user: AuthUser, dto: CreateExpenseDTO) {
    const program = await this.getProgramOrThrow(programId);
    this.verifyPartnerAccess(program, user);

    const amountNum = Number(dto.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new BadRequestError("Nominal pengeluaran harus lebih dari 0");
    }

    if (!dto.receiptUrl || dto.receiptUrl.trim() === "") {
      throw new BadRequestError("Bukti foto nota / kwitansi pengeluaran wajib dilampirkan");
    }

    // STRICT GUARDRAIL 1: Validasi Sisa Kas Mitra yang telah Terkonfirmasi Diterima
    const summary = await this.financeRepository.getFinancialSummary(programId);
    if (summary.totalConfirmedReceived <= 0) {
      throw new BadRequestError(
        "Dana kas program belum tersedia. Konfirmasi penerimaan dana termin terlebih dahulu di rekening sebelum mencatat pengeluaran."
      );
    }

    if (amountNum > summary.remainingPartnerBalance) {
      const formattedAmt = "Rp " + Math.round(amountNum).toLocaleString("id-ID");
      const formattedBalance = "Rp " + Math.round(summary.remainingPartnerBalance).toLocaleString("id-ID");
      throw new BadRequestError(
        `Nominal belanja (${formattedAmt}) melebihi sisa saldo kas yang dikelola mitra saat ini (${formattedBalance}). Silakan sesuaikan nominal atau tunggu pencairan dana termin berikutnya dari perusahaan.`
      );
    }

    // STRICT GUARDRAIL 2: Validasi Sisa Alokasi Termin Khusus (jika termin dipilih)
    if (dto.disbursementId) {
      const disbursement = await this.financeRepository.findDisbursementById(dto.disbursementId);
      if (!disbursement || disbursement.programId !== programId) {
        throw new NotFoundError("Data termin penyaluran dana tidak ditemukan pada program ini");
      }

      if (disbursement.status !== "CONFIRMED") {
        throw new BadRequestError(
          `Dana pada ${disbursement.trancheName} belum dikonfirmasi masuk ke rekening kas mitra. Harap konfirmasi penerimaan dana termin ini terlebih dahulu.`
        );
      }

      const spentOnTranche = await this.financeRepository.getDisbursementSpent(dto.disbursementId);
      const trancheTotal = Number(disbursement.amount || 0);
      const remainingTranche = Math.max(0, trancheTotal - spentOnTranche);

      if (amountNum > remainingTranche) {
        const formattedAmt = "Rp " + Math.round(amountNum).toLocaleString("id-ID");
        const formattedRemainingTranche = "Rp " + Math.round(remainingTranche).toLocaleString("id-ID");
        throw new BadRequestError(
          `Nominal belanja (${formattedAmt}) melebihi sisa alokasi dana ${disbursement.trancheName} (${formattedRemainingTranche}). Silakan sesuaikan nominal nota.`
        );
      }
    }

    this.logger.info(
      `Partner ${user.partnerId} reported expense of Rp ${amountNum} for program ${programId}`
    );

    const expense = await this.financeRepository.createExpense(programId, {
      ...dto,
      amount: amountNum,
    });

    return expense;
  }

  async verifyExpense(
    programId: string,
    expenseId: string,
    user: AuthUser,
    dto: VerifyExpenseDTO
  ) {
    const program = await this.getProgramOrThrow(programId);
    this.verifyCompanyAccess(program, user);

    const expense = await this.financeRepository.findExpenseById(expenseId);
    if (!expense || expense.programId !== programId) {
      throw new NotFoundError("Data pengeluaran tidak ditemukan pada program ini");
    }

    this.logger.info(
      `Company ${user.companyId} verified expense ${expenseId} as ${dto.verificationStatus} for program ${programId}`
    );

    const updated = await this.financeRepository.verifyExpense(
      expenseId,
      user.sub,
      dto.verificationStatus,
      dto.verificationNotes
    );

    return updated;
  }
}

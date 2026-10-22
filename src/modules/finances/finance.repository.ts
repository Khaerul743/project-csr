import { db } from "@/db";
import {
  programDisbursements,
  ProgramDisbursement,
  NewProgramDisbursement,
} from "@/db/schema/program-disbursements";
import {
  programExpenses,
  ProgramExpense,
  NewProgramExpense,
} from "@/db/schema/program-expenses";
import { programs } from "@/db/schema/programs";
import { users } from "@/db/schema/users";
import { eq, desc, asc, and, count } from "drizzle-orm";
import {
  CreateDisbursementDTO,
  CreateExpenseDTO,
  ProgramFinancialSummary,
} from "./finance.interface";

export class FinanceRepository {
  async findProgramById(programId: string) {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1);
    return program ?? null;
  }

  async findDisbursementsByProgramId(programId: string) {
    const rows = await db
      .select({
        disbursement: programDisbursements,
        confirmedByName: users.name,
      })
      .from(programDisbursements)
      .leftJoin(users, eq(programDisbursements.confirmedBy, users.id))
      .where(eq(programDisbursements.programId, programId))
      .orderBy(asc(programDisbursements.trancheNumber), asc(programDisbursements.createdAt));

    return rows.map((r) => ({
      ...r.disbursement,
      confirmedByName: r.confirmedByName ?? null,
    }));
  }

  async findDisbursementById(id: string) {
    const [row] = await db
      .select()
      .from(programDisbursements)
      .where(eq(programDisbursements.id, id))
      .limit(1);
    return row ?? null;
  }

  async createDisbursement(programId: string, dto: CreateDisbursementDTO): Promise<ProgramDisbursement> {
    const existingCount = await db
      .select({ count: count() })
      .from(programDisbursements)
      .where(eq(programDisbursements.programId, programId));

    const nextTrancheNumber = dto.trancheNumber || Number(existingCount[0]?.count ?? 0) + 1;

    const id = crypto.randomUUID();
    await db.insert(programDisbursements).values({
      id,
      programId,
      trancheNumber: nextTrancheNumber,
      trancheName: dto.trancheName,
      amount: String(dto.amount),
      disbursedDate: dto.disbursedDate ? new Date(dto.disbursedDate) : new Date(),
      transferProofUrl: dto.transferProofUrl || null,
      bankName: dto.bankName || null,
      bankAccountNumber: dto.bankAccountNumber || null,
      bankAccountHolder: dto.bankAccountHolder || null,
      notes: dto.notes || null,
      status: "PENDING",
    });

    const [created] = await db
      .select()
      .from(programDisbursements)
      .where(eq(programDisbursements.id, id))
      .limit(1);

    return created;
  }

  async confirmDisbursement(
    id: string,
    confirmedByUserId: string,
    confirmedNotes?: string | null
  ): Promise<ProgramDisbursement> {
    await db
      .update(programDisbursements)
      .set({
        status: "CONFIRMED",
        confirmedAt: new Date(),
        confirmedBy: confirmedByUserId,
        confirmedNotes: confirmedNotes || null,
      })
      .where(eq(programDisbursements.id, id));

    const [updated] = await db
      .select()
      .from(programDisbursements)
      .where(eq(programDisbursements.id, id))
      .limit(1);

    return updated;
  }

  async findExpensesByProgramId(programId: string) {
    const rows = await db
      .select({
        expense: programExpenses,
        verifiedByName: users.name,
      })
      .from(programExpenses)
      .leftJoin(users, eq(programExpenses.verifiedBy, users.id))
      .where(eq(programExpenses.programId, programId))
      .orderBy(desc(programExpenses.expenseDate), desc(programExpenses.createdAt));

    return rows.map((r) => ({
      ...r.expense,
      verifiedByName: r.verifiedByName ?? null,
    }));
  }

  async findExpenseById(id: string) {
    const [row] = await db
      .select()
      .from(programExpenses)
      .where(eq(programExpenses.id, id))
      .limit(1);
    return row ?? null;
  }

  async getDisbursementSpent(disbursementId: string): Promise<number> {
    const rows = await db
      .select({ amount: programExpenses.amount })
      .from(programExpenses)
      .where(eq(programExpenses.disbursementId, disbursementId));

    return rows.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }

  async createExpense(programId: string, dto: CreateExpenseDTO): Promise<ProgramExpense> {
    const id = crypto.randomUUID();

    await db.insert(programExpenses).values({
      id,
      programId,
      disbursementId: dto.disbursementId || null,
      category: dto.category,
      title: dto.title,
      description: dto.description || null,
      amount: String(dto.amount),
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
      receiptUrl: dto.receiptUrl,
      verificationStatus: "PENDING",
    });

    // Recalculate spent budget on program
    await this.syncProgramSpentBudget(programId);

    const [created] = await db
      .select()
      .from(programExpenses)
      .where(eq(programExpenses.id, id))
      .limit(1);

    return created;
  }

  async verifyExpense(
    id: string,
    verifiedByUserId: string,
    verificationStatus: "VERIFIED" | "REJECTED",
    verificationNotes?: string | null
  ): Promise<ProgramExpense> {
    await db
      .update(programExpenses)
      .set({
        verificationStatus,
        verifiedAt: new Date(),
        verifiedBy: verifiedByUserId,
        verificationNotes: verificationNotes || null,
      })
      .where(eq(programExpenses.id, id));

    const [updated] = await db
      .select()
      .from(programExpenses)
      .where(eq(programExpenses.id, id))
      .limit(1);

    if (updated) {
      await this.syncProgramSpentBudget(updated.programId);
    }

    return updated;
  }

  private async syncProgramSpentBudget(programId: string) {
    const expenses = await db
      .select({ amount: programExpenses.amount })
      .from(programExpenses)
      .where(eq(programExpenses.programId, programId));

    const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    await db
      .update(programs)
      .set({ spentBudget: String(totalSpent) })
      .where(eq(programs.id, programId));
  }

  async getFinancialSummary(programId: string): Promise<ProgramFinancialSummary> {
    const program = await this.findProgramById(programId);
    const agreedBudget = program ? Number(program.budget || 0) : 0;

    const disbursements = await db
      .select({
        amount: programDisbursements.amount,
        status: programDisbursements.status,
      })
      .from(programDisbursements)
      .where(eq(programDisbursements.programId, programId));

    let totalDisbursed = 0;
    let totalConfirmedReceived = 0;
    let totalPendingConfirmation = 0;

    for (const d of disbursements) {
      const amt = Number(d.amount || 0);
      if (d.status !== "REJECTED") {
        totalDisbursed += amt;
      }
      if (d.status === "CONFIRMED") {
        totalConfirmedReceived += amt;
      } else if (d.status === "PENDING") {
        totalPendingConfirmation += amt;
      }
    }

    const expenses = await db
      .select({
        amount: programExpenses.amount,
        verificationStatus: programExpenses.verificationStatus,
      })
      .from(programExpenses)
      .where(eq(programExpenses.programId, programId));

    let totalExpensesReported = 0;
    let totalExpensesVerified = 0;

    for (const e of expenses) {
      const amt = Number(e.amount || 0);
      totalExpensesReported += amt;
      if (e.verificationStatus === "VERIFIED") {
        totalExpensesVerified += amt;
      }
    }

    const remainingPartnerBalance = Math.max(0, totalConfirmedReceived - totalExpensesReported);
    const unreleasedBudget = Math.max(0, agreedBudget - totalDisbursed);
    const absorptionRate = agreedBudget > 0 ? Number(((totalExpensesReported / agreedBudget) * 100).toFixed(1)) : 0;

    return {
      agreedBudget,
      totalDisbursed,
      totalConfirmedReceived,
      totalPendingConfirmation,
      totalExpensesReported,
      totalExpensesVerified,
      remainingPartnerBalance,
      unreleasedBudget,
      absorptionRate,
    };
  }
}

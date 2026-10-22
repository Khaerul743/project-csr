import {
  ProgramDisbursement,
  DisbursementStatus,
} from "@/db/schema/program-disbursements";
import {
  ProgramExpense,
  ExpenseCategory,
  ExpenseVerificationStatus,
} from "@/db/schema/program-expenses";

export interface CreateDisbursementDTO {
  trancheNumber?: number;
  trancheName: string;
  amount: number | string;
  disbursedDate?: string | Date;
  transferProofUrl?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  notes?: string | null;
}

export interface ConfirmDisbursementDTO {
  confirmedNotes?: string | null;
}

export interface CreateExpenseDTO {
  disbursementId?: string | null;
  category: ExpenseCategory;
  title: string;
  description?: string | null;
  amount: number | string;
  expenseDate?: string | Date;
  receiptUrl: string;
}

export interface VerifyExpenseDTO {
  verificationStatus: "VERIFIED" | "REJECTED";
  verificationNotes?: string | null;
}

export interface ProgramFinancialSummary {
  agreedBudget: number;
  totalDisbursed: number; // Total transferred by company (both PENDING & CONFIRMED)
  totalConfirmedReceived: number; // Confirmed by partner
  totalPendingConfirmation: number; // Still waiting partner confirmation
  totalExpensesReported: number; // Sum of all recorded expenses
  totalExpensesVerified: number; // Sum of verified expenses
  remainingPartnerBalance: number; // Confirmed received minus reported expenses
  unreleasedBudget: number; // Agreed budget minus total confirmed received
  absorptionRate: number; // (totalExpensesReported / agreedBudget) * 100
}

export interface ProgramFinancesResponse {
  summary: ProgramFinancialSummary;
  disbursements: (ProgramDisbursement & { confirmedByName?: string | null })[];
  expenses: (ProgramExpense & { verifiedByName?: string | null })[];
}

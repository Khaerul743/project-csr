import { z } from "zod";
import { expenseCategoryEnum } from "@/db/schema/program-expenses";

export const createDisbursementSchema = z.object({
  trancheNumber: z.number().int().min(1).optional(),
  trancheName: z.string().min(2, "Nama termin minimal 2 karakter").max(255),
  amount: z.union([
    z.number().positive("Nominal pencairan harus lebih dari 0"),
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Format nominal tidak valid"),
  ]),
  disbursedDate: z.string().optional(),
  transferProofUrl: z.string().max(1000).optional().nullable().or(z.literal("")),
  bankName: z.string().max(100).optional().nullable().or(z.literal("")),
  bankAccountNumber: z.string().max(100).optional().nullable().or(z.literal("")),
  bankAccountHolder: z.string().max(150).optional().nullable().or(z.literal("")),
  notes: z.string().max(2000).optional().nullable().or(z.literal("")),
});

export const confirmDisbursementSchema = z.object({
  confirmedNotes: z.string().max(1000).optional().nullable().or(z.literal("")),
});

export const createExpenseSchema = z.object({
  disbursementId: z.string().uuid("ID pencairan tidak valid").optional().nullable().or(z.literal("")),
  category: z.enum(expenseCategoryEnum),
  title: z.string().min(2, "Judul pengeluaran minimal 2 karakter").max(255),
  description: z.string().max(2000).optional().nullable().or(z.literal("")),
  amount: z.union([
    z.number().positive("Nominal pengeluaran harus lebih dari 0"),
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Format nominal tidak valid"),
  ]),
  expenseDate: z.string().optional(),
  receiptUrl: z.string().min(1, "Foto nota/kwitansi bukti pengeluaran wajib diisi").max(1000),
});

export const verifyExpenseSchema = z.object({
  verificationStatus: z.enum(["VERIFIED", "REJECTED"]),
  verificationNotes: z.string().max(1000).optional().nullable().or(z.literal("")),
});

export type CreateDisbursementInput = z.infer<typeof createDisbursementSchema>;
export type ConfirmDisbursementInput = z.infer<typeof confirmDisbursementSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type VerifyExpenseInput = z.infer<typeof verifyExpenseSchema>;

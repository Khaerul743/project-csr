import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal } from "drizzle-orm/mysql-core";
import { programs } from "./programs";
import { programDisbursements } from "./program-disbursements";
import { users } from "./users";

export const expenseCategoryEnum = [
  "BAHAN_DAN_MATERIAL",
  "LOGISTIK_DAN_TRANSPORTASI",
  "HONOR_DAN_FASILITATOR",
  "SEWA_ALAT_DAN_TEMPAT",
  "KONSUMSI_KEGIATAN",
  "DOKUMENTASI_DAN_PUBLIKASI",
  "OPERASIONAL_LAINNYA",
] as const;
export type ExpenseCategory = (typeof expenseCategoryEnum)[number];

export const expenseVerificationStatusEnum = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type ExpenseVerificationStatus = (typeof expenseVerificationStatusEnum)[number];

export const programExpenses = mysqlTable("program_expenses", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: varchar("program_id", { length: 36 })
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  disbursementId: varchar("disbursement_id", { length: 36 })
    .references(() => programDisbursements.id, { onDelete: "set null" }),
  category: mysqlEnum("category", expenseCategoryEnum).notNull().default("OPERASIONAL_LAINNYA"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  receiptUrl: text("receipt_url").notNull(),
  verificationStatus: mysqlEnum("verification_status", expenseVerificationStatusEnum)
    .notNull()
    .default("PENDING"),
  verifiedBy: varchar("verified_by", { length: 36 }).references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProgramExpense = typeof programExpenses.$inferSelect;
export type NewProgramExpense = typeof programExpenses.$inferInsert;

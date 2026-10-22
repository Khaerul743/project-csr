import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal, int } from "drizzle-orm/mysql-core";
import { programs } from "./programs";
import { users } from "./users";

export const disbursementStatusEnum = ["PENDING", "CONFIRMED", "REJECTED"] as const;
export type DisbursementStatus = (typeof disbursementStatusEnum)[number];

export const programDisbursements = mysqlTable("program_disbursements", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: varchar("program_id", { length: 36 })
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  trancheNumber: int("tranche_number").notNull().default(1),
  trancheName: varchar("tranche_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  disbursedDate: timestamp("disbursed_date").defaultNow().notNull(),
  transferProofUrl: text("transfer_proof_url"),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  bankAccountHolder: varchar("bank_account_holder", { length: 150 }),
  notes: text("notes"),
  status: mysqlEnum("status", disbursementStatusEnum).notNull().default("PENDING"),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: varchar("confirmed_by", { length: 36 }).references(() => users.id),
  confirmedNotes: text("confirmed_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProgramDisbursement = typeof programDisbursements.$inferSelect;
export type NewProgramDisbursement = typeof programDisbursements.$inferInsert;

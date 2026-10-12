import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal, int } from "drizzle-orm/mysql-core";
import { opportunities } from "./opportunities";
import { partners } from "./partners";
import { users } from "./users";

export const proposalStatusEnum = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ProposalStatus = (typeof proposalStatusEnum)[number];

export const proposals = mysqlTable("proposals", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  opportunityId: varchar("opportunity_id", { length: 36 })
    .notNull()
    .references(() => opportunities.id),
  partnerId: varchar("partner_id", { length: 36 })
    .notNull()
    .references(() => partners.id),
  submittedBy: varchar("submitted_by", { length: 36 })
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  proposedBudget: decimal("proposed_budget", { precision: 15, scale: 2 }).notNull(),
  durationMonths: int("duration_months"),
  targetBeneficiaries: varchar("target_beneficiaries", { length: 255 }),
  documentUrl: text("document_url"),
  feedback: text("feedback"),
  status: mysqlEnum("status", proposalStatusEnum).notNull().default("SUBMITTED"),
  reviewedBy: varchar("reviewed_by", { length: 36 }).references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;

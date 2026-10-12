import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal } from "drizzle-orm/mysql-core";
import { opportunities } from "./opportunities";
import { proposals } from "./proposals";
import { companies } from "./companies";
import { partners } from "./partners";

export const collaborationStatusEnum = [
  "NEGOTIATION",
  "AGREED",
  "CANCELLED",
] as const;
export type CollaborationStatus = (typeof collaborationStatusEnum)[number];

export const collaborations = mysqlTable("collaborations", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  opportunityId: varchar("opportunity_id", { length: 36 })
    .notNull()
    .references(() => opportunities.id),
  proposalId: varchar("proposal_id", { length: 36 })
    .notNull()
    .references(() => proposals.id),
  companyId: varchar("company_id", { length: 36 })
    .notNull()
    .references(() => companies.id),
  partnerId: varchar("partner_id", { length: 36 })
    .notNull()
    .references(() => partners.id),
  finalBudget: decimal("final_budget", { precision: 15, scale: 2 }),
  targetBeneficiaries: varchar("target_beneficiaries", { length: 255 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  mouDocumentUrl: text("mou_document_url"),
  notes: text("notes"),
  status: mysqlEnum("status", collaborationStatusEnum).notNull().default("NEGOTIATION"),
  agreedAt: timestamp("agreed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Collaboration = typeof collaborations.$inferSelect;
export type NewCollaboration = typeof collaborations.$inferInsert;

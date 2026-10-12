import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal } from "drizzle-orm/mysql-core";
import { collaborations } from "./collaborations";
import { opportunities } from "./opportunities";
import { companies } from "./companies";
import { partners } from "./partners";
import { csrFocusAreaEnum } from "./csr-focus-areas";

export const programStatusEnum = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
] as const;
export type ProgramStatus = (typeof programStatusEnum)[number];

export const programs = mysqlTable("programs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  collaborationId: varchar("collaboration_id", { length: 36 })
    .notNull()
    .references(() => collaborations.id),
  opportunityId: varchar("opportunity_id", { length: 36 })
    .notNull()
    .references(() => opportunities.id),
  companyId: varchar("company_id", { length: 36 })
    .notNull()
    .references(() => companies.id),
  partnerId: varchar("partner_id", { length: 36 })
    .notNull()
    .references(() => partners.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  focusArea: mysqlEnum("focus_area", csrFocusAreaEnum).notNull(),
  budget: decimal("budget", { precision: 15, scale: 2 }).notNull(),
  spentBudget: decimal("spent_budget", { precision: 15, scale: 2 }).default("0"),
  targetBeneficiaries: varchar("target_beneficiaries", { length: 255 }),
  actualBeneficiaries: varchar("actual_beneficiaries", { length: 255 }),
  targetCity: varchar("target_city", { length: 100 }),
  targetProvince: varchar("target_province", { length: 100 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: mysqlEnum("status", programStatusEnum).notNull().default("PLANNED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;

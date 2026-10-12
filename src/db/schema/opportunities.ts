import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal } from "drizzle-orm/mysql-core";
import { companies } from "./companies";
import { users } from "./users";
import { csrFocusAreaEnum } from "./csr-focus-areas";

export const opportunityStatusEnum = ["DRAFT", "OPEN", "IN_REVIEW", "CLOSED"] as const;
export type OpportunityStatus = (typeof opportunityStatusEnum)[number];

export const opportunities = mysqlTable("opportunities", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 36 })
    .notNull()
    .references(() => companies.id),
  createdBy: varchar("created_by", { length: 36 })
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  focusArea: mysqlEnum("focus_area", csrFocusAreaEnum).notNull(),
  targetCity: varchar("target_city", { length: 100 }),
  targetProvince: varchar("target_province", { length: 100 }),
  estimatedBudget: decimal("estimated_budget", { precision: 15, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  deadline: timestamp("deadline"),
  bannerUrl: text("banner_url"),
  status: mysqlEnum("status", opportunityStatusEnum).notNull().default("OPEN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;

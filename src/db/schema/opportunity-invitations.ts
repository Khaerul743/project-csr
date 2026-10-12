import { mysqlTable, varchar, text, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";
import { opportunities } from "./opportunities";
import { companies } from "./companies";
import { partners } from "./partners";
import { users } from "./users";

export const opportunityInvitationStatusEnum = ["INVITED", "ACCEPTED", "DECLINED"] as const;
export type OpportunityInvitationStatus = (typeof opportunityInvitationStatusEnum)[number];

export const opportunityInvitations = mysqlTable("opportunity_invitations", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  opportunityId: varchar("opportunity_id", { length: 36 })
    .notNull()
    .references(() => opportunities.id),
  companyId: varchar("company_id", { length: 36 })
    .notNull()
    .references(() => companies.id),
  partnerId: varchar("partner_id", { length: 36 })
    .notNull()
    .references(() => partners.id),
  invitedBy: varchar("invited_by", { length: 36 })
    .notNull()
    .references(() => users.id),
  message: text("message"),
  status: mysqlEnum("status", opportunityInvitationStatusEnum).notNull().default("INVITED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type OpportunityInvitation = typeof opportunityInvitations.$inferSelect;
export type NewOpportunityInvitation = typeof opportunityInvitations.$inferInsert;

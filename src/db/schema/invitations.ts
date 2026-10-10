import { mysqlTable, varchar, mysqlEnum, timestamp, check } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { companies } from "./companies";
import { partners } from "./partners";
import { users } from "./users";

export const invitationRoleEnum = [
  "CSR_ADMIN",
  "MANAGEMENT",
  "PARTNER_ADMIN",
] as const;
export type InvitationRole = (typeof invitationRoleEnum)[number];

export const invitationStatusEnum = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;
export type InvitationStatus = (typeof invitationStatusEnum)[number];

export const invitations = mysqlTable(
  "invitations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: varchar("company_id", { length: 36 }).references(() => companies.id),
    partnerId: varchar("partner_id", { length: 36 }).references(() => partners.id),
    email: varchar("email", { length: 255 }).notNull(),
    role: mysqlEnum("role", invitationRoleEnum).notNull(),
    invitedBy: varchar("invited_by", { length: 36 })
      .references(() => users.id)
      .notNull(),
    status: mysqlEnum("status", invitationStatusEnum).notNull().default("PENDING"),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    // Constraint: invitation can only belong to company OR partner (cannot be both)
    check(
      "chk_invitation_company_or_partner",
      sql`(${table.companyId} IS NULL OR ${table.partnerId} IS NULL)`
    ),
  ]
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

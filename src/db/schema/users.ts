import { mysqlTable, varchar, mysqlEnum, timestamp, check } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { companies } from "./companies";
import { partners } from "./partners";

export const userRoleEnum = [
  "CSR_ADMIN",
  "MANAGEMENT",
  "PARTNER_ADMIN",
  "PARTNER_STAFF",
  "STAGING",
] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const userStatusEnum = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof userStatusEnum)[number];

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: varchar("company_id", { length: 36 }).references(() => companies.id),
    partnerId: varchar("partner_id", { length: 36 }).references(() => partners.id),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: mysqlEnum("role", userRoleEnum).notNull().default("STAGING"),
    status: mysqlEnum("status", userStatusEnum).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    // Constraint: user can only belong to company OR partner (cannot be both)
    check(
      "chk_user_company_or_partner",
      sql`(${table.companyId} IS NULL OR ${table.partnerId} IS NULL)`
    ),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

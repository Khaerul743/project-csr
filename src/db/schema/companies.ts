import { mysqlTable, varchar, text, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";

export const companyStatusEnum = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type CompanyStatus = (typeof companyStatusEnum)[number];

export const companies = mysqlTable("companies", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  website: varchar("website", { length: 255 }),
  logoUrl: text("logo_url"),
  status: mysqlEnum("status", companyStatusEnum).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

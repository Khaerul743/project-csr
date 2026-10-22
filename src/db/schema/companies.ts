import { mysqlTable, varchar, text, mysqlEnum, timestamp, int } from "drizzle-orm/mysql-core";

export const companyStatusEnum = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type CompanyStatus = (typeof companyStatusEnum)[number];

export const companies = mysqlTable("companies", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 150 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),
  description: text("description"),
  csrVision: text("csr_vision"),
  industry: varchar("industry", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }),
  foundedYear: int("founded_year"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  website: varchar("website", { length: 255 }),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  nibNumber: varchar("nib_number", { length: 50 }),
  npwpNumber: varchar("npwp_number", { length: 50 }),
  sustainabilityReportUrl: text("sustainability_report_url"),
  instagramUrl: varchar("instagram_url", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  csrLeaders: text("csr_leaders"), // JSON: [{ id, name, role, email, phone, photoUrl }]
  status: mysqlEnum("status", companyStatusEnum).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

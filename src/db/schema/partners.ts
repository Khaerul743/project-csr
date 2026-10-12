import { mysqlTable, varchar, text, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";
import { csrFocusAreaEnum } from "./csr-focus-areas";

export const partnerStatusEnum = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type PartnerStatus = (typeof partnerStatusEnum)[number];

export const partners = mysqlTable("partners", {
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
  focusArea: mysqlEnum("focus_area", csrFocusAreaEnum).notNull().default("LAINNYA"),
  status: mysqlEnum("status", partnerStatusEnum).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;

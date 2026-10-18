import { mysqlTable, varchar, text, mysqlEnum, timestamp, int } from "drizzle-orm/mysql-core";
import { csrFocusAreaEnum } from "./csr-focus-areas";

export const partnerStatusEnum = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type PartnerStatus = (typeof partnerStatusEnum)[number];

export const partners = mysqlTable("partners", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 150 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),
  description: text("description"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  website: varchar("website", { length: 255 }),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  organizationType: varchar("organization_type", { length: 100 }), // e.g., "Yayasan", "Perkumpulan / NGO", "Komunitas Sosial"
  foundedYear: int("founded_year"),
  legalNumber: varchar("legal_number", { length: 150 }), // SK Kemenkumham / Izin Dinsos
  npwpNumber: varchar("npwp_number", { length: 100 }),
  instagramUrl: varchar("instagram_url", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  youtubeUrl: varchar("youtube_url", { length: 255 }),
  portfolioDocUrl: varchar("portfolio_doc_url", { length: 500 }), // PDF Company Profile / Laporan Tahunan
  pastActivities: text("past_activities"), // JSON stringified array of { id, title, year, clientSponsor, beneficiaries, description, photoUrl }
  teamMembers: text("team_members"), // JSON stringified array of { id, name, role, photoUrl }
  focusArea: mysqlEnum("focus_area", csrFocusAreaEnum).notNull().default("LAINNYA"),
  status: mysqlEnum("status", partnerStatusEnum).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;

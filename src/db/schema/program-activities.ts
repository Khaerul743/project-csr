import { mysqlTable, varchar, text, mysqlEnum, timestamp, decimal } from "drizzle-orm/mysql-core";
import { programs } from "./programs";
import { users } from "./users";

export const activityStatusEnum = [
  "SUBMITTED",
  "VERIFIED",
  "REVISION_REQUESTED",
] as const;
export type ActivityStatus = (typeof activityStatusEnum)[number];

export const programActivities = mysqlTable("program_activities", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: varchar("program_id", { length: 36 })
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  submittedBy: varchar("submitted_by", { length: 36 })
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  activityDate: timestamp("activity_date").notNull(),
  location: varchar("location", { length: 255 }),
  beneficiariesReached: varchar("beneficiaries_reached", { length: 100 }),
  fundsSpent: decimal("funds_spent", { precision: 15, scale: 2 }).default("0"),
  mediaUrls: text("media_urls"), // JSON stringified array of image URLs
  documentUrl: varchar("document_url", { length: 500 }),
  status: mysqlEnum("status", activityStatusEnum).notNull().default("SUBMITTED"),
  companyFeedback: text("company_feedback"),
  verifiedBy: varchar("verified_by", { length: 36 }).references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProgramActivity = typeof programActivities.$inferSelect;
export type NewProgramActivity = typeof programActivities.$inferInsert;

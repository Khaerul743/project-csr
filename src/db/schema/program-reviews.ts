import { mysqlTable, varchar, text, timestamp, int } from "drizzle-orm/mysql-core";
import { programs } from "./programs";

export const programReviews = mysqlTable("program_reviews", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: varchar("program_id", { length: 36 })
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  reviewerName: varchar("reviewer_name", { length: 100 }).notNull(),
  reviewerRole: varchar("reviewer_role", { length: 100 }).notNull(), // e.g., "Penerima Manfaat Langsung", "Warga Sekitar", "Tokoh Masyarakat"
  reviewerCity: varchar("reviewer_city", { length: 100 }),
  rating: int("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  photoUrl: varchar("photo_url", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProgramReview = typeof programReviews.$inferSelect;
export type NewProgramReview = typeof programReviews.$inferInsert;

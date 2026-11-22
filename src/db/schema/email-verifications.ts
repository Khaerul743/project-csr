import { mysqlTable, varchar, timestamp, int } from "drizzle-orm/mysql-core";

export const emailVerifications = mysqlTable("email_verifications", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull(),
  attempts: int("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;


import { mysqlTable, varchar, text, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const adminAuditTargetTypeEnum = [
  "COMPANY",
  "PARTNER",
  "USER",
  "OPPORTUNITY",
  "PROGRAM",
  "SYSTEM",
] as const;
export type AdminAuditTargetType = (typeof adminAuditTargetTypeEnum)[number];

export const adminAuditLogs = mysqlTable("admin_audit_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  adminId: varchar("admin_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: mysqlEnum("target_type", adminAuditTargetTypeEnum).notNull(),
  targetId: varchar("target_id", { length: 36 }).notNull(),
  targetLabel: varchar("target_label", { length: 255 }),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;


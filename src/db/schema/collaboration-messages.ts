import { mysqlTable, varchar, text, timestamp, boolean } from "drizzle-orm/mysql-core";
import { collaborations } from "./collaborations";
import { users } from "./users";

export const collaborationMessages = mysqlTable("collaboration_messages", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  collaborationId: varchar("collaboration_id", { length: 36 })
    .notNull()
    .references(() => collaborations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 500 }),
  attachmentName: varchar("attachment_name", { length: 255 }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CollaborationMessage = typeof collaborationMessages.$inferSelect;
export type NewCollaborationMessage = typeof collaborationMessages.$inferInsert;

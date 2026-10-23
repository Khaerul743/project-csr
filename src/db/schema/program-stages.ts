import { mysqlTable, varchar, text, mysqlEnum, timestamp, int } from "drizzle-orm/mysql-core";
import { programs } from "./programs";

export const stageStatusEnum = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
] as const;
export type StageStatus = (typeof stageStatusEnum)[number];

export const stageSourceEnum = [
  "AI_GENERATED",
  "MANUAL",
] as const;
export type StageSource = (typeof stageSourceEnum)[number];

export const programStages = mysqlTable("program_stages", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: varchar("program_id", { length: 36 })
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  orderIndex: int("order_index").notNull().default(1),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetTimeline: varchar("target_timeline", { length: 100 }),
  expectedEvidence: text("expected_evidence"),
  suggestedKpi: varchar("suggested_kpi", { length: 255 }),
  status: mysqlEnum("status", stageStatusEnum).notNull().default("PENDING"),
  source: mysqlEnum("source", stageSourceEnum).notNull().default("AI_GENERATED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProgramStage = typeof programStages.$inferSelect;
export type NewProgramStage = typeof programStages.$inferInsert;

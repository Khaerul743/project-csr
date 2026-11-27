import {
  mysqlTable,
  varchar,
  text,
  mysqlEnum,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

export const templateCategoryEnum = [
  "PARTNER_INVITATION",
  "INVITATION_OVERDUE",
] as const;
export type TemplateCategory = (typeof templateCategoryEnum)[number];

export const companyTemplates = mysqlTable("company_templates", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 36 }).notNull(),
  category: mysqlEnum("category", templateCategoryEnum)
    .notNull()
    .default("PARTNER_INVITATION"),
  title: varchar("title", { length: 120 }).notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdBy: varchar("created_by", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CompanyTemplate = typeof companyTemplates.$inferSelect;
export type NewCompanyTemplate = typeof companyTemplates.$inferInsert;


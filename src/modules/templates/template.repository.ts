import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  companyTemplates,
  CompanyTemplate,
  NewCompanyTemplate,
  TemplateCategory,
} from "@/db/schema/company-templates";

export class TemplateRepository {
  async findByCompanyId(
    companyId: string,
    category?: TemplateCategory
  ): Promise<CompanyTemplate[]> {
    const conditions = [eq(companyTemplates.companyId, companyId)];
    if (category) {
      conditions.push(eq(companyTemplates.category, category));
    }

    return db
      .select()
      .from(companyTemplates)
      .where(and(...conditions))
      .orderBy(desc(companyTemplates.isDefault), desc(companyTemplates.updatedAt));
  }

  async findById(id: string): Promise<CompanyTemplate | null> {
    const rows = await db
      .select()
      .from(companyTemplates)
      .where(eq(companyTemplates.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async clearDefaultForCategory(
    companyId: string,
    category: TemplateCategory
  ): Promise<void> {
    await db
      .update(companyTemplates)
      .set({ isDefault: false })
      .where(
        and(
          eq(companyTemplates.companyId, companyId),
          eq(companyTemplates.category, category)
        )
      );
  }

  async create(data: NewCompanyTemplate): Promise<CompanyTemplate> {
    const id = data.id || crypto.randomUUID();
    await db.insert(companyTemplates).values({ ...data, id });

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Gagal mengambil data template setelah dibuat");
    }
    return created;
  }

  async update(
    id: string,
    data: Partial<Omit<NewCompanyTemplate, "id" | "companyId" | "createdAt">>
  ): Promise<CompanyTemplate> {
    await db
      .update(companyTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(companyTemplates.id, id));

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Template tidak ditemukan setelah diperbarui");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(companyTemplates).where(eq(companyTemplates.id, id));
  }
}


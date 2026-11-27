import { CompanyTemplate, TemplateCategory } from "@/db/schema/company-templates";

export type TemplateItem = CompanyTemplate;

export interface CreateTemplateDTO {
  category?: TemplateCategory;
  title: string;
  content: string;
  isDefault?: boolean;
}

export interface UpdateTemplateDTO {
  title?: string;
  content?: string;
  isDefault?: boolean;
}


import { TemplateRepository } from "./template.repository";
import { TemplateService } from "./template.service";
import { TemplateController } from "./template.controller";

export const templateRepository = new TemplateRepository();
export const templateService = new TemplateService(templateRepository);
export const templateController = new TemplateController(templateService);

export * from "./template.interface";
export * from "./template.validation";
export * from "./template.repository";
export * from "./template.service";
export * from "./template.controller";


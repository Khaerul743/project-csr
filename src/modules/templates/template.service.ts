import {
  BadRequestError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { TemplateCategory } from "@/db/schema/company-templates";
import { TemplateRepository } from "./template.repository";
import {
  CreateTemplateDTO,
  TemplateItem,
  UpdateTemplateDTO,
} from "./template.interface";

export const DEFAULT_PARTNER_INVITATION_TITLE =
  "Undangan Resmi Kolaborasi CSR (Default)";

export const DEFAULT_PARTNER_INVITATION_CONTENT = `Yth. Bapak/Ibu Pengurus {{nama_yayasan}},

Salam sejahtera,

Perkenalkan, kami dari {{nama_perusahaan}}. Melalui program Corporate Social Responsibility (CSR), kami berkomitmen untuk mendukung berbagai inisiatif sosial dan lingkungan yang memberikan dampak positif bagi masyarakat.

Sehubungan dengan hal tersebut, kami bermaksud mengundang {{nama_yayasan}} untuk menjalin kolaborasi dalam pelaksanaan program CSR kami yang berjudul "{{nama_program}}", dengan fokus pada bidang {{bidang_csr}} di wilayah {{lokasi_program}}.

Kami melihat bahwa fokus dan pengalaman organisasi Bapak/Ibu memiliki kesesuaian dengan tujuan program tersebut. Oleh karena itu, kami berharap dapat membangun kemitraan yang sinergis dalam mendukung pelaksanaan program dan memberikan manfaat nyata bagi masyarakat.

Untuk informasi lebih lanjut mengenai program, Bapak/Ibu dapat meninjau detail peluang CSR yang kami tawarkan. Apabila tertarik untuk menjajaki kolaborasi ini, kami mengharapkan tanggapan Bapak/Ibu paling lambat pada {{batas_respons}}.

Terima kasih atas perhatian dan kesediaannya. Kami berharap undangan ini dapat menjadi awal dari kolaborasi yang baik dan berkelanjutan bersama {{nama_yayasan}}.

Hormat kami,

{{nama_perusahaan}}
{{nama_pic}}
{{jabatan_pic}}`;

export const DEFAULT_INVITATION_OVERDUE_TITLE =
  "Pemberitahuan Undangan Melewati Batas Waktu (Default)";

export const DEFAULT_INVITATION_OVERDUE_CONTENT = `Yth. Bapak/Ibu Pengurus {{nama_yayasan}},

Salam sejahtera,

Kami dari {{nama_perusahaan}} ingin menginformasikan bahwa undangan kolaborasi untuk program CSR "{{nama_program}}" telah melewati batas waktu tanggapan yang ditentukan, yaitu {{batas_respons}}.

Hingga batas waktu tersebut, kami belum menerima tanggapan dari Bapak/Ibu. Dengan demikian, kami memutuskan untuk membatalkan undangan kolaborasi ini.

Kami mohon maaf apabila keputusan ini menimbulkan ketidaknyamanan. Terima kasih atas perhatian dan kesempatan yang telah diberikan. Kami berharap dapat menjalin kerja sama dengan Bapak/Ibu pada kesempatan lainnya.

Hormat kami,
{{nama_perusahaan}}`;

export class TemplateService {
  private readonly logger = new AppLogger("TemplateService");

  constructor(private readonly templateRepository: TemplateRepository) {}

  private async ensureCategorySeeded(
    companyId: string,
    category: TemplateCategory,
    existingInCategory: TemplateItem[]
  ): Promise<TemplateItem[]> {
    if (existingInCategory.length > 0) return existingInCategory;

    const isInvite = category === "PARTNER_INVITATION";
    const seeded = await this.templateRepository.create({
      companyId,
      category,
      title: isInvite
        ? DEFAULT_PARTNER_INVITATION_TITLE
        : DEFAULT_INVITATION_OVERDUE_TITLE,
      content: isInvite
        ? DEFAULT_PARTNER_INVITATION_CONTENT
        : DEFAULT_INVITATION_OVERDUE_CONTENT,
      isDefault: true,
    });

    this.logger.info(
      `Auto-seeded default ${category} template for company ${companyId}`
    );
    return [seeded];
  }

  async listTemplates(
    companyId: string | null,
    category?: TemplateCategory
  ): Promise<TemplateItem[]> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda belum terhubung dengan organisasi perusahaan.");
    }

    if (category) {
      const existing = await this.templateRepository.findByCompanyId(
        companyId,
        category
      );
      return this.ensureCategorySeeded(companyId, category, existing);
    }

    const allExisting = await this.templateRepository.findByCompanyId(companyId);
    const inviteTemplates = allExisting.filter(
      (t) => t.category === "PARTNER_INVITATION"
    );
    const overdueTemplates = allExisting.filter(
      (t) => t.category === "INVITATION_OVERDUE"
    );

    const seededAny =
      inviteTemplates.length === 0 || overdueTemplates.length === 0;

    if (inviteTemplates.length === 0) {
      await this.ensureCategorySeeded(companyId, "PARTNER_INVITATION", []);
    }
    if (overdueTemplates.length === 0) {
      await this.ensureCategorySeeded(companyId, "INVITATION_OVERDUE", []);
    }

    return seededAny
      ? this.templateRepository.findByCompanyId(companyId)
      : allExisting;
  }

  async getDefaultTemplate(
    companyId: string,
    category: TemplateCategory
  ): Promise<TemplateItem | null> {
    const list = await this.listTemplates(companyId, category);
    return list.find((t) => t.isDefault) ?? list[0] ?? null;
  }

  async createTemplate(
    companyId: string | null,
    userId: string,
    dto: CreateTemplateDTO
  ): Promise<TemplateItem> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda belum terhubung dengan organisasi perusahaan.");
    }

    const category = dto.category || "PARTNER_INVITATION";

    if (dto.isDefault) {
      await this.templateRepository.clearDefaultForCategory(companyId, category);
    }

    const created = await this.templateRepository.create({
      companyId,
      category,
      title: dto.title.trim(),
      content: dto.content.trim(),
      isDefault: Boolean(dto.isDefault),
      createdBy: userId,
    });

    this.logger.info(`Template created: ${created.id} for company ${companyId}`);
    return created;
  }

  async updateTemplate(
    companyId: string | null,
    templateId: string,
    dto: UpdateTemplateDTO
  ): Promise<TemplateItem> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda belum terhubung dengan organisasi perusahaan.");
    }

    const existing = await this.templateRepository.findById(templateId);
    if (!existing) {
      throw new NotFoundError("Template tidak ditemukan.");
    }

    if (existing.companyId !== companyId) {
      throw new ForBiddenError("Anda tidak memiliki akses untuk mengubah template ini.");
    }

    if (dto.isDefault) {
      await this.templateRepository.clearDefaultForCategory(
        companyId,
        existing.category
      );
    }

    const updatePayload: Partial<{
      title: string;
      content: string;
      isDefault: boolean;
    }> = {};

    if (dto.title !== undefined) updatePayload.title = dto.title.trim();
    if (dto.content !== undefined) updatePayload.content = dto.content.trim();
    if (dto.isDefault !== undefined) updatePayload.isDefault = dto.isDefault;

    const updated = await this.templateRepository.update(templateId, updatePayload);
    this.logger.info(`Template updated: ${templateId} for company ${companyId}`);
    return updated;
  }

  async deleteTemplate(companyId: string | null, templateId: string): Promise<void> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda belum terhubung dengan organisasi perusahaan.");
    }

    const existing = await this.templateRepository.findById(templateId);
    if (!existing) {
      throw new NotFoundError("Template tidak ditemukan.");
    }

    if (existing.companyId !== companyId) {
      throw new ForBiddenError("Anda tidak memiliki akses untuk menghapus template ini.");
    }

    await this.templateRepository.delete(templateId);
    this.logger.info(`Template deleted: ${templateId} for company ${companyId}`);
  }
}

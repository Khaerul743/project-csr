import {
  BadRequestError,
  ForBiddenError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { ProgramRepository } from "./program.repository";
import {
  UpdateProgramDTO,
  ProgramListQuery,
  ProgramWithDetails,
} from "./program.interface";
import { Program } from "@/db/schema/programs";

export class ProgramService {
  private readonly logger = new AppLogger("ProgramService");

  constructor(private readonly programRepository: ProgramRepository) {}

  async getProgramById(
    id: string,
    user: { companyId?: string | null; partnerId?: string | null }
  ): Promise<ProgramWithDetails> {
    const program = await this.programRepository.findById(id);
    if (!program) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    const isCompanyMember = user.companyId && program.companyId === user.companyId;
    const isPartnerMember = user.partnerId && program.partnerId === user.partnerId;

    if (!isCompanyMember && !isPartnerMember) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk melihat data program ini");
    }

    return program;
  }

  async getCompanyPrograms(
    companyId: string | null,
    query: ProgramListQuery
  ) {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    return this.programRepository.findByCompanyId(companyId, query);
  }

  async getPartnerPrograms(
    partnerId: string | null,
    query: ProgramListQuery
  ) {
    if (!partnerId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan organisasi mitra manapun");
    }

    return this.programRepository.findByPartnerId(partnerId, query);
  }

  async updateProgram(
    id: string,
    user: { companyId?: string | null; partnerId?: string | null },
    dto: UpdateProgramDTO
  ): Promise<Program> {
    const existing = await this.programRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }

    const isCompanyMember = user.companyId && existing.companyId === user.companyId;
    const isPartnerMember = user.partnerId && existing.partnerId === user.partnerId;

    if (!isCompanyMember && !isPartnerMember) {
      throw new ForBiddenError("Anda tidak memiliki hak akses untuk memperbarui program ini");
    }

    if (existing.status === "CANCELLED" && dto.status !== "CANCELLED") {
      throw new BadRequestError("Program yang telah dibatalkan tidak dapat diaktifkan kembali");
    }

    this.logger.info(`Updating program ${id} to status ${dto.status || existing.status}`);

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    const budget =
      dto.budget !== undefined && dto.budget !== null
        ? String(dto.budget).replace(/[^\d.]/g, "")
        : undefined;

    const spentBudget =
      dto.spentBudget !== undefined && dto.spentBudget !== null
        ? String(dto.spentBudget).replace(/[^\d.]/g, "")
        : undefined;

    const updatePayload: any = {};
    if (dto.title) updatePayload.title = dto.title;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.focusArea) updatePayload.focusArea = dto.focusArea;
    if (budget !== undefined) updatePayload.budget = budget;
    if (spentBudget !== undefined) updatePayload.spentBudget = spentBudget;
    if (dto.targetBeneficiaries !== undefined) updatePayload.targetBeneficiaries = dto.targetBeneficiaries;
    if (dto.actualBeneficiaries !== undefined) updatePayload.actualBeneficiaries = dto.actualBeneficiaries;
    if (dto.targetCity !== undefined) updatePayload.targetCity = dto.targetCity;
    if (dto.targetProvince !== undefined) updatePayload.targetProvince = dto.targetProvince;
    if (startDate !== undefined) updatePayload.startDate = startDate;
    if (endDate !== undefined) updatePayload.endDate = endDate;
    if (dto.status !== undefined) updatePayload.status = dto.status;

    return this.programRepository.update(id, updatePayload);
  }
}

export const programService = new ProgramService(new ProgramRepository());

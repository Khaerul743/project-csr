import { BadRequestError, ConflictError, NotFoundError } from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { JwtService } from "@/common/jwt/jwt.service";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { CompanyRepository } from "./company.repository";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  CompanyResponseData,
  CompanyListQuery,
  CompanyDetailedProfile,
} from "./company.interface";
import { Company } from "@/db/schema/companies";
import { UserRole, UserStatus } from "@/db/schema/users";

export class CompanyService {
  private readonly logger = new AppLogger("CompanyService");

  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async createCompany(userId: string, dto: CreateCompanyDTO): Promise<CompanyResponseData> {
    this.logger.info(`User ${userId} attempting to create company: ${dto.name}`);

    // Verify user exists
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Role check: Only STAGING users can create a company
    if (user.role !== "STAGING") {
      throw new ConflictError("User already belongs to an organization or has an active role");
    }

    // Check duplicate name
    const existing = await this.companyRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictError("A company with this name already exists");
    }

    // Execute transaction: create company + promote user to MANAGEMENT
    const { company, updatedUser } = await this.companyRepository.createCompanyWithAdmin(
      dto,
      userId
    );

    this.logger.info(`Company ${company.id} created successfully by user ${userId}`);

    // Issue updated token with new role and companyId
    const accessToken = JwtService.sign({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      companyId: updatedUser.companyId,
      partnerId: updatedUser.partnerId,
    });

    const { password: _, ...safeUser } = updatedUser;

    return {
      company,
      user: safeUser,
      accessToken,
    };
  }

  async getCurrentCompany(companyId: string | null): Promise<CompanyDetailedProfile> {
    if (!companyId) {
      throw new BadRequestError("User is not associated with any company");
    }

    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError("Company profile not found");
    }

    const [members, metrics, openOpportunities, companyPrograms] = await Promise.all([
      this.companyRepository.findMembers(companyId),
      this.companyRepository.getMetrics(companyId),
      this.companyRepository.getOpenOpportunities(companyId),
      this.companyRepository.getCompanyPrograms(companyId),
    ]);

    return {
      ...company,
      members,
      metrics,
      openOpportunities,
      programs: companyPrograms,
    };
  }

  async getCompanyById(id: string): Promise<CompanyDetailedProfile> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const [metrics, openOpportunities, companyPrograms] = await Promise.all([
      this.companyRepository.getMetrics(id),
      this.companyRepository.getOpenOpportunities(id),
      this.companyRepository.getCompanyPrograms(id),
    ]);

    return {
      ...company,
      metrics,
      openOpportunities,
      programs: companyPrograms,
    };
  }

  async getAllCompanies(query: CompanyListQuery) {
    return this.companyRepository.findAll(query);
  }

  async updateCompany(companyId: string | null, dto: UpdateCompanyDTO): Promise<CompanyDetailedProfile> {
    if (!companyId) {
      throw new BadRequestError("User is not associated with any company");
    }

    const existing = await this.companyRepository.findById(companyId);
    if (!existing) {
      throw new NotFoundError("Company not found");
    }

    await this.companyRepository.updateCompany(companyId, dto);
    return this.getCurrentCompany(companyId);
  }

  async updateMember(
    currentUserId: string,
    companyId: string | null,
    memberId: string,
    data: { role?: UserRole; status?: UserStatus }
  ) {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const member = await this.companyRepository.findMemberById(companyId, memberId);
    if (!member) {
      throw new NotFoundError("Anggota tim tidak ditemukan");
    }

    // 1. Tidak boleh menonaktifkan diri sendiri
    if (data.status === "INACTIVE" && memberId === currentUserId) {
      throw new BadRequestError("Anda tidak dapat menonaktifkan akun Anda sendiri.");
    }

    // 2. Tidak boleh mengubah role atau menonaktifkan satu-satunya akun Management yang masih aktif
    if (
      member.role === "MANAGEMENT" &&
      member.status === "ACTIVE" &&
      (data.role === "CSR_ADMIN" || data.status === "INACTIVE")
    ) {
      const otherActiveManagementCount = await this.companyRepository.countActiveManagement(
        companyId,
        memberId
      );
      if (otherActiveManagementCount === 0) {
        throw new BadRequestError(
          "Tidak dapat mengubah role atau menonaktifkan satu-satunya akun Management yang masih aktif."
        );
      }
    }

    const updated = await this.companyRepository.updateMember(companyId, memberId, data);
    this.logger.info(`Member ${memberId} in company ${companyId} updated: ${JSON.stringify(data)}`);
    return updated;
  }
}

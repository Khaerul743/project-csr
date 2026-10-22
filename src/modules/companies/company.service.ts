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

    // User must be in STAGING role
    if (user.role !== "STAGING") {
      throw new ConflictError(`User already has role '${user.role}' and cannot create a new company`);
    }

    if (user.companyId || user.partnerId) {
      throw new ConflictError("User is already associated with an organization");
    }

    const { company, updatedUser } = await this.companyRepository.createCompanyWithAdmin(dto, userId);

    this.logger.info(`Company ${company.id} created successfully, user ${userId} promoted to MANAGEMENT`);

    // Generate refreshed access token with new role and companyId
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

    const [members, metrics, openOpportunities] = await Promise.all([
      this.companyRepository.findMembers(companyId),
      this.companyRepository.getMetrics(companyId),
      this.companyRepository.getOpenOpportunities(companyId),
    ]);

    return {
      ...company,
      members,
      metrics,
      openOpportunities,
    };
  }

  async getCompanyById(id: string): Promise<CompanyDetailedProfile> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    const [metrics, openOpportunities] = await Promise.all([
      this.companyRepository.getMetrics(id),
      this.companyRepository.getOpenOpportunities(id),
    ]);

    return {
      ...company,
      metrics,
      openOpportunities,
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
}

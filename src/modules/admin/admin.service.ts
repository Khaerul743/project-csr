import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/common/errors/app-error";
import { AppLogger } from "@/common/logger/app-logger";
import { PasswordUtil } from "@/common/utils/password";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { SafeUser } from "@/modules/auth/auth.interface";
import { AdminRepository } from "./admin.repository";
import {
  AdminAuditLogsQuery,
  AdminCompaniesQuery,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminImpactOverviewResponse,
  AdminOpportunitiesQuery,
  AdminOpportunityListItem,
  AdminOverviewResponse,
  AdminPartnerDetail,
  AdminPartnerListItem,
  AdminPartnersQuery,
  AdminProgramAuditDetail,
  AdminProgramListItem,
  AdminProgramsQuery,
  AdminProposalListItem,
  AdminProposalsQuery,
  AdminSystemStatusResponse,
  AdminUserListItem,
  AdminUsersQuery,
  CreateSuperAdminDTO,
  ModerateOpportunityDTO,
  PaginatedResult,
  UpdateTenantStatusDTO,
  UpdateUserStatusDTO,
} from "./admin.interface";
import { Company } from "@/db/schema/companies";
import { Partner } from "@/db/schema/partners";
import { Opportunity } from "@/db/schema/opportunities";

export class AdminService {
  private readonly logger = new AppLogger("AdminService");

  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async getOverview(): Promise<AdminOverviewResponse> {
    return this.adminRepository.getOverviewData();
  }

  async getCompanies(query: AdminCompaniesQuery): Promise<PaginatedResult<AdminCompanyListItem>> {
    return this.adminRepository.findCompanies(query);
  }

  async getCompanyDetail(id: string): Promise<AdminCompanyDetail> {
    const company = await this.adminRepository.findCompanyDetail(id);
    if (!company) {
      throw new NotFoundError("Perusahaan tidak ditemukan");
    }
    return company;
  }

  async updateCompanyStatus(
    adminId: string,
    companyId: string,
    dto: UpdateTenantStatusDTO
  ): Promise<Company> {
    const existing = await this.adminRepository.findCompanyById(companyId);
    if (!existing) {
      throw new NotFoundError("Perusahaan tidak ditemukan");
    }

    const updatePayload = this.buildTenantUpdatePayload(adminId, existing, dto);
    const updated = await this.adminRepository.updateCompanyStatus(companyId, updatePayload);

    const action =
      dto.isVerified !== undefined && dto.status === undefined
        ? dto.isVerified
          ? "VERIFY_COMPANY"
          : "REVOKE_COMPANY_VERIFICATION"
        : "UPDATE_COMPANY_STATUS";

    await this.adminRepository.createAuditLog({
      adminId,
      action,
      targetType: "COMPANY",
      targetId: companyId,
      targetLabel: existing.name,
      previousValue: JSON.stringify({
        status: existing.status,
        isVerified: existing.isVerified,
      }),
      newValue: JSON.stringify({
        status: updated.status,
        isVerified: updated.isVerified,
      }),
      reason: dto.reason?.trim() || dto.verificationNotes?.trim() || null,
    });

    this.logger.info(`SuperAdmin ${adminId} updated company ${companyId}: ${action}`);
    return updated;
  }

  async getPartners(query: AdminPartnersQuery): Promise<PaginatedResult<AdminPartnerListItem>> {
    return this.adminRepository.findPartners(query);
  }

  async getPartnerDetail(id: string): Promise<AdminPartnerDetail> {
    const partner = await this.adminRepository.findPartnerDetail(id);
    if (!partner) {
      throw new NotFoundError("Mitra NGO/Yayasan tidak ditemukan");
    }
    return partner;
  }

  async updatePartnerStatus(
    adminId: string,
    partnerId: string,
    dto: UpdateTenantStatusDTO
  ): Promise<Partner> {
    const existing = await this.adminRepository.findPartnerById(partnerId);
    if (!existing) {
      throw new NotFoundError("Mitra NGO/Yayasan tidak ditemukan");
    }

    const updatePayload = this.buildTenantUpdatePayload(adminId, existing, dto);
    const updated = await this.adminRepository.updatePartnerStatus(partnerId, updatePayload);

    const action =
      dto.isVerified !== undefined && dto.status === undefined
        ? dto.isVerified
          ? "VERIFY_PARTNER"
          : "REVOKE_PARTNER_VERIFICATION"
        : "UPDATE_PARTNER_STATUS";

    await this.adminRepository.createAuditLog({
      adminId,
      action,
      targetType: "PARTNER",
      targetId: partnerId,
      targetLabel: existing.name,
      previousValue: JSON.stringify({
        status: existing.status,
        isVerified: existing.isVerified,
      }),
      newValue: JSON.stringify({
        status: updated.status,
        isVerified: updated.isVerified,
      }),
      reason: dto.reason?.trim() || dto.verificationNotes?.trim() || null,
    });

    this.logger.info(`SuperAdmin ${adminId} updated partner ${partnerId}: ${action}`);
    return updated;
  }

  async getUsers(query: AdminUsersQuery): Promise<PaginatedResult<AdminUserListItem>> {
    return this.adminRepository.findUsers(query);
  }

  async createSuperAdmin(adminId: string, dto: CreateSuperAdminDTO): Promise<SafeUser> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.authRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError("Email sudah terdaftar di sistem");
    }

    const hashedPassword = await PasswordUtil.hash(dto.password);
    const created = await this.authRepository.createUser({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      companyId: null,
      partnerId: null,
      phone: dto.phone?.trim() || null,
      position: dto.position?.trim() || "Platform Super Admin",
    });

    await this.adminRepository.createAuditLog({
      adminId,
      action: "CREATE_SUPER_ADMIN",
      targetType: "USER",
      targetId: created.id,
      targetLabel: `${created.name} (${created.email})`,
      previousValue: null,
      newValue: JSON.stringify({ role: created.role, status: created.status }),
      reason: "Penambahan akun Super Admin internal oleh pengelola platform",
    });

    this.logger.info(`SuperAdmin ${adminId} created new SuperAdmin ${created.id}`);
    const { password: _, ...safeUser } = created;
    return safeUser;
  }

  async updateUserStatus(
    adminId: string,
    targetUserId: string,
    dto: UpdateUserStatusDTO
  ): Promise<SafeUser> {
    const target = await this.authRepository.findById(targetUserId);
    if (!target) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    if (targetUserId === adminId && dto.status !== "ACTIVE") {
      throw new BadRequestError(
        "Anda tidak dapat menonaktifkan atau menangguhkan akun Anda sendiri"
      );
    }

    if (target.role === "SUPER_ADMIN" && target.status === "ACTIVE" && dto.status !== "ACTIVE") {
      const remainingActiveAdmins = await this.adminRepository.countActiveSuperAdmins(targetUserId);
      if (remainingActiveAdmins === 0) {
        throw new BadRequestError(
          "Tidak dapat menonaktifkan akun Super Admin aktif terakhir di platform"
        );
      }
    }

    const updated = await this.authRepository.updateUser(targetUserId, {
      status: dto.status,
    });

    await this.adminRepository.createAuditLog({
      adminId,
      action: dto.status === "SUSPENDED" ? "SUSPEND_USER" : "UPDATE_USER_STATUS",
      targetType: "USER",
      targetId: targetUserId,
      targetLabel: `${target.name} (${target.email})`,
      previousValue: JSON.stringify({ status: target.status, role: target.role }),
      newValue: JSON.stringify({ status: updated.status, role: updated.role }),
      reason: dto.reason?.trim() || null,
    });

    this.logger.info(`SuperAdmin ${adminId} changed user ${targetUserId} status to ${dto.status}`);
    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  async getOpportunities(
    query: AdminOpportunitiesQuery
  ): Promise<PaginatedResult<AdminOpportunityListItem>> {
    return this.adminRepository.findOpportunities(query);
  }

  async moderateOpportunity(
    adminId: string,
    opportunityId: string,
    dto: ModerateOpportunityDTO
  ): Promise<Opportunity> {
    const existing = await this.adminRepository.findOpportunityById(opportunityId);
    if (!existing) {
      throw new NotFoundError("Peluang CSR tidak ditemukan");
    }

    const updated = await this.adminRepository.updateOpportunityStatus(opportunityId, dto.status);
    if (!updated) {
      throw new NotFoundError("Peluang CSR tidak ditemukan setelah pembaruan");
    }

    await this.adminRepository.createAuditLog({
      adminId,
      action: dto.status === "CLOSED" ? "FORCE_CLOSE_OPPORTUNITY" : "REOPEN_OPPORTUNITY",
      targetType: "OPPORTUNITY",
      targetId: opportunityId,
      targetLabel: existing.title,
      previousValue: JSON.stringify({ status: existing.status }),
      newValue: JSON.stringify({ status: updated.status }),
      reason: dto.reason.trim(),
    });

    this.logger.info(`SuperAdmin ${adminId} moderated opportunity ${opportunityId} -> ${dto.status}`);
    return updated;
  }

  async getProposals(query: AdminProposalsQuery): Promise<PaginatedResult<AdminProposalListItem>> {
    return this.adminRepository.findProposals(query);
  }

  async getPrograms(query: AdminProgramsQuery): Promise<PaginatedResult<AdminProgramListItem>> {
    return this.adminRepository.findPrograms(query);
  }

  async getProgramAuditDetail(programId: string): Promise<AdminProgramAuditDetail> {
    const detail = await this.adminRepository.findProgramAuditDetail(programId);
    if (!detail) {
      throw new NotFoundError("Program CSR tidak ditemukan");
    }
    return detail;
  }

  async getImpactOverview(): Promise<AdminImpactOverviewResponse> {
    return this.adminRepository.getImpactOverview();
  }

  async getSystemStatus(auditQuery: AdminAuditLogsQuery): Promise<AdminSystemStatusResponse> {
    const [aiMetrics, auditLogs] = await Promise.all([
      this.adminRepository.getAiMetrics(),
      this.adminRepository.findAuditLogs(auditQuery),
    ]);

    const rawApiKey = (process.env.OPENAI_API_KEY || "").trim();
    const openAiConfigured =
      rawApiKey.length > 10 && !rawApiKey.includes("your-openai-api-key");

    return {
      aiConfig: {
        enabled: isAiFeatureEnabled(),
        model: process.env.OPENAI_MODEL || process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        openAiConfigured,
      },
      aiMetrics,
      auditLogs,
    };
  }

  private buildTenantUpdatePayload(
    adminId: string,
    existing: { status: "ACTIVE" | "INACTIVE" | "SUSPENDED"; isVerified: boolean },
    dto: UpdateTenantStatusDTO
  ) {
    const payload: {
      status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      isVerified?: boolean;
      verifiedAt?: Date | null;
      verifiedBy?: string | null;
      verificationNotes?: string | null;
    } = {};

    if (dto.status !== undefined) {
      payload.status = dto.status;
    }

    if (dto.isVerified !== undefined) {
      payload.isVerified = dto.isVerified;
      if (dto.isVerified) {
        if (!existing.isVerified) {
          payload.verifiedAt = new Date();
          payload.verifiedBy = adminId;
        }
      } else {
        payload.verifiedAt = null;
        payload.verifiedBy = null;
      }
    }

    const notes = dto.verificationNotes !== undefined ? dto.verificationNotes : dto.reason;
    if (notes !== undefined) {
      payload.verificationNotes = notes?.trim() || null;
    }

    return payload;
  }
}


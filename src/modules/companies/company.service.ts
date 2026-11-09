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
  CompanyFinancialOversightResponse,
  CompanyPartnerEvaluationsResponse,
  FinancialEarlyWarning,
  SectorFinancialBreakdown,
  FinancialOversightProgramItem,
  PartnerEvaluationItem,
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

  async getFinancialOversight(companyId: string | null): Promise<CompanyFinancialOversightResponse> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const { companyPrograms, disbursements, expenses } =
      await this.companyRepository.getFinancialOversightRawData(companyId);

    let totalBudget = 0;
    let totalSpent = 0;
    let totalBeneficiaries = 0;
    let completedPrograms = 0;
    let inProgressPrograms = 0;

    const sectorMap = new Map<
      string,
      { totalBudget: number; totalSpent: number; programsCount: number }
    >();

    const alerts: FinancialEarlyWarning[] = [];
    const programItems: FinancialOversightProgramItem[] = [];

    // Helper for beneficiary parsing
    const parseBeneficiaries = (text: string | null | undefined): number => {
      if (!text) return 0;
      const cleaned = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    };

    for (const row of companyPrograms) {
      const p = row.program;
      const budgetNum = parseFloat(p.budget || "0") || 0;
      const spentNum = parseFloat(p.spentBudget || "0") || 0;
      const benCount = parseBeneficiaries(p.actualBeneficiaries || p.targetBeneficiaries);
      const absorptionRate = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;
      const costPerBen = benCount > 0 && spentNum > 0 ? Math.round(spentNum / benCount) : 0;

      totalBudget += budgetNum;
      totalSpent += spentNum;
      totalBeneficiaries += benCount;

      if (p.status === "COMPLETED") completedPrograms += 1;
      if (p.status === "IN_PROGRESS") inProgressPrograms += 1;

      // Sector map
      const focus = p.focusArea || "LAINNYA";
      const existingSector = sectorMap.get(focus) || { totalBudget: 0, totalSpent: 0, programsCount: 0 };
      existingSector.totalBudget += budgetNum;
      existingSector.totalSpent += spentNum;
      existingSector.programsCount += 1;
      sectorMap.set(focus, existingSector);

      // Program tranches & expenses
      const progDisbursements = disbursements.filter((d) => d.programId === p.id);
      const progExpenses = expenses.filter((e) => e.programId === p.id);
      const totalDisbursed = progDisbursements.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      const verifiedExpensesCount = progExpenses.filter((e) => e.verificationStatus === "VERIFIED").length;
      const pendingExpensesCount = progExpenses.filter((e) => e.verificationStatus === "PENDING").length;

      // Early warning alerts
      if (p.status === "IN_PROGRESS" && absorptionRate < 30) {
        alerts.push({
          id: `slow-${p.id}`,
          programId: p.id,
          programTitle: p.title,
          type: "slow_absorption",
          title: "Serapan Anggaran Rendah (< 30%)",
          description: `Program "${p.title}" berstatus berjalan namun realisasi baru ${absorptionRate.toFixed(1)}%. Pastikan kegiatan lapangan berjalan sesuai jadwal.`,
          absorptionRate: Math.round(absorptionRate),
          budget: budgetNum,
          spent: spentNum,
        });
      }

      if (p.status === "IN_PROGRESS" && absorptionRate >= 90) {
        alerts.push({
          id: `ceiling-${p.id}`,
          programId: p.id,
          programTitle: p.title,
          type: "near_ceiling",
          title: "Mendekati Plafon Anggaran (≥ 90%)",
          description: `Realisasi anggaran program "${p.title}" telah mencapai ${absorptionRate.toFixed(1)}%. Perketat verifikasi pengeluaran tersisa.`,
          absorptionRate: Math.round(absorptionRate),
          budget: budgetNum,
          spent: spentNum,
        });
      }

      programItems.push({
        id: p.id,
        title: p.title,
        focusArea: p.focusArea,
        status: p.status,
        budget: budgetNum,
        spentBudget: spentNum,
        absorptionRate: Math.round(absorptionRate),
        partnerId: p.partnerId,
        partnerName: row.partnerName || "Mitra Pelaksana",
        partnerLogo: row.partnerLogo ?? null,
        targetCity: p.targetCity ?? null,
        targetProvince: p.targetProvince ?? null,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        targetBeneficiaries: p.targetBeneficiaries ?? null,
        actualBeneficiaries: p.actualBeneficiaries ?? null,
        beneficiariesCount: benCount,
        costPerBeneficiary: costPerBen,
        disbursementsCount: progDisbursements.length,
        totalDisbursed,
        expensesCount: progExpenses.length,
        verifiedExpensesCount,
        pendingExpensesCount,
      });
    }

    const unspentBudget = Math.max(0, totalBudget - totalSpent);
    const overallAbsorptionRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const avgCostPerBeneficiary =
      totalBeneficiaries > 0 && totalSpent > 0 ? Math.round(totalSpent / totalBeneficiaries) : 0;

    const sectors: SectorFinancialBreakdown[] = Array.from(sectorMap.entries()).map(
      ([focusArea, stats]) => ({
        focusArea,
        totalBudget: stats.totalBudget,
        totalSpent: stats.totalSpent,
        absorptionRate: stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0,
        programsCount: stats.programsCount,
        percentageOfTotalBudget: totalBudget > 0 ? Math.round((stats.totalBudget / totalBudget) * 100) : 0,
      })
    );

    return {
      summary: {
        totalBudget,
        totalSpent,
        unspentBudget,
        absorptionRate: Math.round(overallAbsorptionRate * 10) / 10,
        totalBeneficiaries,
        avgCostPerBeneficiary,
        totalPrograms: companyPrograms.length,
        completedPrograms,
        inProgressPrograms,
      },
      sectors,
      alerts,
      programs: programItems,
    };
  }

  async getPartnerEvaluations(companyId: string | null): Promise<CompanyPartnerEvaluationsResponse> {
    if (!companyId) {
      throw new BadRequestError("Akun Anda tidak terhubung dengan perusahaan manapun");
    }

    const { companyPrograms, activities, expenses, reviews, partnersList } =
      await this.companyRepository.getPartnerEvaluationsRawData(companyId);

    if (partnersList.length === 0) {
      return {
        evaluations: [],
        summary: {
          totalPartners: 0,
          tier1Count: 0,
          tier2Count: 0,
          tier3Count: 0,
          tier4Count: 0,
          averageScore: 0,
        },
      };
    }

    const parseBeneficiaries = (text: string | null | undefined): number => {
      if (!text) return 0;
      const cleaned = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    };

    const evaluations: PartnerEvaluationItem[] = [];

    for (const partner of partnersList) {
      const partnerCompanyPrograms = companyPrograms.filter(
        (cp) => cp.program.partnerId === partner.id
      );
      const partnerProgramIds = new Set(partnerCompanyPrograms.map((cp) => cp.program.id));

      let totalBudget = 0;
      let totalSpent = 0;
      let totalBeneficiaries = 0;
      let completedProgramsCount = 0;
      let inProgressProgramsCount = 0;

      for (const cp of partnerCompanyPrograms) {
        const p = cp.program;
        totalBudget += parseFloat(p.budget || "0") || 0;
        totalSpent += parseFloat(p.spentBudget || "0") || 0;
        totalBeneficiaries += parseBeneficiaries(p.actualBeneficiaries || p.targetBeneficiaries);
        if (p.status === "COMPLETED") completedProgramsCount += 1;
        if (p.status === "IN_PROGRESS") inProgressProgramsCount += 1;
      }

      const costPerBeneficiary =
        totalBeneficiaries > 0 && totalSpent > 0 ? Math.round(totalSpent / totalBeneficiaries) : 0;

      // 1. Pilar Kualitas Pelaporan Lapangan (35%)
      const partnerActivities = activities.filter((a) => partnerProgramIds.has(a.programId));
      let fieldReportingScore = 85;
      if (partnerActivities.length > 0) {
        const verifiedCount = partnerActivities.filter((a) => a.status === "VERIFIED").length;
        const revisionCount = partnerActivities.filter((a) => a.status === "REVISION_REQUESTED").length;
        const completionRatio = verifiedCount / partnerActivities.length;
        const verifBonus = revisionCount === 0 && verifiedCount > 0 ? 10 : 0;
        fieldReportingScore = Math.max(
          35,
          Math.min(100, Math.round(completionRatio * 90 + verifBonus - revisionCount * 5))
        );
      }

      // 2. Pilar Integritas Finansial & LPJ (30%)
      const partnerExpenses = expenses.filter((e) => partnerProgramIds.has(e.programId));
      let financialIntegrityScore = 85;
      if (partnerExpenses.length > 0) {
        const verifiedExpenses = partnerExpenses.filter((e) => e.verificationStatus === "VERIFIED");
        const totalExpSum = partnerExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const verifExpSum = verifiedExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const verifRatio = totalExpSum > 0 ? verifExpSum / totalExpSum : 1;
        financialIntegrityScore = Math.max(
          35,
          Math.min(100, Math.round(verifRatio * 90 + (verifRatio === 1 ? 10 : 0)))
        );
      }

      // 3. Pilar Kepuasan Warga & Penerima Manfaat (25%)
      const partnerReviews = reviews.filter((r) => partnerProgramIds.has(r.programId));
      let satisfactionScore = 85;
      if (partnerReviews.length > 0) {
        const avgRating =
          partnerReviews.reduce((acc, curr) => acc + curr.rating, 0) / partnerReviews.length;
        satisfactionScore = Math.max(30, Math.min(100, Math.round((avgRating / 5) * 100)));
      }

      // 4. Pilar Tata Kelola & Legalitas (10%)
      let governanceScore = 90;
      if (partner.legalNumber || partner.npwpNumber) {
        governanceScore = 100;
      }

      // Overall Weighted Score
      const overallScore = Math.round(
        fieldReportingScore * 0.35 +
          financialIntegrityScore * 0.3 +
          satisfactionScore * 0.25 +
          governanceScore * 0.1
      );

      // Tiering
      let tier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4" = "TIER_2";
      let tierLabel = "Tier 2 - Berkinerja Baik";
      let tierBadgeVariant: "emerald" | "blue" | "amber" | "rose" = "blue";
      let tierRecommendation =
        "Kinerja andal. Pertahankan kolaborasi dengan pemantauan milestone berkala.";

      if (overallScore >= 85) {
        tier = "TIER_1";
        tierLabel = "Tier 1 - Mitra Unggulan";
        tierBadgeVariant = "emerald";
        tierRecommendation =
          "Direkomendasikan untuk program skala prioritas tinggi dan penambahan alokasi pagu.";
      } else if (overallScore >= 70) {
        tier = "TIER_2";
        tierLabel = "Tier 2 - Berkinerja Baik";
        tierBadgeVariant = "blue";
        tierRecommendation =
          "Kinerja andal. Pertahankan kolaborasi dengan pemantauan milestone berkala.";
      } else if (overallScore >= 55) {
        tier = "TIER_3";
        tierLabel = "Tier 3 - Butuh Bimbingan";
        tierBadgeVariant = "amber";
        tierRecommendation =
          "Perlu pendampingan pelaporan LPJ dan konfirmasi serapan sebelum pencairan termin berikutnya.";
      } else {
        tier = "TIER_4";
        tierLabel = "Tier 4 - Perlu Evaluasi Khusus";
        tierBadgeVariant = "rose";
        tierRecommendation =
          "Audit lapangan diperlukan. Tunda penugasan peluang program baru hingga evaluasi tuntas.";
      }

      evaluations.push({
        partnerId: partner.id,
        name: partner.name,
        organizationType: partner.organizationType ?? null,
        city: partner.city ?? null,
        province: partner.province ?? null,
        logoUrl: partner.logoUrl ?? null,
        verificationStatus: partner.status,
        focusArea: partner.focusArea,
        programsCount: partnerCompanyPrograms.length,
        completedProgramsCount,
        inProgressProgramsCount,
        totalBudget,
        totalSpent,
        totalBeneficiaries,
        costPerBeneficiary,
        fieldReportingScore,
        financialIntegrityScore,
        satisfactionScore,
        governanceScore,
        overallScore,
        tier,
        tierLabel,
        tierBadgeVariant,
        tierRecommendation,
        partner: {
          id: partner.id,
          name: partner.name,
          organizationType: partner.organizationType ?? null,
          city: partner.city ?? null,
          province: partner.province ?? null,
          logoUrl: partner.logoUrl ?? null,
          status: partner.status,
          focusArea: partner.focusArea,
        },
      });
    }

    evaluations.sort((a, b) => b.overallScore - a.overallScore);

    const tier1Count = evaluations.filter((e) => e.tier === "TIER_1").length;
    const tier2Count = evaluations.filter((e) => e.tier === "TIER_2").length;
    const tier3Count = evaluations.filter((e) => e.tier === "TIER_3").length;
    const tier4Count = evaluations.filter((e) => e.tier === "TIER_4").length;
    const avgScore =
      evaluations.length > 0
        ? Math.round(evaluations.reduce((acc, curr) => acc + curr.overallScore, 0) / evaluations.length)
        : 0;

    return {
      evaluations,
      summary: {
        totalPartners: evaluations.length,
        tier1Count,
        tier2Count,
        tier3Count,
        tier4Count,
        averageScore: avgScore,
      },
    };
  }
}

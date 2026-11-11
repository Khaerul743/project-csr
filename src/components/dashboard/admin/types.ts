import type {
  AdminAuditLogItem,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminImpactOverviewResponse,
  AdminOpportunityListItem,
  AdminOverviewResponse,
  AdminPartnerDetail,
  AdminPartnerListItem,
  AdminProgramAuditDetail,
  AdminProgramListItem,
  AdminProposalListItem,
  AdminSystemStatusResponse,
  AdminUserListItem,
  PaginatedResult,
} from "@/modules/admin/admin.interface";

export type AdminNavMenu =
  | "overview"
  | "companies"
  | "partners"
  | "users"
  | "moderation"
  | "programs"
  | "impact"
  | "system";

export type {
  AdminAuditLogItem,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminImpactOverviewResponse,
  AdminOpportunityListItem,
  AdminOverviewResponse,
  AdminPartnerDetail,
  AdminPartnerListItem,
  AdminProgramAuditDetail,
  AdminProgramListItem,
  AdminProposalListItem,
  AdminSystemStatusResponse,
  AdminUserListItem,
  PaginatedResult,
};

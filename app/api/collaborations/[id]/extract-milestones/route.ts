import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { collaborationService } from "@/modules/collaborations";
import { milestoneExtractorService } from "@/modules/ai";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authUser = AuthGuard.authenticate(request);
    AuthGuard.authorize(authUser, ["CSR_ADMIN"]);

    const { id } = await params;
    const collaboration = await collaborationService.getCollaborationById(id, {
      companyId: authUser.companyId,
    });

    const extractionResult = await milestoneExtractorService.extractFromProposal({
      title: collaboration.proposalTitle || collaboration.opportunityTitle || "Inisiatif CSR",
      focusArea: collaboration.opportunityFocusArea || "Umum",
      durationMonths: collaboration.proposalDurationMonths || 3,
      targetBeneficiaries:
        collaboration.targetBeneficiaries || collaboration.proposalTargetBeneficiaries || "Masyarakat sasaran",
      budget: collaboration.finalBudget || collaboration.proposedBudget || "0",
      summary: collaboration.proposalSummary || "",
      documentUrl: collaboration.proposalDocumentUrl || null,
    });

    return ApiResponse.success(
      extractionResult,
      "Draf rencana milestone berhasil diekstraksi dari dokumen proposal"
    );
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}


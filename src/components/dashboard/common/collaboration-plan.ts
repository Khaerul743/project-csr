export interface PlanMilestoneItem {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  targetTimeline: string;
  suggestedKpi: string;
  expectedEvidence: string;
  source: "AI_GENERATED" | "MANUAL";
}

export type MilestonePlanStatus =
  | "DRAFT"
  | "PENDING_PARTNER_CONFIRMATION"
  | "CONFIRMED_BY_PARTNER"
  | "REVISION_REQUESTED";

export interface CollaborationPlanPayload {
  textNotes?: string;
  milestones: PlanMilestoneItem[];
  milestonePlanStatus: MilestonePlanStatus;
  partnerFeedback?: string;
  lastUpdatedBy?: "CSR_ADMIN" | "PARTNER";
  lastUpdatedAt?: string;
  history?: {
    timestamp: string;
    actor: "CSR_ADMIN" | "PARTNER";
    action: string;
    notes?: string;
  }[];
}

export function parseCollaborationPlan(rawNotes?: string | null): CollaborationPlanPayload {
  if (!rawNotes) {
    return {
      textNotes: "",
      milestones: [],
      milestonePlanStatus: "DRAFT",
      history: [],
    };
  }

  try {
    const parsed = JSON.parse(rawNotes);
    if (parsed && typeof parsed === "object") {
      return {
        textNotes: typeof parsed.textNotes === "string" ? parsed.textNotes : "",
        milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
        milestonePlanStatus: parsed.milestonePlanStatus || "DRAFT",
        partnerFeedback: parsed.partnerFeedback || "",
        lastUpdatedBy: parsed.lastUpdatedBy,
        lastUpdatedAt: parsed.lastUpdatedAt,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }
  } catch {
    // Plain text legacy note fallback
    return {
      textNotes: rawNotes,
      milestones: [],
      milestonePlanStatus: "DRAFT",
      history: [],
    };
  }

  return {
    textNotes: "",
    milestones: [],
    milestonePlanStatus: "DRAFT",
    history: [],
  };
}

export function serializeCollaborationPlan(plan: CollaborationPlanPayload): string {
  return JSON.stringify(plan);
}


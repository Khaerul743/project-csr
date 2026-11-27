import { opportunityController } from "@/modules/opportunities";

export async function GET(request: Request) {
  return opportunityController.getCompanyInvitations(request);
}


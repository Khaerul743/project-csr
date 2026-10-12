import { connection } from "next/server";
import { opportunityController } from "@/modules/opportunities";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return opportunityController.invitePartner(request, id);
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return opportunityController.getInvitations(request, id);
}

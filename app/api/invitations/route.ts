import { connection } from "next/server";
import { invitationController } from "@/modules/invitations";

export async function POST(request: Request) {
  return invitationController.create(request);
}

export async function GET(request: Request) {
  await connection();
  return invitationController.getCompanyInvitations(request);
}

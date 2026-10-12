import { connection } from "next/server";
import { invitationController } from "@/modules/invitations";

export async function GET(request: Request) {
  await connection();
  return invitationController.getMyPending(request);
}

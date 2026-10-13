import { connection } from "next/server";
import { opportunityController } from "@/modules/opportunities";

export async function GET(request: Request) {
  await connection();
  return opportunityController.getMyInvitations(request);
}

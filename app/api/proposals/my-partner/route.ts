import { connection } from "next/server";
import { proposalController } from "@/modules/proposals";

export async function GET(request: Request) {
  await connection();
  return proposalController.getMyPartnerProposals(request);
}

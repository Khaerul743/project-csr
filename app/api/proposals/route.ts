import { proposalController } from "@/modules/proposals";

export async function POST(request: Request) {
  return proposalController.create(request);
}

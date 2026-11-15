import { opportunityController } from "@/modules/opportunities";

export async function POST(request: Request) {
  return opportunityController.recommendSdgs(request);
}

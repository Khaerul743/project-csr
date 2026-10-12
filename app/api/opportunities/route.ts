import { connection } from "next/server";
import { opportunityController } from "@/modules/opportunities";

export async function POST(request: Request) {
  return opportunityController.create(request);
}

export async function GET(request: Request) {
  await connection();
  return opportunityController.getAll(request);
}

import { connection } from "next/server";
import { partnerController } from "@/modules/partners";

export async function POST(request: Request) {
  return partnerController.create(request);
}

export async function GET(request: Request) {
  await connection();
  return partnerController.getAll(request);
}

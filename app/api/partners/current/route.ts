import { connection } from "next/server";
import { partnerController } from "@/modules/partners";

export async function GET(request: Request) {
  await connection();
  return partnerController.getCurrent(request);
}

export async function PUT(request: Request) {
  return partnerController.update(request);
}

export async function PATCH(request: Request) {
  return partnerController.update(request);
}

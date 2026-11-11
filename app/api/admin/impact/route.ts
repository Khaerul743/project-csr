import { connection } from "next/server";
import { adminController } from "@/modules/admin";

export async function GET(request: Request) {
  await connection();
  return adminController.getImpactOverview(request);
}


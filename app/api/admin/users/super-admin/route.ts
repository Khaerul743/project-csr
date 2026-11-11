import { connection } from "next/server";
import { adminController } from "@/modules/admin";

export async function POST(request: Request) {
  await connection();
  return adminController.createSuperAdmin(request);
}


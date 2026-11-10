import { connection } from "next/server";
import { authController } from "@/modules/auth";

export async function POST(request: Request) {
  await connection();
  return authController.changePassword(request);
}


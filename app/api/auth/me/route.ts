import { connection } from "next/server";
import { authController } from "@/modules/auth";

export async function GET(request: Request) {
  await connection();
  return authController.me(request);
}

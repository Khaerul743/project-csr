import { authController } from "@/modules/auth";

export async function GET(request: Request) {
  return authController.me(request);
}

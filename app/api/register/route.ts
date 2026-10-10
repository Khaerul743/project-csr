import { authController } from "@/modules/auth";

export async function POST(request: Request) {
  return authController.register(request);
}

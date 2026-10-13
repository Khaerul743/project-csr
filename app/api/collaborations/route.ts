import { connection } from "next/server";
import { collaborationController } from "@/modules/collaborations";

export async function GET(request: Request) {
  await connection();
  return collaborationController.getAll(request);
}

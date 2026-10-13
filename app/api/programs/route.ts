import { connection } from "next/server";
import { programController } from "@/modules/programs";

export async function GET(request: Request) {
  await connection();
  return programController.getAll(request);
}

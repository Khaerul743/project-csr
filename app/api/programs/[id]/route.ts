import { connection } from "next/server";
import { programController } from "@/modules/programs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return programController.getById(request, id);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return programController.update(request, id);
}

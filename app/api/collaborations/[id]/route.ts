import { connection } from "next/server";
import { collaborationController } from "@/modules/collaborations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return collaborationController.getById(request, id);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return collaborationController.update(request, id);
}

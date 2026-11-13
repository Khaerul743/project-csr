import { connection } from "next/server";
import { collaborationController } from "@/modules/collaborations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return collaborationController.predictImpact(request, id);
}


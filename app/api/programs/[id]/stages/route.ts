import { connection } from "next/server";
import { programStageController } from "@/modules/programs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return programStageController.getStages(request, id);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return programStageController.saveStages(request, id);
}

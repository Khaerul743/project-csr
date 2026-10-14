import { connection } from "next/server";
import { activityController } from "@/modules/activities";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return activityController.getByProgramId(request, id);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return activityController.create(request, id);
}

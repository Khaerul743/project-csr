import { connection } from "next/server";
import { reviewController } from "@/modules/reviews";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return reviewController.getByProgramId(request, id);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return reviewController.create(request, id);
}

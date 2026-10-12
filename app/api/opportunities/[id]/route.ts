import { connection } from "next/server";
import { opportunityController } from "@/modules/opportunities";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return opportunityController.getById(id);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return opportunityController.update(request, id);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return opportunityController.update(request, id);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return opportunityController.delete(request, id);
}

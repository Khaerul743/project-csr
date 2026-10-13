import { connection } from "next/server";
import { proposalController } from "@/modules/proposals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return proposalController.getById(request, id);
}

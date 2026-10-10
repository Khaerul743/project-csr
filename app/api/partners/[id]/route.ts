import { connection } from "next/server";
import { partnerController } from "@/modules/partners";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return partnerController.getById(id);
}

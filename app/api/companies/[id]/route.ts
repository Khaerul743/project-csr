import { connection } from "next/server";
import { companyController } from "@/modules/companies";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return companyController.getById(id);
}

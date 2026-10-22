import { connection } from "next/server";
import { financeController } from "@/modules/finances";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return financeController.createExpense(request, id);
}

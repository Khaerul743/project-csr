import { connection } from "next/server";
import { financeController } from "@/modules/finances";

interface RouteParams {
  params: Promise<{ id: string; expenseId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  await connection();
  const { id, expenseId } = await params;
  return financeController.verifyExpense(request, id, expenseId);
}

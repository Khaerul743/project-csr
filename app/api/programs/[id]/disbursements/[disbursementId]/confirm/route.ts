import { connection } from "next/server";
import { financeController } from "@/modules/finances";

interface RouteParams {
  params: Promise<{ id: string; disbursementId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  await connection();
  const { id, disbursementId } = await params;
  return financeController.confirmDisbursement(request, id, disbursementId);
}

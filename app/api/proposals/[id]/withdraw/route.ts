import { proposalController } from "@/modules/proposals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proposalController.withdraw(request, id);
}

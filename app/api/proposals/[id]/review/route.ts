import { proposalController } from "@/modules/proposals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proposalController.review(request, id);
}

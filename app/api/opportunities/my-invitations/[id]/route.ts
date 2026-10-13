import { opportunityController } from "@/modules/opportunities";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return opportunityController.respondInvitation(request, id);
}

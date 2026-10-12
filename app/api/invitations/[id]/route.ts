import { invitationController } from "@/modules/invitations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return invitationController.cancel(request, id);
}

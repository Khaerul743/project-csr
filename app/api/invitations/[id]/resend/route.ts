import { invitationController } from "@/modules/invitations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return invitationController.resend(request, id);
}


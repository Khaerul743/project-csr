import { invitationController } from "@/modules/invitations";

export async function POST(request: Request) {
  return invitationController.accept(request);
}

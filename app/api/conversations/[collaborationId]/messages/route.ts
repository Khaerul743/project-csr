import { conversationController } from "@/modules/conversations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ collaborationId: string }> }
) {
  const { collaborationId } = await params;
  return conversationController.getMessages(request, collaborationId);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ collaborationId: string }> }
) {
  const { collaborationId } = await params;
  return conversationController.sendMessage(request, collaborationId);
}

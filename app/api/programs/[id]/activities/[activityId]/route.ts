import { activityController } from "@/modules/activities";

interface RouteParams {
  params: Promise<{ id: string; activityId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { activityId } = await params;
  return activityController.review(request, activityId);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { activityId } = await params;
  return activityController.delete(request, activityId);
}

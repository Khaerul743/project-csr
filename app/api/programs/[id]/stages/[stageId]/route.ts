import { programStageController } from "@/modules/programs";

interface RouteParams {
  params: Promise<{ id: string; stageId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id, stageId } = await params;
  return programStageController.updateStage(request, id, stageId);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id, stageId } = await params;
  return programStageController.deleteStage(request, id, stageId);
}

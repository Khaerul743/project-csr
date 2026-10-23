import { programStageController } from "@/modules/programs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return programStageController.generateStages(request, id);
}

import { programController } from "@/modules/programs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return programController.generateEsgReport(request, id);
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return programController.getEsgReport(request, id);
}

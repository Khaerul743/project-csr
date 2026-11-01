import { companyController } from "@/modules/companies";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return companyController.updateMember(request, id);
}


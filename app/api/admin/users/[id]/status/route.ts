import { connection } from "next/server";
import { adminController } from "@/modules/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  return adminController.updateUserStatus(request, id);
}


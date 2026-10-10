import { connection } from "next/server";
import { companyController } from "@/modules/companies";

export async function GET(request: Request) {
  await connection();
  return companyController.getCurrent(request);
}

export async function PUT(request: Request) {
  return companyController.update(request);
}

export async function PATCH(request: Request) {
  return companyController.update(request);
}

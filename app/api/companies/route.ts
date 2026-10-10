import { connection } from "next/server";
import { companyController } from "@/modules/companies";

export async function POST(request: Request) {
  return companyController.create(request);
}

export async function GET(request: Request) {
  await connection();
  return companyController.getAll(request);
}

import { connection } from "next/server";
import { companyController } from "@/modules/companies";

export async function GET(request: Request) {
  await connection();
  return companyController.getFinancialOversight(request);
}


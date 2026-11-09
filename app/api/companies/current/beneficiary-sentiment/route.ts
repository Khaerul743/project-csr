import { connection } from "next/server";
import { reviewController } from "@/modules/reviews";

export async function GET(request: Request) {
  await connection();
  return reviewController.getCompanySentimentOverview(request);
}


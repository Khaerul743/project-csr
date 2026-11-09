import { connection } from "next/server";
import { reviewController } from "@/modules/reviews";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  const { id } = await params;
  return reviewController.analyzeProgramSentiment(request, id);
}


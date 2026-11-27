import { templateController } from "@/modules/templates";

export async function GET(request: Request) {
  return templateController.list(request);
}

export async function POST(request: Request) {
  return templateController.create(request);
}


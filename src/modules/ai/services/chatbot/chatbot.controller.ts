import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";
import { ChatbotService } from "./chatbot.service";
import { chatRequestSchema } from "./chatbot.schema";

export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  async chat(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);

      if (!isAiFeatureEnabled()) {
        return ApiResponse.success(
          {
            reply:
              "Fitur AI Advisor saat ini sedang dinonaktifkan oleh administrator melalui konfigurasi sistem (`ENABLE_AI_FEATURES=false` / `NEXT_PUBLIC_ENABLE_AI=false`). Silakan aktifkan kembali fitur AI di Environment Variables jika ingin menggunakannya.",
            toolCallsMade: [],
            suggestedPrompts: [],
          },
          "Fitur AI dinonaktifkan"
        );
      }

      const body = await request.json();
      const validatedInput = chatRequestSchema.parse(body);

      const result = await this.chatbotService.handleChat({
        user: authUser,
        messages: validatedInput.messages,
        context: validatedInput.context,
      });

      return ApiResponse.success(result, "Respon asisten AI berhasil dibuat");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}


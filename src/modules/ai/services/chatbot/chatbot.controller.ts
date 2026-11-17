import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { BadRequestError } from "@/common/errors/app-error";
import { AuthGuard } from "@/common/guards/auth.guard";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";
import { ChatbotService } from "./chatbot.service";
import { chatRequestSchema } from "./chatbot.schema";
import { surveyDocumentParserService } from "../document-parser/survey-document-parser.service";

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

      let messages: any[] = [];
      let context: any = {};

      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const messagesStr = formData.get("messages") as string;
        const contextStr = formData.get("context") as string;

        if (messagesStr) {
          try {
            messages = JSON.parse(messagesStr);
          } catch {
            messages = [];
          }
        }
        if (contextStr) {
          try {
            context = JSON.parse(contextStr);
          } catch {
            context = {};
          }
        }

        if (file && file.size > 0) {
          const MAX_SIZE_BYTES = 15 * 1024 * 1024;
          if (file.size > MAX_SIZE_BYTES) {
            throw new BadRequestError("Ukuran dokumen survei terlalu besar. Maksimal 15MB.");
          }

          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          const allowedExtensions = ["pdf", "doc", "docx"];
          if (!allowedExtensions.includes(ext)) {
            throw new BadRequestError("Format berkas tidak didukung. Harap unggah berkas PDF atau Word (.docx).");
          }

          const arrayBuffer = await file.arrayBuffer();
          const parsed = await surveyDocumentParserService.parseBuffer(
            arrayBuffer,
            file.name,
            file.size,
            file.type
          );

          const attachedSurveyInfo = {
            fileName: parsed.fileName,
            fileSize: parsed.fileSize,
            mimeType: parsed.mimeType,
            detectedProvince: parsed.detectedProvince,
            detectedFocusAreas: parsed.detectedFocusAreas,
            extractedSnippet: parsed.extractedText.slice(0, 500),
            fullExtractedText: parsed.extractedText,
          };

          context = {
            ...context,
            attachedSurveyDocument: attachedSurveyInfo,
          };

          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "user") {
              lastMsg.attachedDocument = {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
              };
              lastMsg.content = `${lastMsg.content}\n\n[DOKUMEN HASIL SURVEI WILAYAH TERLAMPIR: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)]\nIsi Teks Dokumen:\n${parsed.extractedText}`;
            }
          }
        }

        // Validate messages array
        chatRequestSchema.shape.messages.parse(messages);
      } else {
        const body = await request.json();
        const validatedInput = chatRequestSchema.parse(body);
        messages = validatedInput.messages;
        context = validatedInput.context || {};
      }

      const result = await this.chatbotService.handleChat({
        user: authUser,
        messages,
        context,
      });

      return ApiResponse.success(result, "Respon asisten AI berhasil dibuat");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}


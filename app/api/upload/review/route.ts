import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { BadRequestError } from "@/common/errors/app-error";
import { storageService } from "@/common/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new BadRequestError("File foto kegiatan/bukti wajib diunggah");
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new BadRequestError(
        "Format foto tidak didukung. Harap unggah foto berekstensi JPG, PNG, WEBP, atau GIF."
      );
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError("Ukuran foto terlalu besar. Maksimal 5MB.");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeFilename = `review-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await storageService.upload(buffer, safeFilename, {
      folder: "reviews",
      contentType: file.type,
    });

    return ApiResponse.created(
      {
        url: uploadResult.url,
        filename: safeFilename,
        size: file.size,
        mimeType: file.type,
        provider: uploadResult.provider,
      },
      "Foto testimoni berhasil diunggah"
    );
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}


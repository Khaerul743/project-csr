import { NextResponse } from "next/server";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { BadRequestError } from "@/common/errors/app-error";
import { storageService } from "@/common/storage";

export async function POST(request: Request) {
  try {
    // 1. Verifikasi autentikasi user
    AuthGuard.authenticate(request);

    // 2. Ambil form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "company";

    if (!file) {
      throw new BadRequestError("File wajib diunggah");
    }

    // 3. Validasi tipe MIME (gambar & dokumen PDF)
    const allowedImageMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    const allowedDocMimeTypes = ["application/pdf"];
    const allowedMimeTypes = [...allowedImageMimeTypes, ...allowedDocMimeTypes];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new BadRequestError(
        "Format file tidak didukung. Harap unggah gambar JPG, PNG, WEBP, atau dokumen PDF."
      );
    }

    // 4. Validasi ukuran (maksimal 5MB untuk gambar, 10MB untuk PDF)
    const isPdf = file.type === "application/pdf";
    const MAX_SIZE_BYTES = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError(
        `Ukuran file terlalu besar. Maksimal ${isPdf ? "10MB" : "5MB"}.`
      );
    }

    // 5. Ekstensi file & sanitasi nama
    const ext = file.name.split(".").pop()?.toLowerCase() || (isPdf ? "pdf" : "jpg");
    const prefix = isPdf ? "doc" : "media";
    const safeFilename = `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const safeFolder = requestedFolder.replace(/[^a-zA-Z0-9-_]/g, "");

    // 6. Simpan file via Storage Service (Vercel Blob / Local Storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await storageService.upload(buffer, safeFilename, {
      folder: safeFolder,
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
      "File berhasil diunggah"
    );
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

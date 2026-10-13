import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { BadRequestError } from "@/common/errors/app-error";

export async function POST(request: Request) {
  try {
    // 1. Verifikasi autentikasi user
    AuthGuard.authenticate(request);

    // 2. Ambil form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new BadRequestError("File gambar wajib diunggah");
    }

    // 3. Validasi tipe MIME
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
        "Format file tidak didukung. Harap unggah gambar JPG, PNG, WEBP, atau GIF."
      );
    }

    // 4. Validasi ukuran (maksimal 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError("Ukuran file terlalu besar. Maksimal 5MB.");
    }

    // 5. Ekstensi file
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeFilename = `opp-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // 6. Siapkan folder penyimpanan di public/uploads/opportunities
    const uploadDir = path.join(process.cwd(), "public", "uploads", "opportunities");
    await mkdir(uploadDir, { recursive: true });

    // 7. Simpan file
    const filePath = path.join(uploadDir, safeFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/opportunities/${safeFilename}`;

    return ApiResponse.created(
      {
        url: publicUrl,
        filename: safeFilename,
        size: file.size,
        mimeType: file.type,
      },
      "Gambar thumbnail berhasil diunggah"
    );
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

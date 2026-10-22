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
      throw new BadRequestError("File dokumen proposal wajib dipilih");
    }

    // 3. Ekstensi file yang diizinkan
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx"];

    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestError(
        "Format dokumen tidak didukung. Harap unggah berkas berformat PDF, DOC, atau DOCX."
      );
    }

    // 4. Validasi ukuran (maksimal 15MB)
    const MAX_SIZE_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestError("Ukuran dokumen terlalu besar. Maksimal 15MB.");
    }

    // 5. Nama file unik dan aman
    const safeFilename = `proposal-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // 6. Siapkan folder penyimpanan di public/uploads/proposals
    const uploadDir = path.join(process.cwd(), "public", "uploads", "proposals");
    await mkdir(uploadDir, { recursive: true });

    // 7. Simpan file buffer ke disk
    const filePath = path.join(uploadDir, safeFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/proposals/${safeFilename}`;

    return ApiResponse.created(
      {
        url: publicUrl,
        filename: safeFilename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      },
      "Dokumen proposal berhasil diunggah"
    );
  } catch (error) {
    return ErrorHandler.handle(error);
  }
}

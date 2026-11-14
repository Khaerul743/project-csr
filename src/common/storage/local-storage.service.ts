import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { AppLogger } from "@/common/logger/app-logger";
import { IStorageService, UploadOptions, UploadResult } from "./storage.interface";

export class LocalStorageService implements IStorageService {
  private readonly logger = new AppLogger("LocalStorageService");

  async upload(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const folder = (options?.folder || "general").replace(/[^a-zA-Z0-9-_]/g, "");
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_.]/g, "-");
    
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFilename);
    await writeFile(filePath, fileBuffer);

    const relativeUrl = `/uploads/${folder}/${safeFilename}`;
    this.logger.info(`File berhasil disimpan di disk lokal: ${relativeUrl}`);

    return {
      url: relativeUrl,
      pathname: `${folder}/${safeFilename}`,
      contentType: options?.contentType,
      size: fileBuffer.length,
      provider: "LOCAL_DISK",
    };
  }

  async delete(urlOrPathname: string): Promise<void> {
    try {
      let cleanPath = urlOrPathname;
      if (cleanPath.startsWith("/uploads/")) {
        cleanPath = cleanPath.replace("/uploads/", "");
      }
      const fullPath = path.join(process.cwd(), "public", "uploads", cleanPath);
      await unlink(fullPath);
      this.logger.info(`File lokal berhasil dihapus: ${cleanPath}`);
    } catch (err: any) {
      this.logger.warn(`Gagal menghapus file lokal: ${err.message}`);
    }
  }

  getProvider(): "LOCAL_DISK" {
    return "LOCAL_DISK";
  }
}


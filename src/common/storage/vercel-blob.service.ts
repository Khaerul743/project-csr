import { put, del } from "@vercel/blob";
import { AppLogger } from "@/common/logger/app-logger";
import { IStorageService, UploadOptions, UploadResult } from "./storage.interface";

export class VercelBlobStorageService implements IStorageService {
  private readonly logger = new AppLogger("VercelBlobStorageService");

  async upload(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const folder = (options?.folder || "general").replace(/[^a-zA-Z0-9-_]/g, "");
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_.]/g, "-");
    const pathname = `${folder}/${safeFilename}`;
    const body = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

    this.logger.info(`Mengunggah file ke Vercel Blob: ${pathname}`);

    let blob;
    try {
      blob = await put(pathname, body, {
        access: "public",
        contentType: options?.contentType,
      });
    } catch (err: any) {
      if (err.message?.includes("Cannot use public access on a private store")) {
        this.logger.warn(
          "Blob store di Vercel bertipe Private. Mengunggah dengan akses private..."
        );
        blob = await put(pathname, body, {
          access: "private",
          contentType: options?.contentType,
        });
      } else {
        throw err;
      }
    }

    this.logger.info(`Upload sukses ke Vercel Blob: ${blob.url}`);

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: fileBuffer.length,
      provider: "VERCEL_BLOB",
    };
  }

  async delete(urlOrPathname: string): Promise<void> {
    try {
      this.logger.info(`Menghapus file dari Vercel Blob: ${urlOrPathname}`);
      await del(urlOrPathname);
      this.logger.info(`File berhasil dihapus dari Vercel Blob`);
    } catch (err: any) {
      this.logger.warn(`Gagal menghapus file dari Vercel Blob: ${err.message}`);
    }
  }

  getProvider(): "VERCEL_BLOB" {
    return "VERCEL_BLOB";
  }
}

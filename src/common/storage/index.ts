import { AppLogger } from "@/common/logger/app-logger";
import { IStorageService, UploadOptions, UploadResult } from "./storage.interface";
import { LocalStorageService } from "./local-storage.service";
import { VercelBlobStorageService } from "./vercel-blob.service";

export * from "./storage.interface";
export * from "./local-storage.service";
export * from "./vercel-blob.service";

class StorageManager implements IStorageService {
  private readonly logger = new AppLogger("StorageManager");
  private localService = new LocalStorageService();
  private vercelBlobService = new VercelBlobStorageService();

  private getActiveService(): IStorageService {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token && token.trim().length > 0 && !token.includes("xxxxxxxx")) {
      return this.vercelBlobService;
    }
    return this.localService;
  }

  async upload(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const service = this.getActiveService();
    try {
      return await service.upload(fileBuffer, filename, options);
    } catch (err: any) {
      if (service instanceof VercelBlobStorageService) {
        this.logger.warn(
          `Gagal upload ke Vercel Blob: ${err.message}. Mengalihkan fallback ke Local Storage...`
        );
        return await this.localService.upload(fileBuffer, filename, options);
      }
      throw err;
    }
  }

  async delete(urlOrPathname: string): Promise<void> {
    const service = this.getActiveService();
    return service.delete(urlOrPathname);
  }

  getProvider(): "VERCEL_BLOB" | "LOCAL_DISK" {
    return this.getActiveService().getProvider();
  }
}

export const storageService = new StorageManager();


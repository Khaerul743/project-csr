export interface UploadOptions {
  folder?: string;
  contentType?: string;
  access?: "public";
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType?: string;
  size?: number;
  provider: "VERCEL_BLOB" | "LOCAL_DISK";
}

export interface IStorageService {
  upload(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult>;
  delete(urlOrPathname: string): Promise<void>;
  getProvider(): "VERCEL_BLOB" | "LOCAL_DISK";
}


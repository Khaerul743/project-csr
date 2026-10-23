import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { AppLogger } from "@/common/logger/app-logger";

export class PdfParserService {
  private readonly logger = new AppLogger("PdfParserService");

  /**
   * Ekstrak teks dari berkas PDF lokal dan lakukan pemfilteran cerdas
   * agar hanya mengambil bagian yang relevan dengan metodologi & rencana kerja kegiatan.
   */
  async extractRelevantText(documentUrlOrPath: string, maxCharacters = 18000): Promise<string> {
    try {
      if (!documentUrlOrPath) return "";

      // 1. Tentukan path file di disk
      let fullPath = documentUrlOrPath;
      if (documentUrlOrPath.startsWith("/uploads/")) {
        fullPath = path.join(process.cwd(), "public", documentUrlOrPath);
      } else if (!path.isAbsolute(documentUrlOrPath)) {
        fullPath = path.join(process.cwd(), "public", "uploads", "proposals", documentUrlOrPath);
      }

      if (!existsSync(/*turbopackIgnore: true*/ fullPath)) {
        this.logger.warn(`File PDF tidak ditemukan di path: ${fullPath}`);
        return "";
      }

      // Pastikan ekstensi adalah PDF
      if (!fullPath.toLowerCase().endsWith(".pdf")) {
        this.logger.info(`Bukan berkas PDF, lewati parsing PDF: ${fullPath}`);
        return "";
      }

      this.logger.info(`Membaca dan mengekstrak berkas PDF: ${fullPath}`);
      const fileBuffer = await readFile(/*turbopackIgnore: true*/ fullPath);

      // 2. Ekstrak teks dengan unpdf (workerless, native Next.js & serverless compatible)
      let rawText = "";
      try {
        const { extractText } = await import("unpdf");
        const uint8 = new Uint8Array(fileBuffer);
        const res = await extractText(uint8);
        if (Array.isArray(res?.text)) {
          rawText = res.text.join("\n\n");
        } else if (typeof res?.text === "string") {
          rawText = res.text;
        }
      } catch (unpdfErr: any) {
        this.logger.warn(`Ekstraksi dengan unpdf mengalami kendala: ${unpdfErr.message}. Mencoba fallback...`);
      }

      // Fallback ke pdf-parse jika unpdf belum menghasilkan teks
      if (!rawText || rawText.trim().length === 0) {
        try {
          const pdfModule: any = await import("pdf-parse");
          if (pdfModule.PDFParse) {
            const parser = new pdfModule.PDFParse({ data: fileBuffer });
            const res = await parser.getText();
            rawText = res?.text || "";
            if (typeof parser.destroy === "function") {
              await parser.destroy();
            }
          } else if (typeof pdfModule === "function") {
            const data = await pdfModule(fileBuffer);
            rawText = data?.text || "";
          } else if (typeof pdfModule.default === "function") {
            const data = await pdfModule.default(fileBuffer);
            rawText = data?.text || "";
          }
        } catch (pdfParseErr: any) {
          this.logger.warn(`Fallback pdf-parse juga gagal: ${pdfParseErr.message}`);
        }
      }

      if (!rawText || rawText.trim().length === 0) {
        this.logger.warn("PDF berhasil dibaca namun tidak menghasilkan teks");
        return "";
      }

      // 3. Pembersihan whitespace & formatting teks
      const cleanText = rawText
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // 4. Smart Section Filtering: Temukan paragraf yang memuat rencana kerja & metodologi
      const keywords = [
        "tahap",
        "kegiatan",
        "metodologi",
        "jadwal",
        "timeline",
        "rencana kerja",
        "pelaksanaan",
        "anggaran",
        "minggu ke",
        "bulan ke",
        "action plan",
        "work plan",
        "deliverable",
        "sasaran",
        "indikator",
      ];

      const paragraphs = cleanText.split(/\n\n+/);
      const relevantParagraphs: string[] = [];
      let totalLength = 0;

      for (const p of paragraphs) {
        const lower = p.toLowerCase();
        const hasKeyword = keywords.some((kw) => lower.includes(kw));

        if (hasKeyword && p.length > 30) {
          relevantParagraphs.push(p);
          totalLength += p.length;
          if (totalLength >= maxCharacters) break;
        }
      }

      // Jika filtering kata kunci menghasilkan teks yang memadai, gunakan itu
      if (relevantParagraphs.length >= 2 && totalLength > 500) {
        this.logger.info(
          `Smart filtering berhasil: mengambil ${relevantParagraphs.length} paragraf relevan (${totalLength} karakter)`
        );
        return relevantParagraphs.join("\n\n").slice(0, maxCharacters);
      }

      // Jika tidak terdeteksi kata kunci spesifik (misal proposal gaya narasi bebas),
      // ambil potongan teks awal (yang umumnya memuat executive summary & metodologi awal)
      this.logger.info(`Menggunakan potongan teks awal proposal (${Math.min(cleanText.length, maxCharacters)} karakter)`);
      return cleanText.slice(0, maxCharacters);
    } catch (error: any) {
      this.logger.error(`Gagal mengekstrak teks PDF: ${error.message}`);
      return "";
    }
  }
}

export const pdfParserService = new PdfParserService();

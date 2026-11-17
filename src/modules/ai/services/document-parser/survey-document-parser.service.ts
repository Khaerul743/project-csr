import { AppLogger } from "@/common/logger/app-logger";
import { INDONESIA_PROVINCE_GEO, matchGeoProvinceName } from "@/components/dashboard/company/overview/indonesia-geo-coordinates";

export interface ParsedSurveyDocument {
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  characterCount: number;
  detectedProvince?: string;
  detectedFocusAreas?: string[];
  keyIssuesSummary?: string;
}

export class SurveyDocumentParserService {
  private readonly logger = new AppLogger("SurveyDocumentParserService");

  /**
   * Ekstrak teks dari Buffer berkas (PDF atau DOCX) langsung di memori (in-memory)
   */
  async parseBuffer(
    buffer: Buffer | ArrayBuffer,
    fileName: string,
    fileSize: number,
    mimeType: string,
    maxCharacters = 20000
  ): Promise<ParsedSurveyDocument> {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    let rawText = "";

    this.logger.info(`Memulai parsing in-memory berkas survei: ${fileName} (${ext}, ${fileSize} bytes)`);

    if (ext === "pdf" || mimeType.includes("pdf")) {
      rawText = await this.extractPdfText(buffer);
    } else if (ext === "docx" || ext === "doc" || mimeType.includes("word") || mimeType.includes("officedocument")) {
      rawText = await this.extractDocxText(buffer);
    } else {
      this.logger.warn(`Format berkas tidak didukung langsung: ${fileName}`);
      rawText = "";
    }

    // Pembersihan formatting & whitespace
    const cleanText = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const truncatedText = cleanText.slice(0, maxCharacters);

    // Deteksi cerdas provinsi di dalam teks survei
    const detectedProvince = this.detectProvinceFromText(truncatedText);

    // Deteksi fokus area CSR yang dominan
    const detectedFocusAreas = this.detectFocusAreas(truncatedText);

    return {
      fileName,
      fileSize,
      mimeType,
      extractedText: truncatedText,
      characterCount: truncatedText.length,
      detectedProvince,
      detectedFocusAreas,
    };
  }

  /**
   * Ekstraksi teks dari PDF menggunakan unpdf dengan fallback pdf-parse
   */
  private async extractPdfText(fileBuffer: Buffer | ArrayBuffer): Promise<string> {
    let text = "";

    // 1. Coba unpdf
    try {
      const { extractText } = await import("unpdf");
      const uint8 = new Uint8Array(fileBuffer);
      const res = await extractText(uint8);
      if (Array.isArray(res?.text)) {
        text = res.text.join("\n\n");
      } else if (typeof res?.text === "string") {
        text = res.text;
      }
    } catch (unpdfErr: any) {
      this.logger.warn(`Ekstraksi unpdf gagal: ${unpdfErr?.message}. Mencoba fallback...`);
    }

    // 2. Fallback pdf-parse
    if (!text || text.trim().length === 0) {
      try {
        const pdfModule: any = await import("pdf-parse");
        const nodeBuffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: nodeBuffer });
          const res = await parser.getText();
          text = res?.text || "";
          if (typeof parser.destroy === "function") {
            await parser.destroy();
          }
        } else if (typeof pdfModule === "function") {
          const data = await pdfModule(nodeBuffer);
          text = data?.text || "";
        } else if (typeof pdfModule.default === "function") {
          const data = await pdfModule.default(nodeBuffer);
          text = data?.text || "";
        }
      } catch (pdfParseErr: any) {
        this.logger.warn(`Fallback pdf-parse juga gagal: ${pdfParseErr?.message}`);
      }
    }

    return text || "";
  }

  /**
   * Ekstraksi teks dari Word (.docx) menggunakan mammoth
   */
  private async extractDocxText(fileBuffer: Buffer | ArrayBuffer): Promise<string> {
    try {
      const mammoth: any = await import("mammoth");
      const nodeBuffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      return result?.value || "";
    } catch (err: any) {
      this.logger.error(`Gagal mengekstrak teks DOCX dengan mammoth: ${err?.message}`);
      return "";
    }
  }

  /**
   * Temukan provinsi yang paling banyak disebut atau dicocokkan dalam teks survei
   */
  private detectProvinceFromText(text: string): string | undefined {
    if (!text) return undefined;
    const lower = text.toLowerCase();

    // Prioritas pencocokan nama provinsi
    let bestMatch: string | undefined;
    let highestFrequency = 0;
    const allProvinces = Object.values(INDONESIA_PROVINCE_GEO);

    for (const p of allProvinces) {
      const pNameLower = p.name.toLowerCase();
      // Hitung frekuensi kemunculan
      const regex = new RegExp(`\\b${pNameLower}\\b`, "gi");
      const matches = lower.match(regex);
      const count = matches ? matches.length : 0;

      if (count > highestFrequency) {
        highestFrequency = count;
        bestMatch = p.name;
      }
    }

    // Jika tidak ada kemunculan nama provinsi langsung, coba matchGeoProvinceName
    if (!bestMatch) {
      for (const p of allProvinces) {
        if (lower.includes(p.name.toLowerCase())) {
          bestMatch = matchGeoProvinceName(p.name) || undefined;
          break;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Deteksi bidang fokus CSR yang relevan berdasarkan kata kunci survei
   */
  private detectFocusAreas(text: string): string[] {
    const lower = text.toLowerCase();
    const detected: string[] = [];

    const focusKeywords: Record<string, string[]> = {
      KESEHATAN: ["stunting", "gizi", "puskesmas", "posyandu", "kesehatan", "sanitasi", "air bersih", "balita", "ibu hamil"],
      PENDIDIKAN: ["sekolah", "siswa", "beasiswa", "literasi", "guru", "kelas", "putus sekolah", "pelatihan guru"],
      LINGKUNGAN: ["sampah", "mangrove", "penghijauan", "banjir", "erosi", "hutan", "emisi", "konservasi", "pesisir"],
      PEMBERDAYAAN_EKONOMI: ["umkm", "petani", "nelayan", "koperasi", "modal usaha", "pengangguran", "vokasi", "pendapatan"],
      INFRASTRUKTUR: ["jalan desa", "jembatan", "fasilitas umum", "jaringan air", "mck", "renovasi"],
    };

    for (const [focus, keywords] of Object.entries(focusKeywords)) {
      const hasMatch = keywords.some((kw) => lower.includes(kw));
      if (hasMatch) {
        detected.push(focus);
      }
    }

    return detected.length > 0 ? detected : ["PEMBERDAYAAN_EKONOMI"];
  }
}

export const surveyDocumentParserService = new SurveyDocumentParserService();

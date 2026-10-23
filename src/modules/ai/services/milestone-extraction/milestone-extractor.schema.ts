import { z } from "zod";

export const milestoneItemSchema = z.object({
  orderIndex: z
    .number()
    .int()
    .describe("Nomor urut tahapan kegiatan, mulai dari 1, 2, 3, dan seterusnya secara kronologis"),
  title: z
    .string()
    .describe("Judul padat dan jelas untuk tahapan kegiatan (contoh: 'Tahap 1: Sosialisasi & Rembug Warga Desa')"),
  description: z
    .string()
    .describe("Uraian lengkap kegiatan operasional yang akan dilaksanakan di lapangan pada tahapan ini"),
  targetTimeline: z
    .string()
    .describe("Estimasi waktu pelaksanaan tahapan (contoh: 'Bulan ke-1', 'Bulan ke-2', atau 'Minggu 1-2')"),
  expectedEvidence: z
    .string()
    .describe("Daftar bukti fisik, dokumentasi visual, atau berkas yang wajib diunggah mitra untuk membuktikan pelaksanaan tahapan ini (contoh: 'Foto pertemuan warga, daftar hadir 50 peserta, berita acara')"),
  suggestedKpi: z
    .string()
    .describe("Indikator capaian kuantitatif terukur pada tahap ini (contoh: 'Minimal 50 warga hadir dan 100 bibit diserahkan')"),
});

export const milestoneExtractionSchema = z.object({
  summaryRationale: z
    .string()
    .describe("Penjelasan ringkas mengapa tahapan-tahapan ini disusun berdasarkan rencana kerja di proposal"),
  stages: z
    .array(milestoneItemSchema)
    .min(2)
    .max(6)
    .describe("Daftar 2 hingga 6 tahapan kegiatan berurutan yang mencakup siklus program dari persiapan hingga evaluasi"),
});

export type MilestoneItemOutput = z.infer<typeof milestoneItemSchema>;
export type MilestoneExtractionResult = z.infer<typeof milestoneExtractionSchema>;

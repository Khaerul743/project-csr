# AI Service: Program Impact Prediction & Key Success Indicators Advisor

Dokumentasi arsitektur, parameter data LLM, prompt engineering, skema output terstruktur, mekanisme fallback deterministik, endpoint REST API, serta integrasi antarmuka untuk fitur **Prediksi Potensi Dampak Program (AI Impact Prediction)** pada fase pengesahan kesepakatan kerja sama CSR (*MoU Sign-off*).

---

## 1. Latar Belakang & Tujuan

Mengacu pada spesifikasi kebutuhan sistem (SRS):
> *"Memperkirakan potensi hasil dan dampak program berdasarkan tujuan, kondisi wilayah, target penerima manfaat, serta indikator keberhasilan sebagai pertimbangan sebelum persetujuan akhir."*

Pada alur kemitraan CSR, proposal yang telah disetujui (`ACCEPTED`) memasuki tahap negosiasi kolaborasi untuk menyepakati komitmen pagu anggaran, rentang waktu pelaksanaan, target penerima manfaat, dan dokumen MoU resmi. Sebelum pimpinan eksekutif atau admin CSR perusahaan menekan tombol **"Sahkan & Sepakati MoU"** (yang secara otomatis menginisiasi entri `programs` di database), manajemen membutuhkan pertimbangan evaluatif berbasis data mengenai:
1. **Rasionalitas Anggaran & Target Wilayah:** Apakah pagu yang disepakati sepadan dengan target penerima manfaat dan kondisi geografis di kabupaten/kota sasaran?
2. **Estimasi Capaian Terukur (*Direct Outputs*):** Berapa perkiraan hasil fisik langsung yang dapat dicapai (jumlah KK terlayani, sarana fisik terbangun, dsb)?
3. **Rekomendasi Indikator Keberhasilan (*Key Success Indicators* / KPI):** Merumuskan 2–3 KPI konkret lengkap dengan target kuantitatif dan metode verifikasi lapangan untuk dimasukkan ke klausul MoU atau acuan monitoring berkala.
4. **Antisipasi Risiko Lapangan:** Mendeteksi kendala geografis, cuaca, atau koordinasi lokal di wilayah sasaran agar langkah mitigasi dapat disepakati sejak awal.

---

## 2. Arsitektur Modul

```text
src/modules/ai/services/impact-prediction/
├── impact-prediction.schema.ts    # Zod schema untuk validasi structured output LLM
├── impact-prediction.prompt.ts    # Prompt template dengan fokus ringkas, tajam, & anti-slop
├── impact-prediction.service.ts   # Integrasi LangChain ChatOpenAI (gpt-4o-mini) + heuristic fallback
└── index.ts

src/modules/collaborations/
├── collaboration.interface.ts     # Interface CollaborationWithDetails (termasuk kolom impact prediction)
├── collaboration.repository.ts    # saveImpactPrediction() & query context wilayah
├── collaboration.service.ts       # predictImpact() + agregasi konteks proposal & inisiatif
└── collaboration.controller.ts    # predictImpact() dengan AuthGuard ["MANAGEMENT", "CSR_ADMIN"]

app/api/collaborations/[id]/impact-prediction/
└── route.ts                       # Next.js 16 dynamic route handler POST dengan connection()

src/components/dashboard/company/
└── CollaborationDetailModal.tsx   # Panel UI minimalis AI Impact Prediction dengan aksi 1-klik salin KPI
```

---

## 3. Scope Data yang Disuplai ke LLM

Layanan `ImpactPredictionService` menerima konteks masukan komprehensif dari database:

1. **Parameter Kesepakatan Final (`collaborations`):**
   - `finalBudget`: Nilai komitmen anggaran yang disepakati (fallback ke `proposedBudget` proposal).
   - `targetBeneficiaries`: Kelompok sasaran warga penerima manfaat langsung.
   - `startDate` & `endDate`: Rentang waktu resmi dan estimasi durasi bulan pelaksanaan.
2. **Konteks Inisiatif CSR Perusahaan (`opportunities`):**
   - `opportunityTitle`: Judul inisiatif CSR yang dibuka perusahaan.
   - `focusArea`: Bidang fokus (Kesehatan, Pendidikan, Lingkungan, UMKM, Infrastruktur Sosial, dsb).
   - `targetCity` & `targetProvince`: Lokasi kabupaten/kota dan provinsi sasaran program.
   - `opportunityDescription`: Sasaran dan objektif inisiatif sponsor.
3. **Profil Usulan Mitra Pelaksana (`proposals`, `partners`):**
   - `proposalTitle`: Judul program yang diajukan mitra.
   - `partnerName`: Nama lembaga/yayasan pelaksana.
   - `methodologySummary`: Ringkasan narasi teknis dan rencana tahapan kerja (*milestones*).
4. **Konteks Program di Wilayah Sasaran (`programs`):**
   - `existingProgramsCountInRegion`: Jumlah program CSR yang pernah tercatat di kabupaten/kota tersebut.
   - `existingProgramsInSectorCount`: Jumlah program CSR pada sektor yang sama di wilayah tersebut (mencegah intervensi jenuh/tumpang tindih).

---

## 4. Skema Output Terstruktur (Zod Schema)

Mengusung prinsip antarmuka *clean* dan *anti-slop*, struktur data dirancang ringkas dengan hierarki visual tinggi tanpa dinding teks panjang:

```typescript
export interface ImpactPredictionResult {
  overallImpactScore: number; // 0 - 100
  impactLevel: "TINGGI" | "MODERAT" | "TERBATAS";
  impactLevelLabel: string; // misal: "Dampak Signifikan"
  executiveSummary: string; // Maksimal 1-2 kalimat tajam dan padat
  
  // 1. Output Langsung (2-3 Metrik Mini)
  projectedOutputs: {
    metric: string; // misal: "Penerima Manfaat Langsung"
    estimate: string; // misal: "250 KK (±1.000 Jiwa)"
    unit: string;
  }[];

  // 2. Proyeksi Dampak Jangka Menengah (2-3 Poin Ringkas)
  projectedOutcomes: {
    aspect: "SOSIAL" | "EKONOMI" | "LINGKUNGAN";
    highlight: string;
  }[];

  // 3. Indikator Keberhasilan Terukur (2-3 Target KPI MoU)
  keySuccessIndicators: {
    indicator: string; // Nama indikator
    target: string; // Target capaian konkret
    verification: string; // Bukti verifikasi lapangan
  }[];

  // 4. Tantangan Wilayah (1 Catatan Ringkas)
  regionalRisks: {
    risk: string;
    mitigation: string;
  }[];

  // 5. Rekomendasi Persetujuan Akhir
  recommendation: "READY_TO_SIGN" | "NEED_CONDITIONS" | "RECONSIDER";
  recommendationLabel: string;
  recommendationNotes: string;
}
```

---

## 5. Mekanisme Fallback Deterministik

Jika kunci `OPENAI_API_KEY` tidak tersedia, kuota habis, atau pemanggilan LLM mengalami kendala jaringan/timeout:
- Sistem secara otomatis mengalihkan proses ke `generateHeuristicPrediction`.
- Menghitung skor estimasi dampak berbasis kelengkapan data kesepakatan, rasio pagu anggaran terhadap target sasaran, dan jumlah tahapan milestone.
- Menghasilkan ringkasan eksekutif, metrik capaian langsung, KPI standar terukur, dan catatan wilayah yang realistis tanpa menyebabkan kegagalan sistem (*zero downtime*).
- Respons ditandai dengan metadata `source: "HEURISTIC_FALLBACK"`.

---

## 6. Kontrak REST API

### Jalankan Prediksi Potensi Dampak
Menjalankan simulasi prediksi dampak untuk kesepakatan kolaborasi tertentu dan menyimpan hasilnya ke database.

- **Method / Path:** `POST /api/collaborations/:id/impact-prediction`
- **Auth Guard:** Bearer Token JWT (`MANAGEMENT` | `CSR_ADMIN`)
- **Headers:** `Authorization: Bearer <token>`

#### Contoh Response Berhasil (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Prediksi potensi dampak program berhasil dijalankan",
  "data": {
    "overallImpactScore": 86,
    "impactLevel": "TINGGI",
    "impactLevelLabel": "Dampak Signifikan",
    "executiveSummary": "Program memiliki efisiensi pagu yang kuat untuk memberdayakan 150 KK petani lokal di Karawang melalui transfer keahlian pertanian terpadu.",
    "projectedOutputs": [
      {
        "metric": "Penerima Manfaat Langsung",
        "estimate": "150 Kepala Keluarga",
        "unit": "KK"
      },
      {
        "metric": "Cakupan Intervensi Lapangan",
        "estimate": "100% target wilayah Kab. Karawang",
        "unit": "Wilayah"
      },
      {
        "metric": "Efisiensi Pagu Dana",
        "estimate": "Rp 75.000.000",
        "unit": "Total Budget"
      }
    ],
    "projectedOutcomes": [
      {
        "aspect": "EKONOMI",
        "highlight": "Peningkatan pendapatan petani lokal melalui hilirisasi dan akses pasar mandiri."
      },
      {
        "aspect": "SOSIAL",
        "highlight": "Terbentuknya kelompok tani mandiri yang aktif membina regenerasi petani muda."
      }
    ],
    "keySuccessIndicators": [
      {
        "indicator": "Tingkat Partisipasi & Kehadiran Sasaran",
        "target": "Minimal 85% dari total sasaran",
        "verification": "Daftar hadir fisik dan berita acara serah terima"
      },
      {
        "indicator": "Penyelesaian Tahapan Milestone",
        "target": "100% tahapan terselesaikan sesuai linimasa",
        "verification": "Laporan progres berkala mitra dan bukti pengeluaran"
      },
      {
        "indicator": "Tingkat Kepuasan Warga",
        "target": "Rata-rata rating kepuasan minimal 4.0/5.0 bintang",
        "verification": "Survei ulasan publik masyarakat berbasis QR Code"
      }
    ],
    "regionalRisks": [
      {
        "risk": "Kendala distribusi bibit dan logistik saat puncak musim hujan di wilayah perbukitan.",
        "mitigation": "Penjadwalan pengiriman logistik pada minggu pertama sebelum curah hujan ekstrem."
      }
    ],
    "recommendation": "READY_TO_SIGN",
    "recommendationLabel": "Siap Disahkan",
    "recommendationNotes": "Parameter kesepakatan rasional dan terstruktur. Disarankan menyertakan 3 indikator KPI di atas ke dalam klausul monitoring MoU.",
    "source": "AI_OPENAI",
    "predictedAt": "2026-11-13T10:55:00.000Z"
  }
}
```

---

## 7. Desain Antarmuka Pengguna (`CollaborationDetailModal.tsx`)

Komponen antarmuka dirancang dengan tata letak minimalis dan fungsional:

1. **Badge Skor Ringkas:** Menampilkan pill skor (misal: `Skor: 86/100 • Dampak Signifikan`) pada header kartu.
2. **Tombol Simulasi Responsif:** Tombol *"Simulasikan Dampak AI"* dengan indikator loading saat analisis berjalan dan tombol *"Simulasi Ulang"* untuk memperbarui hasil jika klausul anggaran/target diubah.
3. **Executive Summary Padat:** 1–2 kalimat dalam kotak netral abu-abu tipis tanpa memakan ruang visual.
4. **Grid 3 Kartu Mini Metrik:** Menampilkan ringkasan output terpenting dalam 3 kotak seimbang.
5. **Daftar Indikator Keberhasilan (KPI):** Menampilkan nama indikator dan target capaian.
6. **Aksi 1-Klik "Terapkan ke Catatan MoU":** Tombol praktis yang otomatis memformat dan menyalin 3 indikator KPI rekomendasi AI langsung ke dalam textarea catatan kesepakatan MoU tanpa perlu mengetik manual.
7. **Single-line Banner Risiko Wilayah:** Kotak amber 1 baris yang menonjolkan risiko geografis dan solusinya secara jelas.
8. **Proteksi Pasca Pengesahan:** Saat status kolaborasi telah disahkan (`AGREED`), panel beralih ke mode tampilan baca (*read-only*) untuk mengunci catatan audit.


# AI Service: Regional Need Prioritization & Overlap Detection

Dokumentasi arsitektur, scope data LLM, prompt engineering, skema output terstruktur, fallback heuristik, serta endpoint REST API untuk fitur **AI Need Prioritization** pada saat perusahaan merencanakan peluang CSR (`OpportunityFormPageView`).

---

## 1. Latar Belakang & Tujuan

Perusahaan sering kali kesulitan menyelaraskan prioritas inisiatif CSR baru dengan kondisi riil di lapangan karena tidak memiliki gambaran program CSR apa saja yang sudah berjalan di suatu kabupaten/kota. Tanpa informasi tersebut, perusahaan rentan membuat program yang tumpang tindih (*over-served*) sementara kebutuhan masyarakat di sektor lain belum tersentuh (*underserved*).

Fitur **AI Need Prioritization** berfungsi untuk:
1. **Memetakan Kepadatan Sektor & Risiko Tumpang Tindih (*Overlap Check*):** Mengukur apakah `focusArea` yang dipilih perusahaan sudah ramai digarap di kota/provinsi sasaran atau masih sepi inisiatif.
2. **Menganalisis Suara Warga & Kesiapan Ekosistem:** Membaca testimoni/sentimen penerima manfaat (`program_reviews`), jejak lokasi kegiatan (`program_activities`), dan ketersediaan NGO lokal aktif/terverifikasi (`partners`).
3. **Menyusun Top 3 Prioritas Kebutuhan Wilayah:** Menghasilkan peringkat kebutuhan lengkap dengan rasional, rekomendasi intervensi pembeda, sasaran warga, dan pemetaan SDGs (1-17).
4. **Penyelarasan Form 1-Klik (*Human-in-the-Loop*):** Memberikan tombol terapkan ke form peluang CSR (bidang fokus, SDGs, serta draf deskripsi) dengan keputusan akhir tetap di tangan pengguna.

---

## 2. Arsitektur Modul

```text
src/modules/ai/services/need-prioritization/
├── need-prioritization.schema.ts    # Zod schema untuk structured output LLM
├── need-prioritization.prompt.ts    # Prompt template dengan aturan anti-halusinasi & privasi
├── need-prioritization.service.ts   # ChatOpenAI (gpt-4o-mini) + heuristic fallback berbasis DB
└── index.ts

src/modules/opportunities/
├── opportunity.repository.ts        # getTerritoryDataForPrioritization()
├── opportunity.service.ts           # analyzeNeedPrioritization() + cek feature flag
├── opportunity.validation.ts        # needPrioritizationRequestSchema
└── opportunity.controller.ts        # AuthGuard ["MANAGEMENT", "CSR_ADMIN"]

app/api/opportunities/need-prioritization/route.ts
src/components/dashboard/company/opportunities/AiNeedPrioritizationPanel.tsx
```

---

## 3. Scope Data yang Disuplai ke LLM

`OpportunityRepository.getTerritoryDataForPrioritization` mengumpulkan `TerritoryDataSnapshot` dari MySQL:

1. **Profil & Histori Perusahaan Pemohon (`companies`, `programs`, `opportunities`):**
   `industry`, `csrVision`, jumlah program/peluang milik perusahaan sendiri, dan bidang fokus dominan perusahaan.
2. **Peta Program Wilayah Lintas Ekosistem Secara Anonim (`programs`):**
   Agregasi program pada provinsi/kota sasaran (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`) dikelompokkan per `focusArea`, beserta tema umum dan kelompok penerima manfaat. Nama perusahaan lain dan nominal anggaran privat tidak pernah dibagikan.
3. **Peluang CSR Terbuka Wilayah (`opportunities`):**
   Daftar peluang berstatus `OPEN` atau `IN_REVIEW` di kota/provinsi yang sama (mengecualikan peluang yang sedang diedit bila mode edit).
4. **Suara Masyarakat & Lokasi Kegiatan (`program_reviews`, `program_activities`):**
   Rata-rata rating, jumlah ulasan negatif vs positif, hingga 10 sampel komentar warga (diutamakan ulasan kritis/rating rendah agar celah layanan terlihat), serta daftar lokasi kegiatan yang pernah tersentuh.
5. **Kesiapan Mitra Pelaksana Lokal (`partners`):**
   Jumlah NGO berstatus `ACTIVE` dan `isVerified` per sektor di kota/provinsi sasaran.
6. **Input Formulir & Catatan Lapangan Perusahaan:**
   `targetProvince`, `targetCity`, `focusArea`, `title`, `estimatedBudget`, `description`, serta input opsional `fieldContextNotes` (*Catatan Kondisi / Survei Awal Lapangan*).

---

## 4. Penanganan Cold Start & Privasi

- **Indikator Cakupan Data (`dataCoverage`):**
  - `RICH_DATA`: terdapat histori program kota >= 2, atau ulasan >= 3, atau program provinsi >= 3 disertai mitra aktif.
  - `LIMITED_DATA`: terdapat sebagian data program, peluang, atau mitra di provinsi.
  - `COLD_START`: belum ada riwayat program, peluang terbuka, maupun ulasan warga di wilayah sasaran. Pada kondisi ini, UI menampilkan banner peringatan transparan agar perusahaan memverifikasi konteks makro melalui asesmen lapangan.
- **Fallback Heuristik (`HEURISTIC_FALLBACK`):**
  Jika `OPENAI_API_KEY` belum terkonfigurasi atau pemanggilan LLM gagal, `NeedPrioritizationService` menghitung kepadatan sektor langsung dari data MySQL untuk menghasilkan skor risiko overlap, peringkat prioritas berbasis celah sektor + kata kunci catatan lapangan, serta draf deskripsi siap pakai.
- **Feature Flag:**
  Dikontrol oleh `ENABLE_AI_FEATURES` (backend) dan `NEXT_PUBLIC_ENABLE_AI` (frontend) via [`isAiFeatureEnabled`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/common/config/ai-feature-flag.ts). Endpoint mengembalikan `403 Forbidden` jika AI dinonaktifkan.

---

## 5. Kontrak API

- **Endpoint:** `POST /api/opportunities/need-prioritization`
- **Role:** `MANAGEMENT`, `CSR_ADMIN`
- **Dokumentasi Request/Response lengkap:** Lihat bagian `6.10` pada [`api-documentation.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/api-documentation.md).

import { ChatPromptTemplate } from "@langchain/core/prompts";

export const esgReportSystemPrompt = `
Anda adalah seorang **Senior Corporate Sustainability & ESG Specialist** kelas dunia dengan pengalaman mendalam dalam pelaporan keberlanjutan berbasis **GRI Standards (Global Reporting Initiative)**, **POJK 51/POJK.03/2017 (Penerapan Keuangan Berkelanjutan)**, dan kerangka **UN Sustainable Development Goals (SDGs)**.

Tugas Anda adalah menganalisis data riil pelaksanaan program Corporate Social Responsibility (CSR) dari platform **Sipena** dan menyusun **Laporan Keberlanjutan & Dampak ESG (Executive Sustainability Report)** resmi yang komprehensif, inspiratif, dan akuntabel.

### Prinsip Penyusunan Laporan:
1. **Berbasis Bukti Riil (*Evidence-Based*)**: Gunakan data aktivitas lapangan, jumlah penerima manfaat, serapan anggaran keuangan, dan testimoni masyarakat yang diberikan.
2. **Narasi Berkelas Korporat**: Gunakan Bahasa Indonesia formal, elegan, optimis, dan persuasif yang cocok untuk laporan tahunan (*Annual Sustainability Report*) kepada Dewan Direksi, Pemegang Saham, dan Regulator.
3. **Penyelarasan 3 Pilar ESG**:
   - **Environment (E)**: Soroti konservasi alam, pengurangan emisi/limbah, efisiensi energi, atau pelestarian lingkungan bila relevan.
   - **Social (S)**: Soroti peningkatan kualitas hidup, pemberdayaan ekonomi komunitas lokal, kesetaraan akses, dan dampak kemanusiaan.
   - **Governance (G)**: Tekankan transparansi realisasi anggaran belanja, kepatuhan pelaporan kuitansi/nota, serta kolaborasi multipihak yang beretika.
4. **Penyelarasan SDG**: Tentukan 1 target SDG utama (Goal 1-17) beserta argumen kontribusi yang kuat, serta 1-3 SDG sekunder yang turut terdorong.
5. **Kisah Dampak Nyata (*Human Interest*)**: Buat narasi inspiratif yang menyoroti perubahan hidup warga penerima manfaat sebelum vs sesudah intervensi program.
6. **Objektivitas & Pembelajaran**: Cantumkan tantangan nyata di lapangan dan rekomendasi strategis perbaikan untuk keberlanjutan di masa mendatang.
`.trim();

export const esgReportUserPrompt = `
Berikut adalah data riil pelaksanaan program CSR yang perlu Anda analisis dan susun laporannya:

### 1. PROFIL INISIATIF & PROGRAM CSR
- **Judul Program**: {programTitle}
- **Fokus Area CSR**: {focusArea}
- **Lokasi Pelaksanaan**: {location}
- **Periode Pelaksanaan**: {timeline}
- **Status Program**: {status}
- **Deskripsi Program**:
{description}

### 2. PROFIL PERUSAHAAN SPONSOR & MITRA PELAKSANA
- **Perusahaan Sponsor**: {companyName} ({companyIndustry})
- **Mitra Pelaksana (NGO/Yayasan)**: {partnerName}

### 3. AKUNTABILITAS ANGGARAN & REALISASI KEUANGAN
- **Komitmen Anggaran (Total Budget)**: {budget}
- **Realisasi Belanja Lapangan Terverifikasi**: {spentBudget} ({absorptionRate})
- **Jumlah Transaksi Belanja Terverifikasi**: {verifiedExpensesCount} pengeluaran kuitansi valid

### 4. CAPAIAN PENERIMA MANFAAT & TAHAPAN KERJA
- **Target Penerima Manfaat**: {targetBeneficiaries}
- **Realisasi Jiwa Penerima Manfaat Riil**: {actualBeneficiaries}
- **Tahapan Kerja / Milestones**:
{stagesSummary}

### 5. DOKUMENTASI AKTIVITAS LAPANGAN TERVERIFIKASI
{activitiesSummary}

### 6. SUARA MASYARAKAT / ULASAN PENERIMA MANFAAT
- **Rata-rata Rating Kepuasan**: {satisfactionRating}
- **Total Ulasan Warga**: {reviewsCount} ulasan
- **Kutipan Ulasan Lapangan**:
{reviewsExcerpts}

Susunlah Laporan Keberlanjutan & Dampak ESG lengkap dalam format data terstruktur sesuai skema JSON yang ditentukan.
`.trim();

export const esgReportPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", esgReportSystemPrompt],
  ["human", esgReportUserPrompt],
]);

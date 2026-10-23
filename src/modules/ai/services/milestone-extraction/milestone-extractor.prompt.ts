import { ChatPromptTemplate } from "@langchain/core/prompts";

export const milestoneExtractionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Anda adalah seorang Senior CSR Project Monitoring & Evaluation Specialist.
Tugas utama Anda adalah menganalisis dokumen dan ringkasan proposal kegiatan CSR dari mitra/NGO pelaksana, lalu menyusunnya menjadi rencana tahapan kegiatan lapangan (Milestones) yang terstruktur, kronologis, dan dapat diverifikasi secara visual melalui foto/dokumen lapangan.

Panduan Penyusunan Tahapan Kegiatan:
1. Susun sebanyak 3 hingga 5 tahapan berurutan yang mencakup siklus program dari awal hingga akhir:
   - Tahap Awal: Sosialisasi, koordinasi aparat/tokoh lokal, asesmen kebutuhan, atau pembentukan kelompok sasaran.
   - Tahap Inti: Pelatihan, pengadaan alat/bibit, konstruksi/penanaman, atau aksi lapangan utama.
   - Tahap Lanjutan: Pendampingan berkala, uji coba fungsi, atau distribusi hasil.
   - Tahap Akhir: Monitoring kelangsungan program, evaluasi dampak, serah terima, dan pelaporan akhir.
2. Setiap tahapan WAJIB memiliki 'expectedEvidence' yang konkret dan realistis (contoh: 'Foto pertemuan warga, daftar absensi peserta, berita acara serah terima alat (BAST)').
3. Estimasi waktu ('targetTimeline') harus disesuaikan dengan total durasi pelaksanaan program (contoh: 'Bulan ke-1', 'Bulan ke-2 - Minggu ke-3').
4. Gunakan Bahasa Indonesia baku, jelas, dan profesional.
5. Dasarkan tahapan sepenuhnya pada metodologi proposal dan petikan dokumen yang diberikan. Hindari menambahkan kegiatan yang tidak ada sangkut pautnya dengan proposal mitra.`
  ],
  [
    "human",
    `Berikut data proposal inisiatif CSR mitra:
- Judul Proposal: {title}
- Bidang Fokus CSR: {focusArea}
- Durasi Pelaksanaan: {durationMonths} Bulan
- Target Penerima Manfaat: {targetBeneficiaries}
- Anggaran Program Disepakati: {budget}

--- Ringkasan Teknis & Metodologi Pelaksanaan: ---
{summary}

--- Petikan Dokumen Proposal (PDF): ---
{pdfExcerpts}

Berdasarkan informasi di atas, silakan analisis dan susun tahapan rencana kerja kegiatan lapangan yang terstruktur.`
  ]
]);

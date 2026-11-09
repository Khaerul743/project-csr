import { ChatPromptTemplate } from "@langchain/core/prompts";

/**
 * Prompt Template untuk AI Proposal Optimizer & Reviewer bagi Mitra CSR.
 * Membantu mitra menyempurnakan proposal baru atau merevisi proposal berdasarkan catatan perusahaan.
 */
export const proposalOptimizationPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Anda adalah Konsultan Senior Proposal CSR dan Grant Writing Advisor terkemuka di Indonesia.
Tugas Anda adalah mendampingi lembaga mitra pelaksana (NGO / Yayasan / Komunitas) dalam menyempurnakan proposal kemitraan CSR mereka agar memiliki daya saing tinggi, rasionalitas operasional yang kokoh, dan peluang persetujuan (win-rate) optimal dari perusahaan sponsor.

Pedoman Evaluasi & Optimasi:
1. Keselarasan Strategis (Strategic Alignment):
   - Apakah metodologi yang diajukan mitra benar-benar menjawab kebutuhan yang dicari perusahaan dalam inisiatif CSR?
   - Apakah solusi mitra relevan dengan pilar fokus (Pendidikan, Lingkungan, Kesehatan, UMKM, dll.)?

2. Analisis Feedback Perusahaan (Prioritas Utama jika ada):
   - Jika terdapat catatan umpan balik / permintaan revisi dari perusahaan, telaah secara kritis poin keberatan mereka.
   - Berikan arahan konkret dan draf perbaikan yang secara eksplisit menjawab kekhawatiran reviewer perusahaan.

3. Rasionalitas Anggaran (Budget Feasibility):
   - Bandingkan proposed budget dengan plafon estimasi anggaran perusahaan.
   - Jika proposed budget melebihi plafon, berikan rekomendasi penyesuaian atau efisiensi pos biaya.

4. Draf Teks Ringkasan Metodologi yang Disempurnakan (suggestedSummaryDraft):
   - Tuliskan ulang teks ringkasan proposal mitra menjadi narasi yang terstruktur rapi:
     * Latar Belakang & Urgensi Masalah Lapangan
     * Solusi Teknis & Metodologi Kerja Konkret
     * Target Capaian & Dampak Terukur bagi Masyarakat
     * Keberlanjutan Program (Sustainability)
   - Gunakan bahasa Indonesia profesional korporat, lugas, persuasif, dan bebas jargon klise.

5. Objektif & Konstruktif:
   - Berikan penilaian yang adil. Berikan skor kesiapan (0-100) yang realistis untuk memandu mitra.
   - Sediakan checklist kesiapan sebelum mitra mengirimkan draf ke perusahaan.

Kembalikan HANYA format JSON terstruktur sesuai skema yang telah ditentukan.`,
  ],
  [
    "human",
    `Berikut adalah data inisiatif CSR perusahaan dan draf proposal mitra yang perlu Anda evaluasi dan optimalkan:

=== INFORMASI INISIATIF CSR PERUSAHAAN (OPPORTUNITY) ===
- Judul Inisiatif: {opportunityTitle}
- Bidang Fokus CSR: {opportunityFocusArea}
- Estimasi Plafon Anggaran: {opportunityEstimatedBudget}
- Wilayah Sasaran: {opportunityLocation}
- Target Penerima Manfaat: {opportunityTargetBeneficiaries}
- Deskripsi Kebutuhan: {opportunityDescription}

=== PROFIL MITRA PELAKSANA ===
- Nama Lembaga: {partnerName}
- Bidang Keahlian: {partnerFocusArea}
- Kota Domisili: {partnerCity}

=== CATATAN EVALUASI / FEEDBACK DARI PERUSAHAAN ===
{companyFeedbackSection}

=== DRAF PROPOSAL MITRA YANG DIAJUKAN ===
- Judul Proposal: {proposalTitle}
- Rencana Anggaran (RAB): {proposedBudget}
- Durasi Pelaksanaan: {durationMonths} Bulan
- Target Penerima Manfaat Mitra: {proposalTargetBeneficiaries}
- Ringkasan Teknis & Metodologi Saat Ini:
"{proposalSummary}"

=== PETIKAN DOKUMEN PROPOSAL TERLAMPIR (PDF) ===
{pdfExcerpts}

Instruksi Khusus:
Lakukan analisis mendalam terhadap keselarasan proposal terhadap inisiatif perusahaan. Jika terdapat catatan evaluasi dari perusahaan, fokuskan rekomendasi pada penyelesaian catatan tersebut. Hasilkan draf ringkasan yang disempurnakan serta checklist tindakan nyata bagi mitra.`,
  ],
]);


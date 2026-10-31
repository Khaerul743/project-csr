# Struktur Folder Proyek - Project CSR

Dokumentasi ringkas mengenai pembagian dan fungsi utama setiap folder dalam proyek **CSR Impact Hub**.

---

## 1. Ikhtisar Struktur Utama

```text
project-csr/
├── app/                  # Routing Next.js (Halaman antarmuka & endpoint API)
├── docs/                 # Dokumentasi teknis proyek
├── drizzle/              # File riwayat migrasi SQL database
├── public/               # Aset statis (gambar, icon, svg)
└── src/                  # Sumber kode utama aplikasi
    ├── common/           # Utilitas & fungsi bersama lintas modul
    ├── components/       # Komponen antarmuka React
    ├── db/               # Skema tabel database & koneksi Drizzle ORM
    └── modules/          # Modul fitur bisnis (Controller, Service, Repository)
```

---

## 2. Penjelasan Fungsi Setiap Folder

### 📁 `app/`
Folder routing bawaan Next.js App Router:
- **`app/api/`**: Berisi seluruh endpoint backend (Route Handlers) yang menghubungkan request HTTP ke controller modul terkait.
- **`app/(halaman)/`**: Berisi halaman frontend aplikasi, seperti `app/login/`, `app/register/`, `app/dashboard/`, dan `app/page.tsx` (landing page).
- **`globals.css` & `layout.tsx`**: Pengaturan layout dasar, font, dan konfigurasi tema Tailwind CSS.

### 📁 `docs/`
Pusat dokumentasi lengkap proyek untuk pengembang & AI:
- **[INDEX.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/INDEX.md)**: Gerbang utama dokumentasi, peta navigasi, dan aturan utama bagi AI/developer.
- **[system-architecture.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/system-architecture.md)**: Arsitektur 3-Tier, multi-tenancy, RBAC, dan sub-sistem AI.
- **[database-schema.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/database-schema.md)**: Skema 16+ tabel MySQL, ERD Mermaid, master enum, dan konvensi Drizzle.
- **[business-workflows.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/business-workflows.md)**: Siklus hidup bisnis, alur transisi status, MoU, realisasi termin & QR survei publik.
- **[developer-guide.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/developer-guide.md)**: Panduan praktis penambahan modul baru, langkah Drizzle, dan tips pencegahan bug.
- **[design-system.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/design-system.md)**: Panduan palet warna (Emerald & Slate Navy), tipografi, dan komponen UI.
- **[api-documentation.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/api-documentation.md)**: Dokumentasi kontrak lengkap seluruh endpoint REST API.
- **[ai-service-milestone-extraction.md](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/ai-service-milestone-extraction.md)**: Dokumentasi teknis ekstraksi milestone otomatis dari proposal PDF via LangChain.
- **[postman_collection.json](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/postman_collection.json)**: Koleksi Postman siap pakai untuk pengujian API.

### 📁 `drizzle/`
Menyimpan riwayat file migrasi SQL otomatis yang di-generate oleh Drizzle Kit saat ada perubahan skema tabel di database.

### 📁 `public/`
Aset publik yang dapat diakses langsung oleh browser tanpa kompilasi (misalnya logo, favicon, dan ilustrasi).

---

## 3. Pembagian Folder di Dalam `src/`

Folder `src/` merupakan inti dari kode aplikasi dan dibagi menjadi 4 bagian:

### 📁 `src/common/`
Kumpulan kode utilitas yang digunakan bersama oleh berbagai modul (*cross-cutting concerns*):
- **`errors/`**: Definisi error khusus aplikasi (`AppError`, `UnauthorizedError`, `ConflictError`, dll).
- **`guards/`**: Otentikasi token JWT dan pengecekan role pengguna (RBAC).
- **`jwt/`**: Fungsi pembuatan (*sign*) dan verifikasi token JWT.
- **`logger/`**: Sistem pencatatan log aktivitas dan error server.
- **`utils/`**: Helper pembungkus response (`ApiResponse`), penanganan error global (`ErrorHandler`), dan enkripsi password (`PasswordUtil`).

### 📁 `src/components/`
- **`ui/`**: Komponen dasar yang berdiri sendiri dan dapat dipakai ulang di halaman manapun (*reusable primitives* seperti `AppLogo`, `Button`, `Input`, `Textarea`, `Modal`, `Card`, `Badge`).
- **`auth/`**: Komponen khusus alur autentikasi (seperti `AuthLayout`, `LoginForm`, `RegisterForm`).
- **`dashboard/`**: Komponen antarmuka dashboard:
  - `Navbar`, `Sidebar`, `DashboardHeader`, `RoleDashboardView`
  - `staging/`: Alur onboarding staging organisasi
  - `company/`: Workspace dashboard perusahaan (`CompanyDashboardView`, `CreateOpportunityModal`, `EditOpportunityModal`, `InvitePartnerModal`, `OpportunityDetailModal`, `ReviewProposalModal`, `CollaborationDetailModal`, `ProgramDetailModal`)
    - `profile/`: Profil Perusahaan ala LinkedIn & Komitmen ESG (`CompanyFullProfileView`, `EditCompanyProfileModal`)
  - `partner/`: Workspace dashboard mitra (`PartnerDashboardView`, `PartnerSidebar`, `SubmitProposalModal`, `ProposalDetailModal`, `PartnerOpportunityDetailModal`, `PartnerCollaborationDetailModal`, `PartnerProgramDetailModal`)
    - `profile/`: Profil Lembaga ala LinkedIn & Pengisian Portofolio (`PartnerFullProfileView`, `EditPartnerProfileModal`)
  - `analytics/`: Modul visualisasi analitik ESG & pelaporan dampak (`EsgAnalyticsView`, `helpers.ts`, `types.ts`) dengan export CSV dan mode cetak resmi
  - `activities/`: Modul Linimasa Aktivitas & Bukti Lapangan (`ActivityTimeline`, `AddActivityModal`, `VerifyActivityModal`, `PhotoLightboxModal`, `AiMilestonesModal`, `types.ts`)
  - `finances/`: Modul Realisasi Dana Bertahap & Akuntabilitas Pengeluaran (`ProgramFinancesTab`, `DisburseFundModal`, `ConfirmDisbursementModal`, `AddExpenseModal`, `VerifyExpenseModal`, `types.ts`)
  - `conversations/`: Modul Percakapan & Negosiasi Kemitraan (`ConversationCenterView`, `ConversationList`, `ChatWindow`, `types.ts`)
  - `reviews/`: Modul Survei & Ulasan Kepuasan Masyarakat (`BeneficiaryReviewsTab`, `ShareReviewModal`)
- **`public-review/`**: Halaman publik survei lapangan tanpa autentikasi login (`BeneficiaryReviewView.tsx`)

### 📁 `src/db/`
Pengelolaan basis data menggunakan Drizzle ORM:
- **`schema/`**: Definisi skema tabel MySQL secara type-safe (`users.ts`, `companies.ts`, `partners.ts`, `invitations.ts`, `opportunities.ts`, `opportunity-invitations.ts`, `proposals.ts`, `collaborations.ts`, `collaboration-messages.ts`, `programs.ts`, `program-stages.ts`, `program-activities.ts`, `program-reviews.ts`, `program-disbursements.ts`, `program-expenses.ts`, `csr-focus-areas.ts`).
- **`index.ts`**: Inisialisasi koneksi pool MySQL dan instance client Drizzle.

### 📁 `src/modules/`
Modul fitur bisnis aplikasi yang memisahkan tanggung jawab kode ke dalam 3 lapisan (*3-Tier Pattern*), meliputi modul `auth/`, `companies/`, `partners/`, `invitations/`, `opportunities/`, `proposals/`, `collaborations/`, `conversations/`, `programs/`, `activities/`, `reviews/`, `finances/`, serta modul kecerdasan buatan `ai/`:
- **`ai/`**: Modul integrasi Generative AI (LangChain + OpenAI GPT-4o-mini & PDF Document Parser) yang terbagi menjadi sub-layanan fungsional (`config/`, `services/document-parser/`, `services/milestone-extraction/`).
- **`Controller`**: Menerima request HTTP, memvalidasi guard autentikasi/RBAC, dan memanggil service.
- **`Service`**: Tempat logika bisnis utama dijalankan (misal: onboarding organisasi, undangan tim, promosi role, hashing password, review proposal, inisiasi kolaborasi, finalisasi MoU & pembuatan program otomatis, dekonstruksi proposal menjadi tahapan terstruktur oleh AI, penyaluran dana termin & verifikasi rekening mitra, pelaporan belanja fisik & sinkronisasi otomatis serapan pagu, survei kepuasan masyarakat & anti-spam rate limiting).
- **`Repository`**: Tempat penulisan query langsung ke database menggunakan Drizzle ORM (termasuk *database transactions*, rekapitulasi ringkasan kas, dan agregasi skor rating).
- **`Validation & Interface`**: Skema validasi data request (Zod) dan pendefinisian tipe data/DTO.

---

## 4. Pola Kerja Singkat Saat Menambah Fitur Baru

Jika ingin menambahkan fitur baru di kemudian hari:
1. **Database:** Definisikan tabel di `src/db/schema/` $\rightarrow$ jalankan migrasi.
2. **Backend:** Buat fitur di `src/modules/[nama_fitur]/` (Repository $\rightarrow$ Service $\rightarrow$ Controller) $\rightarrow$ daftarkan routenya di `app/api/`.
3. **Frontend:** Buat komponen tampilannya di `src/components/` $\rightarrow$ tampilkan di halaman `app/[halaman]/`.

# 📚 Master Documentation Index — Project CSR (Sipena)

> **Untuk AI & Software Engineer:** Dokumen ini adalah gerbang utama (*entry point*) untuk memahami, memelihara, dan melanjutkan pengembangan proyek **CSR Impact Hub (Sipena)**. Bacalah dokumen ini terlebih dahulu sebelum memodifikasi atau menambahkan kode baru.

---

## 🗺️ Peta Navigasi Dokumentasi (`docs/`)

Setiap dokumen di bawah ini memiliki fokus teknis yang spesifik:

| Dokumen | Deskripsi & Tujuan | Kapan Harus Dibaca? |
| :--- | :--- | :--- |
| **[`system-architecture.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/system-architecture.md)** | Arsitektur sistem 3-Tier, otentikasi JWT, model multi-tenancy, RBAC, dan integrasi AI. | Sebelum merancang fitur baru atau memahami alur request backend. |
| **[`database-schema.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/database-schema.md)** | Definisi 16+ tabel MySQL via Drizzle ORM, relasi ERD, enum status, dan pola query. | Sebelum memodifikasi skema data atau membuat query database baru. |
| **[`business-workflows.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/business-workflows.md)** | *State machines* & siklus hidup bisnis: Onboarding, Proposal, MoU, Milestone, Termin Finansial, dan Ulasan Publik. | Sebelum memodifikasi logika bisnis atau alur transisi status. |
| **[`developer-guide.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/developer-guide.md)** | Panduan praktis penambahan modul baru, aturan Next.js 16, migrasi Drizzle, dan troubleshooting. | Saat mulai menulis kode (backend/frontend) atau memperbaiki bug. |
| **[`design-system.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/design-system.md)** | Panduan palet warna (Emerald Green & Slate Navy), tipografi, token, dan standar komponen UI. | Saat membuat atau merombak antarmuka halaman React / Tailwind CSS. |
| **[`folder-structure.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/folder-structure.md)** | Rincian direktori dan peran setiap file di dalam `app/`, `src/`, `public/`, dan `drizzle/`. | Saat mencari lokasi kode atau file komponen tertentu. |
| **[`api-documentation.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/api-documentation.md)** | Kontrak lengkap REST API (request body, parameter URL, response JSON, dan status code). | Saat menghubungkan frontend ke backend atau integrasi pihak ketiga. |
| **[`ai-service-milestone-extraction.md`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/ai-service-milestone-extraction.md)** | Dokumentasi dekonstruksi proposal PDF menjadi tahapan otomatis berbasis LangChain & GPT-4o-mini. | Saat memodifikasi atau memperbaiki fitur AI ekstraksi TOR/proposal. |
| **[`postman_collection.json`](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/docs/postman_collection.json)** | Koleksi endpoint Postman siap pakai untuk pengujian API. | Saat melakukan manual testing API di Postman/Insomnia. |

---

## ⚡ Ikhtisar Proyek dalam 60 Detik

### 1. Apa itu Project CSR (Sipena)?
Sipena (*Sistem Informasi Pengelolaan & Evaluasi Kemitraan CSR*) adalah platform web enterprise B2B yang menghubungkan:
1. **Perusahaan Sponsor (Company)**: Membuka peluang inisiatif CSR, meninjau proposal, mengalokasikan anggaran, menandatangani MoU digital, menyalurkan dana termin, dan mengawasi dampak ESG.
2. **Mitra Pelaksana (Partner / NGO / Yayasan)**: Mengajukan proposal kegiatan, menegosiasikan MoU, melaporkan linimasa aktivitas fisik beserta bukti foto & serapan dana, serta membagikan survei kepuasan masyarakat.
3. **Penerima Manfaat Lapangan (Masyarakat Publik)**: Memberikan penilaian rating bintang 1–5 dan testimoni langsung melalui QR Code tanpa perlu login.

### 2. Tech Stack Inti
- **Framework Full-Stack:** [Next.js 16](https://nextjs.org/) (App Router dengan TypeScript & Turbopack).
- **Frontend UI:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), dan [Lucide React](https://lucide.dev/).
- **Database:** MySQL 8.x dengan [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit (Type-safe migrations).
- **Backend Architecture:** Modular 3-Tier Pattern (Controller $\rightarrow$ Service $\rightarrow$ Repository) di dalam `src/modules/`.
- **Autentikasi & Keamanan:** Stateless JWT (`jsonwebtoken`), hash password `bcryptjs`, validasi payload `zod`.
- **Generative AI:** LangChain Core/OpenAI (`@langchain/openai`), PDF Document Parser (`unpdf` & `pdf-parse`) untuk dekonstruksi proposal otomatis.

---

## 🛡️ Aturan Utama Bagi AI / Developer (*Core Commandments*)

Sebelum melakukan perubahan apa pun, patuhi 6 aturan absolut ini:

1. **Jaga Pola 3-Tier Backend**: 
   - `app/api/.../route.ts` HANYA bertindak sebagai Route Handler pembungkus ke Controller.
   - Controller memvalidasi Auth/RBAC dan Zod Schema.
   - Service mengeksekusi aturan bisnis (validasi domain, state machine).
   - Repository menangani interaksi langsung ke database MySQL via Drizzle ORM.
   - **Jangan pernah melakukan query database langsung di dalam Route Handler atau UI Component!**
2. **Kepatuhan Design System**:
   - Warna Brand Utama: **Emerald Green** (`#059669` / `#10B981`) dan **Corporate Slate Navy** (`#181343` / `#0D0A26`).
   - Aksen Transisi: **Warm Amber / Orange** (`#F6AC2F`).
   - Jangan gunakan warna merah sembarangan (warna merah hanya untuk bahaya/error/penolakan fatal).
3. **Type-Safety & Drizzle ORM**:
   - Seluruh tabel didefinisikan di `src/db/schema/`. Jika ada perubahan kolom/tabel, buat file migrasi melalui `npm run db:generate` lalu `npm run db:migrate`.
4. **Keamanan Multi-Tenant & RBAC**:
   - Setiap endpoint bisnis harus memeriksa identitas user dari token (`AuthGuard.authenticate(req)`) dan peran akses (`AuthGuard.authorize(user, [ROLES])`).
   - Pastikan data selalu difilter berdasarkan `companyId` atau `partnerId` untuk mencegah *data leak* antar organisasi.
5. **Kompilasi & Build Verifikasi**:
   - Sebelum mengakhiri sesi pengerjaan, wajib validasi dengan `npm run build` untuk memastikan tidak ada kesalahan tipe TypeScript atau konvensi Next.js yang rusak.
6. **Next.js 16 Breaking Conventions**:
   - Mengacu pada panduan di `node_modules/next/dist/docs/` dan file aturan `AGENTS.md`. Hindari penggunaan API yang sudah usang (*deprecated*).

---

## 🚀 Panduan Memulai Cepat (Quick Start)

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka Drizzle Studio untuk inspeksi data visual di browser
npm run db:studio

# 3. Uji validitas kompilasi kode sebelum commit
npm run build
```
Port default:
- **Aplikasi Web**: `http://localhost:3000`
- **Drizzle Studio**: `https://local.drizzle.studio` (atau port yang ditampilkan terminal)

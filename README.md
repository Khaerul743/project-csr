# 🌿 CSR Impact Hub — Platform Kolaborasi CSR & Kurasi Mitra Terpercaya

> Platform terpadu penghubung kemitraan strategis program **Corporate Social Responsibility (CSR)** antara **Perusahaan (Company)** dan **Mitra Pelaksana / NGO (Partner)** dengan pemantauan dampak ESG, linimasa bukti lapangan, survei kepuasan masyarakat, dan kurasi mitra berbasis rekam jejak.

---

## 📌 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Prasyarat Sistem (Prerequisites)](#-prasyarat-sistem-prerequisites)
4. [Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
   - [Langkah 1: Clone Repository](#langkah-1-clone-repository)
   - [Langkah 2: Instalasi Dependensi](#langkah-2-instalasi-dependensi)
   - [Langkah 3: Konfigurasi Environment Variables (`.env`)](#langkah-3-konfigurasi-environment-variables-env)
   - [Langkah 4: Setup Database MySQL](#langkah-4-setup-database-mysql)
   - [Langkah 5: Migrasi Database dengan Drizzle Kit](#langkah-5-migrasi-database-dengan-drizzle-kit)
   - [Langkah 6: Menjalankan Server Pengembangan (Dev Server)](#langkah-6-menjalankan-server-pengembangan-dev-server)
5. [Daftar Perintah NPM (NPM Scripts)](#-daftar-perintah-npm-npm-scripts)
6. [Struktur Folder Proyek](#-struktur-folder-proyek)
7. [Alur Registrasi & Pengujian Role Akun](#-alur-registrasi--pengujian-role-akun)
8. [Panduan Mengakses Drizzle Studio (Database GUI)](#-panduan-mengakses-drizzle-studio-database-gui)
9. [Troubleshooting & Kendala Umum](#-troubleshooting--kendala-umum)
10. [Dokumentasi Tambahan](#-dokumentasi-tambahan)

---

## ✨ Fitur Utama

- 🏢 **Multi-Tenant Onboarding & RBAC**: Pendaftaran satu pintu dengan sistem onboarding dinamis (Perusahaan vs Mitra Pelaksana).
- 🔍 **Kurasi Mitra Terpercaya (LinkedIn-Style Profile)**: Profil lembaga komprehensif memuat legalitas (SK Kemenkumham, NPWP), *annual report PDF*, rekam jejak portofolio kegiatan lampau, profil dewan pengurus, dan live rating kepuasan masyarakat.
- 🎯 **Manajemen Peluang (CSR Opportunities) & Proposal**: Publikasi inisiatif CSR oleh perusahaan, pengajuan proposal kemitraan oleh mitra, dan alur peninjauan bertingkat.
- 🤝 **Inisiasi Kemitraan & MoU Otomatis**: Transisi kesepakatan kerjasama menjadi Program CSR aktif dengan serapan anggaran transparan.
- 💬 **Pusat Percakapan & Negosiasi Kemitraan**: Ruang obrolan terpusat per kolaborasi untuk koordinasi teknis tim.
- 📸 **Linimasa Aktivitas & Bukti Lapangan**: Dokumentasi kegiatan berkala dengan foto bukti lapangan dan alur verifikasi oleh administrator CSR.
- 📊 **Visualisasi Analitik ESG & Pelaporan Dampak**: Dashboard analitik metrik penerima manfaat, serapan dana, grafik sebaran pilar CSR, serta fitur export CSV & cetak laporan resmi.
- ⭐ **Survei Kepuasan Masyarakat Tanpa Login**: Halaman publik penilaian dampak CSR oleh masyarakat penerima manfaat via tautan/QR Code dengan sistem anti-spam rate limiting.

---

## 💻 Teknologi yang Digunakan

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) | Framework React full-stack performa tinggi |
| **Library UI** | [React 19](https://react.dev/) & [Tailwind CSS v4](https://tailwindcss.com/) | Antarmuka modern, responsif, dan dinamis |
| **Icons** | [Lucide React](https://lucide.dev/) | Koleksi ikon vektor modern |
| **Database** | [MySQL 8.x](https://www.mysql.com/) | Basis data relasional utama |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit | ORM TypeScript type-safe & migration tool |
| **Autentikasi** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` | Keamanan login & enkripsi password |
| **Validasi** | [Zod](https://zod.dev/) | Validasi skema request data |

---

## ⚙️ Prasyarat Sistem (Prerequisites)

Sebelum menjalankan proyek, pastikan perangkat Anda telah terpasang:
1. **Node.js**: Versi **`>= 20.x`** (disarankan Node.js 20 LTS atau lebih baru).
   - Periksa dengan menjalankan: `node -v`
2. **NPM**: Versi **`>= 10.x`** (bawaan Node.js).
   - Periksa dengan menjalankan: `npm -v`
3. **Git**: Untuk proses cloning repository.
   - Periksa dengan menjalankan: `git --version`
4. **MySQL Database Server**:
   - Dapat menggunakan **XAMPP**, **Laragon**, **MySQL Community Server**, atau **Docker**.
   - Pastikan service MySQL berjalan pada port default **`3306`**.

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

Ikuti langkah-langkah berikut secara berurutan:

### Langkah 1: Clone Repository
Buka terminal (Git Bash, Command Prompt, atau PowerShell) dan clone repository ke folder lokal Anda:

```bash
git clone https://github.com/Khaerul743/project-csr.git
cd project-csr
```

### Langkah 2: Instalasi Dependensi
Instal seluruh paket dependensi yang dibutuhkan:

```bash
npm install
```

> **Tips:** Pastikan proses instalasi selesai tanpa error sebelum melanjutkan ke langkah berikutnya.

---

### Langkah 3: Konfigurasi Environment Variables (`.env`)
Duplikasi file template konfigurasi [`.env.example`](file:///.env.example) menjadi `.env`:

- **Di Windows (Command Prompt / PowerShell):**
  ```cmd
  copy .env.example .env
  ```
- **Di Linux / macOS / Git Bash:**
  ```bash
  cp .env.example .env
  ```

Buka file `.env` yang baru dibuat, lalu sesuaikan koneksi database MySQL Anda:

```env
# Jika menggunakan XAMPP / Laragon standar (user 'root', tanpa password):
DATABASE_URL="mysql://root:@localhost:3306/csr_project"

# JIKA MySQL Anda memiliki password (misal: passwordnya 'rahasia123'):
# DATABASE_URL="mysql://root:rahasia123@localhost:3306/csr_project"

# Kunci rahasia JWT (bisa biarkan default untuk kebutuhan development lokal)
JWT_SECRET="supersecret_jwt_csr_project_key_2026"
JWT_EXPIRES_IN="1d"
```

---

### Langkah 4: Setup Database MySQL
Pastikan server MySQL Anda telah aktif (misalnya klik **Start** pada modul MySQL di XAMPP Control Panel).

Buat sebuah database baru bernama **`csr_project`**:
- **Opsi A (Melalui phpMyAdmin):**
  1. Buka browser: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
  2. Klik menu **"New"** / **"Baru"** di sebelah kiri.
  3. Masukkan nama database: `csr_project` dengan collation `utf8mb4_general_ci`.
  4. Klik **"Create"**.
- **Opsi B (Melalui Terminal MySQL CLI):**
  ```sql
  mysql -u root -p
  CREATE DATABASE csr_project;
  EXIT;
  ```

---

### Langkah 5: Migrasi Database dengan Drizzle Kit
Jalankan perintah berikut untuk mensinkronkan seluruh tabel skema ke database `csr_project`:

```bash
npm run db:push
```

Perintah ini akan secara otomatis membuat tabel-tabel berikut:
- `users` (Manajemen pengguna & otentikasi)
- `companies` (Profil korporasi/perusahaan)
- `partners` (Profil lembaga mitra/NGO, legalitas, portofolio & pengurus)
- `opportunities` (Peluang & inisiatif CSR perusahaan)
- `proposals` (Pengajuan proposal dari mitra)
- `collaborations` (Kemitraan yang terjalin & kesepakatan MoU)
- `programs` (Program CSR aktif dan serapan dana)
- `program_activities` (Linimasa dokumentasi aktivitas & verifikasi lapangan)
- `program_reviews` (Survei ulasan kepuasan warga masyarakat)
- `collaboration_messages` (Pusat percakapan/chat)
- `invitations` & `opportunity_invitations` (Manajemen undangan tim dan kurasi)

> **Catatan:** Jika Anda melakukan perubahan skema di folder `src/db/schema/`, cukup jalankan kembali `npm run db:push` untuk memperbarui database tanpa menghapus data yang ada.

---

### Langkah 6: Menjalankan Server Pengembangan (Dev Server)
Jalankan server aplikasi Next.js:

```bash
npm run dev
```

Buka peramban (browser) dan akses alamat:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📜 Daftar Perintah NPM (NPM Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan local development server Next.js (port 3000) |
| `npm run build` | Melakukan build produksi & kompilasi tipe TypeScript |
| `npm run start` | Menjalankan aplikasi hasil build mode produksi |
| `npm run lint` | Menjalankan pengecekan kode dengan ESLint |
| `npm run db:push` | **(Penting)** Mendorong langsung perubahan skema TypeScript ke database MySQL |
| `npm run db:generate` | Membuat file migrasi SQL baru di folder `drizzle/` |
| `npm run db:migrate` | Menjalankan eksekusi migrasi SQL yang telah di-generate |
| `npm run db:studio` | Membuka antarmuka grafis web (GUI) Drizzle Studio untuk inspeksi database |

---

## 📁 Struktur Folder Proyek

Untuk memahami struktur arsitektur 3-Tier (`Controller -> Service -> Repository`), silakan pelajari dokumentasi lengkap di:
📖 [**Dokumentasi Struktur Folder (`docs/folder-structure.md`)**](file:///docs/folder-structure.md)

Ikhtisar ringkas:
```text
project-csr/
├── app/                  # Route Handlers API (/api/...) & Halaman Antarmuka Web
├── docs/                 # Dokumentasi API, Design System, & Struktur Folder
├── drizzle/              # Riwayat file migrasi SQL Drizzle
├── public/               # File statis dan direktori upload berkas lokal (/uploads/...)
└── src/
    ├── common/           # Error Handler, JWT Service, RBAC Guards, Logger
    ├── components/       # Komponen UI React (Dashboard Company, Partner, Public Review)
    ├── db/               # Skema Drizzle ORM (MySQL) & Koneksi Pool
    └── modules/          # Modul bisnis 3-Tier (Auth, Companies, Partners, Programs, dll)
```

---

## 👥 Alur Registrasi & Pengujian Role Akun

Aplikasi ini menggunakan sistem role bertingkat:

1. **Registrasi Awal (`STAGING`)**:
   - Buka `/register` dan buat akun baru. Akun baru akan memiliki status role awal `STAGING`.
2. **Onboarding Profil Organisasi**:
   - Di halaman `/dashboard`, pilih tipe organisasi yang ingin Anda daftarkan:
     - **Daftar sebagai Perusahaan**: Akun Anda otomatis dipromosikan menjadi `MANAGEMENT` dan memiliki akses penuh mengelola program CSR, anggaran, dan mengundang tim internal (`CSR_ADMIN`).
     - **Daftar sebagai Mitra / NGO**: Akun Anda otomatis dipromosikan menjadi `PARTNER_ADMIN` dan dapat melengkapi profil lembaga (banner, legalitas, portofolio, tim) serta mengajukan proposal kolaborasi.
3. **Menguji Profil Lengkap Mitra**:
   - Buka menu **Profil Lembaga** pada dashboard mitra untuk mengisi identitas ala LinkedIn (banner cover, logo, slogan, legalitas SK Kemenkumham, riwayat kegiatan lampau, dan pengurus).
4. **Menguji Kurasi Mitra oleh Perusahaan**:
   - Masuk sebagai akun Perusahaan, buka menu **Kurasi Mitra**, lalu klik tombol **"Lihat Profil"** untuk meninjau profil lengkap organisasi mitra sebelum mengundangnya bekerja sama.
5. **Menguji Ulasan Warga (Public Review)**:
   - Akses `/review/[programId]` untuk menguji form ulasan kepuasan warga tanpa perlu login.

---

## 🗄️ Panduan Mengakses Drizzle Studio (Database GUI)

Drizzle menyediakan antarmuka web visual bawaan untuk melihat dan menyunting isi tabel database:

1. Buka terminal baru di direktori proyek.
2. Jalankan perintah:
   ```bash
   npm run db:studio
   ```
3. Buka tautan lokal yang tampil di terminal (biasanya `https://local.drizzle.studio`).
4. Anda dapat melihat seluruh tabel data (`users`, `companies`, `partners`, `programs`, dll) secara visual dan langsung.

---

## 🛠️ Troubleshooting & Kendala Umum

### 1. `connect ECONNREFUSED 127.0.0.1:3306`
- **Penyebab:** Service MySQL belum berjalan.
- **Solusi:** Buka XAMPP Control Panel / Laragon / Docker dan pastikan modul **MySQL** sudah dalam kondisi **Running** (hijau).

### 2. `Access denied for user 'root'@'localhost'`
- **Penyebab:** Konfigurasi password MySQL pada file `.env` tidak cocok.
- **Solusi:** Periksa kembali file `.env`. Jika Anda menggunakan password pada MySQL lokal Anda, masukkan password tersebut: `mysql://root:PASSWORD_ANDA@localhost:3306/csr_project`.

### 3. `Unknown database 'csr_project'`
- **Penyebab:** Database belum dibuat di MySQL.
- **Solusi:** Buka phpMyAdmin atau MySQL CLI dan jalankan `CREATE DATABASE csr_project;`.

### 4. Port 3000 sudah digunakan (`Port 3000 is in use`)
- **Solusi:** Next.js akan secara otomatis menawarkan port lain (misal `http://localhost:3001`), atau hentikan proses yang memakai port 3000 dengan perintah `npx kill-port 3000`.

### 5. Windows PowerShell Execution Policy Error saat menjalankan npm
- **Solusi:** Jalankan terminal melalui **Command Prompt (CMD)** atau ketik `cmd /c npm run dev`.

---

## 📚 Dokumentasi Tambahan

- 📘 [Dokumentasi REST API Lengkap (`docs/api-documentation.md`)](file:///docs/api-documentation.md)
- 🎨 [Panduan Sistem Desain & Token UI (`docs/design-system.md`)](file:///docs/design-system.md)
- 📁 [Dokumentasi Struktur Direktori Proyek (`docs/folder-structure.md`)](file:///docs/folder-structure.md)
- 📋 [Spesifikasi Kebutuhan Perangkat Lunak (`srs.md`)](file:///srs.md)
- 📬 [Postman API Collection (`docs/postman_collection.json`)](file:///docs/postman_collection.json)

---

## 🤝 Kontribusi & Lisensi

Proyek ini dikembangkan untuk kebutuhan kolaborasi CSR yang berdampak dan transparan. Jika mengalami kendala saat menjalankan proyek, silakan hubungi tim pengembang atau buka *Issue* di repository ini.

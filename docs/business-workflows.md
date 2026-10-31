# 🔄 Business Workflows & State Machines — Project CSR (Sipena)

Dokumentasi ini menguraikan siklus hidup proses bisnis (*business lifecycles*), alur transisi status (*state machines*), dan interaksi antar-pengguna dalam platform **Sipena**.

---

## 1. Siklus Onboarding & Staging Organisasi

Setiap pengguna yang baru mendaftar (`POST /api/register`) secara otomatis memiliki peran **`STAGING`**. Pengguna belum dapat mengakses fitur inti sampai menyelesaikan salah satu dari 3 cabang onboarding:

```mermaid
graph TD
    Register["1. Registrasi Akun Baru (Role: STAGING)"] --> Choice{"Pilih Cabang Onboarding"}
    
    Choice -->|"Perusahaan Sponsor"| FormCompany["Isi Profil Perusahaan (Nama, Industri, NPWP, Kota)"]
    FormCompany --> CreateCompany["Insert ke tabel 'companies' & Update User (Role: CSR_ADMIN, companyId)"]
    CreateCompany --> CompanyDash["Akses Company Dashboard"]

    Choice -->|"Mitra Pelaksana (NGO)"| FormPartner["Isi Profil Mitra (Nama Yayasan, Fokus Area, Legalitas)"]
    FormPartner --> CreatePartner["Insert ke tabel 'partners' & Update User (Role: PARTNER_ADMIN, partnerId)"]
    CreatePartner --> PartnerDash["Akses Partner Dashboard"]

    Choice -->|"Terima Undangan Tim"| TokenInvite["Verifikasi Token Undangan (team_invitations)"]
    TokenInvite --> BindOrg["Update User dengan role & organizationId target"]
    BindOrg --> OrgDash["Akses Dashboard Tim Organisasi"]
```

---

## 2. Siklus Hidup Inisiatif CSR (Opportunity Lifecycle)

Tabel `opportunities` mengelola inisiatif pendanaan yang dipublikasikan oleh perusahaan sponsor:

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Disimpan sebagai draf internal
    DRAFT --> OPEN : Dipublikasikan ke publik & mitra
    OPEN --> REVIEWING : Evaluasi proposal masuk / tenggat waktu tercapai
    REVIEWING --> IN_PROGRESS : Proposal terpilih & kemitraan dimulai
    IN_PROGRESS --> COMPLETED : Seluruh program lapangan selesai
    
    OPEN --> CANCELLED : Dibatalkan perusahaan
    REVIEWING --> CANCELLED : Dibatalkan perusahaan
    COMPLETED --> [*]
    CANCELLED --> [*]
```

- **`DRAFT`**: Inisiatif baru dirancang oleh tim CSR, belum dapat dilihat oleh mitra pelaksana.
- **`OPEN`**: Terbuka untuk pengajuan proposal umum. Perusahaan juga dapat mengirimkan undangan eksklusif (`opportunity_invitations`) ke mitra berperingkat tinggi.
- **`REVIEWING`**: Perusahaan sedang menyeleksi proposal yang masuk.
- **`IN_PROGRESS`**: Telah ada proposal yang disetujui dan dialihkan ke tahap eksekusi program.
- **`COMPLETED`**: Program telah selesai dipertanggungjawabkan.

---

## 3. Siklus Hidup Proposal Masuk (Proposal Lifecycle)

Tabel `proposals` merekam usulan kegiatan dari mitra pelaksana beserta usulan anggaran (RAB):

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Mitra mengirimkan proposal
    
    SUBMITTED --> UNDER_REVIEW : Perusahaan mulai menelaah teknis
    SUBMITTED --> WITHDRAWN : Ditarik kembali oleh mitra
    
    UNDER_REVIEW --> REVISION_REQUESTED : Perusahaan meminta perbaikan (dengan catatan feedback)
    REVISION_REQUESTED --> SUBMITTED : Mitra mengunggah revisi baru
    
    UNDER_REVIEW --> ACCEPTED : Proposal disetujui
    UNDER_REVIEW --> REJECTED : Proposal ditolak
    
    ACCEPTED --> [*] : Otomatis membuat Kolaborasi (MoU)
    REJECTED --> [*]
    WITHDRAWN --> [*]
```

### Aturan Bisnis Penting:
1. **Otomasi Kolaborasi Baru**: Saat proposal diubah statusnya menjadi **`ACCEPTED`**, sistem secara transaksional membuat baris baru pada tabel `collaborations` dengan status awal `NEGOTIATION` / `MOU_DRAFTING`.
2. **Revisi Dua Arah**: Saat perusahaan memilih `REVISION_REQUESTED`, kolom `feedback` wajib diisi minimal 5 karakter. Ketika mitra menyimpan hasil revisi, status proposal secara otomatis kembali ke `SUBMITTED` agar tim perusahaan mengetahui adanya pembaruan.
3. **Penarikan Mandiri**: Mitra hanya dapat menarik proposal (`WITHDRAWN`) jika proposal belum mencapai status `ACCEPTED` atau `REJECTED`.

---

## 4. Siklus Finalisasi MoU & Pembuatan Program Otomatis

Tabel `collaborations` menjembatani kesepakatan formal antara perusahaan dan mitra:

```mermaid
sequenceDiagram
    participant Mitra as Admin Mitra (PARTNER_ADMIN)
    participant Chat as Ruang Percakapan Terpadu
    participant Perusahaan as Admin CSR (CSR_ADMIN / MANAGEMENT)
    participant Sistem as Sistem Aplikasi

    Note over Mitra,Perusahaan: Proposal disetujui (Status: NEGOTIATION / MOU_DRAFTING)
    Mitra->>Chat: Negosiasi tanggal kick-off & rincian RAB
    Perusahaan->>Chat: Konfirmasi kesepakatan akhir anggaran (agreedBudget)
    Perusahaan->>Sistem: Unggah berkas resmi MoU/PKS (PDF) yang ditandatangani kedua pihak
    Perusahaan->>Sistem: Finalisasi Kolaborasi (status: AGREED)
    Sistem->>Sistem: Otomatis buat entitas Proyek 'programs' (status: PLANNING)
    Sistem-->>Perusahaan: Program siap dijalankan di menu "Pelaksanaan Program"
    Sistem-->>Mitra: Program aktif muncul di dashboard mitra
```

---

## 5. Eksekusi Program, Dekonstruksi AI, & Linimasa Lapangan

Setelah program terbentuk (`programs`), eksekusi kegiatan diatur dalam tahapan (*stages*) dan log aktivitas (*activities*):

```mermaid
graph TD
    subgraph Setup_Stages ["1. Penentuan Tahapan / Milestone"]
        Manual["Input Tahapan Manual (program_stages)"]
        AI["Dekonstruksi Proposal Otomatis via AI (LangChain GPT-4o-mini)"]
    end

    subgraph Logging ["2. Pelaporan Aktivitas Lapangan"]
        PartnerLog["Mitra lapor kegiatan: Tanggal, Lokasi, Jiwa Penerima, Pengeluaran, Foto Bukti"]
        StatusPending["Status: PENDING"]
    end

    subgraph Verification ["3. Verifikasi Korporat"]
        CSRReview{"Audit Admin CSR"}
        CSRReview -->|"Valid"| Verified["Status: VERIFIED (Masuk rekapitulasi data)"]
        CSRReview -->|"Tidak Lengkap"| Rejected["Status: REJECTED (Disertai catatan koreksi)"]
    end

    Setup_Stages --> Logging
    PartnerLog --> StatusPending
    StatusPending --> CSRReview
```

---

## 6. Realisasi Keuangan Bertahap (Disbursements & Expenses)

Sistem memastikan tata kelola keuangan yang transparan dan akuntabel melalui pemisahan antara **Pencairan Termin** dan **Pelaporan Belanja**:

```mermaid
graph LR
    subgraph Penyaluran_Termin ["A. Penyaluran Dana Perusahaan (program_disbursements)"]
        D1["Jadwal Termin (SCHEDULED)"] --> D2["Perusahaan Transfer & Unggah Struk (DISBURSED)"]
        D2 --> D3["Mitra Konfirmasi Terima Dana (CONFIRMED)"]
    end

    subgraph Pelaporan_Belanja ["B. Akuntabilitas Pengeluaran Mitra (program_expenses)"]
        E1["Mitra Belanja Lapangan"] --> E2["Unggah Kuitansi & Nota (REPORTED)"]
        E2 --> E3{"Audit Perusahaan"}
        E3 -->|"Cocok"| E4["Status: VERIFIED (Menambah serapan riil anggaran)"]
        E3 -->|"Tolak"| E5["Status: REJECTED"]
    end

    D3 -. Dana Tersedia .-> E1
```

- **Pagu Alokasi**: Total komitmen anggaran program (`totalBudget`).
- **Dana Tersalurkan**: Akumulasi termin yang berstatus `CONFIRMED`.
- **Dana Terserap Riil**: Akumulasi nota belanja yang berstatus `VERIFIED`.

---

## 7. Survei Kepuasan Masyarakat Tanpa Login (Public QR Review)

Platform memfasilitasi pengumpulan umpan balik langsung dari masyarakat di lokasi kegiatan:

```mermaid
sequenceDiagram
    participant Warga as Warga Penerima Manfaat (Smartphone)
    participant QR as Banner / QR Code Lapangan
    participant WebPublic as Endpoint Publik (/public-review/[programId])
    participant RateLimiter as Anti-Spam Rate Limiter (IP Guard)
    participant DB as Database (program_reviews)
    participant Dashboard as Dashboard Analitik CSR

    Warga->>QR: Scan QR Code menggunakan kamera ponsel
    QR->>WebPublic: Membuka formulir survei publik tanpa login
    Warga->>WebPublic: Input Nama, Peran, Rating (1-5 Bintang), Ulasan, Foto Bukti
    WebPublic->>RateLimiter: Periksa frekuensi request dari IP pengirim
    alt Melebihi Batas Pengiriman (Spam)
        RateLimiter-->>Warga: 429 Too Many Requests (Peringatan Anti-Spam)
    else Verifikasi Lolos
        WebPublic->>DB: Simpan ulasan masyarakat
        DB-->>Dashboard: Agregasi skor kepuasan & galeri testimoni terupdate real-time
        WebPublic-->>Warga: Tampilan ucapan terima kasih
    end
```

---

## 8. Laporan & Visualisasi Analitik ESG (Executive Analytics)

Modul `analytics` merangkum metrik kuantitatif dan kualitatif dari seluruh program aktif dan selesai:
1. **Total Penerima Manfaat (Jiwa)**: Dihitung dari akumulasi penerima manfaat terverifikasi pada tabel `program_activities` dan target inisiatif.
2. **Efisiensi Serapan Anggaran**: Perbandingan realisasi pengeluaran terhadap komitmen awal.
3. **Distribusi Pilar ESG & SDG**: Diagram komposisi portofolio (Lingkungan, Pendidikan, Kesehatan, Ekonomi).
4. **Alat Pelaporan**:
   - **Ekspor CSV**: Menghasilkan data mentah terstruktur untuk integrasi ke spreadsheet/BI tool.
   - **Mode Cetak Laporan Resmi**: Tampilan bersih bebas navigasi yang dioptimalkan untuk dicetak langsung ke PDF atau printer fisik sebagai lampiran laporan tahunan (*Sustainability Report*).

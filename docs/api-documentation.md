# API Reference - Project CSR

Dokumentasi ringkas REST API Project CSR. Didesain modular agar mudah diperluas seiring bertambahnya fitur dan modul.

---

## 1. Konvensi Global

- **Base URL:** `http://localhost:3000`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>` (untuk route terproteksi)
- **Roles (RBAC):** `CSR_ADMIN` | `MANAGEMENT` | `PARTNER_ADMIN` | `STAGING`

### Format Response
```typescript
// Sukses
{ success: true, statusCode: number, message: string, data?: any }

// Error
{ success: false, statusCode: number, message: string, details?: any }
```

---

## 2. Modul Autentikasi (`/api`)

### 2.1 Register
Mendaftarkan akun baru. User hanya menginput `username` (atau `name`), `email`, dan `password`. Role setiap user baru secara otomatis diset ke **`STAGING`**.

- **Method / Path:** `POST /api/register` *(alias: `/api/auth/register`)*
- **Auth:** Public

**Request Body:**
```json
{
  "username": "budi_santoso",
  "email": "budi@example.com",
  "password": "Password123!"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "e5c464c7-e6f7-4632-a565-d059637cba4a",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "STAGING",
      "companyId": null,
      "partnerId": null,
      "status": "ACTIVE",
      "createdAt": "2026-10-10T02:00:00.000Z",
      "updatedAt": "2026-10-10T02:00:00.000Z"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```
*Error:* `400 Bad Request` (validasi gagal), `409 Conflict` (email duplikat).

---

### 2.2 Login
Autentikasi akun dan mendapatkan token JWT.

- **Method / Path:** `POST /api/login` *(alias: `/api/auth/login`)*
- **Auth:** Public

**Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "e5c464c7-e6f7-4632-a565-d059637cba4a",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "STAGING",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```
*Error:* `401 Unauthorized` (kredensial salah / akun nonaktif).

---

### 2.3 Get Current User (Me)
Mengambil informasi profil user yang sedang login.

- **Method / Path:** `GET /api/auth/me`
- **Auth:** `Bearer Token`

**Response (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "e5c464c7-e6f7-4632-a565-d059637cba4a",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "STAGING",
    "companyId": null,
    "partnerId": null,
    "status": "ACTIVE"
  }
}
```
*Error:* `401 Unauthorized`.

---

## 3. Modul Perusahaan (`/api/companies`)

Modul untuk onboarding perusahaan dan manajemen profil perusahaan.

### 3.1 Buat Profil Perusahaan (Onboarding)
Mendaftarkan profil perusahaan oleh user dengan role `STAGING`. Setelah sukses, user otomatis dipromosikan menjadi **`MANAGEMENT`** dan mendapatkan access token baru yang sudah memuat `companyId` dan `role: MANAGEMENT`.

- **Method / Path:** `POST /api/companies`
- **Auth:** Bearer Token (Role: `STAGING`)

**Request Body:**
```json
{
  "name": "PT Sumber Energi Hijau",
  "description": "Perusahaan energi terbarukan yang fokus pada reboisasi dan lingkungan.",
  "email": "csr@sumberenergi.co.id",
  "phone": "+6281234567890",
  "address": "Jl. Jenderal Sudirman Kav. 52-53",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "website": "https://sumberenergi.co.id",
  "logoUrl": "https://example.com/logo.png"
}
```

**Response Sukses (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Company created successfully. You are now MANAGEMENT.",
  "data": {
    "company": {
      "id": "uuid-company",
      "name": "PT Sumber Energi Hijau",
      "status": "ACTIVE",
      "createdAt": "2026-10-10T14:00:00.000Z"
    },
    "user": {
      "id": "uuid-user",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "MANAGEMENT",
      "companyId": "uuid-company",
      "partnerId": null,
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### 3.2 Ambil Profil Perusahaan Saya
Mengambil data detail perusahaan dari user yang sedang login.

- **Method / Path:** `GET /api/companies/current`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

### 3.3 Update Profil Perusahaan
Memperbarui data profil perusahaan.

- **Method / Path:** `PUT /api/companies/current` *(atau `PATCH`)*
- **Auth:** Bearer Token (Role: `MANAGEMENT`)

### 3.4 Daftar Perusahaan (Katalog)
Melihat daftar perusahaan terdaftar dengan paginasi dan pencarian.

- **Method / Path:** `GET /api/companies?page=1&limit=10&search=energi`
- **Auth:** Public / Authenticated

### 3.5 Detail Perusahaan Berdasarkan ID
- **Method / Path:** `GET /api/companies/:id`
- **Auth:** Public / Authenticated

---

## 4. Modul Mitra CSR / NGO (`/api/partners`)

Modul untuk onboarding mitra pelaksana (yayasan, NGO, komunitas) dan manajemen profil mitra.

### 4.1 Buat Profil Mitra (Onboarding)
Mendaftarkan profil mitra/NGO oleh user dengan role `STAGING`. Setelah sukses, user otomatis dipromosikan menjadi **`PARTNER_ADMIN`** dan mendapatkan access token baru yang memuat `partnerId` dan `role: PARTNER_ADMIN`.

- **Method / Path:** `POST /api/partners`
- **Auth:** Bearer Token (Role: `STAGING`)

**Request Body:**
```json
{
  "name": "Yayasan Lindungi Hutan",
  "description": "Lembaga konservasi hutan dan penanaman mangrove di pesisir Indonesia.",
  "email": "kontak@lindungi-hutan.org",
  "phone": "+628987654321",
  "address": "Jl. Hutan Lestari No. 12",
  "city": "Semarang",
  "province": "Jawa Tengah",
  "website": "https://lindungi-hutan.org",
  "logoUrl": "https://example.com/partner-logo.png"
}
```

**Response Sukses (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Partner created successfully. You are now PARTNER_ADMIN.",
  "data": {
    "partner": {
      "id": "uuid-partner",
      "name": "Yayasan Lindungi Hutan",
      "status": "ACTIVE",
      "createdAt": "2026-10-10T14:00:00.000Z"
    },
    "user": {
      "id": "uuid-user",
      "name": "Siti Rahma",
      "email": "siti@example.com",
      "role": "PARTNER_ADMIN",
      "companyId": null,
      "partnerId": "uuid-partner",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### 4.2 Ambil Profil Mitra Saya
Mengambil detail mitra milik user yang sedang login.

- **Method / Path:** `GET /api/partners/current`
- **Auth:** Bearer Token (Role: `PARTNER_ADMIN`)

### 4.3 Update Profil Mitra
Memperbarui profil mitra.

- **Method / Path:** `PUT /api/partners/current` *(atau `PATCH`)*
- **Auth:** Bearer Token (Role: `PARTNER_ADMIN`)

### 4.4 Daftar Mitra (Katalog Pencarian CSR)
Melihat daftar mitra yang terdaftar untuk keperluan pencarian kolaborasi CSR.

- **Method / Path:** `GET /api/partners?page=1&limit=10&search=hutan`
- **Auth:** Public / Authenticated

### 4.5 Detail Mitra Berdasarkan ID
- **Method / Path:** `GET /api/partners/:id`
- **Auth:** Public / Authenticated

---

## 5. Modul Undangan Tim (`/api/invitations`)

Modul untuk manajemen undangan bergabung ke tim perusahaan. Memungkinkan `MANAGEMENT` mengundang anggota tim internal (`CSR_ADMIN`) dan memungkinkan user di tahap `STAGING` menerima undangan untuk langsung bergabung ke workspace perusahaan.

### 5.1 Kirim Undangan Tim
Mengirim undangan resmi ke email calon anggota tim.

- **Method / Path:** `POST /api/invitations`
- **Auth:** Bearer Token (Role: `MANAGEMENT`)

**Request Body:**
```json
{
  "email": "staf.csr@perusahaan.co.id",
  "role": "CSR_ADMIN"
}
```

**Response Sukses (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Undangan tim berhasil dikirim",
  "data": {
    "id": "uuid-invitation",
    "companyId": "uuid-company",
    "email": "staf.csr@perusahaan.co.id",
    "role": "CSR_ADMIN",
    "invitedBy": "uuid-user-management",
    "status": "PENDING",
    "token": "uuid-token-string",
    "expiresAt": "2026-10-19T14:00:00.000Z",
    "createdAt": "2026-10-12T14:00:00.000Z"
  }
}
```

### 5.2 Daftar Undangan Perusahaan
Melihat riwayat seluruh undangan yang dikirimkan oleh perusahaan yang sedang login.

- **Method / Path:** `GET /api/invitations`
- **Auth:** Bearer Token (Role: `MANAGEMENT`)

### 5.3 Cek Undangan Masuk Saya (Pending)
Mengecek apakah email user yang sedang login memiliki undangan bergabung yang masih pending/aktif. Digunakan di Dashboard Staging.

- **Method / Path:** `GET /api/invitations/my-pending`
- **Auth:** Bearer Token (Role: `STAGING` / Authenticated)

### 5.4 Terima Undangan Tim
Menerima undangan bergabung. User otomatis dipromosikan menjadi **`CSR_ADMIN`** dan dihubungkan ke perusahaan pengundang (`company_id`). Mengembalikan access token baru.

- **Method / Path:** `POST /api/invitations/accept`
- **Auth:** Bearer Token (Role: `STAGING`)

**Request Body:**
```json
{
  "invitationId": "uuid-invitation"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Undangan berhasil diterima! Selamat bergabung.",
  "data": {
    "user": {
      "id": "uuid-user",
      "name": "Ahmad Dani",
      "email": "staf.csr@perusahaan.co.id",
      "role": "CSR_ADMIN",
      "companyId": "uuid-company",
      "partnerId": null,
      "status": "ACTIVE"
    },
    "organization": {
      "id": "uuid-company",
      "name": "PT Sumber Energi Hijau",
      "type": "COMPANY"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### 5.5 Tolak Undangan Tim
- **Method / Path:** `POST /api/invitations/reject`
- **Auth:** Bearer Token (Authenticated)

**Request Body:**
```json
{
  "invitationId": "uuid-invitation"
}
```

### 5.6 Batalkan Undangan Tim
- **Method / Path:** `DELETE /api/invitations/:id`
- **Auth:** Bearer Token (Role: `MANAGEMENT`)

---

## 6. Modul Peluang CSR / Inisiatif (`/api/opportunities`)

Modul untuk manajemen inisiatif CSR yang dibuka oleh perusahaan sebagai peluang kolaborasi bagi para mitra.

### 6.1 Buat Opportunity Baru
Membuat inisiatif program CSR baru oleh tim perusahaan.

- **Method / Path:** `POST /api/opportunities`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

**Request Body:**
```json
{
  "title": "Inisiatif Konservasi Mangrove Pesisir 2026",
  "description": "Penanaman 10.000 bibit mangrove dan pemberdayaan ekonomi masyarakat pesisir di Pantai Utara Jawa.",
  "focusArea": "LINGKUNGAN",
  "targetCity": "Semarang",
  "targetProvince": "Jawa Tengah",
  "estimatedBudget": 250000000,
  "startDate": "2026-06-01",
  "endDate": "2026-12-31",
  "deadline": "2026-05-15",
  "status": "OPEN"
}
```

**Pilihan `focusArea` yang valid:**
`LINGKUNGAN` | `PENDIDIKAN` | `KESEHATAN` | `PEMBERDAYAAN_EKONOMI` | `INFRASTRUKTUR_SOSIAL` | `TANGGAP_BENCANA` | `LAINNYA`

### 6.2 Katalog Publik Opportunity
Melihat daftar seluruh peluang CSR yang dibuka dengan filter pencarian dan paginasi.

- **Method / Path:** `GET /api/opportunities?page=1&limit=10&search=mangrove&focusArea=LINGKUNGAN&city=Semarang`
- **Auth:** Public / Authenticated

### 6.3 Daftar Opportunity Milik Perusahaan Saya
Melihat seluruh inisiatif yang dibuat oleh perusahaan user yang login (termasuk status `DRAFT`, `OPEN`, `IN_REVIEW`, `CLOSED`).

- **Method / Path:** `GET /api/opportunities/my-company?page=1&limit=10`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

### 6.4 Detail Opportunity
Mengambil rincian detail suatu inisiatif beserta profil perusahaan pengusul dan statistik proposal masuk.

- **Method / Path:** `GET /api/opportunities/:id`
- **Auth:** Public / Authenticated

### 6.5 Update Opportunity
Memperbarui informasi atau status inisiatif.

- **Method / Path:** `PUT /api/opportunities/:id` *(atau `PATCH`)*
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN` milik perusahaan terkait)

### 6.6 Hapus Opportunity
Menghapus inisiatif.

- **Method / Path:** `DELETE /api/opportunities/:id`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN` milik perusahaan terkait)

### 6.7 Undang Mitra ke Opportunity (Pitch Invite)
Perusahaan mengundang mitra terdaftar secara langsung untuk mengajukan proposal ke inisiatif ini.

- **Method / Path:** `POST /api/opportunities/:id/invite`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

**Request Body:**
```json
{
  "partnerId": "uuid-partner",
  "message": "Halo Yayasan, kami terkesan dengan rekam jejak Anda dan ingin mengundang Anda mengajukan proposal."
}
```

### 6.8 Daftar Mitra yang Diundang ke Opportunity
Melihat daftar mitra yang telah diundang untuk inisiatif ini beserta status responnya (`INVITED`, `ACCEPTED`, `DECLINED`).

- **Method / Path:** `GET /api/opportunities/:id/invite`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

### 6.9 Unggah Thumbnail Opportunity
Mengunggah file gambar (JPG, PNG, WEBP, GIF maks 5MB) dan menyimpannya secara lokal di folder `public/uploads/opportunities/`.

- **Method / Path:** `POST /api/upload`
- **Auth:** Bearer Token (Authenticated)
- **Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File gambar (binary)

**Response (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Gambar thumbnail berhasil diunggah",
  "data": {
    "url": "/uploads/opportunities/opp-1791858000-abcd1234.jpg",
    "filename": "opp-1791858000-abcd1234.jpg",
    "size": 1048576,
    "mimeType": "image/jpeg"
  }
}
```

---

## 7. Modul Proposal (`/api/proposals`)

Mendukung alur dua arah di mana Mitra Pelaksana (`PARTNER_ADMIN`) dapat mengajukan proposal inisiatif kegiatan ke program CSR perusahaan, dan pihak Perusahaan (`MANAGEMENT`, `CSR_ADMIN`) dapat mereview, menyetujui, atau menolaknya.

### 7.1 Mengajukan Proposal
Mitra mengajukan proposal teknis beserta estimasi anggaran dan durasi pelaksanaan ke program CSR yang sedang terbuka.

- **Method / Path:** `POST /api/proposals`
- **Auth:** Bearer Token (Role: `PARTNER_ADMIN`)

**Request Body:**
```json
{
  "opportunityId": "uuid-opportunity",
  "title": "Program Revitalisasi Terumbu Karang Teluk Ambon",
  "summary": "Implementasi transplantasi 500 bibit terumbu karang bersama masyarakat nelayan pesisir...",
  "proposedBudget": 45000000,
  "durationMonths": 6,
  "targetBeneficiaries": "120 KK Nelayan Pesisir",
  "documentUrl": "https://drive.google.com/proposal-doc.pdf"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Proposal berhasil diajukan kepada perusahaan",
  "data": {
    "id": "uuid-proposal",
    "opportunityId": "uuid-opportunity",
    "partnerId": "uuid-partner",
    "submittedBy": "uuid-user",
    "title": "Program Revitalisasi Terumbu Karang Teluk Ambon",
    "summary": "...",
    "proposedBudget": "45000000.00",
    "durationMonths": 6,
    "targetBeneficiaries": "120 KK Nelayan Pesisir",
    "documentUrl": "https://drive.google.com/proposal-doc.pdf",
    "status": "SUBMITTED",
    "createdAt": "2026-10-13T10:00:00.000Z",
    "updatedAt": "2026-10-13T10:00:00.000Z"
  }
}
```

---

### 7.2 Daftar Proposal Mitra Sendiri
Mitra melihat seluruh riwayat pengajuan proposal yang pernah dikirimkan beserta status peninjauannya.

- **Method / Path:** `GET /api/proposals/my-partner?page=1&limit=10&status=SUBMITTED`
- **Auth:** Bearer Token (Role: `PARTNER_ADMIN`)

---

### 7.3 Daftar Proposal Masuk Perusahaan
Perusahaan melihat proposal yang diajukan oleh berbagai mitra pada seluruh atau spesifik inisiatif opportunity milik perusahaan.

- **Method / Path:** `GET /api/proposals/company?page=1&limit=10&opportunityId=uuid`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

---

### 7.4 Detail Proposal
Melihat informasi komprehensif suatu proposal, profil mitra pengaju, dan data inisiatif terkait.

- **Method / Path:** `GET /api/proposals/:id`
- **Auth:** Bearer Token (Mitra pemilik proposal atau Perusahaan pemilik opportunity)

---

### 7.5 Review Proposal (Disetujui / Ditolak / Dalam Tinjauan)
Perusahaan memberikan keputusan atas proposal yang masuk. Jika status disetujui (`ACCEPTED`), sistem secara otomatis menjalankan transaksi atomik untuk mencatatkan entri kontrak kerja sama baru (`collaborations`) berstatus `NEGOTIATION` dan memperbarui status undangan terkait menjadi `ACCEPTED`.

- **Method / Path:** `PATCH /api/proposals/:id/review`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN`)

**Request Body:**
```json
{
  "status": "ACCEPTED", // atau "UNDER_REVIEW" | "REJECTED"
  "feedback": "Proposal sangat komprehensif dan sesuai dengan target ESG perusahaan tahun ini."
}
```

**Response (`200 OK` - jika ACCEPTED):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Proposal berhasil diterima! Kolaborasi baru telah dibentuk.",
  "data": {
    "proposal": {
      "id": "uuid-proposal",
      "status": "ACCEPTED",
      "reviewedBy": "uuid-user",
      "reviewedAt": "2026-10-13T11:00:00.000Z",
      "feedback": "Proposal sangat komprehensif..."
    },
    "collaboration": {
      "id": "uuid-collab",
      "opportunityId": "uuid-opp",
      "proposalId": "uuid-proposal",
      "companyId": "uuid-company",
      "partnerId": "uuid-partner",
      "finalBudget": "45000000.00",
      "status": "NEGOTIATION"
    }
  }
}
```

---

### 7.6 Menarik Proposal
Mitra menarik kembali proposal yang telah diajukan (hanya berlaku jika status masih `SUBMITTED` atau `UNDER_REVIEW`).

- **Method / Path:** `POST /api/proposals/:id/withdraw`
- **Auth:** Bearer Token (Role: `PARTNER_ADMIN`)

---

## 8. Modul Kolaborasi & Kontrak Kerjasama (`/api/collaborations`)

Mencatat perjanjian kemitraan resmi antara Perusahaan dan Mitra Pelaksana setelah proposal disetujui (`ACCEPTED`). Mengakomodasi fase negosiasi akhir anggaran, penentuan tanggal pelaksanaan, pengunggahan dokumen MoU/PKS resmi, serta inisiasi eksekusi program.

### 8.1 Daftar Kolaborasi
Mengambil seluruh daftar kolaborasi aktif yang melibatkan organisasi pengguna (baik dari sisi perusahaan maupun mitra).

- **Method / Path:** `GET /api/collaborations?page=1&limit=10&status=NEGOTIATION`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN` | `PARTNER_ADMIN`)

---

### 8.2 Detail Kolaborasi
Melihat rincian kesepakatan, profil kedua belah pihak, proposal terkait, dan draf MoU.

- **Method / Path:** `GET /api/collaborations/:id`
- **Auth:** Bearer Token (Perusahaan atau Mitra yang terlibat)

---

### 8.3 Pembaruan & Pengesahan Kolaborasi (MoU Sign-off)
Memperbarui rincian negosiasi (anggaran akhir, tanggal kegiatan, dokumen MoU, catatan kesepakatan) dan mengesahkan status kolaborasi menjadi `AGREED`. Ketika status disetujui menjadi `AGREED`, sistem secara otomatis menginisialisasi entri kegiatan pada tabel `programs` berstatus `PLANNED`.

- **Method / Path:** `PATCH /api/collaborations/:id`
- **Auth:** Bearer Token (Role: `MANAGEMENT` | `CSR_ADMIN` | `PARTNER_ADMIN`)

**Request Body:**
```json
{
  "finalBudget": 48000000,
  "startDate": "2026-11-01T00:00:00.000Z",
  "endDate": "2027-04-30T00:00:00.000Z",
  "targetBeneficiaries": "150 KK Nelayan Pesisir & 50 Pemuda",
  "mouDocumentUrl": "https://drive.google.com/pks-mou-signed.pdf",
  "notes": "MoU ditandatangani oleh Direktur CSR dan Ketua Yayasan pada 20 Oktober 2026.",
  "status": "AGREED"
}
```

---

## 9. Contoh Implementasi RBAC Guard

Untuk memproteksi endpoint baru dengan role tertentu:

```typescript
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiResponse, ErrorHandler } from "@/common";

export async function GET(request: Request) {
  try {
    // Memvalidasi token sekaligus role yang diizinkan (RBAC)
    const user = AuthGuard.authorize(request, ["CSR_ADMIN", "MANAGEMENT"]);
    
    return ApiResponse.success({ message: `Halo ${user.email}` }, "OK");
  } catch (error) {
    return ErrorHandler.handle(error); // Otomatis return 401 atau 403
  }
}
```

---

## 10. Ringkasan Status Code

| Code | Status | Keterangan |
| :--- | :--- | :--- |
| `200` | OK | Request berhasil |
| `201` | Created | Resource baru dibuat |
| `400` | Bad Request | Validasi input gagal |
| `401` | Unauthorized | Token tidak ada / tidak valid |
| `403` | Forbidden | Role tidak memiliki hak akses (RBAC) |
| `404` | Not Found | Data tidak ditemukan |
| `409` | Conflict | Data duplikat / konflik state role |
| `500` | Internal Error | Server error |



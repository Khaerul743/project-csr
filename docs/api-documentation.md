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

## 5. Contoh Implementasi RBAC Guard

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

## 6. Ringkasan Status Code

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

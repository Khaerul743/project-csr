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

## 3. Contoh Implementasi RBAC Guard

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

## 4. Ringkasan Status Code

| Code | Status | Keterangan |
| :--- | :--- | :--- |
| `200` | OK | Request berhasil |
| `201` | Created | Resource baru dibuat |
| `400` | Bad Request | Validasi input gagal |
| `401` | Unauthorized | Token tidak ada / tidak valid |
| `403` | Forbidden | Role tidak memiliki hak akses (RBAC) |
| `404` | Not Found | Data tidak ditemukan |
| `409` | Conflict | Data duplikat (misal email) |
| `500` | Internal Error | Server error |

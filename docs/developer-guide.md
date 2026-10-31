# 🛠️ Developer & AI Playbook — Project CSR (Sipena)

Panduan operasional praktis ini dirancang untuk memandu pengembang perangkat lunak atau agen AI dalam menambah fitur baru, mengelola basis data, dan menjaga integritas kode.

---

## 1. Setup Lingkungan Pengembangan (Environment Setup)

### Prasyarat:
- **Node.js**: Versi `>= 20.x`
- **NPM**: Versi `>= 10.x`
- **MySQL**: Versi `8.x` (Port default: `3306`)

### Konfigurasi `.env`:
Buat file `.env` di root direktori proyek berdasarkan `.env.example`:

```env
# Koneksi Basis Data MySQL
DATABASE_URL=mysql://root:password@localhost:3306/project_csr

# Rahasia Autentikasi JWT
JWT_SECRET=rahasia_super_aman_proyek_csr_2026_jwt_token
JWT_EXPIRES_IN=7d

# Konfigurasi Domain Aplikasi
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Integrasi OpenAI (Opsional - untuk ekstraksi AI milestone proposal)
OPENAI_API_KEY=sk-proj-your-openai-api-key
OPENAI_MODEL_NAME=gpt-4o-mini
```

---

## 2. Manajemen Basis Data dengan Drizzle ORM

Proyek ini menggunakan **Drizzle ORM** dengan driver `mysql2`. Skema tabel berada di `src/db/schema/`.

### Daftar Perintah Basis Data:

| Perintah NPM | Fungsi | Kapan Digunakan? |
| :--- | :--- | :--- |
| `npm run db:generate` | Membaca perubahan di `src/db/schema/` dan membuat berkas migrasi SQL di folder `drizzle/`. | Setiap kali Anda mengubah/menambah kolom di file skema. |
| `npm run db:migrate` | Menjalankan migrasi SQL yang belum diterapkan ke server database MySQL. | Setelah `db:generate` untuk memperbarui tabel di database riil. |
| `npm run db:push` | Mendorong perubahan skema langsung ke database tanpa membuat berkas migrasi SQL. | Berguna untuk *prototyping* cepat pada lingkungan lokal. |
| `npm run db:studio` | Membuka antarmuka GUI visual Drizzle Studio di browser (`https://local.drizzle.studio`). | Untuk melihat isi tabel, mengedit data, atau debugging langsung. |

> [!IMPORTANT]
> Jangan pernah memodifikasi tabel database MySQL secara manual melalui phpMyAdmin tanpa memperbarui skema di `src/db/schema/`. Selalu gunakan alur `src/db/schema/` $\rightarrow$ `npm run db:generate` $\rightarrow$ `npm run db:migrate`.

---

## 3. Langkah Demi Langkah: Menambah Fitur Baru (*New Feature Playbook*)

Ikuti alur terstruktur ini saat menambahkan entitas atau fitur bisnis baru:

### Langkah 1: Buat Skema Tabel di Database
Buat file skema baru di `src/db/schema/[nama-fitur].ts` dan ekspor di `src/db/schema/index.ts`:

```typescript
// src/db/schema/certificates.ts
import { mysqlTable, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { programs } from "./programs";

export const certificates = mysqlTable("certificates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  programId: varchar("program_id", { length: 36 }).notNull().references(() => programs.id),
  certificateNumber: varchar("certificate_number", { length: 100 }).notNull().unique(),
  fileUrl: text("file_url").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});
```
Lalu jalankan `npm run db:generate` dan `npm run db:migrate`.

---

### Langkah 2: Buat Validasi Zod & Tipe Data
Buat file `src/modules/[nama-fitur]/[nama-fitur].validation.ts`:

```typescript
import { z } from "zod";

export const issueCertificateSchema = z.object({
  programId: z.string().uuid("ID program harus berupa UUID valid"),
  certificateNumber: z.string().min(5, "Nomor sertifikat minimal 5 karakter"),
  fileUrl: z.string().url("URL sertifikat harus valid"),
});

export type IssueCertificateDTO = z.infer<typeof issueCertificateSchema>;
```

---

### Langkah 3: Buat Repository (Database Queries)
Buat file `src/modules/[nama-fitur]/[nama-fitur].repository.ts`:

```typescript
import { db } from "@/db";
import { certificates } from "@/db/schema";
import { eq } from "drizzle-orm";

export class CertificateRepository {
  async findByProgramId(programId: string) {
    return await db.select().from(certificates).where(eq(certificates.programId, programId));
  }

  async create(data: { programId: string; certificateNumber: string; fileUrl: string }) {
    await db.insert(certificates).values(data);
    return data;
  }
}
```

---

### Langkah 4: Buat Service (Logika Bisnis & Validasi Domain)
Buat file `src/modules/[nama-fitur]/[nama-fitur].service.ts`:

```typescript
import { CertificateRepository } from "./certificate.repository";
import { IssueCertificateDTO } from "./certificate.validation";
import { BadRequestError } from "@/common/errors";

export class CertificateService {
  constructor(private repo: CertificateRepository) {}

  async issueCertificate(companyId: string, dto: IssueCertificateDTO) {
    // Validasi aturan bisnis: apakah program sudah berstatus COMPLETED?
    // Jika tidak, throw new BadRequestError("Program belum selesai");
    return await this.repo.create(dto);
  }
}
```

---

### Langkah 5: Buat Controller (Guard RBAC & HTTP Formatting)
Buat file `src/modules/[nama-fitur]/[nama-fitur].controller.ts`:

```typescript
import { AuthGuard } from "@/common/guards/auth.guard";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { issueCertificateSchema } from "./certificate.validation";
import { CertificateService } from "./certificate.service";

export class CertificateController {
  constructor(private service: CertificateService) {}

  async issue(request: Request) {
    try {
      const authUser = AuthGuard.authenticate(request);
      AuthGuard.authorize(authUser, ["CSR_ADMIN", "MANAGEMENT"]);

      const body = await request.json();
      const validated = issueCertificateSchema.parse(body);

      const result = await this.service.issueCertificate(authUser.companyId!, validated);
      return ApiResponse.success(result, "Sertifikat berhasil diterbitkan", 201);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}
```

---

### Langkah 6: Hubungkan ke Next.js Route Handler
Buat file `app/api/certificates/route.ts`:

```typescript
import { CertificateController } from "@/modules/certificates/certificate.controller";
import { CertificateService } from "@/modules/certificates/certificate.service";
import { CertificateRepository } from "@/modules/certificates/certificate.repository";

const repo = new CertificateRepository();
const service = new CertificateService(repo);
const controller = new CertificateController(service);

export async function POST(request: Request) {
  return controller.issue(request);
}
```

---

### Langkah 7: Hubungkan ke Frontend UI
Gunakan komponen antarmuka terstandarisasi dari `src/components/ui/` (`Button`, `Card`, `Badge`, `Modal`) dan palet warna resmi (`#059669`, `#181343`, `#F6AC2F`).

---

## 4. Jebakan Umum (*Common Pitfalls*) & Solusinya

### 1. Kebocoran Data Multi-Tenant (*Data Leakage*)
- **Masalah**: Mengambil data seluruh inisiatif atau proposal tanpa memfilter berdasarkan `companyId` atau `partnerId`.
- **Solusi**: Pastikan selalu menyertakan `eq(table.companyId, authUser.companyId)` pada query perusahaan, dan `eq(table.partnerId, authUser.partnerId)` pada query mitra.

### 2. Presisi Angka Keuangan Rupiah
- **Masalah**: Melakukan operasi matematika langsung pada tipe `DECIMAL` string MySQL dapat memicu *floating point error* (`0.1 + 0.2 = 0.30000000000000004`).
- **Solusi**: Gunakan konversi `Number(val)` atau helper `formatRupiah(val)` untuk presentasi, dan simpan kembali dalam format string numerik murni.

### 3. Autoplay Video di Browser Modern
- **Masalah**: Elemen `<video autoPlay>` gagal berputar otomatis karena kebijakan keamanan browser (*Autoplay Policy*).
- **Solusi**: Video wajib menyertakan atribut `muted={true}`, `defaultMuted={true}`, `playsInline={true}`, serta inisialisasi `videoRef.current.muted = true` di dalam `useEffect`.

### 4. Perintah Verifikasi Kompilasi (Next.js Security Prompt)
- **Kondisi**: Pada versi Next.js tertentu, eksekusi pertama `npm run build` mungkin menampilkan *prompt advisory* keamanan.
- **Solusi**: Cukup jalankan kembali `npm run build` untuk kedua kalinya. Build akan langsung terkompilasi bersih dengan exit code `0`.

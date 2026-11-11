import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema/users";
import { PasswordUtil } from "../common/utils/password";

async function seedSuperAdmin() {
  const adminName = process.env.ADMIN_NAME?.trim() || "Super Admin SIPENA";
  const adminEmail = (process.env.ADMIN_EMAIL?.trim() || "superadmin@sipena.id").toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminPassword = envPassword || "SuperAdmin@2026!";

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD harus minimal 8 karakter.");
  }

  console.log(`[Seed Super Admin] Memeriksa akun dengan email: ${adminEmail}`);

  const existingRows = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  const existing = existingRows[0];

  if (existing) {
    if (existing.role === "SUPER_ADMIN") {
      console.log(
        `[Seed Super Admin] Akun Super Admin sudah tersedia (ID: ${existing.id}, status: ${existing.status}). Tidak ada perubahan.`
      );
      return;
    }

    throw new Error(
      `Email '${adminEmail}' sudah terdaftar dengan role '${existing.role}'. Gunakan ADMIN_EMAIL yang berbeda di .env untuk menghindari penimpaan akun organisasi.`
    );
  }

  const hashedPassword = await PasswordUtil.hash(adminPassword);
  const newId = crypto.randomUUID();

  await db.insert(users).values({
    id: newId,
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    companyId: null,
    partnerId: null,
    position: "Platform Super Admin",
  });

  console.log(`[Seed Super Admin] Akun Super Admin berhasil dibuat!`);
  console.log(`  - ID    : ${newId}`);
  console.log(`  - Nama  : ${adminName}`);
  console.log(`  - Email : ${adminEmail}`);
  console.log(`  - Role  : SUPER_ADMIN`);
  if (!envPassword) {
    console.log(`  - Sandi : Menggunakan sandi bawaan development (set ADMIN_PASSWORD di .env untuk kustomisasi).`);
  }
}

seedSuperAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Seed Super Admin] Gagal:", err instanceof Error ? err.message : err);
    process.exit(1);
  });


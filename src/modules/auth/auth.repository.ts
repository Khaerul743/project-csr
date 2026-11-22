import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { users, User, NewUser } from "@/db/schema/users";
import { emailVerifications, EmailVerification } from "@/db/schema/email-verifications";

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    const result = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = ${cleanEmail}`)
      .limit(1);
    return result[0] ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] ?? null;
  }

  async createUser(data: Omit<NewUser, "id"> & { id?: string }): Promise<User> {
    const userId = data.id ?? crypto.randomUUID();
    const newUser: NewUser = {
      ...data,
      id: userId,
    };

    await db.insert(users).values(newUser);

    const created = await this.findById(userId);
    if (!created) {
      throw new Error("Failed to retrieve created user record");
    }

    return created;
  }

  async updateUser(id: string, data: Partial<NewUser>): Promise<User> {
    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Failed to retrieve updated user record");
    }

    return updated;
  }

  async markEmailVerified(userId: string): Promise<User> {
    return this.updateUser(userId, {
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    });
  }

  async createOrUpdateOtp(email: string, otp: string, expiresAt: Date): Promise<EmailVerification> {
    const cleanEmail = email.trim().toLowerCase();

    // Hapus OTP lama untuk email ini agar selalu fresh
    await db.delete(emailVerifications).where(sql`LOWER(${emailVerifications.email}) = ${cleanEmail}`);

    const id = crypto.randomUUID();
    await db.insert(emailVerifications).values({
      id,
      email: cleanEmail,
      otp,
      attempts: 0,
      expiresAt,
    });

    const rows = await db.select().from(emailVerifications).where(eq(emailVerifications.id, id)).limit(1);
    if (!rows[0]) {
      throw new Error("Gagal menyimpan kode OTP verifikasi");
    }

    return rows[0];
  }

  async findLatestOtp(email: string): Promise<EmailVerification | null> {
    const cleanEmail = email.trim().toLowerCase();
    const rows = await db
      .select()
      .from(emailVerifications)
      .where(sql`LOWER(${emailVerifications.email}) = ${cleanEmail}`)
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);

    return rows[0] ?? null;
  }

  async incrementOtpAttempts(id: string): Promise<void> {
    await db
      .update(emailVerifications)
      .set({
        attempts: sql`${emailVerifications.attempts} + 1`,
      })
      .where(eq(emailVerifications.id, id));
  }

  async deleteOtp(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    await db.delete(emailVerifications).where(sql`LOWER(${emailVerifications.email}) = ${cleanEmail}`);
  }
}

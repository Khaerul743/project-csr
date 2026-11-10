import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, User, NewUser } from "@/db/schema/users";

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
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
}

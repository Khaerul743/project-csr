import { db } from "@/db";
import {
  programActivities,
  ProgramActivity,
  NewProgramActivity,
} from "@/db/schema/program-activities";
import { programs } from "@/db/schema/programs";
import { users } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { ActivityWithDetails } from "./activity.interface";

const submitterUsers = alias(users, "submitter_users");
const verifierUsers = alias(users, "verifier_users");

export class ActivityRepository {
  async create(data: NewProgramActivity): Promise<ProgramActivity> {
    const id = data.id || crypto.randomUUID();
    await db.insert(programActivities).values({
      ...data,
      id,
    });
    const created = await this.findById(id);
    if (!created) {
      throw new Error("Gagal membuat data aktivitas");
    }
    return created;
  }

  async findById(id: string): Promise<ActivityWithDetails | null> {
    const rows = await db
      .select({
        activity: programActivities,
        submitterName: submitterUsers.name,
        submitterRole: submitterUsers.role,
        verifierName: verifierUsers.name,
        programTitle: programs.title,
      })
      .from(programActivities)
      .leftJoin(submitterUsers, eq(programActivities.submittedBy, submitterUsers.id))
      .leftJoin(verifierUsers, eq(programActivities.verifiedBy, verifierUsers.id))
      .leftJoin(programs, eq(programActivities.programId, programs.id))
      .where(eq(programActivities.id, id))
      .limit(1);

    if (!rows[0]) return null;

    const r = rows[0];
    return {
      ...r.activity,
      submitterName: r.submitterName,
      submitterRole: r.submitterRole,
      verifierName: r.verifierName,
      programTitle: r.programTitle,
    };
  }

  async findByProgramId(programId: string): Promise<ActivityWithDetails[]> {
    const rows = await db
      .select({
        activity: programActivities,
        submitterName: submitterUsers.name,
        submitterRole: submitterUsers.role,
        verifierName: verifierUsers.name,
        programTitle: programs.title,
      })
      .from(programActivities)
      .leftJoin(submitterUsers, eq(programActivities.submittedBy, submitterUsers.id))
      .leftJoin(verifierUsers, eq(programActivities.verifiedBy, verifierUsers.id))
      .leftJoin(programs, eq(programActivities.programId, programs.id))
      .where(eq(programActivities.programId, programId))
      .orderBy(desc(programActivities.activityDate), desc(programActivities.createdAt));

    return rows.map((r) => ({
      ...r.activity,
      submitterName: r.submitterName,
      submitterRole: r.submitterRole,
      verifierName: r.verifierName,
      programTitle: r.programTitle,
    }));
  }

  async update(id: string, data: Partial<ProgramActivity>): Promise<ProgramActivity> {
    await db
      .update(programActivities)
      .set(data)
      .where(eq(programActivities.id, id));

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Gagal memperbarui aktivitas");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(programActivities).where(eq(programActivities.id, id));
  }
}

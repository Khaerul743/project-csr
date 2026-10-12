import { eq, and, gt, desc } from "drizzle-orm";
import { db } from "@/db";
import { invitations, Invitation, NewInvitation, InvitationStatus } from "@/db/schema/invitations";
import { users, User } from "@/db/schema/users";
import { companies, Company } from "@/db/schema/companies";
import { partners, Partner } from "@/db/schema/partners";
import { InvitationWithDetails } from "./invitation.interface";

export class InvitationRepository {
  async createInvitation(data: NewInvitation): Promise<Invitation> {
    const id = data.id || crypto.randomUUID();
    await db.insert(invitations).values({
      ...data,
      id,
    });

    const result = await this.findById(id);
    if (!result) {
      throw new Error("Gagal mengambil data undangan setelah dibuat");
    }
    return result;
  }

  async findById(id: string): Promise<Invitation | null> {
    const result = await db.select().from(invitations).where(eq(invitations.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const result = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
    return result[0] ?? null;
  }

  async findActiveByEmailAndCompany(email: string, companyId: string): Promise<Invitation | null> {
    const now = new Date();
    const result = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email.toLowerCase()),
          eq(invitations.companyId, companyId),
          eq(invitations.status, "PENDING"),
          gt(invitations.expiresAt, now)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findByCompanyId(companyId: string): Promise<InvitationWithDetails[]> {
    const rows = await db
      .select({
        invitation: invitations,
        invitedByName: users.name,
      })
      .from(invitations)
      .leftJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.companyId, companyId))
      .orderBy(desc(invitations.createdAt));

    return rows.map((r) => ({
      ...r.invitation,
      invitedByName: r.invitedByName,
    }));
  }

  async findPendingByEmail(email: string): Promise<InvitationWithDetails[]> {
    const now = new Date();
    const rows = await db
      .select({
        invitation: invitations,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        partnerName: partners.name,
        invitedByName: users.name,
      })
      .from(invitations)
      .leftJoin(companies, eq(invitations.companyId, companies.id))
      .leftJoin(partners, eq(invitations.partnerId, partners.id))
      .leftJoin(users, eq(invitations.invitedBy, users.id))
      .where(
        and(
          eq(invitations.email, email.toLowerCase()),
          eq(invitations.status, "PENDING"),
          gt(invitations.expiresAt, now)
        )
      )
      .orderBy(desc(invitations.createdAt));

    return rows.map((r) => ({
      ...r.invitation,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      partnerName: r.partnerName,
      invitedByName: r.invitedByName,
    }));
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<Invitation> {
    await db.update(invitations).set({ status }).where(eq(invitations.id, id));
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Undangan tidak ditemukan setelah pembaruan");
    }
    return updated;
  }

  async acceptInvitationTx(
    invitationId: string,
    userId: string
  ): Promise<{
    updatedUser: User;
    organization: { id: string; name: string; type: "COMPANY" | "PARTNER" };
  }> {
    return await db.transaction(async (tx) => {
      // 1. Ambil data undangan
      const [invitation] = await tx
        .select()
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .limit(1);

      if (!invitation) {
        throw new Error("Data undangan tidak ditemukan");
      }

      // 2. Update status undangan menjadi ACCEPTED
      await tx
        .update(invitations)
        .set({ status: "ACCEPTED" })
        .where(eq(invitations.id, invitationId));

      // 3. Update user
      let orgType: "COMPANY" | "PARTNER" = "COMPANY";
      let orgName = "Organisasi";
      let orgId = "";

      if (invitation.companyId) {
        await tx
          .update(users)
          .set({
            companyId: invitation.companyId,
            role: invitation.role,
          })
          .where(eq(users.id, userId));

        const [company] = await tx
          .select()
          .from(companies)
          .where(eq(companies.id, invitation.companyId))
          .limit(1);

        orgType = "COMPANY";
        orgId = invitation.companyId;
        orgName = company ? company.name : "Perusahaan";
      } else if (invitation.partnerId) {
        await tx
          .update(users)
          .set({
            partnerId: invitation.partnerId,
            role: invitation.role,
          })
          .where(eq(users.id, userId));

        const [partner] = await tx
          .select()
          .from(partners)
          .where(eq(partners.id, invitation.partnerId))
          .limit(1);

        orgType = "PARTNER";
        orgId = invitation.partnerId;
        orgName = partner ? partner.name : "Mitra";
      }

      // 4. Ambil user yang telah diperbarui
      const [updatedUser] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!updatedUser) {
        throw new Error("Gagal mengambil data user yang diperbarui");
      }

      return {
        updatedUser,
        organization: {
          id: orgId,
          name: orgName,
          type: orgType,
        },
      };
    });
  }

  async cancelInvitation(id: string, companyId: string): Promise<void> {
    await db
      .update(invitations)
      .set({ status: "CANCELLED" })
      .where(and(eq(invitations.id, id), eq(invitations.companyId, companyId)));
  }
}

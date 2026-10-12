import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.string().email("Format email tidak valid").max(255),
  role: z.enum(["CSR_ADMIN", "MANAGEMENT"]).default("CSR_ADMIN"),
});

export const acceptInvitationSchema = z
  .object({
    invitationId: z.string().uuid("ID undangan tidak valid").optional(),
    token: z.string().min(1, "Token undangan tidak valid").optional(),
  })
  .refine((data) => Boolean(data.invitationId || data.token), {
    message: "Harus menyertakan invitationId atau token undangan",
    path: ["invitationId"],
  });

export const rejectInvitationSchema = z.object({
  invitationId: z.string().uuid("ID undangan tidak valid"),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type RejectInvitationInput = z.infer<typeof rejectInvitationSchema>;

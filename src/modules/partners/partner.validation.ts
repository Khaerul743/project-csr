import { z } from "zod";

export const createPartnerSchema = z.object({
  name: z.string().min(2, "Partner name must be at least 2 characters").max(150),
  description: z.string().max(2000).optional().nullable(),
  email: z.string().email("Invalid email format").max(255).optional().nullable().or(z.literal("")),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  address: z.string().max(1000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  website: z.string().url("Invalid website URL").max(255).optional().nullable().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").optional().nullable().or(z.literal("")),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;

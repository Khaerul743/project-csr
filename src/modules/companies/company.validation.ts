import { z } from "zod";

export const csrLeaderItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama PIC/Pimpinan CSR wajib diisi").max(150),
  role: z.string().min(1, "Jabatan PIC wajib diisi").max(100),
  email: z.string().email("Format email PIC tidak valid").optional().nullable().or(z.literal("")),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  photoUrl: z.string().max(1000).optional().nullable().or(z.literal("")),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(150),
  tagline: z.string().max(255).optional().nullable().or(z.literal("")),
  description: z.string().max(4000).optional().nullable().or(z.literal("")),
  csrVision: z.string().max(4000).optional().nullable().or(z.literal("")),
  industry: z.string().max(100).optional().nullable().or(z.literal("")),
  companySize: z.string().max(50).optional().nullable().or(z.literal("")),
  foundedYear: z
    .union([z.number().int().min(1800).max(2100), z.string().transform((v) => (v ? parseInt(v, 10) : null))])
    .optional()
    .nullable(),
  email: z.string().email("Invalid email format").max(255).optional().nullable().or(z.literal("")),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  address: z.string().max(1000).optional().nullable().or(z.literal("")),
  city: z.string().max(100).optional().nullable().or(z.literal("")),
  province: z.string().max(100).optional().nullable().or(z.literal("")),
  website: z.string().max(255).optional().nullable().or(z.literal("")),
  logoUrl: z.string().max(1000).optional().nullable().or(z.literal("")),
  coverUrl: z.string().max(1000).optional().nullable().or(z.literal("")),
  nibNumber: z.string().max(50).optional().nullable().or(z.literal("")),
  npwpNumber: z.string().max(50).optional().nullable().or(z.literal("")),
  sustainabilityReportUrl: z.string().max(1000).optional().nullable().or(z.literal("")),
  instagramUrl: z.string().max(255).optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().max(255).optional().nullable().or(z.literal("")),
  csrLeaders: z.union([z.array(csrLeaderItemSchema), z.string()]).optional().nullable(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

import { z } from "zod";
import { csrFocusAreaEnum } from "@/db/schema/csr-focus-areas";

const pastActivityItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Judul kegiatan minimal 2 karakter"),
  year: z.union([z.number(), z.string()]),
  clientSponsor: z.string().optional().nullable(),
  beneficiaries: z.string().optional().nullable(),
  description: z.string().min(5, "Deskripsi kegiatan minimal 5 karakter"),
  photoUrl: z.string().optional().nullable(),
});

const teamMemberItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama anggota minimal 2 karakter"),
  role: z.string().min(2, "Jabatan minimal 2 karakter"),
  photoUrl: z.string().optional().nullable(),
});

export const createPartnerSchema = z.object({
  name: z.string().min(2, "Partner name must be at least 2 characters").max(150),
  tagline: z.string().max(255).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  email: z.string().email("Invalid email format").max(255).optional().nullable().or(z.literal("")),
  phone: z.string().max(30).optional().nullable().or(z.literal("")),
  address: z.string().max(1000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  website: z.string().max(255).optional().nullable().or(z.literal("")),
  logoUrl: z.string().optional().nullable().or(z.literal("")),
  coverUrl: z.string().optional().nullable().or(z.literal("")),
  organizationType: z.string().max(100).optional().nullable(),
  foundedYear: z.union([z.number(), z.string()]).transform((val) => {
    if (!val) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }).optional().nullable(),
  legalNumber: z.string().max(150).optional().nullable(),
  npwpNumber: z.string().max(100).optional().nullable(),
  instagramUrl: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().max(255).optional().nullable(),
  youtubeUrl: z.string().max(255).optional().nullable(),
  portfolioDocUrl: z.string().max(500).optional().nullable(),
  pastActivities: z
    .union([z.array(pastActivityItemSchema), z.string()])
    .optional()
    .nullable(),
  teamMembers: z
    .union([z.array(teamMemberItemSchema), z.string()])
    .optional()
    .nullable(),
  focusArea: z.enum(csrFocusAreaEnum).optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;

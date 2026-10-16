import { z } from "zod";

export const createReviewSchema = z.object({
  reviewerName: z
    .string()
    .min(2, "Nama Anda minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  reviewerRole: z
    .string()
    .min(2, "Status/peran penerima manfaat wajib diisi")
    .max(100, "Status/peran maksimal 100 karakter"),
  reviewerCity: z.string().max(100, "Kota/kabupaten maksimal 100 karakter").optional().nullable(),
  rating: z
    .number()
    .int("Rating harus berupa bilangan bulat")
    .min(1, "Rating minimal 1 bintang")
    .max(5, "Rating maksimal 5 bintang"),
  comment: z
    .string()
    .min(10, "Ulasan/testimoni minimal 10 karakter")
    .max(1500, "Ulasan maksimal 1500 karakter"),
  photoUrl: z.string().max(500, "URL foto maksimal 500 karakter").optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

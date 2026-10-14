import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Pesan tidak boleh kosong")
    .max(5000, "Pesan maksimal 5000 karakter"),
  attachmentUrl: z.string().max(500).optional().nullable(),
  attachmentName: z.string().max(255).optional().nullable(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

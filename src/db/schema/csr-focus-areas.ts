export const csrFocusAreaEnum = [
  "LINGKUNGAN",
  "PENDIDIKAN",
  "KESEHATAN",
  "PEMBERDAYAAN_EKONOMI",
  "INFRASTRUKTUR_SOSIAL",
  "TANGGAP_BENCANA",
  "LAINNYA",
] as const;

export type CsrFocusArea = (typeof csrFocusAreaEnum)[number];

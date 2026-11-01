/**
 * Utility untuk memeriksa status aktif/nonaktif fitur AI di seluruh platform.
 *
 * Konfigurasi ENV yang didukung:
 * - NEXT_PUBLIC_ENABLE_AI : Dapat diakses di browser (client-side) dan server-side.
 * - ENABLE_AI_FEATURES    : Dapat diakses di backend (server-side).
 *
 * Nilai yang dianggap AKTIF: "true", "1", "yes", "on", atau default jika tidak diisi.
 * Nilai yang dianggap NONAKTIF: "false", "0", "no", "off", "disable", "disabled".
 */
export function isAiFeatureEnabled(): boolean {
  // 1. Ambil nilai client-side jika tersedia
  const clientVal = process.env.NEXT_PUBLIC_ENABLE_AI;

  // 2. Ambil nilai server-side jika tersedia di runtime Node.js
  const serverVal =
    typeof process !== "undefined" && process.env
      ? process.env.ENABLE_AI_FEATURES
      : undefined;

  // Prioritaskan nilai server jika ada, fallback ke clientVal, default ke 'true'
  const resolved = (serverVal ?? clientVal ?? "true").trim().toLowerCase();

  const isExplicitlyDisabled = [
    "false",
    "0",
    "no",
    "off",
    "disable",
    "disabled",
  ].includes(resolved);

  return !isExplicitlyDisabled;
}

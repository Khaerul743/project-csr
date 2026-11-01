import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Sanitasi DATABASE_URL agar aman dari tanda petik (quotes) yang tidak sengaja
 * ter-copy ke Vercel Environment Variables, serta aman dari crash ERR_INVALID_URL
 * saat proses build static page data collection di Vercel.
 */
function getSanitizedDatabaseUrl(): string {
  let url = (process.env.DATABASE_URL || "").trim();

  // Bersihkan tanda petik tunggal atau ganda di awal dan akhir URL
  while (
    (url.startsWith("'") && url.endsWith("'")) ||
    (url.startsWith('"') && url.endsWith('"'))
  ) {
    url = url.slice(1, -1).trim();
  }

  // Fallback aman untuk build runner jika DATABASE_URL kosong saat build
  if (!url || !url.startsWith("mysql://")) {
    return "mysql://build_user:build_pass@127.0.0.1:3306/defaultdb";
  }

  return url;
}

const pool = mysql.createPool(getSanitizedDatabaseUrl());

export const db = drizzle({
  client: (pool as any).pool ?? pool,
});

export type DbClient = typeof db;
export { schema };


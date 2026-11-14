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

function createMySqlPool(): mysql.Pool {
  const dbUrl = getSanitizedDatabaseUrl();

  return mysql.createPool({
    uri: dbUrl,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000, // Bersihkan koneksi idle sebelum diputus oleh TiDB Serverless gateway
    enableKeepAlive: true, // TCP keep-alive aktif untuk mencegah zombie connection di cloud database
    keepAliveInitialDelay: 10000, // Deteksi keep-alive setiap 10 detik
    connectTimeout: 20000,
  });
}

// Singleton pattern di Next.js dev server untuk mencegah kebocoran koneksi akibat hot module reload (HMR)
const globalForDb = globalThis as unknown as {
  _mysqlPool?: mysql.Pool;
  _drizzleDb?: ReturnType<typeof drizzle>;
};

export const pool = globalForDb._mysqlPool ?? createMySqlPool();

export const db =
  globalForDb._drizzleDb ??
  drizzle({
    client: (pool as any).pool ?? pool,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._mysqlPool = pool;
  globalForDb._drizzleDb = db;
}

export type DbClient = typeof db;
export { schema };


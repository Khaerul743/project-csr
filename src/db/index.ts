import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool(process.env.DATABASE_URL!);

export const db = drizzle({
  client: (pool as any).pool ?? pool,
});

export type DbClient = typeof db;
export { schema };

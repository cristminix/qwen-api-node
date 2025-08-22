import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./schema"

// Membuat koneksi ke database SQLite
const sqlite = new Database("db.sqlite")

// Membuat instance drizzle dengan skema
export const db = drizzle(sqlite, { schema })

export type DB = typeof db

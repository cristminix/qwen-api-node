import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"

// Tabel untuk menyimpan hasil upload file
export const uploadedFiles = sqliteTable("uploaded_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filePath: text("file_path").notNull().unique(),
  fileUrl: text("file_url").notNull(),
  fileId: text("file_id").notNull(),
  crc: text("crc").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

// Tabel untuk menyimpan penggunaan API
export const usages = sqliteTable("usages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  date: text("date").notNull(), // Format: 2020-09-09
  connections: integer("connections").notNull(),
  tokens: integer("tokens").notNull(), // Big number
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

// Tipe untuk hasil upload
export type UploadedFile = typeof uploadedFiles.$inferSelect
export type NewUploadedFile = typeof uploadedFiles.$inferInsert

// Tipe untuk penggunaan API
export type Usage = typeof usages.$inferSelect
export type NewUsage = typeof usages.$inferInsert

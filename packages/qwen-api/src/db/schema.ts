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

// Tipe untuk hasil upload
export type UploadedFile = typeof uploadedFiles.$inferSelect
export type NewUploadedFile = typeof uploadedFiles.$inferInsert

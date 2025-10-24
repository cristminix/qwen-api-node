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
  ipaddr: text("ipaddr"),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
})

// Tabel untuk menyimpan percakapan Kimi
export const kimiChat = sqliteTable("kimi_chat", {
  chatId: text("chat_id").primaryKey().notNull(),
  lastUserMessageId: text("last_user_message_id"),
  lastAssistantMessageId: text("last_assistant_message_id"),
  checksum: text("checksum", { mode: "json" }).$type<string[]>(),
  sessionId: text("session_id").notNull(),
  history: text("history", { mode: "json" }).$type<any[]>(),
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

// Tipe untuk penggunaan API
export type Usage = typeof usages.$inferSelect
export type NewUsage = typeof usages.$inferInsert

// Tipe untuk percakapan Kimi
export type KimiChat = typeof kimiChat.$inferSelect
export type NewKimiChat = typeof kimiChat.$inferInsert

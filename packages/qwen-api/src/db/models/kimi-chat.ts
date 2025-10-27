import { eq, and, sql } from "drizzle-orm"
import { db } from "../index"
import { kimiChat, type NewKimiChat, type KimiChat } from "../schema"

/**
 * Menyimpan percakapan Kimi ke database
 * @param chatData Data percakapan Kimi
 * @returns Data percakapan Kimi yang disimpan
 */
export async function saveKimiChat(chatData: NewKimiChat): Promise<KimiChat> {
    const newKimiChat: NewKimiChat = {
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const result: KimiChat[] = await db
        .insert(kimiChat)
        .values(newKimiChat)
        .returning()
    return result[0]
}

/**
 * Mendapatkan percakapan Kimi dari database berdasarkan chatId
 * @param chatId ID percakapan Kimi
 * @returns Data percakapan Kimi jika ditemukan, null jika tidak
 */
export async function getKimiChatByChatId(chatId: string): Promise<KimiChat | null> {
    const result: KimiChat[] = await db
        .select()
        .from(kimiChat)
        .where(eq(kimiChat.chatId, chatId))
    return result.length > 0 ? result[0] : null
}

/**
 * Mendapatkan percakapan Kimi dari database berdasarkan sessionId
 * @param sessionId ID sesi percakapan Kimi
 * @returns Array dari data percakapan Kimi
 */
export async function getKimiChatBySessionId(sessionId: string): Promise<KimiChat[]> {
    const result: KimiChat[] = await db
        .select()
        .from(kimiChat)
        .where(eq(kimiChat.sessionId, sessionId))
    return result
}

/**
 * Mendapatkan percakapan Kimi dari database berdasarkan checksum
 * @param hexChecksum Nilai checksum untuk dicari dalam array checksum
 * @returns Array dari data percakapan Kimi yang mengandung checksum tersebut
 */
export async function getKimiChatByChecksum(hexChecksum: string): Promise<KimiChat> {
    // Query untuk mencari record di mana array checksum mengandung hexChecksum yang ditentukan
    const result: KimiChat[] = await db
        .select()
        .from(kimiChat)
        .where(
            sql`EXISTS (
        SELECT 1
        FROM json_each(${kimiChat.checksum})
        WHERE json_each.value = ${hexChecksum}
      )`
        )
    const [row] = result
    return row
}

/**
 * Memperbarui percakapan Kimi di database
 * @param chatId ID percakapan Kimi yang akan diperbarui
 * @param chatData Data percakapan Kimi yang baru
 * @returns Data percakapan Kimi yang diperbarui
 */
export async function updateKimiChat(chatId: string, chatData: Partial<NewKimiChat>): Promise<KimiChat> {
    const updatedData: Partial<KimiChat> = {
        ...chatData,
        updatedAt: new Date(),
    }

    const result: KimiChat[] = await db
        .update(kimiChat)
        .set(updatedData)
        .where(eq(kimiChat.chatId, chatId))
        .returning()
    return result[0]
}

/**
 * Memperbarui timestamp updatedAt untuk percakapan Kimi
 * @param chatId ID percakapan Kimi
 * @returns Data percakapan Kimi yang diperbarui
 */
export async function updateKimiChatTimestamp(chatId: string): Promise<KimiChat> {
    const result: KimiChat[] = await db
        .update(kimiChat)
        .set({ updatedAt: new Date() })
        .where(eq(kimiChat.chatId, chatId))
        .returning()
    return result[0]
}

/**
 * Menghapus percakapan Kimi dari database berdasarkan chatId
 * @param chatId ID percakapan Kimi yang akan dihapus
 * @returns Jumlah record yang dihapus
 */
export async function deleteKimiChatByChatId(chatId: string): Promise<number> {
    const result = await db.delete(kimiChat).where(eq(kimiChat.chatId, chatId))
    return result.changes
}

/**
 * Menghapus semua percakapan Kimi berdasarkan sessionId
 * @param sessionId ID sesi percakapan Kimi yang akan dihapus
 * @returns Jumlah record yang dihapus
 */
export async function deleteKimiChatBySessionId(sessionId: string): Promise<number> {
    const result = await db.delete(kimiChat).where(eq(kimiChat.sessionId, sessionId))
    return result.changes
}

/**
 * Mendapatkan semua percakapan Kimi dari database
 * @returns Array dari data percakapan Kimi
 */
export async function getAllKimiChats(): Promise<KimiChat[]> {
    const result: KimiChat[] = await db.select().from(kimiChat)
    return result
}

/**
 * Memeriksa apakah percakapan Kimi sudah ada di database
 * @param chatId ID percakapan Kimi
 * @returns true jika sudah ada, false jika belum
 */
export async function kimiChatExists(chatId: string): Promise<boolean> {
    const result = await getKimiChatByChatId(chatId)
    return result !== null
}
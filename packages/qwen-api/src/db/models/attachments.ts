import { eq } from "drizzle-orm"
import { db } from "../index"
import {
  uploadedFiles,
  type NewUploadedFile,
  type UploadedFile,
} from "../schema"

/**
 * Menyimpan hasil upload file ke database
 * @param filePath Path file yang diupload
 * @param fileUrl URL file yang diupload
 * @param fileId ID file yang diupload
 * @returns Data file yang disimpan
 */
export async function saveUploadedFile(
  filePath: string,
  fileUrl: string,
  fileId: string,
  crc: string
): Promise<UploadedFile> {
  const newUploadedFile: NewUploadedFile = {
    filePath,
    fileUrl,
    fileId,
    createdAt: new Date(),
    updatedAt: new Date(),
    crc,
  }

  const result: UploadedFile[] = await db
    .insert(uploadedFiles)
    .values(newUploadedFile)
    .returning()
  return result[0]
}

/**
 * Mendapatkan hasil upload file dari database berdasarkan filePath
 * @param filePath Path file yang diupload
 * @returns Data file jika ditemukan, null jika tidak
 */
export async function getUploadedFileByPath(
  filePath: string
): Promise<UploadedFile | null> {
  const result: UploadedFile[] = await db
    .select()
    .from(uploadedFiles)
    .where(eq(uploadedFiles.filePath, filePath))
  return result.length > 0 ? result[0] : null
}

/**
 * Mendapatkan hasil upload file dari database berdasarkan CRC32
 * @param crc CRC32 file yang diupload
 * @returns Data file jika ditemukan, null jika tidak
 */
export async function getUploadedFileByCrc(
  crc: string
): Promise<UploadedFile | null> {
  const result: UploadedFile[] = await db
    .select()
    .from(uploadedFiles)
    .where(eq(uploadedFiles.crc, crc))
  return result.length > 0 ? result[0] : null
}

/**
 * Memperbarui timestamp updatedAt untuk file yang sudah ada
 * @param filePath Path file yang diupload
 * @returns Data file yang diperbarui
 */
export async function updateUploadedFileTimestamp(
  filePath: string
): Promise<UploadedFile> {
  const result: UploadedFile[] = await db
    .update(uploadedFiles)
    .set({ updatedAt: new Date() })
    .where(eq(uploadedFiles.filePath, filePath))
    .returning()
  return result[0]
}

/**
 * Menghapus record file dari database berdasarkan ID
 * @param id ID file yang akan dihapus
 * @returns Jumlah record yang dihapus
 */
export async function deleteFileById(id: number): Promise<number> {
  const result = await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id))
  return result.changes
}

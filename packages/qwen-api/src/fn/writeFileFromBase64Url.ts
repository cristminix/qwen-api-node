/**
 * Menulis file dari URL base64.
 *
 * @param {string} base64Url - URL base64 yang akan dikonversi dan ditulis ke file.
 * @param {string} filePath - Path file tujuan.
 * @returns {Promise<void>} Promise yang akan resolved setelah file ditulis.
 */
import fs from "fs"
import { getFileExtensionFromBase64Url } from "./getFileExtensionFromBase64Url"
export async function writeFileFromBase64Url(base64Url: string) {
  // Menghapus prefix "data:image/..." dari URL base64
  const base64Data = base64Url.split(",")[1]

  // Mengonversi base64 ke buffer
  const buffer = Buffer.from(base64Data, "base64")

  // Menulis buffer ke file
  const filePath = `tmp-file.png`
  try {
    await fs.writeFileSync(filePath, buffer)
  } catch (error) {
    throw new Error(`Cant save file ${filePath}`)
  }
  return filePath
}

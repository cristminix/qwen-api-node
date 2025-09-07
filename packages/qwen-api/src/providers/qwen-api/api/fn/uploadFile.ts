import path from "path"
import fs from "fs"
import { UploadResult } from "../types"
import OSS from "ali-oss"
import crc32 from "fast-crc32c"
import {
  getUploadedFileByPath,
  getUploadedFileByCrc,
  saveUploadedFile,
  deleteFileById,
} from "../../../../db/models/attachments"
import { UploadedFile } from "../../../../db/schema"

function isFileExpired(existingFile: UploadedFile) {
  // Check if file was created less than 5 minutes ago (300000 milliseconds)
  const fiveMinutesInMillis = 5 * 60 * 1000
  // Handle case where createdAt might be stored in seconds instead of milliseconds
  let createAt = existingFile.createdAt.getTime()
  // If timestamp is in seconds (less than 13 digits), convert to milliseconds
  if (createAt < 1000000000000) {
    createAt = createAt * 1000
  }
  const currentTime = new Date().getTime()
  const fileAgeInMillis = currentTime - createAt
  const expired = fileAgeInMillis > fiveMinutesInMillis
  console.log({
    createAt,
    currentTime,
    existingFile,
    fileAgeInMillis,
    fiveMinutesInMillis,
    expired,
  })
  return expired
}

async function uploadFile(
  filePath: string,
  client: any
): Promise<UploadResult> {
  // Memeriksa apakah file sudah diupload sebelumnya berdasarkan path
  let existingFile: UploadedFile | null = await getUploadedFileByPath(filePath)
  let fileExpired = true
  if (existingFile) {
    fileExpired = isFileExpired(existingFile)
  }

  // Jika tidak ditemukan berdasarkan path, cek berdasarkan CRC32
  let fileCrc = ""
  if (!existingFile) {
    fileCrc = crc32.calculate(await fs.readFileSync(filePath)).toString("16")
    existingFile = await getUploadedFileByCrc(fileCrc)
    if (existingFile) {
      fileExpired = isFileExpired(existingFile)
    }
  }
  if (fileExpired && existingFile) {
    // delete record
    await deleteFileById(existingFile.id)
    // delete file
    try {
      fs.unlinkSync(existingFile.filePath)
    } catch (error) {
      console.error(error)
    }
  }
  if (!fileExpired && existingFile) {
    // console.log("here")
    if (existingFile.filePath !== filePath) {
      try {
        fs.unlinkSync(filePath)
      } catch (error) {
        console.error(error)
      }
    }
    return {
      file_url: existingFile.fileUrl,
      file_id: existingFile.fileId,
    }
  }
  const fileName = path.basename(filePath)
  const stats = fs.statSync(filePath)
  const fileSize = stats.size

  // Menghitung CRC32 dari file

  const stsResponse = await client.post("/api/v1/files/getstsToken", {
    filename: fileName,
    filesize: fileSize,
    filetype: "file",
  })

  const stsData = stsResponse.data
  if (!stsData.access_key_id) {
    throw new Error("Failed to get STS token from Qwen API.")
  }

  const ossClient = new OSS({
    region: stsData.region,
    accessKeyId: stsData.access_key_id,
    accessKeySecret: stsData.access_key_secret,
    stsToken: stsData.security_token,
    bucket: stsData.bucketname,
    endpoint: `https://${stsData.region}.aliyuncs.com`,
  })

  const uploadResult = await ossClient.put(stsData.file_path, filePath)

  if (uploadResult.res.status !== 200) {
    throw new Error(
      `Failed to upload file to OSS. Status: ${uploadResult.res.status}`
    )
  }

  // Menyimpan hasil upload ke database
  await saveUploadedFile(filePath, stsData.file_url, stsData.file_id, fileCrc)

  return {
    file_url: stsData.file_url,
    file_id: stsData.file_id,
  }
}

export default uploadFile

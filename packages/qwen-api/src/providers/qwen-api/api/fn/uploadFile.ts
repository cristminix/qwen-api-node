import path from "path"
import fs from "fs"
import { UploadResult } from "../types"
import OSS from "ali-oss"

async function uploadFile(filePath: string, client): Promise<UploadResult> {
  const fileName = path.basename(filePath)
  const stats = fs.statSync(filePath)
  const fileSize = stats.size

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

  return {
    file_url: stsData.file_url,
    file_id: stsData.file_id,
  }
}

export default uploadFile

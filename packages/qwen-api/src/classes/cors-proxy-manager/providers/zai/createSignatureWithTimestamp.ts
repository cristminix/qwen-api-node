import { sha256 } from "js-sha256"
export const createSignatureWithTimestamp = (e: string, t: string) => {
  const currentTime = Date.now(),
    currentTimeString = String(currentTime),
    dataString = `${e}|${t}|${currentTimeString}`,
    timeWindow = Math.floor(currentTime / (5 * 60 * 1e3)),
    baseSignature = sha256.hmac("junjie", `${timeWindow}`)
  return {
    signature: sha256.hmac(baseSignature, dataString).toString(),
    timestamp: currentTime,
  }
}

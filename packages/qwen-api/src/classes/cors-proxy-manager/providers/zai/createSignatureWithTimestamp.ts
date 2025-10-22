import { sha256 } from "js-sha256"
export const createSignatureWithTimestamp_old = (
  inputString: string,
  dataString: string,
  timestamp: any
) => {
  const timestampNumber = Number(timestamp),
    timestampString = timestamp,
    textEncoder = new TextEncoder(),
    encodedData = textEncoder.encode(dataString),
    base64EncodedData = btoa(String.fromCharCode(...encodedData)),
    signatureData = `${inputString}|${base64EncodedData}|${timestampString}`,
    timeSlot = Math.floor(timestampNumber / (5 * 60 * 1e3)),
    hmacKey = sha256.hmac("junjie", `${timeSlot}`),
    signature = sha256.hmac(hmacKey, signatureData).toString()
  return (
    textEncoder.encode(signatureData),
    {
      signature: signature,
      timestamp: timestampString,
    }
  )
}

export const createSignatureWithTimestamp = (
  inputString,
  lastUserMessageContent,
  tstamp
) => {
  // t = H,
  const timestampNumber = Number(tstamp),
    timestampString = tstamp,
    textEncoder = new TextEncoder(),
    encodedData = textEncoder.encode(lastUserMessageContent),
    base64EncodedData = btoa(String.fromCharCode(...encodedData)),
    signatureData = `${inputString}|${base64EncodedData}|${timestampString}`,
    timeSlot = Math.floor(timestampNumber / (5 * 60 * 1e3)),
    hmacKey = sha256.hmac("key-@@@@)))()((9))-xxxx&&&%%%%%", `${timeSlot}`),
    signature = sha256.hmac(hmacKey, signatureData).toString()
  return (
    textEncoder.encode(signatureData),
    {
      signature: signature,
      timestamp: timestampString,
    }
  )
}

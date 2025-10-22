import { prepareAuthParams } from "./prepareAuthParams"
import { createSignatureWithTimestamp } from "./createSignatureWithTimestamp"

/**
 * Get endpoint URL and signature for ZAI API request
 *
 * @param token - Authentication token
 * @param userId - User ID
 * @param userPrompt - User prompt/message
 * @returns Tuple containing endpoint URL, signature, and timestamp
 */
export function getEndpointSignature(
  baseUrl: string,
  token: string,
  userId: string,
  userPrompt: string
): [string, string, number] {
  // Get auth parameters
  const authParams = prepareAuthParams(token, userId)
  const sortedPayload = authParams.sortedPayload
  const urlParams = authParams.urlParams
  const aTstamp = authParams.timestamp

  // debug.log(f"Prompt:{userPrompt}")
  const lastUserPrompt = userPrompt.trim()

  // Create signature with timestamp
  const signatureData = createSignatureWithTimestamp(
    sortedPayload,
    lastUserPrompt,
    aTstamp
  )
  const signature = signatureData.signature
  const timestamp = signatureData.timestamp

  // Construct the endpoint URL
  const API_ENDPOINT = `${baseUrl}/api/chat/completions`
  const endpoint = `${API_ENDPOINT}?${urlParams}&signature_timestamp=${timestamp}`

  return [endpoint, signature, timestamp]
}

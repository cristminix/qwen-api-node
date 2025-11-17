import { v1 } from "uuid"

/**
 * Builds request headers for ZAI API requests
 * @param token - Authentication token
 * @param signature - Request signature
 * @returns Object containing request headers
 */
export function buildRequestHeaders(
  token: string,
  signature: string
): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
    // "sec-ch-ua":
    //   '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    // "sec-ch-ua-mobile": "?0",
    // "sec-ch-ua-platform": '"Linux"',
    // "sec-fetch-dest": "empty",
    // "sec-fetch-mode": "cors",
    // "sec-fetch-site": "same-origin",
    "x-fe-version": "prod-fe-1.0.128",
    "x-signature": signature,
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "accept-language": "en-US",
    Referer: "https://chat.z.ai",
  }
}

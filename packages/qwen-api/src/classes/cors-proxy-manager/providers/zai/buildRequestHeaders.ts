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
    "x-fe-version": "prod-fe-1.0.95",
    "x-signature": signature,
  }
}

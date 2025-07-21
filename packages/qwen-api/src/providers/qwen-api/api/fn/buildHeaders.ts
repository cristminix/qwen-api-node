function buildHeaders(
  authToken: string,
  cookie: string
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    Host: "chat.qwen.ai",
    Origin: "https://chat.qwen.ai",
  }
}
export default buildHeaders

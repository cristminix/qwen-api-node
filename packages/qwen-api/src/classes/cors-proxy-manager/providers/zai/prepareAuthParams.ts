import { v1 } from "uuid"

export const prepareAuthParams = (token: string, userId: string) => {
  const currentTime = String(Date.now()),
    requestId = v1(),
    basicParams = {
      timestamp: currentTime,
      requestId,
      user_id: userId,
    },
    additionalParams = {
      version: "0.0.1",
      platform: "web",
      token,
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      language: "en-US",
      languages: "en-US,en",
      timezone: "Asia/Jakarta",
      cookie_enabled: "true",
      screen_width: "1920",
      screen_height: "1080",
      screen_resolution: "1920x1080",
      viewport_height: "900",
      viewport_width: "1440",
      viewport_size: "1440x900",
      color_depth: "24",
      pixel_ratio: "1",
      current_url: "https://chat.z.ai/c/e1295904-98d3-4d85-b6ee-a211471101e9",
      pathname: "/",
      search: "",
      hash: "",
      host: "z.ai",
      hostname: "chat.z.ai",
      protocol: "https",
      referrer: "https://accounts.google.com/",
      title: "Qwen API Client",
      timezone_offset: String(new Date().getTimezoneOffset()),
      local_time: new Date().toISOString(),
      utc_time: new Date().toUTCString(),
      is_mobile: false, //jr().toString(),
      is_touch: false, //String("ontouchstart" in window),
      max_touch_points: "5",
      browser_name: "Chrome", //q.browserName,
      os_name: "Linux", //q.osName
    },
    allParams = {
      ...basicParams,
      ...additionalParams,
    },
    urlSearchParams = new URLSearchParams()
  Object.entries(allParams).forEach(([key, value]) => {
    urlSearchParams.append(key, String(value))
  })
  const urlParamsString = urlSearchParams.toString()
  return {
    sortedPayload: Object.entries(basicParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .join(","),
    urlParams: urlParamsString,
    timestamp: currentTime,
  }
}

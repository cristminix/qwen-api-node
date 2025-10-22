export function getAbTestConfig(authInfo: any) {
  const url = "https://tab.volces.com/service/2/abtest_config/"
  const { sub } = authInfo
  const payload = {
    header: {
      aid: 20001731,
      user_unique_id: sub,
      web_id: "7561991421616617216",
      app_id: 20001731,
      os_name: "Linux",
      device_model: "",
      language: "en-US",
      platform: "web",
      sdk_version: "5.1.12_tob",
      sdk_lib: "js",
      timezone: 7,
      tz_offset: -25200,
      resolution: "1920x1200",
      browser: "Chrome",
      browser_version: "140.0.0.0",
      referrer: "",
      referrer_host: "",
      width: 1920,
      height: 1200,
      screen_width: 1920,
      screen_height: 1200,
      custom: {},
      ab_sdk_version: "362441,320783",
      ab_url: "https://www.kimi.com/",
    },
  }
}

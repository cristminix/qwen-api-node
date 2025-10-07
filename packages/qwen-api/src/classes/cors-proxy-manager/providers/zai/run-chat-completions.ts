import { v1 } from "uuid"
import { makeStreamCompletion } from "./makeStreamCompletion"
import { createSignatureWithTimestamp } from "./createSignatureWithTimestamp"
import { prepareAuthParams } from "./prepareAuthParams"
import dotenv from "dotenv"
dotenv.config()
const main = async () => {
  const token = process.env.GLM_TOKEN
  if (!token) {
    throw new Error("GLM_TOKEN environment variable is not set")
  }

  const userId = v1() // "438a7d70-66fd-4bc2-b889-b23456a59035" //((l = de(pe)) == null ? void 0 : l.id) || "",

  const { sortedPayload, urlParams } = prepareAuthParams(token, userId)
  const userPrompt = "mengapa bumi datar?"
  console.log(`Prompt:${userPrompt}`)
  let lastUserPrompt = userPrompt.trim()
  const { signature, timestamp } = createSignatureWithTimestamp(
    sortedPayload,
    lastUserPrompt
  )
  const endpoint = `https://chat.z.ai/api/chat/completions?${urlParams}&signature_timestamp=${timestamp}`

  const body = {
    stream: true,
    model: "GLM-4-6-API-V1",
    messages: [
      //   { role: "user", content: "hi" },

      { role: "user", content: userPrompt },
    ],
    params: {},
    features: {
      image_generation: false,
      web_search: false,
      auto_web_search: false,
      preview_mode: true,
      flags: [],
      features: [],
      enable_thinking: false,
    },
    // variables: {
    //   "{{USER_NAME}}": "sutoyocutez",
    //   "{{USER_LOCATION}}": "Unknown",
    //   "{{CURRENT_DATETIME}}": "2025-10-07 17:16:07",
    //   "{{CURRENT_DATE}}": "2025-10-07",
    //   "{{CURRENT_TIME}}": "17:16:07",
    //   "{{CURRENT_WEEKDAY}}": "Tuesday",
    //   "{{CURRENT_TIMEZONE}}": "Asia/Jakarta",
    //   "{{USER_LANGUAGE}}": "en-US",
    // },
    // model_item: {
    //   id: "GLM-4-6-API-V1",
    //   name: "GLM-4.6",
    //   owned_by: "openai",
    //   openai: {
    //     id: "GLM-4-6-API-V1",
    //     name: "GLM-4-6-API-V1",
    //     owned_by: "openai",
    //     openai: { id: "GLM-4-6-API-V1" },
    //     urlIdx: 1,
    //   },
    //   //   urlIdx: 1,
    //   //   info: {
    //   //     id: "GLM-4-6-API-V1",
    //   //     user_id: "a3856153-cf5b-49ea-a336-e26669288071",
    //   //     base_model_id: null,
    //   //     name: "GLM-4.6",
    //   //     params: { max_tokens: 195000 },
    //   //     meta: {
    //   //       profile_image_url: "/static/favicon.png",
    //   //       description: "Most advanced model, excelling in all-round tasks",
    //   //       capabilities: {
    //   //         vision: false,
    //   //         citations: false,
    //   //         preview_mode: false,
    //   //         web_search: true,
    //   //         language_detection: false,
    //   //         restore_n_source: false,
    //   //         mcp: true,
    //   //         file_qa: true,
    //   //         returnFc: true,
    //   //         returnThink: true,
    //   //         think: true,
    //   //       },
    //   //       mcpServerIds: [],
    //   //       suggestion_prompts: [],
    //   //       tags: [{ name: "NEW" }],
    //   //     },
    //   //     access_control: null,
    //   //     is_active: true,
    //   //     updated_at: 1759638683,
    //   //     created_at: 1759042473,
    //   //   },
    //   actions: [],
    //   tags: [{ name: "NEW" }],
    // },
    chat_id: v1(),
    id: v1(),
  }
  /*
    https://chat.z.ai/api/chat/completions?timestamp=1759832167211&requestId=d08d2966-6eb8-4c42-81c9-b29f92cdde7d&user_id=438a7d70-66fd-4bc2-b889-b23456a59035&version=0.0.1&platform=web&token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzOGE3ZDcwLTY2ZmQtNGJjMi1iODg5LWIyMzQ1NmE1OTAzNSIsImVtYWlsIjoic3V0b3lvY3V0ZXpAZ21haWwuY29tIn0.d4IlszMdwqLz4HbiFuzAGDZYLT76--YthmALi1p1Y4qfyJ4dKXyfJgbXTgpgmi7OrcfCpfFTkz_fcN25kHZuJw&user_agent=Mozilla%2F5.0+%28X11%3B+Linux+x86_64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F140.0.0.0+Safari%2F537.36&language=en-US&languages=en-US%2Cen%2Cid&timezone=Asia%2FJakarta&cookie_enabled=true&screen_width=1920&screen_height=1200&screen_resolution=1920x1200&viewport_height=367&viewport_width=1920&viewport_size=1920x367&color_depth=24&pixel_ratio=1&current_url=https%3A%2F%2Fchat.z.ai%2Fc%2Fe1295904-98d3-4d85-b6ee-a211471101e9&pathname=%2Fc%2Fe1295904-98d3-4d85-b6ee-a211471101e9&search=&hash=&host=chat.z.ai&hostname=chat.z.ai&protocol=https%3A&referrer=https%3A%2F%2Faccounts.google.com%2F&title=Z.ai+Chat+-+Free+AI+powered+by+GLM-4.6+%26+GLM-4.5&timezone_offset=-420&local_time=2025-10-07T10%3A16%3A07.212Z&utc_time=Tue%2C+07+Oct+2025+10%3A16%3A07+GMT&is_mobile=false&is_touch=false&max_touch_points=0&browser_name=Chrome&os_name=Linux&signature_timestamp=1759832167213
    */
  // console.log({
  //   sortedPayload,
  //   urlParams,
  //   signature,
  //   timestamp,
  //   endpoint,
  // })

  const response = await fetch(endpoint, {
    headers: {
      authorization: `Bearer ${token}`,

      "content-type": "application/json",
      "x-fe-version": "prod-fe-1.0.95",
      "x-signature": signature,
    },
    // referrer: "https://chat.z.ai/c/e1295904-98d3-4d85-b6ee-a211471101e9",
    body: JSON.stringify(body),
    method: "POST",
    // mode: "cors",
    // credentials: "include",
  })
  await makeStreamCompletion(response, true, "test", "", [])
}

main().catch((e) => console.error(e))

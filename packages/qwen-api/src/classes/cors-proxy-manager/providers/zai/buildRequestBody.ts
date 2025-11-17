import { v1 } from "uuid";

/**
 * Build request body for ZAI API chat completions
 *
 * @param options - Request body options
 * @returns Formatted request body object
 */
export function buildRequestBody(
  prompt: string,
  realModel: string,
  messages: any[],
  enableThinking = true
) {
  // return newRequest(prompt,realModel,messages,enableThinking)
  return {
    chat_id: "local",
    signature_prompt: prompt,

    id: v1(),
    stream: true,
    model: realModel,
    messages,
    params: {},
    tool_servers: [],
    features: {
      /*
{
  auto_web_search: false,
  enable_thinking: true,
  flags: [],
  image_generation: false,
  preview_mode: true,
  web_search: false
}
*/

      enable_thinking: enableThinking,
    },
  };
}
//
/*GLM new request */
/*

*/
function newRequest(signature_prompt, model, messages, enable_thinking) {
  const data = {
    stream: true,
    // model,
    model: "0727-360B-API",

    messages,
    signature_prompt,
    params: {},
    features: {
      image_generation: false,
      web_search: false,
      auto_web_search: false,
      preview_mode: true,
      flags: [],
      enable_thinking: false,
    },
    variables: {
      "{{USER_NAME}}": "Putra Budiman",
      "{{USER_LOCATION}}": "Unknown",
      "{{CURRENT_DATETIME}}": "2025-11-12 19:20:49",
      "{{CURRENT_DATE}}": "2025-11-12",
      "{{CURRENT_TIME}}": "19:20:49",
      "{{CURRENT_WEEKDAY}}": "Wednesday",
      "{{CURRENT_TIMEZONE}}": "Asia/Bangkok",
      "{{USER_LANGUAGE}}": "en-US",
    },
    chat_id: "c32806d8-1095-4038-a113-14802a0aeca6",
    id: "61b63ccf-6bb2-4329-a0b4-761bc55a6b97",
    current_user_message_id: "ff7f45b8-4543-414d-a9cc-8ac02627b666",
    current_user_message_parent_id: "10527aa7-dfff-42b1-bd5e-921700bf4881",
  };
  return data;
}

const examplePayload = {
  stream: true,
  model: "0727-360B-API",
  messages: [],
  signature_prompt: "hmm",
  params: {},
  features: {
    image_generation: false,
    web_search: false,
    auto_web_search: false,
    preview_mode: true,
    flags: [],
    enable_thinking: true,
  },
  variables: {
    "{{USER_NAME}}": "Putra Budiman",
    "{{USER_LOCATION}}": "Unknown",
    "{{CURRENT_DATETIME}}": "2025-11-12 19:20:49",
    "{{CURRENT_DATE}}": "2025-11-12",
    "{{CURRENT_TIME}}": "19:20:49",
    "{{CURRENT_WEEKDAY}}": "Wednesday",
    "{{CURRENT_TIMEZONE}}": "Asia/Bangkok",
    "{{USER_LANGUAGE}}": "en-US",
  },
  chat_id: "c32806d8-1095-4038-a113-14802a0aeca6",
  id: "61b63ccf-6bb2-4329-a0b4-761bc55a6b97",
  current_user_message_id: "ff7f45b8-4543-414d-a9cc-8ac02627b666",
  current_user_message_parent_id: "10527aa7-dfff-42b1-bd5e-921700bf4881",
};

/**
 * Creates a new chat session with z.ai API
 * @param prompt The user prompt to send
 * @returns Promise containing the API response
 */
export async function createZaiChatSession(
  prompt: string,
  model: string,
  messageId: string,
  token: string
) {
  const response = await fetch("https://chat.z.ai/api/v1/chats/new", {
    headers: {
      accept: "application/json",
      "accept-language": "en-US",
      authorization: "Bearer " + token,
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      // "cookie": "acw_tc=0a0f6b7317629953829821623e52003ca0b0060219371501c797b8cebfa873; token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk1NzM1ODViLTczMTAtNGRlNi1hZTE4LWU5ZDc4Y2Q2NzFjOSIsImVtYWlsIjoiY3Jpc3RtaW5peEBnbWFpbC5jb20ifQ.hM0KeIgSAWB47Y0rlCqqJy0BvYrok83uRBQgpUVnX_hpzqFBFGDvw0-GBZJ_HBgZlqVXDYCSJY1BNlYZie3SWA; ssxmod_itna=1-GqRx0DuDyDcD97DnD4qeqO4mhx3d4Ku7D0QDXDUwqiQGgDYq7=GFRDCxEU3R6jb2oqx4QiQBh_YpiGYTNDlahrotDCTKGfDQaoOrR7AvqPK7e64nQ3YWE5hXA=7DfkgO_e2ECgHzHgMO/9dfQRdXb84GLDY=f7fvIDYYDC4GwDGoD34DiDDPDb_3DAwqD7qDFnenropTDm4GWnl3Di4D_nmbDmk4DGqDnWlqFSnDD0dUBGWxY5Y98aQHt/YWef6_3neDM7xGX7GkqnmyUV9DWL6SLsco3xB69xBQbgYaf/AIta6nHNeNM3xQO7DpGxixxaADrYxtYo3Y33QqY0xjo4YW5VhhZDG8eQDDfz7D9C6qxI3SGbBUB=XS1XbQ0LaAyiY9jGQDh5QDci0mBqGYm50DqiGQRDh0iPjhIei4YD; ssxmod_itna2=1-GqRx0DuDyDcD97DnD4qeqO4mhx3d4Ku7D0QDXDUwqiQGgDYq7=GFRDCxEU3R6jb2oqx4QiQBh_YpiGYToDicdw4PZ7Fx03r3z64w3tF4GN5CX_YbB3OU80Q_n7kstlD9UqL0UBlRrHH/kaey1moqFu2vOArFsh2GzOivzXZYGh6FwKFKx8PIQr0cwr7GvNb01szPO_rwO3So4URS82tvIc/II5Ikjn_FL/4kOutjqzUK6m3TjMFSanIdA5RG0=Xl0r98I7/f9I=GvqKxc89Kqm9KF3iim6rFerfUO2saz_hPAuoy166Iq3eInOI3e0vOKbhpcBp4KLupKqFm4UIYi0/ppyY0YiG59Qd4X4_X9OiPeYY40ZrrotXf=2XexDUQj0G5hDREpLQG8p6QedBc65axdgwLiqgQDsi0QYY_fnSexnen4rGSjv9YwKlfQjK8mNr3waxaItNDKdqcR4zca8capdjC=kgFCPUrpPb/QEDTc7e_SPTxNwZE6/Wumy4EqWocqSETOAzhmgbn3iaROBmgoip9vzjYs2nW5ODWqnGnCUYkNfaxeiIG/3=Rpar3KCfhIhHzEPWXlh8Kmv=7IPKhNsK4vKKLcjKgT6GdTWsfS=HW4H_HKnzGXpfI/EnnnI4lUxj868jpSZjD/vo4UsP4DmL0Ds3AhDvcy/ywQqQ/90ziPllCGDhPMvgckxr7GDEwqYeNuDGQc9T6rYDFlP37K0GcTGmt7p8jKOyVQs/Di1C8PxW4KG8lPamK=z/DW2exmtibxn4DtHDDcPKwxBG02Peile7WG4bfPizr445Y0KO_KD42oxeeD5PAo8wxPanDpAa/zZ0NeeqhqCtMHNW4DroipZGDD",
      Referer: "https://chat.z.ai/",
    },
    body: JSON.stringify({
      chat: {
        id: "",
        title: "New Chat",
        models: [model],
        params: {},
        history: {
          messages: {
            [messageId]: {
              id: messageId,
              parentId: null,
              childrenIds: [],
              role: "user",
              content: prompt,
              timestamp: Date.now(),
              models: [model],
            },
          },
          currentId: messageId,
        },
        tags: [],
        flags: [],
        features: [
          { type: "mcp", server: "vibe-coding", status: "hidden" },
          { type: "mcp", server: "ppt-maker", status: "hidden" },
          { type: "mcp", server: "image-search", status: "hidden" },
          { type: "mcp", server: "deep-research", status: "hidden" },
          { type: "tool_selector", server: "tool_selector", status: "hidden" },
          { type: "mcp", server: "advanced-search", status: "hidden" },
        ],
        mcp_servers: [],
        enable_thinking: false,
        auto_web_search: false,
        timestamp: Date.now(),
      },
    }),
    method: "POST",
  });

  return response.json();
}

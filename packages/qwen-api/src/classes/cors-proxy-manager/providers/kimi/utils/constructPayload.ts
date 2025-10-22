import { createConnectFrame } from "../utils/createConnectFrame"

export const templatePayload = (
  content,
  chatId = "",
  parentId = "",
  instruction = "",
  log = false
) => {
  let blocks = [{ message_id: "", parent_id: parentId, text: { content } }]
  if (chatId === "" && parentId === "") {
    blocks = [
      {
        message_id: "",
        parent_id: parentId,
        text: {
          content: `<contextual_request><system_instruction>${instruction}</system_instruction><current_user_query>${content}</current_user_query></contextual_request>`,
        },
      },

      // { message_id:  "", parent_id: parentId, text: { content } },
    ]
  }

  let userMessage = {
    role: "user",
    blocks,
    scenario: "SCENARIO_K2",
  }
  const message: any = userMessage
  const p = {
    chat_id: chatId,
    // parent_id:parentId,
    scenario: "SCENARIO_K2",
    // tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }],
    // tools: [],

    message,
    options: { thinking: false },
  }

  // if (log) console.log(JSON.stringify(p))
  /*
  if (chatId === "" && parentId === "") {

    if (instruction !== "") {
      p.options.system_prompt = instruction
    }
  } else {
  }

    */
  console.log(p)
  return p
}
export function buildPayload(
  content,
  chatId = "",
  parentId = "",
  instruction = ""
) {
  const encoder = new TextEncoder()

  //@ts-ignore
  const inputPayload = templatePayload(content, chatId, parentId, instruction)
  return createConnectFrame(JSON.stringify(inputPayload), encoder)
}
export function constructPayload(
  content: string,
  chatId,
  parentId,
  instruction
) {
  return buildPayload(content, chatId, parentId, instruction)
}

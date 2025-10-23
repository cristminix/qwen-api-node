import { createConnectFrame } from "../utils/createConnectFrame"

export const templatePayload = (
  content,
  chatId = "",
  parentId = "",
  instruction = "",
  scenario = "kimi-k2",
  enableSearchTool = false
) => {
  let blocks = [{ message_id: "", parent_id: parentId, text: { content } }]
  if (chatId === "" && parentId === "" && instruction.length > 0) {
    blocks = [
      {
        message_id: "",
        parent_id: parentId,
        text: {
          content: `[System Instruction]\n${instruction}\n\n[Current User Query]\n${content}`,
        },
      },

      // { message_id:  "", parent_id: parentId, text: { content } },
    ]
  }
  const model = scenario === "kimi-k2" ? "SCENARIO_K2" : "SCENARIO_CHAT"
  let userMessage = {
    role: "user",
    blocks,
    scenario: model,
  }
  const message: any = userMessage
  const p: {
    chat_id: string
    scenario: string
    tools: Array<{ type: string; [key: string]: any }>
    message: any
    options: { thinking: boolean }
  } = {
    chat_id: chatId,
    scenario: model,
    tools: [],

    message,
    options: { thinking: false },
  }
  if (enableSearchTool) {
    p.tools.push({ type: "TOOL_TYPE_SEARCH", search: {} })
  }

  // console.log(p)
  return p
}
export function buildPayload(
  content,
  chatId = "",
  parentId = "",
  instruction = "",
  scenario = "kimi-k2",
  enableSearchTool = false
) {
  const encoder = new TextEncoder()

  //@ts-ignore
  const inputPayload = templatePayload(
    content,
    chatId,
    parentId,
    instruction,
    scenario,
    enableSearchTool
  )
  return createConnectFrame(JSON.stringify(inputPayload), encoder)
}
export function constructPayload(
  content: string,
  chatId,
  parentId,
  instruction,
  scenario = "kimi-k2"
) {
  return buildPayload(content, chatId, parentId, instruction, scenario)
}

import { v1 } from "uuid"

/**
 * Build request body for ZAI API chat completions
 *
 * @param options - Request body options
 * @returns Formatted request body object
 */
export function buildRequestBody(
  realModel: string,
  messages: any[],
  enableThinking = false
) {
  return {
    chat_id: "local",
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
  }
}

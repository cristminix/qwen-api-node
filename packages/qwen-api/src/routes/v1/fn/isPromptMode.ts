import { ChatCompletionRequest } from "../../../core/types/chat"
function isPromptMode(chatRequest: ChatCompletionRequest) {
  return Array.isArray(chatRequest.prompt)
}
export default isPromptMode

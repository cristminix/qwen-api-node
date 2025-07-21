import { ChatCompletionRequest } from "src/core/types/chat"
import makeApiCallNonStream from "./makeApiCallNonStream"

async function getRawChatResponse(
  request: ChatCompletionRequest,
  client: any,
  axios: any
): Promise<string> {
  const response = await makeApiCallNonStream(request, client, axios)
  const content = response.choices[0]?.message?.content
  if (Array.isArray(content)) {
    // Assuming ContentBlock has a 'text' property for text blocks
    return content
      .map((block) => {
        if (block.block_type === "text") {
          return block.text
        } else if (block.block_type === "image" && block.url) {
          return `![image](${block.url})`
        } else if (block.block_type === "audio" && block.url) {
          return `![audio](${block.url})`
        }
        return ""
      })
      .join("\n")
  }
  return content || ""
}

export default getRawChatResponse

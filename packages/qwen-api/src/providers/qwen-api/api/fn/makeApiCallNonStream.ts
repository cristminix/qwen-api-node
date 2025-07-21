import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../../../core/types/chat"
import { InternalPayloadMessage } from "../types"
async function makeApiCallNonStream(
  request: ChatCompletionRequest,
  client: any,
  axios: any
): Promise<ChatResponse> {
  try {
    const payload = {
      model: request.model,
      //@ts-ignore

      messages: request.messages.map((msg) => {
        let finalContent: any
        if (Array.isArray(msg.content)) {
          finalContent = msg.content.map((block) => {
            if (block.block_type === "text") {
              return { type: block.block_type, text: block.text }
            } else if (block.block_type === "image" && block.url) {
              return { type: block.block_type, image: block.url }
            } else if (block.block_type === "audio" && block.url) {
              return { type: block.block_type, audio: block.url }
            }
            return block
          })
        } else {
          finalContent = msg.content || ""
        }

        return {
          role: msg.role,
          content: finalContent,
          chat_type: "t2t",
          feature_config: {
            thinking_enabled: false,
            thinking_budget: 0,
            output_schema: null,
          },
          extra: {},
        } as InternalPayloadMessage
      }),
      stream: false, // Ensure stream is false for this method
      incremental_output: false, // Typically false for non-streaming
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 2048,
    }

    const response = await client.post("/api/chat/completions", payload)
    // Assuming the non-streaming response directly contains the final message
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: response.data.choices[0]?.message?.content || "",
          },
        },
      ],
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error in _makeApiCallNonStream:",
        //@ts-ignore
        error.response?.data
      )
    } else {
      console.error("Unexpected error in _makeApiCallNonStream:")
    }
    throw error
  }
}
export default makeApiCallNonStream

import {
  ChatCompletionRequest,
  ChatResponseStream,
} from "../../../../core/types/chat"
import { InternalPayloadMessage } from "../types"

async function* makeApiCallStream(
  request: ChatCompletionRequest,
  client: any,
  axios: any
): AsyncGenerator<ChatResponseStream> {
  try {
    const payload = {
      model: request.model,
      //@ts-ignore

      messages: request.messages.map((msg) => {
        let finalContent
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
      stream: true, // Ensure stream is true for this method
      incremental_output: true,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 2048,
    }
    // console.log("Payload for streaming request:", JSON.stringify(payload, null, 2));
    // return; // End the generator if no messages are provided
    const response = await client.post("/api/chat/completions", payload, {
      responseType: "stream",
    })

    for await (const chunk of response.data) {
      const text = chunk.toString("utf-8")
      const events = text.split("\n\n")
      for (const event of events) {
        if (event.startsWith("data:")) {
          try {
            const jsonData = JSON.parse(event.substring(5))
            yield jsonData as ChatResponseStream
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      //@ts-ignore
      console.error("Axios error in makeApiCallStream:", error.response?.data)
    } else {
      console.error("Unexpected error in makeApiCallStream:")
    }
    throw error
  }
}
export default makeApiCallStream

import {
  ChatCompletionRequest,
  ChatResponseStream,
} from "../../../../core/types/chat"
import { InternalPayloadMessage } from "../types"
import buildPayload from "./buildPayload"

async function* makeApiCallStream(
  request: ChatCompletionRequest,
  client: any,
  axios: any
): AsyncGenerator<ChatResponseStream> {
  try {
    const payload = await buildPayload(
      client,
      null,
      //@ts-ignore
      request.messages,
      [],
      request.model,
      request.top_p,
      request.temperature
    )
    // console.log("Payload for streaming request:", JSON.stringify(payload, null, 2));
    // return; // End the generator if no messages are provided
    const response = await client.post("/api/chat", payload, {
      responseType: "stream",
    })
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    for await (const chunk of response.data) {
      const text = chunk.toString("utf-8")
      const data = {
        choices: [
          {
            delta: {
              content: text,
            },
          },
        ],
      }
      yield data as ChatResponseStream
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

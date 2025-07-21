import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../../../core/types/chat"
import { InternalPayloadMessage } from "../types"
import buildPayload from "./buildPayload"
async function makeApiCallNonStream(
  request: ChatCompletionRequest,
  client: any,
  axios: any
): Promise<ChatResponse> {
  //@ts-ignore
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
  // console.log("payload", payload)
  try {
    const response = await client.post("/api/chat", payload)
    // Assuming the non-streaming response directly contains the final message
    // console.log("response", response.data)
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: response.data,
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

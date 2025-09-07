import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { GPT4Free } from "../../classes/cors-proxy-manager/providers/GPT4Free"

class G4F {
  private client: GPT4Free

  constructor() {
    this.client = new GPT4Free()
  }

  public async *stream(
    request: ChatCompletionRequest
    //@ts-ignore
  ): Promise<AsyncGenerator<ChatResponseStream>> {
    // Gunakan signature 2 arg untuk memanggil streaming (sesuai implementasi HuggingFace client)
    const response: any = await this.client.chat.completions.create(
      {
        ...request,
        stream: true,
      },
      {},
      true
    )

    // const reader = response.body.getReader()

    for await (const chunk of response) {
      console.log(chunk)
      yield chunk
    }
  }

  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    const response: any = await this.client.chat.completions.create(
      {
        ...request,
        stream: false,
      },
      {},
      false
    )

    // const reader = response.body.getReader()
    let content = ""
    let chatResponse: ChatResponse = {
      choices: [
        {
          message: {
            role: "assistant",
            content: "",
          },
        },
      ],
    }
    for await (const chunk of response) {
      // console.log(chunk)
      // dataPtr = chunk
      content += chunk.choices[0].delta.content
      if (chunk.usage) {
        chatResponse.usage = chunk.usage
      }
    }
    chatResponse.choices[0].message.content = content
    // console.log(dataPtr)

    return chatResponse
  }
}

export default G4F

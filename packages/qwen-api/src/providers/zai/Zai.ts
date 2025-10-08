import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import ZAI from "../../classes/cors-proxy-manager/providers/ZAI"

class Zai {
  private client: ZAI

  constructor() {
    this.client = new ZAI()
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
      // console.log(chunk)
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
    // console.log({ response })
    return response
  }
}

export default Zai

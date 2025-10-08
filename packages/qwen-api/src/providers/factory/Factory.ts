import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { FactoryAI } from "../../classes/cors-proxy-manager/providers/FactoryAI"

class Factory {
  private client: FactoryAI

  constructor() {
    this.client = new FactoryAI()
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
    console.log({ response })
    return response
  }
}

export default Factory

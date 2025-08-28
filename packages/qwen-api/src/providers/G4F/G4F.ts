import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { GPT4Free } from "../../classes/cors-proxy-manager/providers/GPT4Free"

class HF {
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
      //   console.log(chunk)
      yield chunk
    }
  }

  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    return await this.client.chat.completions.create(request)
  }
}

export default HF

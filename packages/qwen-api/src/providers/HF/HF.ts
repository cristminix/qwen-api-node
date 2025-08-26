import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { HuggingFace } from "../../classes/cors-proxy-manager/providers/HuggingFace"

class HF {
  private client: HuggingFace

  constructor() {
    this.client = new HuggingFace()
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

    const reader = response.body.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }

  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    return await this.client.chat.completions.create(request)
  }
}

export default HF

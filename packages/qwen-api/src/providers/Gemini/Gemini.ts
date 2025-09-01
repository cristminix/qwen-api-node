import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { GeminiCli } from "../../classes/cors-proxy-manager/providers/GeminiCli"

class Gemini {
  private client: GeminiCli

  constructor() {
    this.client = new GeminiCli()
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

    for await (const chunk of response) {
      //   console.log(chunk)
      yield chunk
    }
  }

  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    return await this.client.chat.completions.create(request)
  }
}

export default Gemini

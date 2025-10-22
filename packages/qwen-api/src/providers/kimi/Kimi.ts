import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { KimiAI } from "../../classes/cors-proxy-manager/providers/KimiAI"

class Kimi {
  private client: KimiAI

  constructor() {
    this.client = new KimiAI()
  }

  public async *stream(
    request: ChatCompletionRequest,
    inputHeaders:any
    //@ts-ignore
  ): Promise<AsyncGenerator<ChatResponseStream>> {
    // Gunakan signature 2 arg untuk memanggil streaming (sesuai implementasi HuggingFace client)
    const response: any = await this.client.chat.completions.create(
      {
        ...request,
        stream: true,
      },
      {inputHeaders},
      true
    )

    // const reader = response.body.getReader()

    for await (const chunk of response) {
      // console.log(chunk)
      yield chunk
    }
  }

    
  public async create(request: ChatCompletionRequest,inputHeaders:any): Promise<ChatResponse> {
    const response: any = await this.client.chat.completions.create(
      {
        ...request,
        stream: false,
      },
      {inputHeaders},
      false
    )
    // console.log({ response })
    return response
  }
}

export default Kimi

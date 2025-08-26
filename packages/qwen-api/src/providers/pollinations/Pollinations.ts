import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../core/types/chat"
import { PollinationsAI } from "../../classes/cors-proxy-manager/CorsProxyManager"

class Pollinations {
  private client: PollinationsAI

  // private label = "Pollinations AI"
  // private url = "https://text.pollinations.ai"
  // private apiEndpoint = "https://text.pollinations.ai/openai"

  // private working = 1
  // private supportsStream = 1
  // private supportsSystem_message = 1
  // private supportsMessageHistory = 1

  // private defaultModel = "gpt-oss"
  // private defaultVisionModel = this.defaultModel
  // private visionModels = [this.defaultVisionModel]

  constructor() {
    this.client = new PollinationsAI()
  }

  public async stream(
    request: ChatCompletionRequest
  ): Promise<AsyncGenerator<ChatResponseStream>> {
    const stream = (await this.client.chat.completions.create({
      ...request,
      stream: true,
    })) as AsyncGenerator<ChatResponseStream>

    return stream
  }

  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    // console.log("request", request)
    //@ts-ignore

    return await this.client.chat.completions.create(request)
  }
}

export default Pollinations

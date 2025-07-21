import axios, { AxiosInstance } from "axios"
import buildHeaders from "../fn/buildHeaders"
import uploadFile from "../fn/uploadFile"
import {
  ChatCompletionRequest,
  ChatResponse,
  ChatResponseStream,
} from "../../../../core/types/chat"
import { UploadResult } from "../types"
import stream from "../fn/stream"
// import getRawChatResponse from "../fn/getRawChatResponse"
// import makeApiCallStream from "../fn/makeApiCallStream"
// import makeApiCallNonStream from "../fn/makeApiCallNonStream"
import create from "../fn/create"
import buildPayload from "../fn/buildPayload"

class BlackboxAi {
  private client: AxiosInstance

  private label = "Blackbox AI"
  private url = "https://www.blackbox.ai"
  private apiEndpoint = "https://www.blackbox.ai/api/chat"

  private working = 1
  private supportsStream = 1
  private supportsSystem_message = 1
  private supportsMessageHistory = 1

  private defaultModel = "blackboxai"
  private defaultVisionModel = this.defaultModel
  private visionModels = [this.defaultVisionModel]

  constructor() {
    this.client = axios.create({
      baseURL: this.url,
      headers: this.buildHeaders(),
    })
  }
  private buildHeaders(): Record<string, string> {
    return buildHeaders()
  }
  public async uploadFile(filePath: string): Promise<UploadResult> {
    return await uploadFile(filePath, this.client)
  }
  public async *stream(
    request: ChatCompletionRequest
  ): AsyncGenerator<ChatResponseStream> {
    //@ts-ignore
    yield* stream(request, this.client, axios)
  }
  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    // console.log("request", request)
    //@ts-ignore

    return await create(request, this.client, axios)
  }
  // private async _getRawChatResponse(
  //   request: ChatCompletionRequest
  // ): Promise<string> {
  //   return await getRawChatResponse(request, this.client, axios)
  // }
  // private async *_makeApiCallStream(
  //   request: ChatCompletionRequest
  // ): AsyncGenerator<ChatResponseStream> {
  //   //@ts-ignore
  //   yield* makeApiCallStream(request, this.client, axios)
  // }
  // private async _makeApiCallNonStream(
  //   request: ChatCompletionRequest
  // ): Promise<ChatResponse> {
  //   return await makeApiCallNonStream(request, this.client, axios)
  // }
}
export default BlackboxAi

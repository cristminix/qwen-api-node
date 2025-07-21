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

class ChatQwenAi {
  private client: AxiosInstance
  private authToken: string
  private cookie: string

  constructor(
    authToken: string,
    cookie: string,
    baseURL: string = "https://chat.qwen.ai"
  ) {
    this.authToken = authToken
    this.cookie = cookie
    this.client = axios.create({
      baseURL: baseURL,
      headers: this.buildHeaders(),
    })
  }
  private buildHeaders(): Record<string, string> {
    return buildHeaders(this.authToken, this.cookie)
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
export default ChatQwenAi

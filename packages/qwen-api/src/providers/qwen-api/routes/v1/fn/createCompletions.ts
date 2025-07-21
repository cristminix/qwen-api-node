import { ChatCompletionRequest } from "../../../../../core/types/chat"
import getChatRequestMessages from "./getChatRequestMessages"
import { getModelByAlias } from "../../../fn/getModelByAlias"
import QwenAPI from "../../../"
import ChatQwenAi from "../../../api/classes/ChatQwenAi"
import BlackboxAi from "../../../../blackbox/api/classes/BlackboxAi"

async function createCompletions(chatRequest: ChatCompletionRequest) {
  const authToken = process.env.QWEN_AUTH_TOKEN as string
  const cookie = process.env.QWEN_COOKIE as string
  //@ts-ignore

  const qwenApi = new ChatQwenAi(authToken, cookie)
  const blackboxApi = new BlackboxAi()
  //@ts-ignore
  const messages = await getChatRequestMessages(chatRequest, qwenApi)
  const streaming = chatRequest.stream || false
  //   console.log(chatRequest)
  const realModel = getModelByAlias(chatRequest.model)
  const qwenRequest: ChatCompletionRequest = {
    model: realModel,
    //@ts-ignore
    messages,
    temperature: chatRequest.temperature,
    max_tokens: chatRequest.max_tokens,
    stream: streaming,
    frequency_penalty: chatRequest.frequency_penalty,
    logprobs: chatRequest.logprobs,

    n: chatRequest.n,
    presence_penalty: chatRequest.presence_penalty,
    seed: chatRequest.seed,

    top_p: chatRequest.top_p,
  }
  return streaming ? qwenApi.stream(qwenRequest) : qwenApi.create(qwenRequest)
}

export default createCompletions

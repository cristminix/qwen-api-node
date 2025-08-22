import { ChatCompletionRequest } from "../../../core/types/chat"
import getChatRequestMessages from "./getChatRequestMessages"
import ChatQwenAi from "../../../providers/qwen-api/api/classes/ChatQwenAi"
import BlackboxAi from "../../../providers/blackbox/api/classes/BlackboxAi"
import { getModelByAlias } from "./getModelByAlias"

async function createCompletions(chatRequest: ChatCompletionRequest) {
  const authToken = process.env.QWEN_AUTH_TOKEN as string
  const cookie = process.env.QWEN_COOKIE as string
  //@ts-ignore
  const provider = process.env.DEFAULT_PROVIDER
  let providerApi
  if (provider === "qwenchatai") providerApi = new ChatQwenAi(authToken, cookie)
  else if (provider === "blackbox") providerApi = new BlackboxAi()
  //@ts-ignore
  const messages = await getChatRequestMessages(chatRequest, providerApi)
  const streaming = chatRequest.stream || false
  //   console.log(chatRequest)
  //@ts-ignore
  let realModel = getModelByAlias(provider, chatRequest.model)
  if (!realModel) {
    realModel = process.env.DEFAULT_MODEL
  }
  console.log("realModel", realModel)

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
  return streaming
    ? providerApi.stream(qwenRequest)
    : providerApi.create(qwenRequest)
}

export default createCompletions

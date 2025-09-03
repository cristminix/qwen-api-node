import { ChatCompletionRequest } from "../../../core/types/chat"
import getChatRequestMessages from "./getChatRequestMessages"
import ChatQwenAi from "../../../providers/qwen-api/api/classes/ChatQwenAi"
import BlackboxAi from "../../../providers/blackbox/api/classes/BlackboxAi"
import { getModelByAlias } from "./getModelByAlias"
import Pollinations from "../../../providers/pollinations/Pollinations"
import HF from "../../../providers/HF/HF"
import G4F from "../../../providers/G4F/G4F"
import Gemini from "src/providers/Gemini/Gemini"
async function createCompletions(chatRequest: ChatCompletionRequest) {
  const authToken = process.env.QWEN_AUTH_TOKEN as string
  const cookie = process.env.QWEN_COOKIE as string
  //@ts-ignore
  const provider = process.env.DEFAULT_PROVIDER
  let providerApi
  if (provider === "qwenchatai") providerApi = new ChatQwenAi(authToken, cookie)
  else if (provider === "blackbox") providerApi = new BlackboxAi()
  else if (provider === "pollinations") providerApi = new Pollinations()
  else if (provider === "hf") providerApi = new HF()
  else if (provider === "g4f") providerApi = new G4F()
  else if (provider === "geminicli") providerApi = new Gemini()
  //@ts-ignore
  const messages = await getChatRequestMessages(chatRequest, providerApi)
  const streaming = chatRequest.stream
  console.log({ streaming })
  //@ts-ignore
  let realModel = getModelByAlias(provider, chatRequest.model)
  if (!realModel && provider !== "g4f") {
    realModel = process.env.DEFAULT_MODEL
  } else {
    realModel = chatRequest.model
  }
  console.log("realModel", realModel)
  //@ts-ignore
  const qwenRequest: ChatCompletionRequest =
    provider === "qwenchatai"
      ? {
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
      : chatRequest
  return streaming
    ? providerApi.stream(qwenRequest)
    : providerApi.create(qwenRequest)
}

export default createCompletions

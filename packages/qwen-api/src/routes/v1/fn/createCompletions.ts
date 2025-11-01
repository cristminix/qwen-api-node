import { ChatCompletionRequest } from "../../../core/types/chat"
import getChatRequestMessages from "./getChatRequestMessages"
import ChatQwenAi from "../../../providers/qwen-api/api/classes/ChatQwenAi"
import BlackboxAi from "../../../providers/blackbox/api/classes/BlackboxAi"
import { getModelByAlias } from "./getModelByAlias"
import Pollinations from "../../../providers/pollinations/Pollinations"
import HF from "../../../providers/HF/HF"
import G4F from "../../../providers/G4F/G4F"
import Gemini from "src/providers/Gemini/Gemini"
import Factory from "src/providers/factory/Factory"
import Zai from "src/providers/zai/Zai"
import Kimi from "src/providers/kimi/Kimi"
async function createCompletions(
  chatRequest: ChatCompletionRequest,
  inputHeaders: any
) {
  const authToken = process.env.QWEN_AUTH_TOKEN as string
  const cookie = process.env.QWEN_COOKIE as string
  const useAllProviders = process.env.USE_ALL_PROVIDER === "true" ? true : false
  //@ts-ignore
  let provider = process.env.DEFAULT_PROVIDER
  let requestModel = chatRequest.model
  let providerApi
  if (useAllProviders) {
    const modelSplit = chatRequest.model.split("/")
    const [providerSet] = modelSplit
    requestModel = modelSplit.slice(1, modelSplit.length).join("/")
    provider = providerSet
    chatRequest.model = requestModel
    // console.log({ requestModel, provider })
  }
  if (provider === "qwenchatai") providerApi = new ChatQwenAi(authToken, cookie)
  else if (provider === "blackbox") providerApi = new BlackboxAi()
  else if (provider === "pollinations") providerApi = new Pollinations()
  else if (provider === "hf") providerApi = new HF()
  else if (provider === "g4f") providerApi = new G4F()
  else if (provider === "geminicli") providerApi = new Gemini()
  else if (provider === "factory") providerApi = new Factory()
  else if (provider === "zai") providerApi = new Zai()
  else if (provider === "kimi") providerApi = new Kimi()
  //@ts-ignore
  const messages = await getChatRequestMessages(chatRequest, providerApi)
  const streaming = chatRequest.stream
  console.log({ streaming })
  //@ts-ignore
  let realModel = getModelByAlias(provider, requestModel)
  if (!realModel && provider !== "g4f") {
    realModel = process.env.DEFAULT_MODEL
  } else {
    realModel = requestModel
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
    ? providerApi.stream(qwenRequest, inputHeaders)
    : providerApi.create(qwenRequest, inputHeaders)
}

export default createCompletions

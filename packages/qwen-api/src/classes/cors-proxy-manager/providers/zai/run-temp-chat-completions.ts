import { v1 } from "uuid"
import { makeStreamCompletion } from "./makeStreamCompletion"
import { createSignatureWithTimestamp } from "./createSignatureWithTimestamp"
import { prepareAuthParams } from "./prepareAuthParams"
import dotenv from "dotenv"
import { getAuthToken } from "./getAuthToken"
import { getAuthAndModels } from "./getAuthAndModels"
import { transformMessages } from "./transformRequestMessages"
import { getLastUserMessageContent } from "./getLastUserMessageContent"
import { getEndpointSignature } from "./getEndpointSignature"
import { getModel } from "./getModel"
import { buildRequestHeaders } from "./buildRequestHeaders"
import { buildRequestBody } from "./buildRequestBody"
dotenv.config()
const main = async () => {
  const baseUrl = "https://chat.z.ai"
  const requstModel = "GLM-4.6"
  const defaultModel = "GLM-4-6-API-V1"
  const messages = [{ role: "user", content: "What is the capital of French" }]

  const [models, apiKey, authUserId, modelAliases] = await getAuthAndModels()

  const transformedMessages = transformMessages(messages)
  const userPrompt = getLastUserMessageContent(transformedMessages)
  if (userPrompt && apiKey && authUserId) {
    const [endpoint, signature, timestamp] = getEndpointSignature(
      baseUrl,
      apiKey,
      authUserId,
      userPrompt
    )

    const realModel = getModel(requstModel, modelAliases, defaultModel)
    // console.log({ realModel, endpoint, signature })
    // return
    const body = buildRequestBody(realModel, transformedMessages)

    const response = await fetch(endpoint, {
      headers: buildRequestHeaders(apiKey, signature),
      body: JSON.stringify(body),
      method: "POST",
    })
    await makeStreamCompletion(response, true, realModel)
  } else {
    console.error(`Failed to construct request payloads`)
  }
}

main().catch((e) => console.error(e))

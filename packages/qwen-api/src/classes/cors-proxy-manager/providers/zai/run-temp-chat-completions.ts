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
    // const body = buildRequestBody(realModel, transformedMessages)
    const response = await fetch("https://chat.z.ai/api/v2/chat/completions?timestamp=1762951204441&requestId=9c8398d2-8f9b-494e-9379-8e566f95e81f&user_id=9573585b-7310-4de6-ae18-e9d78cd671c9&version=0.0.1&platform=web&token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk1NzM1ODViLTczMTAtNGRlNi1hZTE4LWU5ZDc4Y2Q2NzFjOSIsImVtYWlsIjoiY3Jpc3RtaW5peEBnbWFpbC5jb20ifQ.H2-q-Gu1jptDO11o1DFltC1b8Exk0t499OVE_jJqKchkJS6Ogkwr2GRueR0aYngRs0hB3sbgYHaBlq4UwwIOlQ&signature_timestamp=1762951204441", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US",
    "authorization": "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk1NzM1ODViLTczMTAtNGRlNi1hZTE4LWU5ZDc4Y2Q2NzFjOSIsImVtYWlsIjoiY3Jpc3RtaW5peEBnbWFpbC5jb20ifQ.H2-q-Gu1jptDO11o1DFltC1b8Exk0t499OVE_jJqKchkJS6Ogkwr2GRueR0aYngRs0hB3sbgYHaBlq4UwwIOlQ",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-fe-version": "prod-fe-1.0.129",
    "x-signature": "2fefc8092cb5a7c8bd807d8be75ffe3ff32d2d0be46c79c83577725604644c40",
    // "cookie": "acw_tc=0a094e3517629510819097618e41f5afedca6e4c97411f45fb3b0947b67775; token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk1NzM1ODViLTczMTAtNGRlNi1hZTE4LWU5ZDc4Y2Q2NzFjOSIsImVtYWlsIjoiY3Jpc3RtaW5peEBnbWFpbC5jb20ifQ.H2-q-Gu1jptDO11o1DFltC1b8Exk0t499OVE_jJqKchkJS6Ogkwr2GRueR0aYngRs0hB3sbgYHaBlq4UwwIOlQ; ssxmod_itna=1-GqRx0DuDyDcD97DnD4qeqO4mhx3d4Ku7D0QDXDUwqiQGgDYq7=GFRDCxEU3R6jb2oqxKaePmhhbt7nqDsaFRxGkRDWPGE3odbKmaCA000htuAGipzeBb9Gxvf1MGD4IU1sO1PUazvVOISfLmx3xGLDY6AiYwz7eGGD0oDt4DIDAYDDxDWDYEADGttDG=D7xTNqaW=xi3DbxTfDDoDY4ToxiUoDDtDiM0N7OTqDDX98urPCCGHvZ0kgBwNr793fDTDjwPD/_x6=DT1yUkqQ19ELUaImeGyF5GuepwTwSw89ecrk6mQ_Go/dxoOGiQ0oYA4PY4o0xrAe3BooQqY0xAo45W5MOhZiwAxoDDfKRYKhm3SGb0UyPXgaXxcq/7vDhmPmxYlGx7IziYsDehA5oGDkF4KiD4jiPjxrUN4YD; ssxmod_itna2=1-GqRx0DuDyDcD97DnD4qeqO4mhx3d4Ku7D0QDXDUwqiQGgDYq7=GFRDCxEU3R6jb2oqxKaePmhhbt7W4DWpiQAm4PqDj44etUtDDsYeF=_wYauWOGqUa7WaFPeO4kGLFOQ_wckk4Hr0aIF8p2D=lvba=D4HpK=lPxOOZv4aZ9auxY_aciHR0vtd/5kFPEQm=oEm294Vh5ARAYmQKHC52pxp1PqVaray4yUWKKvl4LsinFeqrEYeiieMzMOa2D8KK6YF/yHaxnaOjkC/B8C241alphqQSG_1T3CHrlpaAcvYAd=qA3ptM54ma3sELoowrpK_nK6GG3WxXAYyA0X6h9AfXOPsEDUevkPeZBI0BXzxbUDiPPo9lf6Arm=6vPvWUfka3ioTT_NzrwLmrObt4Djk=msKIXpTxf=rtKFoRxljNzLm/24t6QnWC_Ds2YCt3lZbKI6CSKlYL9BcMxjtp=OUakrr1zFk/5Df3lriT9iy0uCooRfHQZrAe3rKxVDFzZIpWxumxf9wvb60BDNE7ffKzEeLYKnZIbW4mBgzePsDehm7oDPPngWHhWkDxD",
    // "Referer": "https://chat.z.ai/c/c32806d8-1095-4038-a113-14802a0aeca6"
  },
  "body": "{\"stream\":true,\"model\":\"0727-360B-API\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"},{\"role\":\"user\",\"content\":\"hmm\"}],\"signature_prompt\":\"hmm\",\"params\":{},\"features\":{\"image_generation\":false,\"web_search\":false,\"auto_web_search\":false,\"preview_mode\":true,\"flags\":[],\"enable_thinking\":true},\"variables\":{\"{{USER_NAME}}\":\"Putra Budiman\",\"{{USER_LOCATION}}\":\"Unknown\",\"{{CURRENT_DATETIME}}\":\"2025-11-12 19:40:04\",\"{{CURRENT_DATE}}\":\"2025-11-12\",\"{{CURRENT_TIME}}\":\"19:40:04\",\"{{CURRENT_WEEKDAY}}\":\"Wednesday\",\"{{CURRENT_TIMEZONE}}\":\"Asia/Bangkok\",\"{{USER_LANGUAGE}}\":\"en-US\"},\"chat_id\":\"local\"}",
  "method": "POST"
});
    // const response = await fetch(endpoint, {
    //   headers: buildRequestHeaders(apiKey, signature),
    //   body: JSON.stringify(body),
    //   method: "POST",
    // })
    await makeStreamCompletion(response, true, realModel)
  } else {
    console.error(`Failed to construct request payloads`)
  }
}

main().catch((e) => console.error(e))

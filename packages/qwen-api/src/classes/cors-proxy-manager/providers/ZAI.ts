import { v1 } from "uuid"
import { Client } from "../Client"
import { estimateMessagesTokens, estimateTokens } from "src/fn/llm/countTokens"
import { availableModels } from "./zai/availableModels"
import { transformMessages } from "./zai/transformRequestMessages"
import { getLastUserMessageContent } from "./zai/getLastUserMessageContent"
import { getAuthAndModels } from "./zai/getAuthAndModels"
import { getEndpointSignature } from "./zai/getEndpointSignature"
import { getModel } from "./zai/getModel"
import { buildRequestBody } from "./zai/buildRequestBody"
import { buildRequestHeaders } from "./zai/buildRequestHeaders"
import { buildStreamChunk } from "./zai/buildStreamChunk"
class ZAI extends Client {
  availableModels = availableModels
  constructor(options: any = {}) {
    super({
      baseUrl: "https://chat.z.ai",
      defaultModel: "GLM-4.6-API-V1",
      modelAliases: {
        // Chat //
      },
      ...options,
    })
  }

  get chat() {
    return {
      completions: {
        create: async (
          params: any,
          requestOption: any = {},
          direct = false
        ) => {
          let { model: requstModel, ...options } = params

          const defaultModel = this.defaultModel as string

          const [models, apiKey, authUserId, modelAliases] =
            await getAuthAndModels()

          const transformedMessages = transformMessages(options.messages)
          const userPrompt = getLastUserMessageContent(transformedMessages)
          if (userPrompt && apiKey && authUserId) {
            const [endpoint, signature, timestamp] = getEndpointSignature(
              this.baseUrl,
              apiKey,
              authUserId,
              userPrompt
            )

            const realModel = getModel(requstModel, modelAliases, defaultModel)
            // console.log({ realModel, endpoint, signature })
            // return
            const thinking = false
            const body = buildRequestBody(
              realModel,
              transformedMessages,
              thinking
            )
            // console.log({ body })
            const response = await fetch(endpoint, {
              headers: buildRequestHeaders(apiKey, signature),
              body: JSON.stringify(body),
              method: "POST",
            })
            // await makeStreamCompletion(response, true, realModel, "", [])

            if (params.stream) {
              return this.makeStreamCompletion(response, direct, realModel)
            }
            return this._sendResponseFromStream(
              this.makeStreamCompletion(response, false, realModel)
            )
          } else {
            console.error(`Failed to construct request payloads`)
          }
        },
      },
    }
  }
  async _sendResponseFromStream(input: any) {
    // const reader = response.body.getReader()
    let content = ""
    let chatResponse: any = {
      choices: [
        {
          message: {
            role: "assistant",
            content: "",
          },
        },
      ],
    }
    for await (const chunk of input) {
      // console.log(chunk.toString())
      // dataPtr = chunk
      content += chunk.choices[0].delta.content
      // console.log({ content })

      if (chunk.usage) {
        chatResponse.usage = chunk.usage
      }
    }
    chatResponse.choices[0].message.content = content
    // console.log(dataPtr)

    return chatResponse
  }
  async *makeStreamCompletion(response: Response, sso = false, model: string) {
    // Validate response with more detailed error message
    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status} and message: ${await response.text()}`
      )
    }

    // Check if response body exists
    if (!response.body) {
      throw new Error("Streaming not supported in this environment")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    const promptTokens = 0
    let completionTokens = 0
    let calculatedUsage: any = null

    let buffer = ""
    let completionId = 1

    try {
      // Process the stream until completion
      while (true) {
        const { done, value } = await reader.read()

        // Handle stream completion
        if (done) {
          // Send final event if in SSO mode
          if (sso) {
            const totalTokens = promptTokens + completionTokens
            let usage = {
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: totalTokens,
            }
            if (calculatedUsage) {
              usage = calculatedUsage
            }
            const finalChunk = buildStreamChunk({
              model,
              index: completionId,
              finishReason: "done",
              content: "",
              usage,
              done: true,
            })
            yield encoder.encode(
              `data: ${JSON.stringify(finalChunk)}\n\ndata: [DONE]\n\n`
            )
          }
          break
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Split buffer by newlines and process each part
        const lines = buffer.split("\n")

        // Keep the last incomplete part in buffer
        buffer = lines.pop() || ""

        // Process each complete line
        for (const line of lines) {
          // Skip empty lines or DONE markers
          if (!line.trim() || line === "data: [DONE]") {
            continue
          }

          try {
            // Process only data lines
            if (line.startsWith("data: ")) {
              // Extract JSON string after "data: "
              const jsonString = line.slice(6)

              // Validate that we have JSON content
              if (!jsonString) {
                continue
              }

              const jsonData = JSON.parse(jsonString)

              if (jsonData.type === "chat:completion") {
                const { data } = jsonData
                const { done, delta_content, usage } = data
                if (usage) {
                  calculatedUsage = usage
                }
                // console.log(jsonData)
                const result = this.convertToOpenaiTextStream(
                  jsonData,
                  model,
                  completionId
                )

                if (result) {
                  if (sso) {
                    yield encoder.encode(`data: ${JSON.stringify(result)}\n\n`)
                  } else {
                    yield result
                  }
                  // console.log(`data: ${JSON.stringify(result)}\n\n`)

                  // Only increment completion ID if not a completion end event
                  if (done) {
                    completionId++
                  }
                }
              }
            }
          } catch (err) {
            // Log parsing errors but continue processing
            // console.error("Error parsing chunk:", line, err)

            // For robustness, we could also emit an error event in SSO mode
            if (sso) {
            }
          }
        }
      }
    } finally {
      // Ensure reader is released even if an error occurs
      reader.releaseLock()
    }
  }

  convertToOpenaiTextStream(
    jsonData: any,
    model: string,
    completionId: number
  ) {
    const { data: inputData } = jsonData
    const { done, delta_content: text } = inputData

    if (inputData.delta_content) {
      return buildStreamChunk({
        model,
        index: completionId,
        finishReason: done ? "finish" : null,
        content: text,
      })
    }

    return null
  }
}

export { ZAI }
export default ZAI

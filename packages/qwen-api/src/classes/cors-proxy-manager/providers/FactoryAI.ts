import { v1 } from "uuid"
import { Client } from "../Client"
import { estimateMessagesTokens, estimateTokens } from "src/fn/llm/countTokens"
export const availableModels = [
  {
    id: "gpt-5-2025-08-07",
    alias: "gpt-5",
    use: "gpt",
  },
  {
    id: "gpt-5-codex",
    alias: "gpt-5-codex",
    use: "gpt",
  },
  {
    id: "claude-opus-4-1-20250805",
    alias: "claude-opus-4",
    use: "antrophic",
  },
  {
    id: "claude-sonnet-4-20250514",
    alias: "claude-sonnet-4",
    use: "antrophic",
  },
  {
    id: "claude-sonnet-4-5-20250929",
    alias: "claude-sonnet-4.5",
    use: "antrophic",
  },
]
class FactoryAI extends Client {
  availableModels = availableModels
  gptEndpoint = "o/v1/responses"
  antrophicEndpoint = "a/v1/messages"
  constructor(options: any = {}) {
    if (!options.apiKey) {
      if (typeof process !== "undefined" && process.env.FACTORY_AI_TOKEN) {
        options.apiKey = process.env.FACTORY_AI_TOKEN
      } else {
        throw new Error(
          "Factory API key is required. Set it in the options or as an environment variable FACTORY_AI_TOKEN."
        )
      }
    }
    super({
      baseUrl: "https://app.factory.ai/api/llm",
      defaultModel: "gpt-5",
      modelAliases: {
        // Chat //
        "gpt-5": "gpt-5-2025-08-07",
        "gpt-5-codex": "gpt-5-codex",
        "claude-opus-4": "claude-opus-4-1-20250805",
        "claude-sonnet-4.5": "claude-sonnet-4-5-20250929",
        "claude-sonnet-4": "claude-sonnet-4-20250514",
      },
      ...options,
    })
  }
  getEndpoint(model: string) {
    // const realModel = this.modelAliases[model]

    const modelObj = this.availableModels.find((m) => m.id === model)
    // console.log({ modelObj, model })
    if (modelObj) {
      return modelObj.use
    }
    return "gpt"
  }
  checkGptMessageContent(content: any) {
    if (Array.isArray(content)) {
      let combinedContent = content.map((c) => c.text).join("\n")
      return combinedContent
    }
    return content
  }
  transformGptMessagesContents(messages: any[]) {
    const input = messages
      .filter((m) => m.role !== "system")
      .map((message) => {
        return {
          role: message.role,
          content: this.checkGptMessageContent(message.content),
        }
      })
    let instructions = ""
    const systemMessages = messages.filter((m) => m.role === "system")
    for (const sysMsg of systemMessages) {
      instructions += `${sysMsg.content}`
    }
    // console.log({ input, instructions })

    return [input, instructions]
  }
  transformAntrophicMessagesContents(messages: any[]) {
    const input = messages
      .filter((m) => m.role !== "system")
      .map((message) => {
        return {
          role: message.role,
          content: this.checkGptMessageContent(message.content),
        }
      })
    let instructions = ""
    const systemMessages = messages.filter((m) => m.role === "system")
    for (const sysMsg of systemMessages) {
      instructions += `${sysMsg.content}`
    }
    // console.log({ input, instructions })
    return [input, instructions]
  }
  buildGptRequest(model: string, options: any) {
    const [input, instructions] = this.transformGptMessagesContents(
      options.messages
    )
    const body: any = {
      model,
      store: false,
      input,
      stream: options.stream,
    }
    if (instructions.length > 0) {
      body.instructions = instructions
    }
    return body
  }
  buildAntrophicRequest(model: string, options: any) {
    const [messages, instructions] = this.transformAntrophicMessagesContents(
      options.messages
    )
    const body: any = {
      model,
      messages,
      stream: options.stream,
      max_tokens: options.max_tokens || 4000,
    }
    if (instructions.length > 0) {
      body.system = instructions
    }
    return body
  }
  get chat() {
    return {
      completions: {
        create: async (
          params: any,
          requestOption: any = {},
          direct = false
        ) => {
          let { model, ...options } = params

          if (!model) {
            model = this.defaultModel
          }
          if (model && this.modelAliases[model]) {
            model = this.modelAliases[model] as string
          }
          const useEndpoint = this.getEndpoint(model)
          const body =
            useEndpoint === "gpt"
              ? this.buildGptRequest(model, options)
              : this.buildAntrophicRequest(model, options)

          if (useEndpoint === "gpt") {
            body.stream = true
          }
          const requestOptions = {
            method: "POST",
            headers: this.extraHeaders,
            body: JSON.stringify(body),
            ...requestOption,
          }

          let endpoint = `${this.baseUrl}/${useEndpoint === "gpt" ? this.gptEndpoint : this.antrophicEndpoint}`

          // console.log({ requestOptions, endpoint })
          // console.log({ body })
          const messages = useEndpoint === "gpt" ? body.input : body.messages
          // return
          const response = await fetch(endpoint, requestOptions)
          if (params.stream) {
            return this.makeStreamCompletion(
              response,
              direct,
              model,
              useEndpoint,
              messages
            )
          } else {
            if (useEndpoint === "gpt") {
              return this._sendResponseFromStream(
                this.makeStreamCompletion(
                  response,
                  false,
                  model,
                  useEndpoint,
                  messages
                )
              )
            }
            return await this._sendCompletion(response, useEndpoint)
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
  async _sendCompletion(response: Response, use: string) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    // console.log("Here 2", response)

    const data = await response.json()
    // console.log({ data })
    let newData = data
    if (use === "gpt") {
    } else {
      /*
    response: {
    id: 'msg_01Dbw7zefJSsrbrNHdJACGnh',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-4-1-20250805',
    content: [ { type: 'text', text: '{ "title": "👋 Initial Greeting Exchange" }' } ],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: 205,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: [Object],
      output_tokens: 11,
      service_tier: 'standard'
    }
  }
}
   
    */
      newData = {
        choices: [
          {
            message: {
              role: "assistant",
              content: data.content[0].text,
            },
          },
        ],
      }
    }
    // console.log(newData.content)
    return newData
  }

  /**
   * Creates an async generator to handle streaming completions from the API
   * @param response - The Response object from fetch call
   * @param sso - Whether to return Server-Sent Events format
   * @param model - The model identifier
   * @param use - The API type (e.g., "gpt", "antrophic")
   * @yields The parsed stream data in appropriate format
   */
  async *makeStreamCompletion(
    response: Response,
    sso = false,
    model: string,
    use: string,
    messages: any
  ): AsyncGenerator<any, void, undefined> {
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
    const promptTokens = estimateMessagesTokens(messages)
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
              const {
                input_tokens,
                cache_creation_input_tokens,
                cache_read_input_tokens,
                output_tokens,
              } = calculatedUsage
              usage.prompt_tokens = input_tokens
              usage.completion_tokens = output_tokens
              usage.total_tokens = input_tokens + output_tokens
            }
            yield encoder.encode(
              `data: ${JSON.stringify({
                id: `chatcmpl-${Date.now()}`,
                model: model,
                object: "chat.completion.chunk",
                index: completionId,
                finish_reason: "done",
                created: Date.now(),
                choices: [
                  {
                    delta: {
                      content: "",
                    },
                  },
                ],
                usage,
                done: true, // Flag akhir stream
              })}\n\ndata: [DONE]\n\n`
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
              completionTokens += estimateTokens(jsonString)
              if (jsonData.usage) {
                const {
                  input_tokens,
                  cache_creation_input_tokens,
                  cache_read_input_tokens,
                  output_tokens,
                } = jsonData.usage
                calculatedUsage = {
                  input_tokens,
                  cache_creation_input_tokens,
                  cache_read_input_tokens,
                  output_tokens,
                }
              }
              // Handle GPT responses specifically
              if (use === "gpt") {
                const result = this.streamGpt(
                  jsonData,
                  sso,
                  model,
                  completionId,
                  encoder
                )

                if (result) {
                  yield result

                  // Only increment completion ID if not a completion end event
                  if (jsonData.type !== "response.output_text.done") {
                    completionId++
                  }
                }
              } else {
                // console.log({ jsonData })
                const result = this.streamAntrophic(
                  jsonData,
                  sso,
                  model,
                  completionId,
                  encoder
                )

                if (result) {
                  yield result

                  // Only increment completion ID if not a completion end event
                  if (jsonData.type !== "response.output_text.done") {
                    completionId++
                  }
                }
              }
            }
          } catch (err) {
            // Log parsing errors but continue processing
            console.error("Error parsing chunk:", line, err)

            // For robustness, we could also emit an error event in SSO mode
            if (sso) {
              yield `data: ${JSON.stringify({ error: "Failed to parse stream chunk", chunk: line, details: err instanceof Error ? err.message : "Unknown error" })}\n`
            }
          }
        }
      }
    } finally {
      // Ensure reader is released even if an error occurs
      reader.releaseLock()
    }
  }

  streamGpt(
    jsonData: any,
    sso: boolean,
    model: string,
    completionId: number,
    encoder: any
  ) {
    /*
    {
  type: 'response.output_text.delta',
  sequence_number: 8,
  item_id: 'msg_0c5909c2988128260168e34f28d64c81998aa3d7821e12f146',
  output_index: 1,
  content_index: 0,
  delta: ' \n',
  logprobs: [],
  obfuscation: 'Zw2ZZOzsgRsJmF'
}
    */
    // Handle GPT response format
    // console.log(jsonData)

    if (
      jsonData.type &&
      (jsonData.type === "response.output_item.added" ||
        jsonData.type === "response.output_text.delta" ||
        jsonData.type === "response.output_text.done")
    ) {
      if (jsonData.delta || jsonData.text || jsonData.item) {
        let { text, delta, item } = jsonData
        let itemType = "text"
        if (item) {
          itemType = item.type === "reasoning" ? "thinking" : "text"
        }
        // console.log({ text, delta, item })
        // Convert to the format expected by the application
        let deltaData = {
          type: itemType,
          content:
            jsonData.type === "response.output_text.done"
              ? ""
              : jsonData.type === "response.output_text.delta"
                ? delta
                : "",
        }
        let data = {
          id: `chatcmpl-${Date.now()}`,
          model: model,
          object: "chat.completion.chunk",
          index: completionId,
          finish_reason:
            jsonData.type === "response.output_text.done" ? "finish" : null,
          created: Date.now(),
          choices: [
            {
              delta: deltaData,
            },
          ],
        }

        if (sso) {
          return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        } else return data
      }
    }
    return null
  }
  streamAntrophic(
    jsonData: any,
    sso: boolean,
    model: string,
    completionId: number,
    encoder: any
  ) {
    /*
    {
  type: 'response.output_text.delta',
  sequence_number: 8,
  item_id: 'msg_0c5909c2988128260168e34f28d64c81998aa3d7821e12f146',
  output_index: 1,
  content_index: 0,
  delta: ' \n',
  logprobs: [],
  obfuscation: 'Zw2ZZOzsgRsJmF'
}
    */
    // Handle GPT response format
    if (
      jsonData.type &&
      (jsonData.type === "content_block_delta" ||
        jsonData.type === "content_block_stop")
    ) {
      if (jsonData.delta) {
        const { text, type } = jsonData.delta
        // console.log({ text, delta })
        // Convert to the format expected by the application
        let data = {
          id: `chatcmpl-${Date.now()}`,
          model: model,
          object: "chat.completion.chunk",
          index: completionId,
          finish_reason:
            jsonData.type === "content_block_stop" ? "finish" : null,
          created: Date.now(),
          choices: [
            {
              delta: {
                content: jsonData.type === "content_block_stop" ? "" : text,
              },
            },
          ],
        }

        if (sso) {
          return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        } else return data
      }
    }
    return null
  }
}

export { FactoryAI }
export default FactoryAI

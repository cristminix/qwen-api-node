import { v1 } from "uuid"
import { Client } from "../Client"
import { estimateMessagesTokens, estimateTokens } from "src/fn/llm/countTokens"
export const availableModels = [
  {
    id: "glm-4.6",
    alias: "glm-4.6",
    use: "glm",
  },
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
  glmEndpoint = "o/v1/chat/completions"
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
        "glm-4.6": "glm-4.6",
      },
      ...options,
    })
  }
  buildRequestHeaders(use: string) {
    const headers = {
      "user-agent": "pB/JS 5.23.2",
      // "x-api-provider": "fireworks",
      // "x-assistant-message-id": "de2bbbca-a668-45f7-9213-c6210d69336b",
      "x-factory-client": "cli",
      // "x-session-id": "a57af53a-8ac3-4502-a509-072d41866366",
      // "x-stainless-arch": "x64",
      // "x-stainless-lang": "js",
      // "x-stainless-os": "Linux",
      // "x-stainless-package-version": "5.23.2",
      // "x-stainless-retry-count": 0,
      // "x-stainless-runtime": "node",
      // "x-stainless-runtime-version": "v24.3.0",
      // // Connection: "keep-alive",
      // Host: "app.factory.ai",
    }
    if (use === "glm") {
      headers["x-api-provider"] = "fireworks"
    } else if (use === "antrophic") {
      headers["x-api-provider"] = "anthropic"
    } else {
      headers["x-api-provider"] = "azure_openai"
    }
    /*
    
    */
    return headers
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
  checkMessageContentPart(content: any) {
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
          content: this.checkMessageContentPart(message.content),
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
          content: this.checkMessageContentPart(message.content),
        }
      })
    let instructions =
      "You are Droid, an AI software engineering agent built by Factory.\n"
    const systemMessages = messages.filter((m) => m.role === "system")
    for (const sysMsg of systemMessages) {
      instructions += `${sysMsg.content}\n`
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
      max_tokens: options.max_tokens || 32000,
      temperature: options.temperature || 1,
    }
    if (instructions.length > 0) {
      body.system = instructions
    }
    return body
  }
  buildGlmRequest(model: string, options: any) {
    // const [messages, instructions] = this.transformGptMessagesContents(
    //   options.messages
    // )
    const body: any = {
      model,
      messages: options.messages,
      stream: options.stream,
      max_tokens: options.max_tokens || 32000,
      temperature: options.temperature || 1,
    }
    // if (instructions.length > 0) {
    //   body.system = instructions
    // }
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
          let body =
            useEndpoint === "gpt"
              ? this.buildGptRequest(model, options)
              : this.buildAntrophicRequest(model, options)

          if (useEndpoint === "glm") {
            body = this.buildGlmRequest(model, options)
          }

          if (useEndpoint === "gpt") {
            body.stream = true
          }
          const addedHeaders = this.buildRequestHeaders(useEndpoint)
          const requestOptions = {
            method: "POST",
            headers: { ...this.extraHeaders, ...addedHeaders },
            body: JSON.stringify(body),
            ...requestOption,
          }

          let endpoint = `${this.baseUrl}/${useEndpoint === "gpt" ? this.gptEndpoint : this.antrophicEndpoint}`
          if (useEndpoint === "glm") {
            endpoint = `${this.baseUrl}/${this.glmEndpoint}`
          }
          // console.log({ requestOptions, endpoint, useEndpoint })
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
  /**
   * Processes non-streaming API completion responses and normalizes them to OpenAI format
   * @param response - The fetch Response object from the API
   * @param use - The API type identifier ("gpt" or "antrophic")
   * @returns Normalized completion response in OpenAI-compatible format
   * @throws {Error} When API request fails or response format is invalid
   */
  async _sendCompletion(response: Response, use: string) {
    // Validate HTTP response status
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      )
    }

    // Parse JSON response with error handling
    let data: any
    try {
      data = await response.json()
    } catch (error) {
      throw new Error(
        `Failed to parse API response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }

    // GPT format is already in OpenAI-compatible format, return as-is
    if (use === "gpt") {
      return this._validateAndNormalizeGptResponse(data)
    }

    // Transform Anthropic format to OpenAI-compatible format
    return this._transformAnthropicResponse(data)
  }

  /**
   * Validates and normalizes GPT response format
   * @param data - The raw GPT API response
   * @returns Normalized response
   * @throws {Error} When response format is invalid
   */
  private _validateAndNormalizeGptResponse(data: any) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid GPT response: Expected an object")
    }

    // GPT responses are already in OpenAI format, but ensure required fields exist
    if (
      !data.choices ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0
    ) {
      throw new Error("Invalid GPT response: Missing or empty choices array")
    }

    return data
  }

  /**
   * Transforms Anthropic API response to OpenAI-compatible format
   * @param data - The raw Anthropic API response
   * @returns Normalized response in OpenAI format
   * @throws {Error} When response format is invalid
   *
   * Anthropic response structure:
   * {
   *   id: string,
   *   type: 'message',
   *   role: 'assistant',
   *   model: string,
   *   content: [{ type: 'text', text: string }],
   *   stop_reason: string,
   *   usage: { input_tokens: number, output_tokens: number, ... }
   * }
   */
  private _transformAnthropicResponse(data: any) {
    // Validate response structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid Anthropic response: Expected an object")
    }

    if (
      !data.content ||
      !Array.isArray(data.content) ||
      data.content.length === 0
    ) {
      throw new Error(
        "Invalid Anthropic response: Missing or empty content array"
      )
    }

    // Extract text content from the first content block
    const firstContent = data.content[0]
    if (!firstContent || typeof firstContent !== "object") {
      throw new Error("Invalid Anthropic response: Invalid content block")
    }

    const contentText = firstContent.text || ""

    // Build OpenAI-compatible response structure
    const normalizedResponse: any = {
      id: data.id || `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: data.model || "unknown",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: contentText,
          },
          finish_reason: this._mapAnthropicStopReason(data.stop_reason),
        },
      ],
    }

    // Include usage information if available
    if (data.usage) {
      normalizedResponse.usage = {
        prompt_tokens: data.usage.input_tokens || 0,
        completion_tokens: data.usage.output_tokens || 0,
        total_tokens:
          (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
      }
    }

    return normalizedResponse
  }

  /**
   * Maps Anthropic stop reasons to OpenAI finish reasons
   * @param stopReason - The Anthropic stop_reason value
   * @returns Corresponding OpenAI finish_reason
   */
  private _mapAnthropicStopReason(stopReason: string | null): string {
    const mapping: Record<string, string> = {
      end_turn: "stop",
      max_tokens: "length",
      stop_sequence: "stop",
    }

    return stopReason ? mapping[stopReason] || "stop" : "stop"
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
              const { input_tokens, output_tokens } = calculatedUsage
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
              } else if (use === "antrophic") {
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
              } else {
                // glm
                yield encoder.encode(`data: ${JSON.stringify(jsonData)}\n\n`)
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

  /**
   * Processes GPT streaming response chunks and normalizes them to OpenAI format
   * @param jsonData - The parsed JSON data from the stream chunk
   * @param sso - Whether to return Server-Sent Events (SSE) encoded format
   * @param model - The model identifier
   * @param completionId - Sequential ID for tracking chunks
   * @param encoder - TextEncoder instance for SSE encoding
   * @returns Encoded SSE data, normalized chunk object, or null if not processable
   */
  streamGpt(
    jsonData: any,
    sso: boolean,
    model: string,
    completionId: number,
    encoder: TextEncoder
  ): Uint8Array | Record<string, any> | null {
    // Early return for invalid or non-processable chunk types
    if (!jsonData?.type) {
      return null
    }

    // Define processable event types
    const PROCESSABLE_TYPES = new Set([
      "response.output_item.added",
      "response.output_text.delta",
      "response.output_text.done",
    ])

    // Check if this chunk type should be processed
    if (!PROCESSABLE_TYPES.has(jsonData.type)) {
      return null
    }

    // Verify chunk contains processable data
    if (!jsonData.delta && !jsonData.text && !jsonData.item) {
      return null
    }

    // Extract data with type safety
    const { text, delta, item } = jsonData

    // Determine item type with explicit type checking
    const itemType = this._determineGptItemType(item)

    // Build delta content based on event type
    const deltaContent = this._buildGptDeltaContent(jsonData.type, delta)

    // Create normalized chunk data structure
    const chunkData = this._createGptChunkData(
      model,
      completionId,
      itemType,
      deltaContent,
      jsonData.type
    )

    // Return appropriate format based on SSO flag
    return sso
      ? encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`)
      : chunkData
  }

  /**
   * Determines the item type from GPT response item
   * @param item - The item object from GPT response
   * @returns The item type ("thinking" for reasoning, "text" otherwise)
   */
  private _determineGptItemType(item: any): string {
    if (!item) {
      return "text"
    }

    return item.type === "reasoning" ? "thinking" : "text"
  }

  /**
   * Builds the delta content based on GPT response type
   * @param responseType - The type of GPT response event
   * @param delta - The delta value from the response
   * @returns The appropriate content string
   */
  private _buildGptDeltaContent(responseType: string, delta?: string): string {
    // Done events have no content
    if (responseType === "response.output_text.done") {
      return ""
    }

    // Delta events use delta value
    if (responseType === "response.output_text.delta") {
      return delta || ""
    }

    // Default to empty string for other types
    return ""
  }

  /**
   * Creates a normalized GPT chunk data structure in OpenAI format
   * @param model - The model identifier
   * @param completionId - Sequential ID for the chunk
   * @param itemType - Type of the item ("text" or "thinking")
   * @param content - The content string for the delta
   * @param responseType - The original GPT response type
   * @returns Normalized chunk data object
   */
  private _createGptChunkData(
    model: string,
    completionId: number,
    itemType: string,
    content: string,
    responseType: string
  ): Record<string, any> {
    const isDone = responseType === "response.output_text.done"
    const timestamp = Date.now()

    return {
      id: `chatcmpl-${timestamp}`,
      model,
      object: "chat.completion.chunk",
      index: completionId,
      finish_reason: isDone ? "finish" : null,
      created: timestamp,
      choices: [
        {
          delta: {
            type: itemType,
            content,
          },
        },
      ],
    }
  }
  streamAntrophic(
    jsonData: any,
    sso: boolean,
    model: string,
    completionId: number,
    encoder: any
  ) {
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

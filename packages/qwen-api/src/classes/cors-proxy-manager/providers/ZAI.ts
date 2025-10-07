import { v1 } from "uuid"
import { Client } from "../Client"
import { estimateMessagesTokens, estimateTokens } from "src/fn/llm/countTokens"
import { availableModels } from "./zai/availableModels"
class ZAI extends Client {
  availableModels = availableModels 
  constructor(options: any = {}) {
    if (!options.apiKey) {
      if (typeof process !== "undefined" && process.env.ZAI_TOKEN) {
        options.apiKey = process.env.ZAI_TOKEN
      } else {
        throw new Error(
          "Factory API key is required. Set it in the options or as an environment variable FACTORY_AI_TOKEN."
        )
      }
    }
    super({
      baseUrl: "https://chat.z.ai",
      defaultModel: "glm-4.6",
      modelAliases: {
        // Chat //
     
      },
      ...options,
    })
  }
  buildRequestHeaders(signature:string) {
    const headers = {
      "x-fe-version": "prod-fe-1.0.95",
      "x-signature": signature,
    }
   
    return headers
  }

  checkMessageContentPart(content: any) {
    if (Array.isArray(content)) {
      let combinedContent = content.map((c) => c.text).join("\n")
      return combinedContent
    }
    return content
  }
  transformMessagesContents(messages: any[]) {
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
 
  buildRequestBody(model: string, options: any) {
   
    const body: any = {
      model,
      messages: options.messages,
      stream: options.stream,
      max_tokens: options.max_tokens || 32000,
      temperature: options.temperature || 1,
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
          let body =  this.buildRequestBody(model, options)
       
const signature=""
         
          const addedHeaders = this.buildRequestHeaders(signature)
          const requestOptions = {
            method: "POST",
            headers: { ...this.extraHeaders, ...addedHeaders },
            body: JSON.stringify(body),
            ...requestOption,
          }
const endpointQs=""
          let endpoint = `${this.baseUrl}/api/chat/completions?${endpointQs}`
        
          // console.log({ requestOptions, endpoint, useEndpoint })
          // console.log({ body })
          const messages =  body.messages
          // return
          const response = await fetch(endpoint, requestOptions)
          if (params.stream) {
            return this.makeStreamCompletion(
              response,
              direct,
              model,
              "",
              messages
            )
          }  
            return await this._sendCompletion(response, "")
          
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

    

    // Transform Anthropic format to OpenAI-compatible format
    return (data)
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

export { ZAI as FactoryAI }
export default ZAI

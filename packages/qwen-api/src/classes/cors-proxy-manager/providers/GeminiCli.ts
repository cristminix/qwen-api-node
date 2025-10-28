import { v1 } from "uuid"
import { Client } from "../Client"
export const availableModels = [
  {
    id: "gemini-2.5-pro",
  },
  {
    id: "gemini-2.5-flash",
  },
]
/**
 * Validates an image URL or base64 data URL
 */
export function validateImageUrl(imageUrl: string) {
  if (!imageUrl) {
    return { isValid: false, error: "Image URL is required" }
  }

  if (imageUrl.startsWith("data:image/")) {
    // Validate base64 image
    const [mimeTypePart, base64Part] = imageUrl.split(",")

    if (!base64Part) {
      return { isValid: false, error: "Invalid base64 image format" }
    }

    const mimeType = mimeTypePart.split(":")[1].split(";")[0]
    const format = mimeType.split("/")[1]

    const supportedFormats = ["jpeg", "jpg", "png", "gif", "webp"]
    if (!supportedFormats.includes(format.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported image format: ${format}. Supported formats: ${supportedFormats.join(", ")}`,
      }
    }

    // Basic base64 validation
    try {
      atob(base64Part.substring(0, 100)) // Test a small portion
    } catch {
      return { isValid: false, error: "Invalid base64 encoding" }
    }

    return { isValid: true, mimeType, format }
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    // Basic URL validation
    try {
      new URL(imageUrl)
      return { isValid: true, mimeType: "image/jpeg" } // Default assumption for URLs
    } catch {
      return { isValid: false, error: "Invalid URL format" }
    }
  }

  return {
    isValid: false,
    error: "Image URL must be a base64 data URL or HTTP/HTTPS URL",
  }
}
class GeminiCli extends Client {
  availableModels = availableModels
  constructor(options: any = {}) {
    if (!options.apiKey) {
      if (typeof process !== "undefined" && process.env.GEMINI_CLI_TOKEN) {
        options.apiKey = process.env.GEMINI_CLI_TOKEN
      } else if (
        typeof localStorage !== "undefined" &&
        localStorage.getItem("GeminiCli-api_key")
      ) {
        options.apiKey = localStorage.getItem("GeminiCli-api_key")
      } else {
        throw new Error(
          "GeminiCli API key is required. Set it in the options or as an environment variable GEMINI_CLI_TOKEN."
        )
      }
    }
    super({
      baseUrl: "https://cloudcode-pa.googleapis.com/v1internal",
      defaultModel: "gemini-2.5-flash",
      modelAliases: {
        // Chat //
        "gemini-2.5-pro": "gemini-2.5-pro",
        "gemini-2.5-flash": "gemini-2.5-flash",
      },
      ...options,
    })
  }
  /**
   * Converts a message to Gemini format, handling both text and image content.
   */
  private messageToGeminiFormat(msg: any) {
    const role = msg.role === "assistant" ? "model" : "user"

    // Handle tool call results (tool role in OpenAI format)
    if (msg.role === "tool") {
      return {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: msg.tool_call_id || "unknown_function",
              response: {
                result:
                  typeof msg.content === "string"
                    ? msg.content
                    : JSON.stringify(msg.content),
              },
            },
          },
        ],
      }
    }

    // Handle assistant messages with tool calls
    if (
      msg.role === "assistant" &&
      msg.tool_calls &&
      msg.tool_calls.length > 0
    ) {
      const parts: any[] = []

      // Add text content if present
      if (typeof msg.content === "string" && msg.content.trim()) {
        parts.push({ text: msg.content })
      }

      // Add function calls
      for (const toolCall of msg.tool_calls) {
        if (toolCall.type === "function") {
          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments),
            },
          })
        }
      }

      return { role: "model", parts }
    }

    if (typeof msg.content === "string") {
      // Simple text message
      return {
        role,
        parts: [{ text: msg.content }],
      }
    }

    if (Array.isArray(msg.content)) {
      // Multimodal message with text and/or images
      const parts: any[] = []

      for (const content of msg.content) {
        if (content.type === "text") {
          parts.push({ text: content.text })
        } else if (content.type === "image_url" && content.image_url) {
          const imageUrl = content.image_url.url

          // Validate image URL
          const validation = validateImageUrl(imageUrl)
          if (!validation.isValid) {
            throw new Error(`Invalid image: ${validation.error}`)
          }

          if (imageUrl.startsWith("data:")) {
            // Handle base64 encoded images
            const [mimeType, base64Data] = imageUrl.split(",")
            const mediaType = mimeType.split(":")[1].split(";")[0]

            parts.push({
              inlineData: {
                mimeType: mediaType,
                data: base64Data,
              },
            })
          } else {
            // Handle URL images
            // Note: For better reliability, you might want to fetch the image
            // and convert it to base64, as Gemini API might have limitations with external URLs
            parts.push({
              fileData: {
                mimeType: validation.mimeType || "image/jpeg",
                fileUri: imageUrl,
              },
            })
          }
        }
      }

      return { role, parts }
    }

    // Fallback for unexpected content format
    return {
      role,
      parts: [{ text: String(msg.content) }],
    }
  }
  transformMessages(messages: any[]): any[] {
    const transformedMessages: any[] = []

    for (const message of messages) {
      if (Array.isArray(message.content)) {
        // handle array of objects
        for (const item of message.content) {
          if (item.type === "text") {
            transformedMessages.push({
              role: message.role,
              content: item.text,
            })
          }
        }
      } else if (typeof message.content === "string") {
        // handle plain string
        transformedMessages.push({
          role: message.role,
          content: message.content,
        })
      }
    }
    // console.log(JSON.stringify(transformedMessages))
    return transformedMessages
  }
  transformMessagesContents(messages: any[]): [string, any[]] {
    const omessages = messages
      .filter((m) => m.role === "user")
      .map((msg) => this.messageToGeminiFormat(msg))
    // console.log(JSON.stringify(omessages))
    const systemMsgs = this.transformMessages(
      messages.filter((m) => m.role === "system")
    )
    let systemPrompt = ""
    for (const msg of systemMsgs) {
      systemPrompt += `${msg.content}\n`
    }
    // console.log({ systemPrompt, omessages: JSON.stringify(omessages) })
    return [systemPrompt, omessages]
  }
  parseRequestBody(model: string, options: any) {
    const [systemPrompt, omessages] = this.transformMessagesContents(
      options.messages
    )
    if (systemPrompt.length > 0)
      omessages.unshift({ role: "user", parts: [{ text: systemPrompt }] })
    return {
      model,
      project: "mythic-berm-djkxm",
      user_prompt_id: v1(),
      request: {
        // systemPrompt,
        contents: omessages,
        generationConfig: {
          temperature: options.temperature || 0,
          topP: options.topP || 1,
          thinkingConfig: {
            includeThoughts: options.thinking || false,
          },
        },
      },
    }
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
          const requestOptions = {
            method: "POST",
            headers: this.extraHeaders,
            body: JSON.stringify(this.parseRequestBody(model, options)),
            ...requestOption,
          }
          // console.log(requestOptions)

          const response = await fetch(
            `${this.baseUrl}:${params.stream ? "streamGenerateContent?alt=sse" : "generateContent"}`,
            requestOptions
          )
          if (params.stream) {
            return this._streamCompletion2(response, direct, model)
          } else {
            return this.sendCompletionResponse(response)
          }
        },
      },
    }
  }
  async sendCompletionResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    return await response.json()
  }

  async *_streamCompletion2(response: Response, sso = false, model: string) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    if (!response.body) {
      throw new Error("Streaming not supported in this environment")
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let completionId = 1

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (sso) yield "data: [DONE]\n\n"

          break
        }
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n")
        buffer = parts.pop() || ""
        for (const part of parts) {
          if (!part.trim() || part === "data: [DONE]") continue
          try {
            if (part.startsWith("data: ")) {
              const jsonData = JSON.parse(part.slice(6))
              // Handle Gemini response format
              if (jsonData.response && jsonData.response.candidates) {
                const candidate = jsonData.response.candidates[0]
                if (candidate && candidate.content && candidate.content.parts) {
                  const text = candidate.content.parts
                    .map((part: any) => part.text)
                    .join("")
                  // Convert to the format expected by the application
                  let data = {
                    id: `chatcmpl-${Date.now()}`,
                    model: model,
                    object: "chat.completion.chunk",
                    index: completionId,
                    finish_reason: null,
                    created: Date.now(),
                    choices: [
                      {
                        delta: {
                          content: text,
                        },
                      },
                    ],
                  }
                  completionId += 1

                  if (sso) {
                    yield `data: ${JSON.stringify(data)}\n\n`
                  } else yield data
                }
              }
            }
          } catch (err) {
            console.error("Error parsing chunk:", part, err)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

export { GeminiCli }
export default GeminiCli

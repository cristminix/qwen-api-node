import { v1 } from "uuid"
import { Client } from "../Client"

class GeminiCli extends Client {
  availableModels = [
    {
      id: "gemini-2.5-pro",
    },
    {
      id: "gemini-2.5-flash",
    },
  ]
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
  transformMessagesContents(messages: any[]) {
    return messages.map((message) => {
      return {
        role: message.role === "assistant" ? "model" : message.role,
        parts: [
          {
            text: message.content,
          },
        ],
      }
    })
  }
  parseRequestBody(model: string, options: any) {
    /*{
              model,
              ...options,
            }*/
    return {
      model,
      project: "mythic-berm-djkxm",
      user_prompt_id: v1(),
      request: {
        contents: this.transformMessagesContents(options.messages),
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
            if (direct) return response
            return this._streamCompletion(response)
          } else {
            return this._regularCompletion(response)
          }
        },
      },
    }
  }
  async _regularCompletion(response: Response) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    return await response.json()
  }

  async *_streamCompletion(response: Response) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    if (!response.body) {
      throw new Error("Streaming not supported in this environment")
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
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
                  const data = {
                    choices: [
                      {
                        delta: {
                          content: text,
                        },
                      },
                    ],
                  }
                  yield data
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

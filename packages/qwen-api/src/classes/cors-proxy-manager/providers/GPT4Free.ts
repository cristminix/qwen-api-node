import { v1 } from "uuid"
import { Client } from "../Client"
import generateId from "src/providers/blackbox/api/fn/generateId"
function transformMessages(messages: any[]): any[] {
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

  return transformedMessages
}
class GPT4Free extends Client {
  // protected baseUrl: string =

  protected defaultModel: string | null = "deepseek-ai/DeepSeek-V3.1"
  protected defaultProvider: string | null = "DeepInfra"
  lastRequestDate = Date.now()
  fullText = ""
  reasoningText = ""
  errorText = ""
  response: Promise<Response> | undefined
  isFinalized: boolean = false
  apiUrl: string = "/api/backend-api/v2/conversation"
  apiKey: string = ""
  abortController: AbortController | null = null

  onFinalizeMessageCallback: (text: string) => void = (text: string) => {}
  onUpdateMessageCallback: (text: string) => void = (text: string) => {}
  onReasoningCallback: (text: string, token: string) => void = (
    text: string
  ) => {}
  onPreviewCallback: (text: string) => void = (text: string) => {}
  onErroCallback: (text: string) => void = (text: string) => {
    console.error(text)
  }

  abortHandler: () => void = () => {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  updateMessage(text: string) {
    // do update
    this.onUpdateMessageCallback(text)
  }

  finalizeMessage(hasError = false) {
    if (!this.isFinalized) {
      // do last parsed message
      this.onFinalizeMessageCallback(this.fullText)
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  getReasoningText(resp: any): string {
    if (resp.token) return resp.token
    if (resp.status) return resp.status
    if (resp.label) return resp.label
    return ""
  }

  onError(errorMessage: string) {
    console.error(errorMessage)
    this.onErroCallback(errorMessage)
  }
  constructor(
    options: any = {
      baseUrl: "http://localhost:5173/api/backend-api/v2/conversation",
    }
  ) {
    super(options)
  }
  getModelAndProvider(srcModel: string) {
    return srcModel.split(":")
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
          const [realModel, realProvider] = this.getModelAndProvider(model)
          let provider = this.defaultProvider
          if (realModel && realProvider) {
            model = realModel
            provider = realProvider
          }
          // console.log({ model, provider, baseUrl: this.baseUrl })
          options.messages = transformMessages(options.messages)
          const body = {
            model,
            provider,
            action: "next",
            api_key: "",
            aspect_ratio: "16:9",
            conversation: null,
            conversation_id: v1(),
            download_media: true,
            id: Date.now().toString(),
            ...options,
          }
          console.log(body.messages)
          const requestOptions = {
            method: "POST",
            headers: this.extraHeaders,
            body: JSON.stringify(body),
            ...requestOption,
          }

          const response = await fetch(`${this.baseUrl}`, requestOptions)
          if (params.stream) {
            // if (direct) return response
            return this._streamCompletion2(response, direct, model)
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

  async *_streamCompletion2(response: Response, sso = false, model: string) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    if (!response.body) {
      throw new Error("Streaming not supported in this environment")
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    this.fullText = ""
    this.reasoningText = ""
    let completionId = 1
    try {
      while (true) {
        let buffer = ""

        try {
          const { done, value } = await reader.read()
          if (done) {
            // this.finalizeMessage()
            if (sso) yield encoder.encode("data: [DONE]\n")

            break
          }

          buffer += decoder.decode(value)

          for (const line of buffer.split("\n")) {
            if (!line) {
              continue
            }
            let resp
            try {
              resp = JSON.parse(line)
            } catch (error) {
              // Skip invalid JSON lines
              continue
            }

            if (resp) {
              // console.log(resp)
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
                      content: "",
                    },
                  },
                ],
              }
              completionId += 1
              switch (resp.type) {
                case "log":
                  break
                case "provider":
                  break
                case "content":
                  if (resp.content) {
                    // this.fullText += resp.content
                    // console.log(line)
                    // this.updateMessage(this.fullText)
                    /*
                    data: {"choices":[{"content_filter_results":{},"delta":{},"finish_reason":"stop","index":0,"logprobs":null}],"created":1756207702,"id":"chatcmpl-C8m8cKF9A2HJuGP6G3fuVjPVmdWRf","model":"gpt-4.1-nano-2025-04-14","object":"chat.completion.chunk","system_fingerprint":"fp_368a354b49"}'
                    */
                    data.choices[0].delta.content = resp.content
                    if (sso) {
                      yield encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                    } else yield data
                  }
                  break
                case "finish":
                  // const reason = resp.finish.reason
                  // this.finalizeMessage()
                  //@ts-ignore
                  data.finish_reason = "stop"
                  if (sso) {
                    yield encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                  } else yield data
                  break

                case "parameters":
                  break
                case "error":
                  if (resp.message) {
                    this.errorText = resp.message
                    this.onErroCallback(this.errorText)
                  }
                  break
                case "preview":
                  if (resp.preview) {
                    this.onPreviewCallback(resp.preview)
                  }
                  break
                case "conversation":
                  try {
                    // const { message_history } = resp.conversation[provider]
                    // const lastMessage = message_history[message_history.length - 1]
                    // // tmpFullText = tmpFullText
                    // fullText = lastMessage
                    // finalizeMessage()
                  } catch (error) {
                    console.error("Error accessing conversation data:", error)
                  }

                  break
                case "reasoning":
                  const token = this.getReasoningText(resp)
                  if (token) {
                    this.reasoningText += token
                    this.onReasoningCallback(this.reasoningText, token)
                  }
                  break
              }
            } else {
              alert("no response")
            }
          }
        } catch (error: any) {
          // Check if the error is due to abort
          if (error.name === "AbortError") {
            console.log("Request was aborted")
            this.finalizeMessage(true)
            break
          } else {
            console.error("Stream reading error:", error)
            this.onError("Stream reading error: " + error.message)
            break
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

export { GPT4Free }
export default GPT4Free

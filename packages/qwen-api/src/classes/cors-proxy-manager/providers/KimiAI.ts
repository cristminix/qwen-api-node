// import { v1 } from "uuid"
import { Client } from "../Client"

import { getLastUserMessageContent } from "./zai/getLastUserMessageContent"
import { createContextualUserMessage } from "./kimi/ChatHistoryEntry"

import { v1 } from "uuid"
import { replaceGrpcWebPatterns } from "./kimi/utils/replaceGrpcWebPatterns"
import { ChatSession } from "src/classes/ChatSession"
import { constructPayload } from "./kimi/utils/constructPayload"
export const availableModels = [
  {
    id: "kimi-k2",
    alias: "kimi-k2",
  },
]

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

function convertToXmlConversation(messages: any[]) {
  let systemMessageContent = ""
  const systemMessages = messages.filter((m) => m.role === "system")
  const lastPrompt = getLastUserMessageContent(messages) || "hi"
  const messageHistory = messages.filter((m) => m.role !== "system")
  if (messageHistory.length > 0) {
    const lastIndex = messageHistory.length - 1
    if (messageHistory[lastIndex].role === "user") {
      messageHistory.pop()
    }
  }
  if (systemMessages.length > 0) {
    const [sysMsg] = systemMessages
    systemMessageContent = sysMsg.content
  }
  const xmlPayload = createContextualUserMessage(
    systemMessageContent,
    messageHistory,
    lastPrompt,
    false
  )
  // console.log({ xmlPayload, systemMessageContent, lastPrompt, messageHistory })
  return xmlPayload
}

class KimiAI extends Client {
  // protected baseUrl: string =

  protected defaultModel: string | null = "kimi-k2"
  lastRequestDate = Date.now()

  chatEndpoint: string = "apiv2/kimi.chat.v1.ChatService/Chat"
  apiKey: string = ""
  currentChatId = ""
  streamBuffer = ""
  lastAssistantMessageContent = ""
  continueStreamBuffer = false
  processStreamBuffer = false
  sessionId = ""
  chatSession: ChatSession | null = null
  constructor(
    options: any = {
      baseUrl: "https://www.kimi.com",
    }
  ) {
    super(options)
    if (!this.apiKey || this.apiKey === "") {
      this.apiKey = process.env.KIMI_TOKEN as string
    }
  }
  getChatInfo(messages: any[]) {
    let systemMessageContent = ""
    const systemMessages = messages.filter((m) => m.role === "system")
    const lastPrompt = getLastUserMessageContent(messages) || "hi"
    const messageHistory = messages.filter((m) => m.role !== "system")
    if (messageHistory.length > 0) {
      const lastIndex = messageHistory.length - 1
      if (messageHistory[lastIndex].role === "user") {
        messageHistory.pop()
      }
    }
    if (systemMessages.length > 0) {
      const [sysMsg] = systemMessages
      systemMessageContent = sysMsg.content
    }
    if (messageHistory.length > 0) {
      // get currentChatId
      console.log("currentChatId", this.currentChatId)
      // get lastAssistantMessage
      // retrieve message id
      // create payload without system message
    } else {
      // create chat with new id
      this.currentChatId = v1()
    }
  }
  getChat(messages) {
    console.log("getChat")
  }
  saveChat(chat) {
    if (chat.id && chat.createTime) {
      console.log("saveChat", { chat })
      this.chatSession?.setChatId(chat.id)
    }
  }
  saveMessage(message) {
    if (message.id && message.role) {
      if (message.role === "user") {
        this.chatSession?.updateLastUserMessage(message.id, message.parentId)
      } else {
        if (message.content.length === 0)
          message.content = this.lastAssistantMessageContent
        this.chatSession?.insertAssistantMessage(message.content, message.id)
      }
      console.log("saveMessage", { message })

      // this.chatSession?.updateMessage(message,message.id,message.parent_id,)
    }
  }
  buldRequestHeaders() {
    const headers = {
      authorization: `Bearer ${this.apiKey}`,
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,id;q=0.8",
      "cache-control": "no-cache",
      "connect-protocol-version": "1",
      "content-type": "application/connect+json",
      pragma: "no-cache",
      priority: "u=1, i",
      "r-timezone": "Asia/Jakarta",
      "sec-ch-ua":
        '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-language": "en-US",
      "x-msh-device-id": "7561991421616617216",
      "x-msh-platform": "web",
    }
    return headers
  }
  generateSession(headers = {}) {
    // console.log(headers)
    // Create a session ID based on specific header values
    const headerValues = [
      headers["sec-ch-ua"] || "",
      headers["sec-ch-ua-mobile"] || "",
      headers["sec-ch-ua-platform"] || "",
      headers["sec-fetch-dest"] || "",
      headers["sec-fetch-mode"] || "",
      headers["sec-fetch-site"] || "",
      headers["user-agent"] || "",
      headers["x-title"] || "",
    ].join("|")

    // Create a simple hash of the header values to use as session ID
    let hash = 0
    for (let i = 0; i < headerValues.length; i++) {
      const char = headerValues.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    const sessionId = Math.abs(hash).toString(36)
    console.log("Generated session ID:", sessionId)
    return sessionId
  }
  buldRequestBody() {
    console.log(this.chatSession)
    // const [maxLen, markerStringIndex] = getValidContentMaxLen(
    //   this.chatSession?.prompt
    // )
    // const markerString = availabelPayloadHeaders[markerStringIndex]
    // const configValidBytesLen = availableByteLens[markerStringIndex]
    // let validPayloadBytesLen: any = configValidBytesLen
    // if (validPayloadBytesLen === -1) {
    //   // console.log("configValidBytesLen === -1")
    //   const [validPayloadBytesLenGuess] = calculateValidPayloadBytesLength(
    //     maxLen,
    //     markerString
    //   )
    //   validPayloadBytesLen = validPayloadBytesLenGuess
    // }
    // console.log({  validPayloadBytesLen ,markerString})

    //  return
    const p = constructPayload(
      this.chatSession?.prompt ?? "",
      this.chatSession?.chatId ?? "",
      this.chatSession?.lastAssistantMessageId ?? "",
      this.chatSession?.instruction ?? ""
    )
    return p
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

          // console.log({ model, provider, baseUrl: this.baseUrl })
          const inputMessages = transformMessages(options.messages)
          // const xmlPrompt = convertToXmlConversation(inputMessages)
          this.sessionId = this.generateSession(requestOption.inputHeaders)
          this.chatSession = ChatSession.getInstance(this.sessionId)
          this.lastAssistantMessageContent = ""
          if (this.chatSession) {
            this.chatSession.setMessages(inputMessages)
          }
          const body = this.buldRequestBody()
          // const body = this.buldRequestBody()
          const chatUrlEndpoint = `${this.baseUrl}/${this.chatEndpoint}`
          // console.log(body.messages)
          const requestOptions = {
            method: "POST",
            headers: this.buldRequestHeaders(),
            body,
          }

          //@ts-ignore
          const response = await fetch(chatUrlEndpoint, requestOptions)
          if (params.stream) {
            return this.makeStreamCompletion(response, direct, model)
          } else {
            return this._sendResponseFromStream(
              this.makeStreamCompletion(response, direct, model)
            )
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
      // console.log(chunk)
      // dataPtr = chunk
      try {
        content += chunk.choices[0].delta.content
      } catch (error) {}
      // console.log({ content })

      if (chunk.usage) {
        chatResponse.usage = chunk.usage
      }
    }
    chatResponse.choices[0].message.content = content
    // console.log(dataPtr)

    return chatResponse
  }
  async *makeStreamCompletion(
    response: Response,
    sso = false,
    model: string,
    outputBuffer: any = null
  ) {
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

    let buffer = ""
    let completionId = 1
    let combinedChunk = ""
    try {
      // Process the stream until completion
      while (true) {
        const { done: readerDone, value } = await reader.read()
        // Handle stream completion
        if (readerDone) {
          // Send final event if in SSO mode
          if (sso) {
            yield encoder.encode(`data: [DONE]\n\n`)
          } else yield ""
          break
        }

        // Decode the chunk and add to buffer
        if (this.continueStreamBuffer) {
          this.streamBuffer += decoder.decode(value, { stream: true })
        } else {
          this.streamBuffer = decoder.decode(value, { stream: true })
        }

        // Split buffer by newlines and process each part
        let line = this.streamBuffer.trim()
        // console.log(line[line.length-1] )
        let line_obj = null
        if (line[line.length - 1] !== "}") {
          this.processStreamBuffer = true
        } else {
          this.processStreamBuffer = false
          const multiline = replaceGrpcWebPatterns(line).trim()
          if (multiline.length > 0) {
            const multilineString = multiline.split("\n")
            for (const mline of multilineString) {
              try {
                line_obj = JSON.parse(mline)
                yield* this.processLineObject(
                  line_obj,
                  model,
                  sso,
                  completionId,
                  combinedChunk,
                  encoder
                )
              } catch (error) {}
            }
          }
        }
        if (!this.processStreamBuffer) {
          this.continueStreamBuffer = line_obj ? true : false
        }
      }
    } finally {
      // Ensure reader is released even if an error occurs
      reader.releaseLock()
      this.streamBuffer = ""
      this.continueStreamBuffer = false
    }
  }

  private async *processLineObject(
    line_obj: any,
    model: string,
    sso: boolean,
    completionId: number,
    combinedChunk: string,
    encoder: TextEncoder
  ) {
    // console.log(JSON.stringify(line_obj))
    this.streamBuffer = ""
    const {
      error,
      heartbeat,
      notification,
      op,
      mask,
      eventOffset,
      message,
      done,
      block,
      chat,
    } = line_obj
    if (error) {
      const { code, details } = error
      console.error(code, details)
    }
    if (op === "set") {
      if (chat) {
        /*
        {"op":"set","eventOffset":1,"chat":{"id":"d3rglnb12h610c3cc300","name":"Untitled Chat","createTime":"2025-10-21T04:23:57.122636Z","updateTime":"2025-10-21T04:23:57.122636Z"}}
        */
        // set or update chat
        this.saveChat(chat)
      }
      if (mask === "message" || mask === "message.status") {
        if (notification) {
          const { type, message: notificationMessage } = notification
        }
        if (message) {
          const { id, parentId, role, status, scenario } = message
          if (role === "assistant" && status === "MESSAGE_STATUS_GENERATING") {
            /*
      {"op":"set","mask":"message","eventOffset":3,"message":{"id":"d3rgln9djjpr0jobgrl0","parentId":"d3rgln9djjpr0jobgrkg","role":"assistant","status":"MESSAGE_STATUS_GENERATING","scenario":"SCENARIO_K2"}}
      
      */
            // insert message type assistant
            // this.saveMessage(message)
          } else if (role === "user" && status === "MESSAGE_STATUS_COMPLETED") {
            /*
      {"op":"set","mask":"message","eventOffset":2,"message":{"id":"d3rgln9djjpr0jobgrkg","role":"user","status":"MESSAGE_STATUS_COMPLETED","blocks":[{"id":"text_0_0","text":{"content":"<contextual_request><system_instruction></system_instruction><chat_history/><current_user_query>hi</current_user_query></contextual_request>"}}],"scenario":"SCENARIO_K2"}}
      */
            // insert message type user
            this.saveMessage(message)
          } else if (status === "MESSAGE_STATUS_COMPLETED") {
            /*
{"op":"set","mask":"message.status","eventOffset":15,"message":{"id":"d3rgln9djjpr0jobgrl0","status":"MESSAGE_STATUS_COMPLETED"}}
     
     */
            // insert message type assistant
            message.content = combinedChunk
            message.role = "assistant"

            this.saveMessage(message)
          }
        }
      }
    }
    if (mask === "chat.name") {
      if (chat) {
        const { name } = chat
      }
    } else if (mask === "block.text.content") {
      if (block) {
        const { id, text } = block
        if (text) {
          const { content } = text
          if (content) {
            combinedChunk += content
            if (combinedChunk.length > 0)
              this.lastAssistantMessageContent += content

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
                    content,
                  },
                },
              ],
            }
            if (sso) {
              yield encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            } else yield data
          }
        }
      }
    }
    if (done) {
    }
    /*
      "mask": "block.search.webPages",
    "eventOffset": 5,
    "block": {
        "id": "0_0",
        "search": {
            "webPages": [
                {
                    "title": "Prabowo Subianto: The tainted ex-military chief who will be ...",
                    "url": "https://www.bbc.com/news/world-asia-68237141",
                    "siteName": "bbc.com",
                    "iconUrl": "https://kimi-web-img.moonshot.cn/prod-data/icon-cache-img/www.bbc.com",
                    "snippet": "A convincing election wins sees a Suharto-era military figure poised to regain control of Indonesia.",
                    "publishTime": "2024-02-13T16:00:00Z",
                    "siteQuality": {}
                }
            ]
        }
    }
      */
  }
}

export { KimiAI }
export default KimiAI

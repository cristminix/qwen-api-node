import axios, { AxiosInstance } from "axios"
import {
  ChatCompletionRequest,
  ChatResponse,
  ChatMessage,
  ChatResponseStream,
} from "../../core/types/chat"
import { Tool } from "../../core/types/tools"
import {
  ACTION_SELECTION_PROMPT,
  TOOL_GENERATION_PROMPT,
} from "../../core/prompts"

import OSS from "ali-oss"
import * as fs from "fs"
import * as path from "path"

export interface UploadResult {
  file_url: string
  file_id: string
}

interface InternalPayloadMessage {
  role: ChatMessage["role"]
  content: string
  chat_type: string
  feature_config: {
    thinking_enabled: boolean
    thinking_budget: number
    output_schema: null
  }
  extra: {}
}

class QwenAPI {
  private client: AxiosInstance
  private authToken: string
  private cookie: string

  constructor(
    authToken: string,
    cookie: string,
    baseURL: string = "https://chat.qwen.ai"
  ) {
    this.authToken = authToken
    this.cookie = cookie
    this.client = axios.create({
      baseURL: baseURL,
      headers: this.buildHeaders(),
    })
  }

  private buildHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.authToken}`,
      Cookie: this.cookie,
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      Host: "chat.qwen.ai",
      Origin: "https://chat.qwen.ai",
    }
  }

  public async uploadFile(filePath: string): Promise<UploadResult> {
    const fileName = path.basename(filePath)
    const stats = fs.statSync(filePath)
    const fileSize = stats.size

    const stsResponse = await this.client.post("/api/v1/files/getstsToken", {
      filename: fileName,
      filesize: fileSize,
      filetype: "file",
    })

    const stsData = stsResponse.data
    if (!stsData.access_key_id) {
      throw new Error("Failed to get STS token from Qwen API.")
    }

    const ossClient = new OSS({
      region: stsData.region,
      accessKeyId: stsData.access_key_id,
      accessKeySecret: stsData.access_key_secret,
      stsToken: stsData.security_token,
      bucket: stsData.bucketname,
      endpoint: `https://${stsData.region}.aliyuncs.com`,
    })

    const uploadResult = await ossClient.put(stsData.file_path, filePath)

    if (uploadResult.res.status !== 200) {
      throw new Error(
        `Failed to upload file to OSS. Status: ${uploadResult.res.status}`
      )
    }

    return {
      file_url: stsData.file_url,
      file_id: stsData.file_id,
    }
  }

  // Public method for non-streaming chat completions
  public async create(request: ChatCompletionRequest): Promise<ChatResponse> {
    if (request.tools && request.tools.length > 0) {
      // Handle tool logic for non-streaming
      const lastMessage = request.messages[request.messages.length - 1]
      const toolsAsString = JSON.stringify(request.tools, null, 2)

      // 1. Action Selection Step
      const actionSelectionMessages: ChatMessage[] = [
        { role: "system", content: ACTION_SELECTION_PROMPT(toolsAsString) },
        lastMessage,
      ]
      const shouldUseToolResponse = await this._getRawChatResponse({
        ...request,
        messages: actionSelectionMessages,
      })

      if (shouldUseToolResponse.toLowerCase().includes("yes")) {
        // 2. Tool Generation Step
        const toolGenerationMessages: ChatMessage[] = [
          { role: "system", content: TOOL_GENERATION_PROMPT(toolsAsString) },
          lastMessage,
        ]
        const toolResponse = await this._getRawChatResponse({
          ...request,
          messages: toolGenerationMessages,
        })

        try {
          const toolJson = JSON.parse(toolResponse)
          return {
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "",
                  tool_calls: [
                    {
                      id: `call_${Date.now()}`,
                      type: "function",
                      function: {
                        name: toolJson.name,
                        arguments: toolJson.arguments,
                      },
                    },
                  ],
                },
              },
            ],
          }
        } catch (e) {
          // If JSON parsing fails, proceed as a normal chat
          console.warn(
            "Tool generation response was not valid JSON, falling back to regular chat."
          )
        }
      }
    }

    // Default behavior: Regular non-streaming chat completion
    return this._makeApiCallNonStream(request)
  }

  // Public method for streaming chat completions
  public async *stream(
    request: ChatCompletionRequest
  ): AsyncGenerator<ChatResponseStream> {
    if (request.tools && request.tools.length > 0) {
      // Handle tool logic for streaming
      const lastMessage = request.messages[request.messages.length - 1]
      const toolsAsString = JSON.stringify(request.tools, null, 2)

      // 1. Action Selection Step
      const actionSelectionMessages: ChatMessage[] = [
        { role: "system", content: ACTION_SELECTION_PROMPT(toolsAsString) },
        lastMessage,
      ]
      const shouldUseToolResponse = await this._getRawChatResponse({
        ...request,
        messages: actionSelectionMessages,
      })

      if (shouldUseToolResponse.toLowerCase().includes("yes")) {
        // 2. Tool Generation Step
        const toolGenerationMessages: ChatMessage[] = [
          { role: "system", content: TOOL_GENERATION_PROMPT(toolsAsString) },
          lastMessage,
        ]
        const toolResponse = await this._getRawChatResponse({
          ...request,
          messages: toolGenerationMessages,
        })

        try {
          const toolJson = JSON.parse(toolResponse)
          const toolCallResponse: ChatResponseStream = {
            choices: [
              {
                delta: {
                  role: "assistant",
                  content: "",
                  tool_calls: [
                    {
                      id: `call_${Date.now()}`,
                      type: "function",
                      function: {
                        name: toolJson.name,
                        arguments: toolJson.arguments,
                      },
                    },
                  ],
                },
              },
            ],
          }
          yield toolCallResponse
          return // End the stream after yielding the tool call
        } catch (e) {
          // If JSON parsing fails, proceed as a normal chat
          console.warn(
            "Tool generation response was not valid JSON, falling back to regular chat."
          )
        }
      }
    }

    // Default behavior: Regular streaming chat completion
    yield* this._makeApiCallStream(request)
  }

  // Internal method to get raw chat response (non-streaming)
  private async _getRawChatResponse(
    request: ChatCompletionRequest
  ): Promise<string> {
    const response = await this._makeApiCallNonStream(request)
    const content = response.choices[0]?.message?.content
    if (Array.isArray(content)) {
      // Assuming ContentBlock has a 'text' property for text blocks
      return content
        .map((block) => {
          if (block.block_type === "text") {
            return block.text
          } else if (block.block_type === "image" && block.url) {
            return `![image](${block.url})`
          } else if (block.block_type === "audio" && block.url) {
            return `![audio](${block.url})`
          }
          return ""
        })
        .join("\n")
    }
    return content || ""
  }

  // Internal method for actual streaming API call
  private async *_makeApiCallStream(
    request: ChatCompletionRequest
  ): AsyncGenerator<ChatResponseStream> {
    try {
      const payload = {
        model: request.model,
        messages: request.messages.map((msg) => {
          let finalContent
          if (Array.isArray(msg.content)) {
            finalContent = msg.content.map((block) => {
              if (block.block_type === "text") {
                return { type: block.block_type, text: block.text }
              } else if (block.block_type === "image" && block.url) {
                return { type: block.block_type, image: block.url }
              } else if (block.block_type === "audio" && block.url) {
                return { type: block.block_type, audio: block.url }
              }
              return block
            })
          } else {
            finalContent = msg.content || ""
          }

          return {
            role: msg.role,
            content: finalContent,
            chat_type: "t2t",
            feature_config: {
              thinking_enabled: false,
              thinking_budget: 0,
              output_schema: null,
            },
            extra: {},
          } as InternalPayloadMessage
        }),
        stream: true, // Ensure stream is true for this method
        incremental_output: true,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 2048,
      }
      // console.log("Payload for streaming request:", JSON.stringify(payload, null, 2));
      // return; // End the generator if no messages are provided
      const response = await this.client.post(
        "/api/chat/completions",
        payload,
        {
          responseType: "stream",
        }
      )

      for await (const chunk of response.data) {
        const text = chunk.toString("utf-8")
        const events = text.split("\n\n")
        for (const event of events) {
          if (event.startsWith("data:")) {
            try {
              const jsonData = JSON.parse(event.substring(5))
              yield jsonData as ChatResponseStream
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in _makeApiCallStream:",
          error.response?.data
        )
      } else {
        console.error("Unexpected error in _makeApiCallStream:", error)
      }
      throw error
    }
  }

  // Internal method for actual non-streaming API call
  private async _makeApiCallNonStream(
    request: ChatCompletionRequest
  ): Promise<ChatResponse> {
    try {
      const payload = {
        model: request.model,
        messages: request.messages.map((msg) => {
          let finalContent: any
          if (Array.isArray(msg.content)) {
            finalContent = msg.content.map((block) => {
              if (block.block_type === "text") {
                return { type: block.block_type, text: block.text }
              } else if (block.block_type === "image" && block.url) {
                return { type: block.block_type, image: block.url }
              } else if (block.block_type === "audio" && block.url) {
                return { type: block.block_type, audio: block.url }
              }
              return block
            })
          } else {
            finalContent = msg.content || ""
          }

          return {
            role: msg.role,
            content: finalContent,
            chat_type: "t2t",
            feature_config: {
              thinking_enabled: false,
              thinking_budget: 0,
              output_schema: null,
            },
            extra: {},
          } as InternalPayloadMessage
        }),
        stream: false, // Ensure stream is false for this method
        incremental_output: false, // Typically false for non-streaming
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 2048,
      }

      const response = await this.client.post("/api/chat/completions", payload)
      // Assuming the non-streaming response directly contains the final message
      return {
        choices: [
          {
            message: {
              role: "assistant",
              content: response.data.choices[0]?.message?.content || "",
            },
          },
        ],
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in _makeApiCallNonStream:",
          error.response?.data
        )
      } else {
        console.error("Unexpected error in _makeApiCallNonStream:", error)
      }
      throw error
    }
  }
}

export default QwenAPI

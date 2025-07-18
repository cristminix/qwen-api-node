import { Hono } from "hono"
import { Context } from "hono"
import { QwenAPI } from "../client"
import { ChatCompletionRequest } from "../core/types/chat"
import * as dotenv from "dotenv"
import { getModelByAlias } from "../fn/getModelByAlias"
import { generateAiResponse } from "../fn/generateAiResponse"
import { models } from "../qwen-models"
import { ChatMessage, TextBlock, ImageBlock } from "../core/types/chat"
import { writeFileFromBase64Url } from "../fn/writeFileFromBase64Url"
dotenv.config()

const app = new Hono()
const authToken = process.env.QWEN_AUTH_TOKEN
const cookie = process.env.QWEN_COOKIE

app.get("/v1/models", async (c: Context) => {
  return c.json(models)
})

app.post("/v1/chat/completions", async (c: Context) => {
  //@ts-ignore
  const qwenAPI = new QwenAPI(authToken, cookie)
  const chatRequest = await c.req.json()
  // console.log(chatRequest)
  const streaming = chatRequest.stream || false
  const realModel = getModelByAlias(chatRequest.model)
  const messages: ChatMessage[] = []
  for (const msg of chatRequest.messages) {
    if (msg.role === "user" && Array.isArray(msg.content)) {
      const contents: ChatMessage = {
        role: "user",
        content: [],
      }
      // console.log(msg.content)
      for (const item of msg.content) {
        if (item.type === "image_url") {
          // console.log(item.image_url.url)
          // process.exit()
          try {
            const imagePath = await writeFileFromBase64Url(item.image_url.url)
            console.log(imagePath)
            const { file_url } = await qwenAPI.uploadFile(imagePath)
            const image: ImageBlock = {
              block_type: "image",
              url: file_url,
            }
            //@ts-ignore
            contents.content.push(image)
          } catch (error) {
            console.error(error)
          }
        } else {
          if (item.type === "text") {
            const text: TextBlock = {
              block_type: "text",
              text: item.text,
            }
            //@ts-ignore
            contents.content.push(text)
          }
        }
      }
      messages.push(contents)
    } else {
      messages.push({
        role: msg.role,
        content: msg.content,
      })
    }
  }
  const qwenRequest: ChatCompletionRequest = {
    model: realModel,
    messages,
    temperature: chatRequest.temperature,
    max_tokens: chatRequest.max_tokens,
    stream: streaming,
  }

  if (streaming) {
    c.header("Content-Type", "text/event-stream")
    c.header("Cache-Control", "no-cache")
    c.header("Connection", "keep-alive")
    const streamResponse = qwenAPI.stream(qwenRequest)
    //@ts-ignore
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Handle client disconnect
    c.req.raw.signal.addEventListener("abort", () => {
      writer.close()
    })

    // Start AI text generation in the background
    generateAiResponse(streamResponse, writer, encoder)

    return c.body(stream.readable)
    // });
  } else {
    const response = await qwenAPI.create(qwenRequest)
    const openAIResponse = {
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: qwenRequest.model,
      choices: response.choices.map((choice: any, index: number) => ({
        index,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        finish_reason: "stop",
      })),
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    }
    return c.json(openAIResponse)
  }
})

export default app

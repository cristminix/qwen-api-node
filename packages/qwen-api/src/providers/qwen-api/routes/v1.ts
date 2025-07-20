import { Hono } from "hono"
import { Context } from "hono"
import QwenAPI from ".."
import { ChatCompletionRequest } from "../../../core/types/chat"
import * as dotenv from "dotenv"
import { models } from "../models"
import { ChatMessage, TextBlock, ImageBlock } from "../../../core/types/chat"
import { writeFileFromBase64Url } from "../../../fn/writeFileFromBase64Url"
import { stream, streamText, streamSSE } from "hono/streaming"
import { getModelByAlias } from "../fn/getModelByAlias"

dotenv.config()

const v1 = new Hono()
const authToken = process.env.QWEN_AUTH_TOKEN
const cookie = process.env.QWEN_COOKIE

v1.get("/v1/models", async (c: Context) => {
  return c.json(models)
})
v1.post("/v1/completions", async (c: Context) => {
  //@ts-ignore
  const qwenAPI = new QwenAPI(authToken, cookie)
  const chatRequest = await c.req.json()
  // console.log(chatRequest)
  const streaming = chatRequest.stream || false
  console.log(chatRequest)
  const realModel = getModelByAlias(chatRequest.model)
  let messages: ChatMessage[] = []
  // let chatMessages = chatRequest.messages ?? chatRequest
  if (Array.isArray(chatRequest.messages)) {
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
  } else {
    if (Array.isArray(chatRequest.prompt)) {
      messages = chatRequest.prompt.map((input: string) => {
        return {
          role: "user",
          content: input,
        }
      })
    }
  }
  // console.log({ messages })
  const qwenRequest: ChatCompletionRequest = {
    model: realModel,
    messages,
    temperature: chatRequest.temperature,
    max_tokens: chatRequest.max_tokens,
    stream: streaming,
    // frequency_penalty: chatRequest.frequency_penalty,
    // logprobs: chatRequest.logprobs,

    // n: chatRequest.n,
    // presence_penalty: chatRequest.presence_penalty,
    // seed: chatRequest.seed,

    // top_p: chatRequest.top_p,
  }

  if (streaming) {
    const streamResponse = qwenAPI.stream(qwenRequest)
    c.header("Content-Type", "text/event-stream")
    c.header("Cache-Control", "no-cache")
    c.header("Connection", "keep-alive")
    return streamSSE(c, async (stream) => {
      if (streamResponse) {
        let id = 1
        for await (const chunk of streamResponse) {
          const token = chunk.choices[0].delta.content

          await stream.writeSSE({
            data: `${JSON.stringify({
              model: realModel,
              object: "chat.completion.chunk",
              choices: [{ delta: { content: token } }],
              id,
              created: Date.now(),
            })}\n`,
          })
        }
        id += 1
        const endEvent = `data: [DONE]]n`
        await stream.writeSSE({
          data: endEvent,
        })
      }
    })
  } else {
    const response = await qwenAPI.create(qwenRequest)
    //@ts-ignore
    // return c.text(response.choices[0].message.content)
    const openAIResponse = {
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: qwenRequest.model,
      choices: response.choices.map((choice: any, index: number) => ({
        index,
        // message: {
        role: choice.message.role,
        text: choice.message.content,
        // },
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
v1.post("/v1/chat/completions", async (c: Context) => {
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
  // console.log({ messages })
  const qwenRequest: ChatCompletionRequest = {
    model: realModel,
    messages,
    temperature: chatRequest.temperature,
    // max_tokens: chatRequest.max_tokens,
    stream: streaming,
  }

  if (streaming) {
    const streamResponse = qwenAPI.stream(qwenRequest)
    c.header("Content-Type", "text/event-stream")
    c.header("Cache-Control", "no-cache")
    c.header("Connection", "keep-alive")
    return streamSSE(c, async (stream) => {
      if (streamResponse) {
        let id = 1
        for await (const chunk of streamResponse) {
          const token = chunk.choices[0].delta.content

          await stream.writeSSE({
            data: `${JSON.stringify({
              model: realModel,
              object: "chat.completion.chunk",
              choices: [{ delta: { content: token } }],
              id,
              created: Date.now(),
            })}\n`,
          })
        }
        id += 1
        const endEvent = `data: [DONE]]n`
        await stream.writeSSE({
          data: endEvent,
        })
      }
    })
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

export default v1

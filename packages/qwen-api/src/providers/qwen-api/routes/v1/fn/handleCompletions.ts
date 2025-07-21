import { Context } from "hono"
import { ChatCompletionRequest } from "../../../../../core/types/chat"
import createCompletions from "./createCompletions"
import isPromptMode from "./isPromptMode"
import { streamSSE } from "hono/streaming"

async function sendStreamResult(
  response: any,
  modelName: string,
  promptMode: boolean,
  c: Context
) {
  c.header("Content-Type", "text/event-stream")
  c.header("Cache-Control", "no-cache")
  c.header("Connection", "keep-alive")
  return streamSSE(c, async (stream) => {
    if (response) {
      let id = 1
      for await (const chunk of response) {
        const token = chunk.choices[0].delta.content
        const data: any = {
          model: modelName,
          object: "chat.completion.chunk",
          id,
          created: Date.now(),
        }
        if (promptMode) {
          data.choices = [{ delta: { text: token } }]
        } else {
          data.choices = [{ delta: { content: token } }]
        }
        await stream.writeSSE({
          data: `${JSON.stringify(data)}\n`,
        })
      }
      id += 1
      const endEvent = `data: [DONE]]n`
      await stream.writeSSE({
        data: endEvent,
      })
    }
  })
}
async function sendResult(
  response: any,
  modelName: string,
  promptMode: boolean,
  c: Context
) {
  const jsonResponse: any = {
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: modelName,

    //   usage: {
    //     prompt_tokens: 0,
    //     completion_tokens: 0,
    //     total_tokens: 0,
    //   },
  }
  if (promptMode) {
    jsonResponse.choices = response.choices.map(
      (choice: any, index: number) => ({
        index,
        role: choice.message.role,
        text: choice.message.content,
        finish_reason: "stop",
      })
    )
  } else {
    jsonResponse.choices = response.choices.map(
      (choice: any, index: number) => ({
        index,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        finish_reason: "stop",
      })
    )
  }
  return c.json(jsonResponse)
}

async function handleCompletions(
  chatRequest: ChatCompletionRequest,
  c: Context
) {
  const response = await createCompletions(chatRequest)
  const streaming = chatRequest.stream || false
  const promptMode = isPromptMode(chatRequest)
  const modelName = chatRequest.model
  return streaming
    ? await sendStreamResult(response, modelName, promptMode, c)
    : await sendResult(response, modelName, promptMode, c)
}

export default handleCompletions

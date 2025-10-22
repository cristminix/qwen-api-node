import { Context } from "hono"
import { ChatCompletionRequest } from "../../../core/types/chat"
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
        // console.log(chunk.toString())
        await stream.write(chunk)
        // await stream.write(":\n\n")
      }
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
  if (typeof chatRequest.stream !== "boolean") {
    chatRequest.stream = true
  }
  console.log(chatRequest.stream)
  // console.log()
  const response = await createCompletions(chatRequest,c.req.header())
  const streaming = chatRequest.stream
  const promptMode = isPromptMode(chatRequest)
  const modelName = chatRequest.model
  return streaming
    ? await sendStreamResult(response, modelName, promptMode, c)
    : await sendResult(response, modelName, promptMode, c)
}

export default handleCompletions

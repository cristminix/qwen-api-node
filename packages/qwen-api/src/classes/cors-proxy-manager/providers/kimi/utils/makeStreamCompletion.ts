// import { buildStreamChunk } from "./buildStreamChunk"

import { replaceGrpcWebPatterns } from "./replaceGrpcWebPatterns"

export async function* makeStreamCompletion(
  response: Response,
  sso = false,
  model: string,
  outputBuffer = {
    continueStreamBuffer: false,
    streamBuffer: "",
    processStreamBuffer: false,
    onSaveChat: (c) => {},
    onSaveUserMessage: (m) => {},
    onSaveAssistantMessage: (m) => {},
  }
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
      if (outputBuffer.continueStreamBuffer) {
        outputBuffer.streamBuffer += decoder.decode(value, { stream: true })
      } else {
        outputBuffer.streamBuffer = decoder.decode(value, { stream: true })
      }

      // Split buffer by newlines and process each part
      let line = outputBuffer.streamBuffer.trim()
      // console.log(line[line.length-1] )
      let line_obj = null
      if (line[line.length - 1] !== "}") {
        outputBuffer.processStreamBuffer = true
      } else {
        outputBuffer.processStreamBuffer = false
        const multiline = replaceGrpcWebPatterns(line).trim()
        if (multiline.length > 0) {
          const multilineString = multiline.split("\n")
          for (const mline of multilineString) {
            try {
              line_obj = JSON.parse(mline)
              yield* processLineObject(
                line_obj,
                model,
                sso,
                completionId,
                combinedChunk,
                encoder,
                outputBuffer
              )
            } catch (error) {}
          }
        }
      }
      if (!outputBuffer.processStreamBuffer) {
        outputBuffer.continueStreamBuffer = line_obj ? true : false
      }
    }
  } finally {
    // Ensure reader is released even if an error occurs
    reader.releaseLock()
    outputBuffer.streamBuffer = ""
    outputBuffer.continueStreamBuffer = false
  }
}

async function* processLineObject(
  line_obj: any,
  model: string,
  sso: boolean,
  completionId: number,
  combinedChunk: string,
  encoder: TextEncoder,
  outputBuffer: any
) {
  // console.log(JSON.stringify(line_obj))
  outputBuffer.streamBuffer = ""
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
      if (outputBuffer) {
        if (typeof outputBuffer.onSaveChat === "function")
          outputBuffer.onSaveChat(chat)
      }
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
          // outputBuffer.saveMessage(message)
        } else if (role === "user" && status === "MESSAGE_STATUS_COMPLETED") {
          /*
      {"op":"set","mask":"message","eventOffset":2,"message":{"id":"d3rgln9djjpr0jobgrkg","role":"user","status":"MESSAGE_STATUS_COMPLETED","blocks":[{"id":"text_0_0","text":{"content":"<contextual_request><system_instruction></system_instruction><chat_history/><current_user_query>hi</current_user_query></contextual_request>"}}],"scenario":"SCENARIO_K2"}}
      */
          // insert message type user
          if (outputBuffer) {
            if (typeof outputBuffer.onSaveUserMessage === "function")
              outputBuffer.onSaveUserMessage(message)
          }
        } else if (status === "MESSAGE_STATUS_COMPLETED") {
          /*
{"op":"set","mask":"message.status","eventOffset":15,"message":{"id":"d3rgln9djjpr0jobgrl0","status":"MESSAGE_STATUS_COMPLETED"}}
     
     */
          // insert message type assistant
          message.content = combinedChunk
          message.role = "assistant"
          if (outputBuffer) {
            if (typeof outputBuffer.onSaveAssistantMessage === "function")
              outputBuffer.onSaveAssistantMessage(message)
          }
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
            outputBuffer.lastAssistantMessageContent += content

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

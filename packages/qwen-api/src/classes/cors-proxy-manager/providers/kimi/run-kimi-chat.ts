import { getAuthInfo } from "./getAuthInfo"
import dotenv from "dotenv"
// import { sendChat } from "./sendChat"
import { makeStreamCompletion } from "./utils/makeStreamCompletion"
import {
  ChatHistoryEntry,
  createContextualUserMessage,
} from "./ChatHistoryEntry"
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"
import { marked } from "marked"

import { markedTerminal } from "marked-terminal"
import { sendChatFinal } from "./utils/sendChatFinal"
import { ChatSession } from "src/classes/ChatSession"

dotenv.config()

/**
 * Loads chat history from a JSON file
 * @param filename - The name of the JSON file to load
 * @returns The parsed chat history array
 */
function loadJsonFile(filename: string): ChatHistoryEntry[] {
  const filePath = path.join(__dirname, filename)
  const fileContent = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(fileContent) as ChatHistoryEntry[]
}

/**
 * Saves chat history to a JSON file
 * @param filename - The name of the JSON file to save
 * @param data - The chat history data to save
 */
function saveJsonFile(filename: string, data: ChatHistoryEntry[]): void {
  const filePath = path.join(__dirname, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}
function generateSession() {
  // console.log(headers)
  // Create a session ID based on specific header values
  const headerValues = new Date().toString()

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
async function main() {
  marked.use(markedTerminal())
  const token = process.env.KIMI_TOKEN || ""
  const cookie = process.env.KIMI_COOKIE || ""
  const authInfo = getAuthInfo(token)
  if (authInfo) {
    const chatSession = ChatSession.getInstance(generateSession())

    const systemMsg = `Jawab dengan bahasa gaul dan santai.`

    // const chatHistoryFile = "chat-history.json"
    // let history = loadJsonFile(chatHistoryFile)

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    let lastMessageDisplayed = false
    while (true) {
      // if (!lastMessageDisplayed) {
      //   const lastAssistantMessage = history.filter(
      //     (m) => m.role === "assistant"
      //   )
      //   if (lastAssistantMessage.length > 0) {
      //     console.log(
      //       marked(
      //         `\n Last Message:\n${lastAssistantMessage[lastAssistantMessage.length - 1].content}`
      //       )
      //     )
      //   }
      //   lastMessageDisplayed = true
      // }
      const currentQuery = await new Promise<string>((resolve) => {
        rl.question("You: ", (input) => {
          resolve(input)
        })
      })

      if (currentQuery.toLowerCase() === "exit") {
        console.log("Goodbye!")
        break
      }

      // const xmlPayload = createContextualUserMessage(
      //   systemMsg,
      //   history,
      //   currentQuery
      // )
      // console.log(xmlPayload)
      // const prompt = xmlPayload.replace('<?xml version="1.0"?>', "")
      // const spinner = ora(`Talking to KIMI`).start()
      let outputBuffer_content = ""

      const outputBuffer = {
        continueStreamBuffer: false,
        streamBuffer: "",
        processStreamBuffer: false,
        onSaveChat: (chat) => {
          if (chat.id && chat.createTime) {
            // console.log("saveChat", { chat })
            chatSession?.setChatId(chat.id)
          }
        },
        onSaveUserMessage: (message) => {
          chatSession?.updateLastUserMessage(message.id, message.parentId)

          // console.log("saveMessage", { message })
        },
        onSaveAssistantMessage: (message) => {
          if (message.content.length === 0)
            message.content = outputBuffer_content
          chatSession?.insertAssistantMessage(message.content, message.id)
        },
      }
      const chatResponse = await sendChatFinal(
        token,
        [
          { role: "system", content: systemMsg },
          // ...history,
          { role: "user", content: currentQuery },
        ],
        chatSession
      )
      // spinner.stop()
      if (chatResponse.ok) {
        // console.log(chatResponse)
        const chunks = makeStreamCompletion(
          chatResponse,
          false,
          "kimi",
          outputBuffer
        )
        // Define type for the expected chunk structure
        interface StreamChunk {
          choices?: Array<{
            delta: {
              content: string
            }
          }>
        }

        for await (const chunk of chunks) {
          // console.log(chunk)
          if (chunk) {
            // Type guard to check if chunk is the expected object type (not Uint8Array)
            if (
              !(chunk instanceof Uint8Array) &&
              typeof chunk === "object" &&
              "choices" in chunk
            ) {
              const typedChunk = chunk as StreamChunk
              if (
                typedChunk.choices &&
                Array.isArray(typedChunk.choices) &&
                typedChunk.choices.length > 0
              ) {
                const bufferChunk = typedChunk.choices[0].delta.content
                if (bufferChunk) {
                  outputBuffer_content += bufferChunk
                  process.stdout.write(bufferChunk)
                }
              }
            }
          }
        }

        // history.push({
        //   role: "user",
        //   content: currentQuery,
        // })

        // history.push({
        //   role: "assistant",
        //   content: outputBuffer_content,
        // })

        // saveJsonFile(chatHistoryFile, history)

        console.log(``)
      }
    }

    rl.close()
  }
}
main().catch((e) => {
  console.error(e)
})

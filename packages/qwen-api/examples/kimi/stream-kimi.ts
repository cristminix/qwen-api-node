import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../../src/core/types/chat"
import { KimiAI } from "../../src/classes/cors-proxy-manager/providers/KimiAI"

async function main() {
  const client = new KimiAI()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "hi",
    },
    { role: "assistant", content: "Hi how are you today ?" },
    {
      role: "user",
      content: "how many r in saya punya ratu raja dan roar ?.",
    },
    {
      role: "system",
      content: "Answer in indonesia.",
    },
  ]

  console.log("Sending streaming request to Kimi...")

  try {
    // Get available models

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: "kimi-k2",
      messages: messages,
      stream: true,
      // thinking: { type: "disabled" },
    })

    // Process the streaming response
    for await (const chunk of stream) {
      // console.log(chunk)
      try {
        const content = chunk.choices[0]?.delta?.content || ""
        process.stdout.write(content)
      } catch (error) {}
    }

    console.log("\n--- End of Stream ---")
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

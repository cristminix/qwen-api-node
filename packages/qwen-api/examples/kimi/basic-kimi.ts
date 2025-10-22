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
      content: "how many r in strawberry ?.",
    },
    {
      role: "system",
      content: "Answer in indonesia.",
    },
  ]

  console.log("Sending  request to Kimi...")

  try {
    // Get available models

    // Send a streaming chat completion request
    const response = await client.chat.completions.create({
      model: "kimi-k2",
      messages: messages,
      stream: false,
      // thinking: { type: "disabled" },
    })

    const content = response.choices[0]?.message?.content
    console.log("\nAssistant's Message:", content)
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

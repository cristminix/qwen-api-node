import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../../src/core/types/chat"
import { ZAI } from "../../src/classes/cors-proxy-manager/providers/ZAI"

async function main() {
  const client = new ZAI()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "tell me the beautyful place in france",
    },
    {
      role: "system",
      content: "Answer in indonesia.",
    },
  ]

  console.log("Sending streaming request to ZAI...")

  try {
    // Get available models

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: "GLM-4.6",
      messages: messages,
      stream: true,
      thinking: { type: "enabled" },
    })

    // Process the streaming response
    for await (const chunk of stream) {
      // console.log(chunk)
      const content = chunk.choices[0]?.delta?.content || ""
      process.stdout.write(content)
    }

    console.log("\n--- End of Stream ---")
    process.exit(0)
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main().catch((e) => console.error)

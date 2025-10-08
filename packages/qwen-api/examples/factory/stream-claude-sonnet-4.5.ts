import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../../src/core/types/chat"
import { FactoryAI } from "../../src/classes/cors-proxy-manager/providers/FactoryAI"

async function main() {
  const client = new FactoryAI()

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

  console.log("Sending streaming request to FactoryAI...")

  try {
    // Get available models

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create(
      {
        model: "claude-sonnet-4.5",
        messages: messages,
        stream: true,
        // thinking: { type: "disabled" },
      },
      {},
      true
    )

    // Process the streaming response
    for await (const chunk of stream) {
      console.log(chunk)
      // const content = chunk.choices[0]?.delta?.content || ""
      // process.stdout.write(content)
    }

    console.log("\n--- End of Stream ---")
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

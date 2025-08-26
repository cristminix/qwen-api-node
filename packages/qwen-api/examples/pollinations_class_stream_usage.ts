import * as dotenv from "dotenv"

// Load .env file from the current working directory
// dotenv.config({ quiet: false, debug: false })

import { ChatMessage } from "../src/core/types/chat"
import Pollinations from "../src/providers/pollinations/Pollinations"

async function main() {
  // Initialize the Pollinations client
  // Note: Pollinations doesn't require API keys, it works anonymously
  const client = new Pollinations()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Write a short story about a robot learning to paint.",
    },
  ]

  console.log("Sending streaming request to Pollinations...")

  try {
    console.log("\n--- Streaming Response ---")

    // Send a streaming chat completion request
    const stream = await client.stream({
      model: "openai", // Using OpenAI model alias
      messages: messages,
    })

    // Process the streaming response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ""
      process.stdout.write(content)
    }

    console.log("\n--- End of Stream ---")
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

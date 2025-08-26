import * as dotenv from "dotenv"

// Load .env file from the current working directory
// dotenv.config({ quiet: false, debug: false })

import { ChatMessage } from "../src/core/types/chat"
import { PollinationsAI } from "../src/classes/cors-proxy-manager/providers/PollinationsAI"

async function main() {
  // Initialize the PollinationsAI client
  // Note: PollinationsAI doesn't require API keys, it works anonymously
  const client = new PollinationsAI()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Write a short story about a robot learning to paint.",
    },
  ]

  console.log("Sending streaming request to PollinationsAI...")

  try {
    // Get available models
    console.log("Fetching available models...")
    // const models = await client.models.list()
    // console.log("Available models:", models.slice(0, 5)) // Show first 5 models

    console.log("\n--- Streaming Response ---")

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: "openai", // Using OpenAI model alias
      messages: messages,
      stream: true,
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

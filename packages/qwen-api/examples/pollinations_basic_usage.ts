import * as dotenv from "dotenv"

// Load .env file from the current working directory
// dotenv.config({ quiet: false, debug: false })

import { ChatMessage } from "../src/core/types/chat"
import { PollinationsAI } from "../src/classes/cors-proxy-manager/CorsProxyManager"

async function main() {
  // Initialize the PollinationsAI client
  // Note: PollinationsAI doesn't require API keys, it works anonymously
  const client = new PollinationsAI()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Hello, what can you do?",
    },
  ]

  console.log("Sending request to PollinationsAI...")

  try {
    // Get available models
    console.log("Fetching available models...")
    const models = await client.models.list()
    console.log("Available models:", models.slice(0, 5)) // Show first 5 models

    // Send a chat completion request
    const response = await client.chat.completions.create({
      model: "openai", // Using OpenAI model alias
      messages: messages,
    })

    console.log("API Response:")
    console.log(JSON.stringify(response, null, 2))

    const content = response.choices[0]?.message?.content
    console.log("\nAssistant's Message:", content)
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

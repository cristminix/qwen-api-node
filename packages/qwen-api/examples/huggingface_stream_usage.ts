import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../src/core/types/chat"
import { HuggingFace } from "../src/classes/cors-proxy-manager/CorsProxyManager"

async function main() {
  // Initialize the HuggingFace client
  // Note: HuggingFace requires an API key set as HUGGINGFACE_API_KEY in your .env file
  const client = new HuggingFace()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Write a short story about a robot learning to paint.",
    },
  ]

  console.log("Sending streaming request to HuggingFace...")

  try {
    // Get available models
    console.log("Fetching available models...")
    // const models = await client.models.list()
    // console.log("Available models:", models.slice(0, 5)) // Show first 5 models

    console.log("\n--- Streaming Response ---")

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: "llama-3", // Using Llama-3 model alias
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

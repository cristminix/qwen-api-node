import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../src/core/types/chat"
import { GPT4Free } from "../src/classes/cors-proxy-manager/providers/GPT4Free"

async function main() {
  // Initialize the HuggingFace client
  // Note: HuggingFace requires an API key set as HUGGINGFACE_API_KEY in your .env file
  const client = new GPT4Free()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Apa kabar korupsi di indonesia ?.",
    },
  ]

  console.log("Sending streaming request to GPT4Free...")

  try {
    // Get available models

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: "moonshotai/Kimi-K2-Instruct:DeepInfra", // Using Llama-3 model alias
      messages: messages,
      stream: true,
    })

    // Process the streaming response
    for await (const chunk of stream) {
      // console.log(chunk)
      const content = chunk.choices[0]?.delta?.content || ""
      process.stdout.write(content)
    }

    console.log("\n--- End of Stream ---")
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

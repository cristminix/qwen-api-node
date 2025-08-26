import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../src/core/types/chat"
import { HuggingFace } from "../src/classes/cors-proxy-manager/providers/HuggingFace"

async function main() {
  // Initialize the HuggingFace client
  // Note: HuggingFace requires an API key set as HUGGINGFACE_API_KEY in your .env file
  const client = new HuggingFace()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Hello, what can you do?",
    },
  ]

  console.log("Sending request to HuggingFace...")

  try {
    // Get available models
    console.log("Fetching available models...")
    // const models = await client.models.list()
    // console.log("Available models:", models.slice(0, 5)) // Show first 5 models

    // Send a chat completion request
    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3.1", // Using Llama-3 model alias
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

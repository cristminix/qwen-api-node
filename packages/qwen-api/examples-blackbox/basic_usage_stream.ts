import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../src/core/types/chat"
import BlackboxAi from "../src/providers/blackbox/api/classes/BlackboxAi"

async function main() {
  const client = new BlackboxAi()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "What is the capital Of Paris?",
    },
  ]

  console.log("Sending request to Qwen Chat API...")

  try {
    console.log("\n--- Streaming Response ---")

    const stream = client.stream({
      model: "blackboxai",
      messages: messages,
    })

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

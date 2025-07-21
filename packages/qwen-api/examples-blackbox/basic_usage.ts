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

  console.log("Sending request to Blackbox Chat API...")

  try {
    const response = await client.create({
      model: "qwen-max-latest", // Use the model name from the Python client
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

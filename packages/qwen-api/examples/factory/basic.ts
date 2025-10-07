import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config({ quiet: false, debug: false })

import { ChatMessage } from "../../src/core/types/chat"
import Factory from "../../src/providers/factory/Factory"

async function main() {
  // Initialize the Pollinations client
  // Note: Pollinations doesn't require API keys, it works anonymously
  const client = new Factory()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Hello, what can you do?",
    },
  ]

  console.log("Sending request to Factory...")

  try {
    // Send a chat completion request
    const response = await client.create({
      model: "gpt-5", // Using OpenAI model alias
      messages: messages,
      stream: false,
    })

    // console.log("API Response:")
    // console.log(JSON.stringify(response, null, 2))

    const content = response.choices[0]?.message?.content
    console.log("\nAssistant's Message:", content)
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

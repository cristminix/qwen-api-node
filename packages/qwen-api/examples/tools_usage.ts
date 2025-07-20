// To run this example, you need to install ts-node:
// npm install -g ts-node
//
// Then, run the script:
// ts-node packages/qwen-api/examples/tools_usage.ts

import * as dotenv from "dotenv"
import * as path from "path"

// Load .env file from the root of the project
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })

import { QwenAPI } from "../src/client"
import { ChatMessage } from "../src/core/types/chat"
import { Tool } from "../src/core/types/tools"

async function main() {
  const authToken = process.env.QWEN_AUTH_TOKEN
  const cookie = process.env.QWEN_COOKIE

  if (!authToken || !cookie) {
    console.error(
      "Error: QWEN_AUTH_TOKEN and QWEN_COOKIE must be set in your .env file."
    )
    process.exit(1)
  }

  const client = new QwenAPI(authToken, cookie)

  // 1. Define the tool
  const tools: Tool[] = [
    {
      name: "get_weather",
      description: "Get the current weather in a given location",
      parameters: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
          required: true,
        },
        unit: {
          type: "string",
          description:
            "The unit of temperature, can be 'celsius' or 'fahrenheit'",
        },
      },
    },
  ]

  // 2. Create a message that should trigger the tool
  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "What is the weather like in Boston?",
    },
  ]

  console.log("Sending request with tools to Qwen Chat API...")

  try {
    const response = await client.create({
      model: "qwen-max-latest",
      messages: messages,
      tools: tools,
    })

    console.log("\nAPI Response:")
    console.log(JSON.stringify(response, null, 2))

    // 3. Check for a tool call in the response
    const toolCalls = response.choices[0]?.message?.tool_calls
    if (toolCalls && toolCalls.length > 0) {
      console.log("\nAssistant wants to call a tool!")
      console.log(`Tool: ${toolCalls[0].function.name}`)
      console.log(
        `Arguments: ${JSON.stringify(toolCalls[0].function.arguments)}`
      )
    } else {
      console.log("\nAssistant responded with a regular message:")
      console.log(response.choices[0]?.message?.content)
    }
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

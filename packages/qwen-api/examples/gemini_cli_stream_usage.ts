import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../src/core/types/chat"
import { GeminiCli } from "../src/classes/cors-proxy-manager/providers/GeminiCli"

async function main() {
  console.log("GeminiCli Streaming Example")
  console.log("==========================")

  // Check if API key is available
  const apiKey = process.env.GEMINI_CLI_TOKEN
  if (!apiKey) {
    console.log("API key not found!")
    console.log("Please set your GEMINI_CLI_TOKEN in the .env file:")
    console.log("1. Copy .env.example to .env if it doesn't exist")
    console.log("2. Add your Gemini API key to the .env file:")
    console.log("   GEMINI_CLI_TOKEN=your_actual_api_key_here")
    console.log("3. Run the example again")
    return
  }

  try {
    // Initialize the GeminiCli client
    const client = new GeminiCli()

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: "Ceritakan tempat menarik di prancis",
      },
    ]

    console.log("Sending streaming request to GeminiCli...")
    console.log("Model: gemini-2.5-pro")
    console.log("Prompt: Ceritakan tempat menarik di prancis")
    console.log("-------------------")

    // Record start time
    const startTime = Date.now()

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: "gemini-2.5-flash", // Using gemini-2.5-pro model
      messages: messages,
      stream: true,
    })

    // Process the streaming response
    for await (const chunk of stream) {
      // console.log(chunk)
      const content = chunk.choices[0]?.delta?.content || ""
      process.stdout.write(content)
    }

    // Record end time and calculate elapsed time
    const endTime = Date.now()
    const elapsedTime = endTime - startTime

    console.log("\n\n--- End of Stream ---")
    console.log(
      `Elapsed time: ${elapsedTime} ms (${(elapsedTime / 1000).toFixed(2)} seconds)`
    )
  } catch (error: any) {
    console.error("\nAn error occurred:")
    if (error.message.includes("401")) {
      console.error("Authentication failed - please check your API key")
      console.error(
        "Make sure your GEMINI_CLI_TOKEN is set correctly in the .env file"
      )
    } else {
      console.error(error.message)
    }
    console.error("Full error:", error)
  }
}

main()

import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { ChatMessage } from "../src/core/types/chat"
import { GeminiCli } from "../src/classes/cors-proxy-manager/providers/GeminiCli"

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  let prompt = "Ceritakan tempat menarik di prancis"
  let model = "gemini-2.5-pro"

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p" && i + 1 < args.length) {
      prompt = args[i + 1]
      i++ // Skip the next argument as it's the prompt value
    } else if (args[i] === "-m" && i + 1 < args.length) {
      model = args[i + 1]
      i++ // Skip the next argument as it's the model value
    }
  }

  return { prompt, model }
}

async function main() {
  console.log("GeminiCli Streaming Example")
  console.log("==========================")

  // Parse command line arguments
  const { prompt, model } = parseArgs()

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
        content: prompt,
      },
    ]

    console.log("Sending streaming request to GeminiCli...")
    console.log(`Model: ${model}`)
    console.log(`Prompt: ${prompt}`)
    console.log("-------------------")

    // Record start time
    const startTime = Date.now()

    // Send a streaming chat completion request
    const stream = await client.chat.completions.create({
      model: model,
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

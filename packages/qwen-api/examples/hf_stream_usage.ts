import * as dotenv from "dotenv"
dotenv.config()

// This example demonstrates streaming responses using the createCompletions function.
import { ChatCompletionRequest, ChatMessage } from "../src/core/types/chat"
import createCompletions from "../src/routes/v1/fn/createCompletions"

async function main() {
  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "What is the capital of french",
    },
  ]

  console.log("Sending streaming request via createCompletions...")

  try {
    console.log("\n--- Streaming Response ---")

    // Create a streaming chat completion request
    const chatRequest: ChatCompletionRequest = {
      model: "deepseek-ai/DeepSeek-V3.1", // Using OpenAI model alias
      messages: messages,
      stream: true,
    }

    const stream = await createCompletions(chatRequest)

    // Buffer to accumulate data across chunks
    let buffer = ""

    // Process the streaming response
    for await (const chunk of stream) {
      // Handle chunks that are objects with numeric keys representing ASCII characters
      if (typeof chunk === "object" && chunk !== null) {
        // Convert numeric object to string
        const values = Object.values(chunk)
        if (values.every((v) => typeof v === "number")) {
          const content = values
            .map((code) => String.fromCharCode(code))
            .join("")

          // Accumulate content in buffer
          buffer += content

          // Process complete events (separated by \n\n)
          const events = buffer.split("\n\n")

          // Keep the last (potentially incomplete) event in the buffer
          buffer = events.pop() || ""

          // Process all complete events
          for (const event of events) {
            // Each event might have multiple lines
            const lines = event.split("\n")
            for (const line of lines) {
              // Look for data: lines
              if (line.startsWith("data: ")) {
                try {
                  const data = line.slice(6) // Remove 'data: ' prefix
                  if (data === "[DONE]") continue // Skip end signal

                  const jsonData = JSON.parse(data)
                  const deltaContent =
                    jsonData.choices?.[0]?.delta?.content || ""
                  if (deltaContent) {
                    process.stdout.write(deltaContent)
                  }
                } catch (e) {
                  // Ignore parsing errors for incomplete JSON
                }
              }
            }
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer) {
      const events = buffer.split("\n\n")
      for (const event of events) {
        // Each event might have multiple lines
        const lines = event.split("\n")
        for (const line of lines) {
          // Look for data: lines
          if (line.startsWith("data: ")) {
            try {
              const data = line.slice(6) // Remove 'data: ' prefix
              if (data === "[DONE]") continue // Skip end signal

              const jsonData = JSON.parse(data)
              const deltaContent = jsonData.choices?.[0]?.delta?.content || ""
              if (deltaContent) {
                process.stdout.write(deltaContent)
              }
            } catch (e) {
              // Ignore parsing errors for incomplete JSON
            }
          }
        }
      }
    }

    console.log("\n--- End of Stream ---")
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()

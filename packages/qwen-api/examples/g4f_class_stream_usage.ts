import * as dotenv from "dotenv"

/* Load .env file from the current working directory
// dotenv.config({ quiet: false, debug: false }) */

// This example demonstrates streaming responses from the Pollinations provider.
import { ChatMessage } from "../src/core/types/chat"
import G4F from "../src/providers/G4F/G4F"

async function main() {
  // Initialize the Pollinations client
  // Note: Pollinations doesn't require API keys, it works anonymously
  const client = new G4F()

  const messages: ChatMessage[] = [
    {
      role: "user",
      content:
        "What are the power of chili if compared with crystalmeth as stimulant?",
    },
  ]

  console.log("Sending streaming request to G4F...")

  try {
    console.log("\n--- Streaming Response ---")

    // Send a streaming chat completion request
    const stream = await client.stream({
      model: "openai:PollinationsAI", // Using OpenAI model alias
      messages: messages,
    })

    // Buffer to accumulate data across chunks
    let buffer = ""

    // Process the streaming response
    for await (const chunk of stream) {
      // Handle chunks that are objects with numeric keys representing ASCII characters
      if (
        (typeof chunk === "object" || typeof chunk === "string") &&
        chunk !== null
      ) {
        // console.log(chunk)

        // Convert numeric object to string
        const values = Object.values(chunk)
        let stop =
          typeof chunk === "object"
            ? values.every((v) => typeof v === "number")
            : true
        if (stop) {
          const content =
            typeof chunk === "object"
              ? values.map((code) => String.fromCharCode(code)).join("")
              : chunk

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

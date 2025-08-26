import Pollinations from "./src/providers/pollinations/Pollinations"
import { ChatCompletionRequest } from "./src/core/types/chat"

async function test() {
  const pollinations = new Pollinations()

  const request: ChatCompletionRequest = {
    model: "openai",
    messages: [
      {
        role: "user",
        content: "Hello, how are you?",
      },
    ],
    stream: true,
  }

  try {
    console.log("Testing stream method...")
    const stream = await pollinations.stream(request)
    console.log("Stream method returned successfully")
    console.log("Stream type:", typeof stream)
    console.log("Is async generator:", Symbol.asyncIterator in stream)
  } catch (error) {
    console.error("Error testing stream method:", error)
  }
}

test()

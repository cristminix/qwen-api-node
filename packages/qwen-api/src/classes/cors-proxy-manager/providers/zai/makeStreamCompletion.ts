export async function makeStreamCompletion(
  response: Response,
  sso = false,
  model: string,
  use: string,
  messages: any
) {
  // Validate response with more detailed error message
  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status} and message: ${await response.text()}`
    )
  }

  // Check if response body exists
  if (!response.body) {
    throw new Error("Streaming not supported in this environment")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const promptTokens = 0
  let completionTokens = 0
  let calculatedUsage: any = null

  let buffer = ""
  let completionId = 1

  try {
    // Process the stream until completion
    while (true) {
      const { done, value } = await reader.read()

      // Handle stream completion
      if (done) {
        // Send final event if in SSO mode
        if (sso) {
          const totalTokens = promptTokens + completionTokens
          let usage = {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
          }
          if (calculatedUsage) {
            const { input_tokens, output_tokens } = calculatedUsage
            usage.prompt_tokens = input_tokens
            usage.completion_tokens = output_tokens
            usage.total_tokens = input_tokens + output_tokens
          }
          // console.log(
          //   `data: ${JSON.stringify({
          //     id: `chatcmpl-${Date.now()}`,
          //     model: model,
          //     object: "chat.completion.chunk",
          //     index: completionId,
          //     finish_reason: "done",
          //     created: Date.now(),
          //     choices: [
          //       {
          //         delta: {
          //           content: "",
          //         },
          //       },
          //     ],
          //     usage,
          //     done: true, // Flag akhir stream
          //   })}\n\ndata: [DONE]\n\n`
          // )
        }
        break
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })

      // Split buffer by newlines and process each part
      const lines = buffer.split("\n")

      // Keep the last incomplete part in buffer
      buffer = lines.pop() || ""

      // Process each complete line
      for (const line of lines) {
        // Skip empty lines or DONE markers
        if (!line.trim() || line === "data: [DONE]") {
          continue
        }

        try {
          // Process only data lines
          if (line.startsWith("data: ")) {
            // Extract JSON string after "data: "
            const jsonString = line.slice(6)

            // Validate that we have JSON content
            if (!jsonString) {
              continue
            }

            const jsonData = JSON.parse(jsonString)
            completionTokens += 0
            if (jsonData.usage) {
              const {
                input_tokens,
                cache_creation_input_tokens,
                cache_read_input_tokens,
                output_tokens,
              } = jsonData.usage
              calculatedUsage = {
                input_tokens,
                cache_creation_input_tokens,
                cache_read_input_tokens,
                output_tokens,
              }
            }
            // console.log({  })
            if (jsonData.type === "chat:completion")
              process.stdout.write(jsonData.data.delta_content)

            // console.log(`data: ${JSON.stringify(jsonData)}\n\n`)
            // Handle GPT responses specifically
            /*
              if (use === "gpt") {
                const result = this.streamGpt(
                  jsonData,
                  sso,
                  model,
                  completionId,
                  encoder
                )
 
                if (result) {
                  yield result
 
                  // Only increment completion ID if not a completion end event
                  if (jsonData.type !== "response.output_text.done") {
                    completionId++
                  }
                }
              } else {
                // console.log({ jsonData })
                const result = this.streamAntrophic(
                  jsonData,
                  sso,
                  model,
                  completionId,
                  encoder
                )
 
                if (result) {
                  yield result
 
                  // Only increment completion ID if not a completion end event
                  if (jsonData.type !== "response.output_text.done") {
                    completionId++
                  }
                }
              }
                */
          }
        } catch (err) {
          // Log parsing errors but continue processing
          // console.error("Error parsing chunk:", line, err)

          // For robustness, we could also emit an error event in SSO mode
          if (sso) {
            // console.log(
            //   `data: ${JSON.stringify({ error: "Failed to parse stream chunk", chunk: line, details: err instanceof Error ? err.message : "Unknown error" })}\n`
            // )
          }
        }
      }
    }
  } finally {
    // Ensure reader is released even if an error occurs
    reader.releaseLock()
  }
}

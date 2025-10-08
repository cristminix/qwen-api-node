import { buildStreamChunk } from "./buildStreamChunk"

export async function makeStreamCompletion(
  response: Response,
  sso = false,
  model: string
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
            usage = calculatedUsage
          }
          const finalChunk = buildStreamChunk({
            model,
            index: completionId,
            finishReason: "done",
            content: "",
            usage,
            done: true,
          })

          console.log(`data: ${JSON.stringify(finalChunk)}\n\ndata: [DONE]\n\n`)
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

            if (jsonData.type === "chat:completion") {
              const { data } = jsonData
              const { done, delta_content, usage } = data
              if (usage) {
                calculatedUsage = usage
              }
              // console.log(jsonData)
              const result = convertToOpenaiTextStream(
                jsonData,
                model,
                completionId
              )

              if (result) {
                console.log(`data: ${JSON.stringify(result)}\n\n`)

                // Only increment completion ID if not a completion end event
                if (done) {
                  completionId++
                }
              }
            }
          }
        } catch (err) {
          // Log parsing errors but continue processing
          // console.error("Error parsing chunk:", line, err)

          // For robustness, we could also emit an error event in SSO mode
          if (sso) {
          }
        }
      }
    }
  } finally {
    // Ensure reader is released even if an error occurs
    reader.releaseLock()
  }
}

function convertToOpenaiTextStream(
  jsonData: any,
  model: string,
  completionId: number
) {
  const { data: inputData } = jsonData
  const { done, delta_content: text } = inputData

  if (inputData.delta_content) {
    return buildStreamChunk({
      model,
      index: completionId,
      finishReason: done ? "finish" : null,
      content: text,
    })
  }

  return null
}

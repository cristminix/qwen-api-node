/**
 * Builds a chat completion chunk object for streaming responses
 *
 * @param options - Options for building the stream chunk
 * @param options.model - The model name
 * @param options.index - The completion index
 * @param options.content - The content text for the chunk
 * @param options.finishReason - The finish reason (null if not finished)
 * @param options.usage - Optional usage information
 * @param options.done - Whether this is the final chunk
 * @returns A formatted chat completion chunk object
 */
export function buildStreamChunk(options: {
  model: string
  index: number
  content: string
  finishReason?: string | null
  usage?: any
  done?: boolean
}) {
  const {
    model,
    index,
    content,
    finishReason = null,
    usage,
    done = false,
  } = options

  const chunk: any = {
    id: `chatcmpl-${Date.now()}`,
    model: model,
    object: "chat.completion.chunk",
    index: index,
    finish_reason: finishReason,
    created: Date.now(),
    choices: [
      {
        delta: {
          content: content,
        },
      },
    ],
  }

  // Add usage if provided
  if (usage) {
    chunk.usage = usage
  }

  // Add done flag if provided
  if (done) {
    chunk.done = true
  }

  return chunk
}

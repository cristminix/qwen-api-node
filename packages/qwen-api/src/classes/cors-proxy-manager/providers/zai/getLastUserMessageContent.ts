import { type TransformedMessage } from "./transformRequestMessages"

/**
 * Get the content of the last message with role 'user'
 *
 * @param messages - List of message objects with 'role' and 'content' properties
 * @returns Content of the last user message, or null if no user message is found
 */

export function getLastUserMessageContent(
  messages: TransformedMessage[]
): string | null {
  // Iterate through messages in reverse order to find the last user message
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message.role === "user") {
      return message.content
    }
  }
  // Return null if no user message is found
  return null
}

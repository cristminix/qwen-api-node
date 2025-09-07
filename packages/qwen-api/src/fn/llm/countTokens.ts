import { get_encoding } from "tiktoken"

export function countTokens(text: string, model: string = ""): number {
  const enc = get_encoding("cl100k_base")
  const tokens = enc.encode(text)
  return tokens.length
}

export async function countMessagesTokens(
  messages: any[],
  model: string = ""
): Promise<number> {
  const enc = get_encoding("cl100k_base")

  let total = 0
  for (const msg of messages) {
    total += enc.encode(msg.content).length
    // Tambahkan token dari role (umumnya 1 token)
    total += 1
  }
  return total
}
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
export function estimateMessagesTokens(messages: any[]): number {
  let total = 0
  for (const msg of messages) {
    total += estimateTokens(msg.content)
    // Tambahkan token dari role (umumnya 1 token)
    total += 1
  }
  return total
}

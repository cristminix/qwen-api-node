import { randomBytes } from "crypto"
import { promisify } from "util"

// Helper to generate a random string
function generateId(length: number = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  const charsLength = chars.length

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsLength)
    result += chars[randomIndex]
  }

  return result
}
export default generateId

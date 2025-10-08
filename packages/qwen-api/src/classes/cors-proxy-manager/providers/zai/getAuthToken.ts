import * as fs from "fs"
import * as path from "path"
import * as os from "os"
/**
 * Fetch authentication token from z.ai API
 * @returns Promise resolving to the authentication token JSON data
 */
export async function getAuthToken(): Promise<any> {
  try {
    const response = await fetch("https://chat.z.ai/api/v1/auths/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching auth token:", error)
    throw error
  }
}

/**
 * Get authentication data from cache if it's less than 5 minutes old
 * @returns Authentication data from cache or null if not available/expired
 */
export function getAuthFromCache(): any {
  const userConfigDir = path.join(os.homedir(), ".config", "g4f")
  const cacheFilePath = path.join(userConfigDir, "zai-auth.json")

  if (fs.existsSync(cacheFilePath)) {
    // Get the modification time of the file
    const fileMtime = fs.statSync(cacheFilePath).mtime.getTime()
    // Get current time
    const currentTime = Date.now()
    // Calculate the difference in milliseconds
    const timeDiff = currentTime - fileMtime
    // Check if the file is less than 5 minutes old (5 * 60 * 1000 milliseconds)
    if (timeDiff < 5 * 60 * 1000) {
      try {
        const fileContent = fs.readFileSync(cacheFilePath, "utf8")
        return JSON.parse(fileContent)
      } catch (error) {
        // If there's an error reading or parsing the file, delete it and return null
        try {
          fs.unlinkSync(cacheFilePath)
        } catch (unlinkError) {
          // If we can't delete the file, just return null
          console.error("Error deleting cache file:", unlinkError)
        }
        return null
      }
    }
  }
  return null
}

/**
 * Save authentication data to cache
 * @param data - Authentication data to save
 */
export function saveAuthToCache(data: any): void {
  const userConfigDir = path.join(os.homedir(), ".config", "g4f")
  const cacheFilePath = path.join(userConfigDir, "zai-auth.json")

  // Create directory if it doesn't exist
  if (!fs.existsSync(userConfigDir)) {
    fs.mkdirSync(userConfigDir, { recursive: true })
  }

  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(data), "utf8")
  } catch (error) {
    console.error("Error saving auth to cache:", error)
    throw error
  }
}

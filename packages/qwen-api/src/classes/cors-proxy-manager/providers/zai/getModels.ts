import * as os from "os"
import * as fs from "fs/promises"
import * as path from "path"

/**
 * Fetch available models from z.ai API
 * @returns Promise resolving to the models JSON data
 */
export async function getModels(apiKey: string): Promise<any> {
  try {
    const response = await fetch("https://chat.z.ai/api/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching models:", error)
    throw error
  }
}

/**
 * Get models from cache if available and not expired (less than one day old)
 * @returns Promise resolving to cached models data or null if not available/expired
 */
export async function getModelsFromCache(): Promise<any | null> {
  try {
    const userDir = os.homedir()
    const cacheDir = path.join(userDir, ".g4f")
    const cacheFilePath = path.join(cacheDir, "zai-models.json")

    // Check if cache file exists
    try {
      await fs.access(cacheFilePath)
    } catch (error) {
      // File doesn't exist
      return null
    }

    // Get file stats to check modification time
    const stats = await fs.stat(cacheFilePath)
    const fileMtime = stats.mtime.getTime()
    const currentTime = new Date().getTime()
    const timeDiff = (currentTime - fileMtime) / 1000 // Convert to seconds

    // Check if the file is less than one day old (24 * 60 * 60 seconds)
    if (timeDiff < 24 * 60 * 60) {
      try {
        const data = await fs.readFile(cacheFilePath, "utf8")
        return JSON.parse(data)
      } catch (error) {
        // If there's an error reading or parsing the file, delete it and return null
        try {
          await fs.unlink(cacheFilePath)
        } catch (unlinkError) {
          // If we can't delete the file, just return null
        }
        return null
      }
    }

    return null
  } catch (error) {
    console.error("Error getting models from cache:", error)
    return null
  }
}

/**
 * Save models data to cache
 * @param data - The models data to cache
 * @returns Promise resolving when the data is saved
 */
export async function saveModelsToCache(data: any): Promise<void> {
  try {
    const userDir = os.homedir()
    const cacheDir = path.join(userDir, ".g4f")
    const cacheFilePath = path.join(cacheDir, "zai-models.json")

    // Ensure cache directory exists
    try {
      await fs.mkdir(cacheDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Write data to cache file
    await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2), "utf8")
  } catch (error) {
    console.error("Error saving models to cache:", error)
    throw error
  }
}

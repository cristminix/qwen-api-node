import fs from "fs"
import { join, resolve } from "path"
import { v4 as uuidv4 } from "uuid" // For UUID generation if needed
import axios from "axios"

type Optional<T> = T | null

function isValidContext(text: string): boolean {
  return "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .some((char) => text.includes(char + "="))
}

async function fetchValidated(
  client: any,
  url: string = "https://www.blackbox.ai",
  forceRefresh: boolean = false
): Promise<Optional<string>> {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  const cachePath = join(homeDir!, ".g4f", "cache")
  const cacheFile = join(cachePath, "blackbox.json")

  if (!forceRefresh && (await fs.existsSync(cacheFile))) {
    // console.log("Blackbox: reading cached value.")

    try {
      const data = JSON.parse(await fs.readFileSync(cacheFile, "utf-8"))
      //   console.log(data)
      if (data?.validated_value) {
        // console.log("Blackbox: Using cached value.")
        return data.validated_value
      }
    } catch (e) {
      console.log(`Blackbox: Error reading cache: ${e}`)
    }
  }
  //   return null
  //   console.log({ cacheFile })
  const jsFilePattern = /static\/chunks\/\d{4}-[a-fA-F0-9]+\.js/g
  const uuidPattern =
    /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/g
  //   console.log(uuidPattern)
  try {
    const response = await client.get("/")
    if (response.status !== 200) {
      return null
    }

    const pageContent = response.data
    // console.log(pageContent)
    const jsFiles = pageContent.match(jsFilePattern) || []

    for (const jsFile of jsFiles) {
      const jsUrl = `${url}/_next/${jsFile}`
      //   console.log(`Fetching: ${jsUrl}`)
      const jsResponse = await client.get(jsUrl)
      if (jsResponse.status === 200) {
        const jsContent = jsResponse.data
        let match: RegExpExecArray | null
        // console.log(jsContent)
        while ((match = uuidPattern.exec(jsContent)) !== null) {
          const uuid = match[1]
          // console.log(`Found UUID: ${uuid}`)
          const start = Math.max(0, match.index - 10)
          const end = Math.min(
            jsContent.length,
            match.index + match[0].length + 10
          )
          const context = jsContent.substring(start, end)

          if (isValidContext(context)) {
            // Save to cache
            await fs.mkdirSync(cachePath, { recursive: true })
            await fs.writeFileSync(
              cacheFile,
              JSON.stringify({ validated_value: uuid })
            )

            return uuid
          }
        }
      }
    }
  } catch (e) {
    console.log(`Blackbox: Error retrieving validated_value: ${e}`)
  }

  return null
}
export default fetchValidated

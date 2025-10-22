import fs from "fs"
import path from "path"
import { getAccessToken, getAccessTokenMock } from "./getAccessToken"
import dotenv from "dotenv"
dotenv.config()
export async function updateAccessTokenEnv(): Promise<void> {
  try {
    // Get a new access token
    const tokenResponse = await getAccessToken(
      process.env.FACTORY_AI_REFRESH_TOKEN || ""
    )

    // Read the .env file
    const envPath = path.join(process.cwd(), ".env")
    let envContent = fs.readFileSync(envPath, "utf8")

    // Update the FACTORY_AI_TOKEN line
    let updatedContent = envContent.replace(
      /^FACTORY_AI_TOKEN=.*$/m,
      `FACTORY_AI_TOKEN="${tokenResponse.access_token}"`
    )

    // Update the FACTORY_AI_REFRESH_TOKEN line
    updatedContent = updatedContent.replace(
      /^FACTORY_AI_REFRESH_TOKEN=.*$/m,
      `FACTORY_AI_REFRESH_TOKEN="${tokenResponse.refresh_token}"`
    )

    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, updatedContent, "utf8")

    console.log(
      "Successfully updated FACTORY_AI_TOKEN and FACTORY_AI_REFRESH_TOKEN in .env file"
    )
  } catch (error) {
    console.error("Error updating access token in .env file:", error)
    throw error
  }
}

// Main function to allow direct execution
async function main(): Promise<void> {
  await updateAccessTokenEnv()
}

// Execute main function if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Error in main execution:", error)
    process.exit(1)
  })
}

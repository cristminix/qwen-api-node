import * as fs from "fs/promises";
import * as path from "path";

// Configuration constants (copied from src/config.ts for standalone example)
const CODE_ASSIST_ENDPOINT = "https://cloudcode-pa.googleapis.com";
const CODE_ASSIST_API_VERSION = "v1internal";

async function loadGeminiCred(): Promise<string | null> {
    try {
        const credsFilePath = path.join(process.env.HOME || process.env.USERPROFILE || "", ".gemini", "oauth_creds.json");
        const credsContent = await fs.readFile(credsFilePath, "utf-8");
        const oauth2Creds = JSON.parse(credsContent);
        console.log("Access token loaded from ~/.gemini/oauth_creds.json");
        return oauth2Creds.access_token;
    } catch (error) {
        console.error(`Failed to load access token from ~/.gemini/oauth_creds.json: ${error}`);
        console.error("Please ensure the file exists and contains valid OAuth2 credentials JSON with an access_token.");
        return null;
    }
}

export async function discoverProjectId(accessToken: string) {
    console.log("Attempting to discover Project ID directly via fetch request...");



    if (!accessToken) {
        console.error("No access token available. Cannot proceed with project ID discovery.");
        return;
    }

    const initialProjectId = "default-project"; // As used in gemini-client.ts
    const requestBody = {
        cloudaicompanionProject: initialProjectId,
        metadata: { duetProject: initialProjectId }
    };

    try {
        const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:loadCodeAssist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.cloudaicompanionProject) {
            console.log("Discovered Project ID:", data.cloudaicompanionProject);
            return data.cloudaicompanionProject;
        } else {
            throw new Error("Project ID not found in response.");
        }
    } catch (error) {
        console.error("Error during direct project ID discovery:", error);
    }
}

// discoverProjectIdDirectly();
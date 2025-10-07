import { makeStreamCompletion } from "./makeStreamCompletion"
import dotenv from "dotenv"
dotenv.config()
const main = async () => {
  const response = await fetch("https://app.factory.ai/api/llm/a/v1/messages", {
    headers: {
      accept: "application/json",
      "anthropic-beta": "context-1m-2025-08-07",
      "anthropic-version": "2023-06-01",
      authorization: `Bearer ${process.env.FACTORY_AI_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "lX/JS 0.57.0",
      "x-api-key": "placeholder",
      "x-api-provider": "anthropic",
      "x-factory-client": "cli",
      //   "x-session-id": "058ef965-efca-4065-9eb9-ecb98211f85d",
      "x-stainless-arch": "x64",
      "x-stainless-helper-method": "stream",
      "x-stainless-lang": "js",
      "x-stainless-os": "Linux",
      "x-stainless-package-version": "0.57.0",
      "x-stainless-retry-count": "0",
      "x-stainless-runtime": "node",
      "x-stainless-runtime-version": "v24.3.0",
      "x-stainless-timeout": "600",
      //   "Accept-Encoding": "gzip, deflate, br, zstd",
      //   "Content-Length": "4226",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      system:
        "You are Droid, an AI software engineering agent built by Factory.",
      messages: [
        {
          role: "user",
          content: "What is the capital of Indonesia",
        },
      ],
      stream: true,
    }),
    method: "POST",
  })
  await makeStreamCompletion(response, true, "glm", "", [])
}

main().catch((e) => {
  console.error(e)
})

import { makeStreamCompletion } from "./makeStreamCompletion"

import dotenv from "dotenv"
dotenv.config()
const main = async () => {
  const response = await fetch(
    "https://app.factory.ai/api/llm/o/v1/chat/completions",
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.FACTORY_AI_TOKEN}`,
        "content-type": "application/json",
        "user-agent": "pB/JS 5.23.2",
        "x-api-provider": "fireworks",
        // "x-assistant-message-id": "de2bbbca-a668-45f7-9213-c6210d69336b",
        "x-factory-client": "cli",
        // "x-session-id": "a57af53a-8ac3-4502-a509-072d41866366",
        "x-stainless-arch": "x64",
        "x-stainless-lang": "js",
        "x-stainless-os": "Linux",
        "x-stainless-package-version": "5.23.2",
        "x-stainless-retry-count": "0",
        "x-stainless-runtime": "node",
        "x-stainless-runtime-version": "v24.3.0",
        // "Accept-Encoding": "gzip, deflate, br, zstd",
        // "Content-Length": "44025",
      },
      body: JSON.stringify({
        model: "glm-4.6",
        messages: [
          {
            role: "system",
            content:
              "You are Droid, an AI software engineering agent built by Factory.",
          },
          {
            role: "user",
            content: "What is the capital of bali",
          },
          /*
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "<system-reminder>IMPORTANT: TodoWrite was not called yet. You must call it for any non-trivial task requested by the user. It would benefit overall performance. Make sure to keep the todo list up to date to the state of the conversation. Performance tip: call the todo tool in parallel to the main flow related tool calls to save user's time and tokens.</system-reminder>",
              },
              {
                type: "text",
                text: "hello",
              },
            ],
          },
          */
        ],
        stream: true,
        max_tokens: 32000,
        temperature: 1,
      }),
      method: "POST",
    }
  )

  await makeStreamCompletion(response, true, "glm", "", [])
}

main().catch((e) => {
  console.error(e)
})

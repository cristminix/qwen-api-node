import { makeStreamCompletion } from "./makeStreamCompletion"
import dotenv from "dotenv"
dotenv.config()
const main = async () => {
  const response = await fetch(
    "https://app.factory.ai/api/llm/o/v1/responses",
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.FACTORY_AI_TOKEN}`,
        "content-type": "application/json",
        "user-agent": "pB/JS 5.23.2",
        // "x-api-provider": "azure_openai",
        // "x-assistant-message-id": "c9bf91ba-c51b-43cb-afbd-65d011ffb64f",
        "x-factory-client": "cli",
        // "x-session-id": "058ef965-efca-4065-9eb9-ecb98211f85d",
        "x-stainless-arch": "x64",
        "x-stainless-lang": "js",
        "x-stainless-os": "Linux",
        "x-stainless-package-version": "5.23.2",
        "x-stainless-retry-count": "0",
        "x-stainless-runtime": "node",
        "x-stainless-runtime-version": "v24.3.0",
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "what are the capital of france",
              },
            ],
          },
          /*
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "<system-reminder>IMPORTANT: TodoWrite was not called yet. You must call it for any non-trivial task requested by the user. It would benefit overall performance. Make sure to keep the todo list up to date to the state of the conversation. Performance tip: call the todo tool in parallel to the main flow related tool calls to save user's time and tokens.</system-reminder>",
              },
              {
                type: "input_text",
                text: "who are you?",
              },
            ],
          },
          */
        ],
        store: false,

        instructions:
          "You are Droid, an AI software engineering agent built by Factory.",
        stream: true,
        max_output_tokens: 32000,
        parallel_tool_calls: true,
        include: ["reasoning.encrypted_content"],
        reasoning: {
          effort: "low",
          summary: "auto",
        },
        prompt_cache_key: "058ef965-efca-4065-9eb9-ecb98211f85d",
      }),
      method: "POST",
    }
  )
  await makeStreamCompletion(response, true, "glm", "", [])
}

main().catch((e) => {
  console.error(e)
})

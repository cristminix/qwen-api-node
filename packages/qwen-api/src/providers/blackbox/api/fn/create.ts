import {
  ACTION_SELECTION_PROMPT,
  TOOL_GENERATION_PROMPT,
} from "../../../../core/prompts"
import {
  ChatCompletionRequest,
  ChatMessage,
  ChatResponse,
} from "../../../../core/types/chat"
import getRawChatResponse from "./getRawChatResponse"
import makeApiCallNonStream from "./makeApiCallNonStream"

async function create(
  request: ChatCompletionRequest,
  client: any,
  axios: any
): Promise<ChatResponse> {
  /*
  if (request.tools && request.tools.length > 0) {
    // Handle tool logic for non-streaming
    //@ts-ignore
    const lastMessage = request.messages[request.messages.length - 1]
    const toolsAsString = JSON.stringify(request.tools, null, 2)

    // 1. Action Selection Step
    const actionSelectionMessages: ChatMessage[] = [
      { role: "system", content: ACTION_SELECTION_PROMPT(toolsAsString) },
      lastMessage,
    ]
    const shouldUseToolResponse = await getRawChatResponse(
      {
        ...request,
        messages: actionSelectionMessages,
      },
      client,
      axios
    )

    if (shouldUseToolResponse.toLowerCase().includes("yes")) {
      // 2. Tool Generation Step
      const toolGenerationMessages: ChatMessage[] = [
        { role: "system", content: TOOL_GENERATION_PROMPT(toolsAsString) },
        lastMessage,
      ]
      const toolResponse = await getRawChatResponse(
        {
          ...request,
          messages: toolGenerationMessages,
        },
        client,
        axios
      )

      try {
        const toolJson = JSON.parse(toolResponse)
        return {
          choices: [
            {
              message: {
                role: "assistant",
                content: "",
                tool_calls: [
                  {
                    id: `call_${Date.now()}`,
                    type: "function",
                    function: {
                      name: toolJson.name,
                      arguments: toolJson.arguments,
                    },
                  },
                ],
              },
            },
          ],
        }
      } catch (e) {
        // If JSON parsing fails, proceed as a normal chat
        console.warn(
          "Tool generation response was not valid JSON, falling back to regular chat."
        )
      }
    }
  }
*/
  // Default behavior: Regular non-streaming chat completion
  return await makeApiCallNonStream(request, client, axios)
}

export default create

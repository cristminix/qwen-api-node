import { trendingAgentMode } from "../../modelList"
import fetchValidated from "./fetchValidated"
import generateId from "./generateId"
import { mergeMedia } from "./mergeMedia"

async function buildPayload(
  client: any,
  conversation: any = {},
  messages: any[],
  media: any[],
  model: any,
  top_p: any,
  temperature: any,
  max_tokens: any = 2000
) {
  if (!conversation || !("chat_id" in conversation)) {
    conversation = {
      model,
      validated_value: await fetchValidated(client), // You need to implement fetchValidated
      chat_id: generateId(),
      message_history: [],
    }
  }

  const current_messages: any[] = []

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const msg_id =
      i > 0 && msg.role === "user" ? conversation.chat_id : generateId()
    current_messages.push({
      id: msg_id,
      content: msg.content,
      role: msg.role,
    })
    console.log(current_messages)
  }

  const mergedMedia = mergeMedia(media || [], messages)
  /*
        if (mergedMedia.length > 0) {
            current_messages[current_messages.length - 1]['data'] = {
                imagesData: [
                    {
                        //@ts-ignore
                        filePath: `/${image.name}`,
                        contents: toDataUri(image.file)
                    }
                        //@ts-ignore
                    for (const [image] of mergedMedia)
                ],
                fileText: ''
            };
        }
        */
  let trendingAgentModeSet = trendingAgentMode?.[model] || {} //, //cls.trendingAgentMode?.[model] || {},
  // console.log("trendingAgentModeSet", trendingAgentModeSet)
  let agentModeSet = trendingAgentMode?.[model] || {}
  const data = {
    messages: current_messages,
    agentMode: agentModeSet,
    id: conversation.chat_id,
    previewToken: null,
    userId: null,
    codeModelMode: true,
    //@ts-ignore
    trendingAgentMode: trendingAgentModeSet,
    isMicMode: false,
    userSystemPrompt: null,
    //@ts-ignore
    maxTokens: max_tokens,
    playgroundTopP: top_p,
    playgroundTemperature: temperature,
    isChromeExt: false,
    githubToken: "",
    clickedAnswer2: false,
    clickedAnswer3: false,
    clickedForceWebSearch: false,
    visitFromDelta: false,
    isMemoryEnabled: false,
    mobileClient: false,
    userSelectedModel: null,
    validated: conversation.validated_value,
    imageGenerationMode: false,
    webSearchModePrompt: false,
    deepSearchMode: false,
    designerMode: false,
    domains: null,
    vscodeClient: false,
    codeInterpreterMode: false,
    customProfile: {
      additionalInfo: "",
      enableNewChats: false,
      name: "",
      occupation: "",
      traits: [],
    },
    webSearchModeOption: {
      autoMode: true,
      webMode: false,
      offlineMode: false,
    },
    session: null,
    isPremium: true,
    subscriptionCache: null,
    beastMode: true,
    reasoningMode: false,
    workspaceId: "",
    asyncMode: false,
    webSearchMode: true,
  }
  return data
}
export default buildPayload

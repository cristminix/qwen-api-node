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
    agentMode: { name: "openai/gpt-5-chat", id: "GPT-5", mode: true },
    id: conversation.chat_id,

    previewToken: null,
    userId: null,
    codeModelMode: true,
    trendingAgentMode: {},
    isMicMode: false,
    userSystemPrompt: null,
    maxTokens: 1024,
    playgroundTopP: null,
    playgroundTemperature: null,
    isChromeExt: false,
    githubToken: "",
    clickedAnswer2: false,
    clickedAnswer3: false,
    clickedForceWebSearch: false,
    visitFromDelta: false,
    isMemoryEnabled: false,
    mobileClient: false,
    userSelectedModel: "openai/gpt-5-chat",
    userSelectedAgent: "VscodeAgent",
    // validated: conversation.validated_value,
    messages: current_messages,

    validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
    imageGenerationMode: false,
    imageGenMode: "autoMode",
    webSearchModePrompt: false,
    deepSearchMode: false,
    domains: null,
    vscodeClient: false,
    codeInterpreterMode: false,
    customProfile: {
      name: "",
      occupation: "",
      traits: [],
      additionalInfo: "",
      enableNewChats: false,
    },
    webSearchModeOption: {
      autoMode: true,
      webMode: false,
      offlineMode: false,
    },
    session: {
      user: {
        name: "sutoyocutez",
        email: "sutoyocutez@gmail.com",
        image:
          "https://lh3.googleusercontent.com/a/ACg8ocJbfOw7_EdeQJZXFdW_kx3nyGRsTrvtIhHkP5b3f-XvPiJHj_E=s96-c",
        id: "101975597345717037351",
      },
      expires: "2025-09-12T01:18:28.154Z",
      isNewUser: false,
    },
    isPremium: false,
    subscriptionCache: {
      status: "FREE",
      expiryTimestamp: null,
      lastChecked: 1755047907219,
      isTrialSubscription: false,
    },
    beastMode: false,
    reasoningMode: false,
    designerMode: false,
    workspaceId: "",
    asyncMode: false,
    integrations: {},
    isTaskPersistent: false,
    selectedElement: null,
  }
  const data2 = {
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

import { create } from "xmlbuilder2"

/**
 * Represents a single turn in the chat history.
 */
export interface ChatHistoryEntry {
  role: "user" | "assistant"
  content: string
}
 
export function createContextualUserMessage(
  systemMessage: string,
  chatHistory: ChatHistoryEntry[],
  currentUserQuery: string,
  flat = false
): string {
  return flat
    ? buildFlatPrompt(systemMessage, chatHistory, currentUserQuery)
    : buildXmlPrompt(systemMessage, chatHistory, currentUserQuery);
}

/* ---------- helpers ---------- */

function buildFlatPrompt(
  system: string,
  history: ChatHistoryEntry[],
  query: string
): string {
  const sys = system ? `[System Instruction]\n${system}\n` : '';
  const hist = history.length
    ? `[Chat History]\n${history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}\n`
    : '';
  return `${sys}${hist}[Current User Query]\n${query}`;
}

function buildXmlPrompt(
  system: string,
  history: ChatHistoryEntry[],
  query: string
): string {
  const root = create().ele('contextual_request');
  root.ele('system_instruction').txt(system);
  root.ele('chat_history').ele(history.map(h => ({ [h.role]: h })));
  root.ele('current_user_query').txt(query);
  return root.end({ headless: true });
}


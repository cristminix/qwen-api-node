export const ACTION_SELECTION_PROMPT = (tools: string) => `
You have access to the following tools. Based on the user's request, should you use any of these tools? Respond with ONLY 'yes' or 'no'.

${tools}
`;

export const TOOL_GENERATION_PROMPT = (tools: string) => `
You have access to the following tools. Based on the user's request, select a tool to use. Respond with ONLY a JSON object in the following format:
{
  "name": "<tool_name>",
  "arguments": {
    "<arg_name>": "<arg_value>"
  }
}

${tools}
`;

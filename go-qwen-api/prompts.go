package qwen

// ACTION_SELECTION_PROMPT is the prompt for selecting whether to use a tool.
func ACTION_SELECTION_PROMPT(tools string) string {
	return "\nYou have access to the following tools. Based on the user's request, should you use any of these tools? Respond with ONLY 'yes' or 'no'.\n\n" + tools + "\n"
}

// TOOL_GENERATION_PROMPT is the prompt for generating a tool call.
func TOOL_GENERATION_PROMPT(tools string) string {
	return "\nYou have access to the following tools. Based on the user's request, select a tool to use. Respond with ONLY a JSON object in the following format:\n{\n  \"name\": \"<tool_name>\",\n  \"arguments\": {\n    \"<arg_name>\": \"<arg_value>\"\n  }\n}\n\n" + tools + "\n"
}


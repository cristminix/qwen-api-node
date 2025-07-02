import * as dotenv from 'dotenv';

// Load .env file from the current working directory
dotenv.config();

import { QwenAPI } from '../src'; // Importing from src to run directly with ts-node
import { ChatMessage } from '../src/core/types/chat';

async function main() {
    const authToken = process.env.QWEN_AUTH_TOKEN;
    const cookie = process.env.QWEN_COOKIE;

    if (!authToken || !cookie) {
        console.error("Error: QWEN_AUTH_TOKEN and QWEN_COOKIE must be set in your .env file.");
        process.exit(1);
    }

    const client = new QwenAPI(authToken, cookie);

    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: 'What is the capital Of Paris?'
        }
    ];

    console.log("Sending request to Qwen Chat API...");

    try {
        const response = await client.create({
            model: 'qwen-max-latest', // Use the model name from the Python client
            messages: messages,
        });

        console.log("API Response:");
        console.log(JSON.stringify(response, null, 2));

        const content = response.choices[0]?.message?.content;
        console.log("\nAssistant's Message:", content);

    } catch (error) {
        console.error("\nAn error occurred:", error);
    }
}

main();

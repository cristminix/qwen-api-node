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
        
        console.log("\n--- Streaming Response ---");

        const stream = client.stream({
            model: 'qwen-max-latest',
            messages: messages,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            process.stdout.write(content);
        }
        console.log("\n--- End of Stream ---");

    } catch (error) {
        console.error("\nAn error occurred:", error);
    }
}

main();

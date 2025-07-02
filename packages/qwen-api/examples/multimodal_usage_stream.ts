// To run this example, you need to install ts-node:
// npm install -g ts-node
// 
// Then, run the script:
// ts-node packages/qwen-api/examples/multimodal_usage_stream.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the root of the project
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { QwenAPI } from '../src';
import { ChatMessage, TextBlock, ImageBlock } from '../src/core/types/chat';

async function main() {
    const authToken = process.env.QWEN_AUTH_TOKEN;
    const cookie = process.env.QWEN_COOKIE;

    if (!authToken || !cookie) {
        console.error("Error: QWEN_AUTH_TOKEN and QWEN_COOKIE must be set in your .env file.");
        process.exit(1);
    }

    const client = new QwenAPI(authToken, cookie);

    const imagePath = path.resolve(__dirname, './tes_image.png'); 

    try {
        console.log(`Uploading image: ${imagePath}...`);
        const { file_url } = await client.uploadFile(imagePath);
        console.log(`Image uploaded successfully. URL: ${file_url}`);

        const messages: ChatMessage[] = [
            {
                role: 'user',
                content: [
                    {
                        block_type: 'image',
                        url: file_url,
                    } as ImageBlock,
                    {
                        block_type: 'text',
                        text: 'ini gambar apa?'
                    } as TextBlock,
                ]
            }
        ];

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
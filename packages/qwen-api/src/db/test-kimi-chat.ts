import { saveKimiChat, getKimiChatByChecksum } from "./models";

// Example usage of the new Kimi chat model functions
async function testKimiChat() {
    try {
        // Example data based on the original structure
        const chatData = {
            chatId: "d3t2a5vftaefms3s11jgh",
            lastUserMessageId: "",
            lastAssistantMessageId: "d3t2a5u4bbjqtq8fss7g",
            checksum: ["d0c1e31c", "cfb85833"],
            sessionId: "k4doq7",
            history: [{ role: "user", content: "hello" }]
        };

        console.log("Testing Kimi chat database operations...");

        // Save a new Kimi chat record
        const savedChat = await saveKimiChat(chatData);
        console.log("Saved chat:", savedChat);

        // Find records by checksum
        const chatsWithChecksum = await getKimiChatByChecksum("d0c1e31c");
        console.log("Chats with checksum 'd0c1e31c':", chatsWithChecksum);

        console.log("Kimi chat database operations test completed successfully!");
    } catch (error) {
        console.error("Error during Kimi chat test:", error);
    }
}

// Run the test
testKimiChat();
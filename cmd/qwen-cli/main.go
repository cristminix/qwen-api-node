package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"qwen-api/go-qwen-api"

	"github.com/joho/godotenv"
)

// ModelAliases maps human-friendly aliases to their model IDs.
var ModelAliases = map[string]string{
	"Jennie":      "qwen3-235b-a22b",
	"Lisa":        "qwen3-30b-a3b",
	"Rosseane":    "qwen3-32b",
	"Cichu":       "qwen-max-latest",
	"Chaelisa":    "qwq-32b",
	"Blinque":     "qwen2.5-omni-7b",
	"Blackpink":   "qvq-72b-preview-0310",
	"Jarvis":      "qwen2.5-vl-32b-instruct",
	"Black Mamba": "qwen2.5-14b-instruct-1m",
	"Milea":       "qwen2.5-coder-32b-instruct",
	"Dilan":       "qwen2.5-72b-instruct",
}

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: Error loading .env file, using system environment variables: %v", err)
	}

	authToken := os.Getenv("QWEN_AUTH_TOKEN")
	cookie := os.Getenv("QWEN_COOKIE")

	if authToken == "" || cookie == "" {
		fmt.Println("Please set QWEN_AUTH_TOKEN and QWEN_COOKIE environment variables.")
		fmt.Println("You can create a .env file in the project root with:")
		fmt.Println("QWEN_AUTH_TOKEN=\"your_auth_token\"")
		fmt.Println("QWEN_COOKIE=\"your_cookie\"")
		return
	}

	client := qwen.NewQwenAPI(authToken, cookie)

	args := os.Args[1:] // Get command-line arguments excluding the program name

	if len(args) > 0 {
		switch args[0] {
		case "stream":
			fmt.Println("Running streaming chat example...")
			runStreamExample(client)
		case "upload":
			if len(args) < 2 {
				fmt.Println("Usage: go run . upload <filepath>")
				return
			}
			filePath := args[1]
			fmt.Printf("Uploading file: %s\n", filePath)
			runUploadExample(client, filePath)
		case "serve":
			fmt.Println("Starting OpenAI-compatible REST API server on :8000 ...")
			runOpenAIServer(client)
		default:
			fmt.Println("Unknown command. Running default chat example.")
			runChatExample(client)
		}
	} else {
		fmt.Println("No command specified. Running default chat example.")
		fmt.Println("Usage: go run . [stream | upload <filepath>]")
		runChatExample(client)
	}
}

func runChatExample(client *qwen.QwenAPI) {
	messageContent := "What is the capital of france ?"
	jsonContent, err := json.Marshal(messageContent)
	if err != nil {
		fmt.Printf("Error marshaling message content: %v\n", err)
		return
	}

	request := qwen.ChatCompletionRequest{
		Model: "qwen-max-latest", // Or any other model you want to use
		Messages: []qwen.ChatMessage{
			{Role: qwen.MessageRoleUser, Content: jsonContent},
		},
		Stream: false,
	}

	fmt.Println("Sending chat completion request...")
	response, err := client.Create(request)
	if err != nil {
		fmt.Printf("Error creating chat completion: %v\n", err)
		return
	}

	if len(response.Choices) > 0 {
		var assistantContent string
		if err := json.Unmarshal(response.Choices[0].Message.Content, &assistantContent); err != nil {
			fmt.Printf("Error unmarshaling assistant content: %v\n", err)
			return
		}
		fmt.Printf("Assistant: %s\n", assistantContent)
	} else {
		fmt.Println("No response from assistant.")
	}
}

func runStreamExample(client *qwen.QwenAPI) {
	messageContent := "What is the capital of france ?"
	jsonContent, err := json.Marshal(messageContent)
	if err != nil {
		fmt.Printf("Error marshaling message content: %v\n", err)
		return
	}

	request := qwen.ChatCompletionRequest{
		Model: "qwen-max-latest", // Or any other model you want to use
		Messages: []qwen.ChatMessage{
			{Role: qwen.MessageRoleUser, Content: jsonContent},
		},
		Stream: true,
	}

	fmt.Println("Sending streaming chat completion request...")
	streamChan, errChan := client.Stream(request)

	fmt.Print("Assistant (streaming): ")
	for {
		select {
		case response, ok := <-streamChan:
			if !ok {
				streamChan = nil // Channel closed
				break
			}
			if len(response.Choices) > 0 {
				// Assuming content is always string for streaming delta
				fmt.Print(response.Choices[0].Delta.Content)
			}
		case err, ok := <-errChan:
			if !ok {
				errChan = nil // Channel closed
				break
			}
			fmt.Printf("\nError during streaming: %v\n", err)
			return
		}
		if streamChan == nil && errChan == nil {
			break // Both channels closed
		}
	}
	fmt.Println("\nStreaming finished.")
}

// runUploadExample uploads a file to the Qwen API using the provided client and file path.
// If the specified file does not exist, it creates a dummy file for testing purposes,
// uploads it, and then removes the dummy file after the operation.
// The function prints the upload result, including the file URL and file ID, or any errors encountered.
func runUploadExample(client *qwen.QwenAPI, filePath string) {
	// Create a dummy file for testing if it doesn't exist
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		fmt.Printf("File %s does not exist. Creating a dummy file for upload test.\n", filePath)
		dummyContent := []byte("This is a dummy file for testing Qwen API file upload.")
		err := os.WriteFile(filePath, dummyContent, 0644)
		if err != nil {
			fmt.Printf("Error creating dummy file: %v\n", err)
			return
		}
		defer os.Remove(filePath) // Clean up the dummy file
	}

	response, err := client.UploadFile(filePath)
	if err != nil {
		fmt.Printf("Error uploading file: %v\n", err)
		return
	}

	fmt.Printf("File uploaded successfully!\n")
	fmt.Printf("File URL: %s\n", response.FileUrl)
	fmt.Printf("File ID: %s\n", response.FileID)
}

// runOpenAIServer starts an HTTP server that provides OpenAI-compatible API endpoints
// for chat completions and model listing, backed by a Qwen API client.
//
// Endpoints:
//   - POST /v1/chat/completions: Accepts OpenAI-style chat completion requests and
//     forwards them to the Qwen API. Supports both streaming and non-streaming responses.
//   - GET /v1/models: Returns a static list of available model IDs in OpenAI format.
//
// The server listens on port 8000. It handles request validation, request/response
// conversion between OpenAI and Qwen formats, and error handling.
//
// Parameters:
//   - client: Pointer to a QwenAPI client used to process chat completion requests.
//
// This function blocks and logs a fatal error if the server fails to start.
func runOpenAIServer(client *qwen.QwenAPI) {
	http.HandleFunc("/v1/chat/completions", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}

		// Log the incoming request body
		// fmt.Printf("[OpenAI API] %s %s\nRequest body: %s\n", r.Method, r.URL.Path, string(body))

		var req struct {
			Model    string `json:"model"`
			Messages []struct {
				Role    string `json:"role"`
				Content string `json:"content"`
			} `json:"messages"`
			Stream bool `json:"stream"`
		}
		if err := json.Unmarshal(body, &req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		// Convert to Qwen format
		var qwenMessages []qwen.ChatMessage
		for _, m := range req.Messages {
			content, _ := json.Marshal(m.Content)
			qwenMessages = append(qwenMessages, qwen.ChatMessage{
				Role:    qwen.MessageRole(m.Role),
				Content: content,
			})
		}
		// Before creating qwenReq, resolve alias to model ID if needed
		modelID := req.Model
		if aliasID, ok := ModelAliases[req.Model]; ok {
			modelID = aliasID
		}

		qwenReq := qwen.ChatCompletionRequest{
			Model:    modelID,
			Messages: qwenMessages,
			Stream:   req.Stream,
		}

		if qwenReq.Stream {
			// Streaming response
			w.Header().Set("Content-Type", "text/event-stream")
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Connection", "keep-alive")

			streamChan, errChan := client.Stream(qwenReq)
			flusher, ok := w.(http.Flusher)
			if !ok {
				http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
				return
			}
			for {
				select {
				case response, ok := <-streamChan:
					if !ok {
						streamChan = nil
						break
					}
					if len(response.Choices) > 0 {
						var content string
						// Fix: Delta.Content is a string, assign directly
						content = response.Choices[0].Delta.Content
						data := map[string]interface{}{
							"choices": []map[string]interface{}{
								{
									"delta": map[string]string{
										"role":    "assistant",
										"content": content,
									},
									"index":         0,
									"finish_reason": nil,
								},
							},
						}
						jsonData, _ := json.Marshal(data)
						fmt.Fprintf(w, "data: %s\n\n", jsonData)
						flusher.Flush()
					}
				case err, ok := <-errChan:
					if !ok {
						errChan = nil
						break
					}
					fmt.Fprintf(w, "data: [ERROR] %v\n\n", err)
					flusher.Flush()
					return
				}
				if streamChan == nil && errChan == nil {
					break
				}
			}
			fmt.Fprintf(w, "data: [DONE]\n\n")
			flusher.Flush()
			return
		} else {
			// Non-streaming response (default)
			resp, err := client.Create(qwenReq)
			if err != nil {
				http.Error(w, "Qwen API error: "+err.Error(), http.StatusInternalServerError)
				return
			}
			// Convert Qwen response to OpenAI-like response
			type openAIChoice struct {
				Index   int `json:"index"`
				Message struct {
					Role    string `json:"role"`
					Content string `json:"content"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}
			var choices []openAIChoice
			for i, c := range resp.Choices {
				var content string
				json.Unmarshal(c.Message.Content, &content)
				choices = append(choices, openAIChoice{
					Index: i,
					Message: struct {
						Role    string `json:"role"`
						Content string `json:"content"`
					}{
						Role:    "assistant",
						Content: content,
					},
					FinishReason: "",
				})
			}
			result := map[string]interface{}{
				"object":  "chat.completion",
				"model":   modelID,
				"choices": choices,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(result)
		}
	})

	// Add /v1/models endpoint
	http.HandleFunc("/v1/models", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var modelsData []map[string]interface{}
		for id, alias := range ModelAliases {
			modelsData = append(modelsData, map[string]interface{}{
				"id":       id,
				"object":   "model",
				"created":  0,
				"owned_by": "qwen",
				"alias":    alias, // Add alias to response
			})
		}
		models := map[string]interface{}{
			"object": "list",
			"data":   modelsData,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models)
	})

	log.Fatal(http.ListenAndServe(":8000", nil))
}

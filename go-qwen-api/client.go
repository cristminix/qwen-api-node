package qwen

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

const defaultBaseURL = "https://chat.qwen.ai"

// QwenAPI represents the Qwen API client.
type QwenAPI struct {
	client    *http.Client
	authToken string
	cookie    string
	baseURL   string
}

// NewQwenAPI creates a new QwenAPI client.
func NewQwenAPI(authToken, cookie string, baseURL ...string) *QwenAPI {
	apiBaseURL := defaultBaseURL
	if len(baseURL) > 0 {
		apiBaseURL = baseURL[0]
	}

	return &QwenAPI{
		client: &http.Client{
			Timeout: 30 * time.Second, // Default timeout
		},
		authToken: authToken,
		cookie:    cookie,
		baseURL:   apiBaseURL,
	}
}

// buildHeaders creates the necessary HTTP headers for Qwen API requests.
func (q *QwenAPI) buildHeaders() http.Header {
	headers := make(http.Header)
	headers.Set("Content-Type", "application/json")
	headers.Set("Authorization", fmt.Sprintf("Bearer %s", q.authToken))
	headers.Set("Cookie", q.cookie)
	headers.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36")
	headers.Set("Host", "chat.qwen.ai")
	headers.Set("Origin", "https://chat.qwen.ai")
	return headers
}

// UploadFile handles file uploads to OSS after getting an STS token.
func (q *QwenAPI) UploadFile(filePath string) (UploadResult, error) {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to get file info: %w", err)
	}

	fileName := filepath.Base(filePath)
	fileSize := fileInfo.Size()

	stsRequest := STSRequest{
		Filename: fileName,
		Filesize: fileSize,
		Filetype: "file", // Assuming file type is always 'file' for now
	}

	jsonSTSRequest, err := json.Marshal(stsRequest)
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to marshal STS request: %w", err)
	}

	req, err := http.NewRequest("POST", q.baseURL+"/api/v1/files/getstsToken", bytes.NewBuffer(jsonSTSRequest))
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to create STS HTTP request: %w", err)
	}

	req.Header = q.buildHeaders()

	resp, err := q.client.Do(req)
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to send STS HTTP request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return UploadResult{}, fmt.Errorf("STS API request failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var stsData STSResponse
	if err := json.NewDecoder(resp.Body).Decode(&stsData); err != nil {
		return UploadResult{}, fmt.Errorf("failed to decode STS API response: %w", err)
	}

	if stsData.AccessKeyID == "" {
		return UploadResult{}, fmt.Errorf("failed to get STS token from Qwen API: access_key_id is empty")
	}

	// Initialize OSS client
	ossClient, err := oss.New(fmt.Sprintf("https://%s.aliyuncs.com", stsData.Region), stsData.AccessKeyID, stsData.AccessKeySecret, oss.SecurityToken(stsData.SecurityToken))
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to create OSS client: %w", err)
	}

	bucket, err := ossClient.Bucket(stsData.BucketName)
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to get OSS bucket: %w", err)
	}

	// Upload file to OSS
	err = bucket.PutObjectFromFile(stsData.FilePath, filePath)
	if err != nil {
		return UploadResult{}, fmt.Errorf("failed to upload file to OSS: %w", err)
	}

	return UploadResult{
		FileUrl: stsData.FileUrl,
		FileID:  stsData.FileID,
	}, nil
}

// UploadResult represents the result of a file upload operation.
type UploadResult struct {
	FileUrl string `json:"file_url"`
	FileID  string `json:"file_id"`
}

// Create handles non-streaming chat completions.
func (q *QwenAPI) Create(request ChatCompletionRequest) (ChatResponse, error) {
	if len(request.Tools) > 0 {
		// Handle tool logic for non-streaming
		lastMessage := request.Messages[len(request.Messages)-1]
		toolsAsString, err := json.MarshalIndent(request.Tools, "", "  ")
		if err != nil {
			return ChatResponse{}, fmt.Errorf("failed to marshal tools: %w", err)
		}

		// 1. Action Selection Step
		actionSelectionPromptContent := ACTION_SELECTION_PROMPT(string(toolsAsString))
		actionSelectionMessages := []ChatMessage{
			{Role: MessageRoleSystem, Content: json.RawMessage(fmt.Sprintf("\"%s\"", actionSelectionPromptContent))},
			lastMessage,
		}
		shouldUseToolResponse, err := q.GetRawChatResponse(ChatCompletionRequest{
			Messages: actionSelectionMessages,
			Model:    request.Model,
		})
		if err != nil {
			return ChatResponse{}, fmt.Errorf("action selection failed: %w", err)
		}

		if strings.ToLower(shouldUseToolResponse) == "yes" {
			// 2. Tool Generation Step
			toolGenerationPromptContent := TOOL_GENERATION_PROMPT(string(toolsAsString))
			toolGenerationMessages := []ChatMessage{
				{Role: MessageRoleSystem, Content: json.RawMessage(fmt.Sprintf("\"%s\"", toolGenerationPromptContent))},
				lastMessage,
			}
			toolResponse, err := q.GetRawChatResponse(ChatCompletionRequest{
				Messages: toolGenerationMessages,
				Model:    request.Model,
			})
			if err != nil {
				return ChatResponse{}, fmt.Errorf("tool generation failed: %w", err)
			}

			var toolJson FunctionCall
			if err := json.Unmarshal([]byte(toolResponse), &toolJson); err == nil {
				// Successfully parsed tool JSON, return as tool_calls
				return ChatResponse{
					Choices: []Choice{{
						Message: ChatMessage{
							Role:    MessageRoleAssistant,
							Content: json.RawMessage(`""`),
							ToolCalls: []ToolCall{{
								ID:       fmt.Sprintf("call_%d", time.Now().UnixNano()/int64(time.Millisecond)),
								Type:     "function",
								Function: toolJson,
							}},
						},
					}},
				}, nil
			} else {
				// If JSON parsing fails, proceed as a normal chat
				fmt.Printf("Warning: Tool generation response was not valid JSON, falling back to regular chat: %v\n", err)
			}
		}
	}

	// Default behavior: Regular non-streaming chat completion
	response, err := q.MakeApiCallNonStream(request)
	if err != nil {
		return ChatResponse{}, err
	}
	return response, nil
}

// MakeApiCallNonStream is an internal method for actual non-streaming API call.
func (q *QwenAPI) MakeApiCallNonStream(request ChatCompletionRequest) (ChatResponse, error) {
	payloadMessages := make([]InternalPayloadMessage, len(request.Messages))
	for i, msg := range request.Messages {
		var finalContent interface{}
		if bytes.HasPrefix(msg.Content, []byte("[")) && bytes.HasSuffix(msg.Content, []byte("]")) {
			// It's an array of ContentBlock
			var contentBlocks []ContentBlock
			if err := json.Unmarshal(msg.Content, &contentBlocks); err != nil {
				return ChatResponse{}, fmt.Errorf("failed to unmarshal content blocks: %w", err)
			}

			internalBlocks := make([]InternalPayloadContentBlock, len(contentBlocks))
			for j, block := range contentBlocks {
				switch block.BlockType {
				case "text":
					var textBlock TextBlock
					json.Unmarshal(block.Raw, &textBlock)
					internalBlocks[j] = InternalPayloadContentBlock{Type: textBlock.BlockType, Text: textBlock.Text}
				case "image":
					var imageBlock ImageBlock
					json.Unmarshal(block.Raw, &imageBlock)
					internalBlocks[j] = InternalPayloadContentBlock{Type: imageBlock.BlockType, Image: imageBlock.URL}
				case "audio":
					var audioBlock AudioBlock
					json.Unmarshal(block.Raw, &audioBlock)
					internalBlocks[j] = InternalPayloadContentBlock{Type: audioBlock.BlockType, Audio: audioBlock.URL}
				default:
					internalBlocks[j] = InternalPayloadContentBlock{Type: block.BlockType}
				}
			}
			finalContent = internalBlocks
		} else {
			var contentStr string
			json.Unmarshal(msg.Content, &contentStr)
			finalContent = contentStr
		}

		payloadMessages[i] = InternalPayloadMessage{
			Role:     msg.Role,
			Content:  finalContent,
			ChatType: "t2t",
			FeatureConfig: struct {
				ThinkingEnabled bool        `json:"thinking_enabled"`
				ThinkingBudget  int         `json:"thinking_budget"`
				OutputSchema    interface{} `json:"output_schema"`
			}{
				ThinkingEnabled: false,
				ThinkingBudget:  0,
				OutputSchema:    nil,
			},
			Extra: make(map[string]interface{}),
		}
	}

	payload := struct {
		Model             string                   `json:"model"`
		Messages          []InternalPayloadMessage `json:"messages"`
		Stream            bool                     `json:"stream"`
		IncrementalOutput bool                     `json:"incremental_output"`
		Temperature       *float64                 `json:"temperature,omitempty"`
		MaxTokens         *int                     `json:"max_tokens,omitempty"`
	}{
		Model:             request.Model,
		Messages:          payloadMessages,
		Stream:            false,
		IncrementalOutput: false,
		Temperature:       request.Temperature,
		// MaxTokens:         request.MaxTokens,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return ChatResponse{}, fmt.Errorf("failed to marshal non-streaming request payload: %w", err)
	}

	req, err := http.NewRequest("POST", q.baseURL+"/api/chat/completions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return ChatResponse{}, fmt.Errorf("failed to create non-streaming HTTP request: %w", err)
	}

	req.Header = q.buildHeaders()

	resp, err := q.client.Do(req)
	if err != nil {
		return ChatResponse{}, fmt.Errorf("failed to send non-streaming HTTP request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return ChatResponse{}, fmt.Errorf("non-streaming API request failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var chatResponse ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResponse); err != nil {
		return ChatResponse{}, fmt.Errorf("failed to decode non-streaming API response: %w", err)
	}

	return chatResponse, nil
}

// Stream handles streaming chat completions.
func (q *QwenAPI) Stream(request ChatCompletionRequest) (<-chan ChatResponseStream, <-chan error) {
	if len(request.Tools) > 0 {
		// Handle tool logic for streaming
		lastMessage := request.Messages[len(request.Messages)-1]
		toolsAsString, err := json.MarshalIndent(request.Tools, "", "  ")
		if err != nil {
			streamChan := make(chan ChatResponseStream)
			errorChan := make(chan error, 1)
			errorChan <- fmt.Errorf("failed to marshal tools: %w", err)
			close(streamChan)
			close(errorChan)
			return streamChan, errorChan
		}

		// 1. Action Selection Step
		actionSelectionPromptContent := ACTION_SELECTION_PROMPT(string(toolsAsString))
		actionSelectionMessages := []ChatMessage{
			{Role: MessageRoleSystem, Content: json.RawMessage(fmt.Sprintf("\"%s\"", actionSelectionPromptContent))},
			lastMessage,
		}
		shouldUseToolResponse, err := q.GetRawChatResponse(ChatCompletionRequest{
			Messages: actionSelectionMessages,
			Model:    request.Model,
		})
		if err != nil {
			streamChan := make(chan ChatResponseStream)
			errorChan := make(chan error, 1)
			errorChan <- fmt.Errorf("action selection failed: %w", err)
			close(streamChan)
			close(errorChan)
			return streamChan, errorChan
		}

		if strings.ToLower(shouldUseToolResponse) == "yes" {
			// 2. Tool Generation Step
			toolGenerationPromptContent := TOOL_GENERATION_PROMPT(string(toolsAsString))
			toolGenerationMessages := []ChatMessage{
				{Role: MessageRoleSystem, Content: json.RawMessage(fmt.Sprintf("\"%s\"", toolGenerationPromptContent))},
				lastMessage,
			}
			toolResponse, err := q.GetRawChatResponse(ChatCompletionRequest{
				Messages: toolGenerationMessages,
				Model:    request.Model,
			})
			if err != nil {
				streamChan := make(chan ChatResponseStream)
				errorChan := make(chan error, 1)
				errorChan <- fmt.Errorf("tool generation failed: %w", err)
				close(streamChan)
				close(errorChan)
				return streamChan, errorChan
			}

			var toolJson FunctionCall
			if err := json.Unmarshal([]byte(toolResponse), &toolJson); err == nil {
				// Successfully parsed tool JSON, return as tool_calls
				streamChan := make(chan ChatResponseStream, 1)
				errorChan := make(chan error, 1)
				toolCallResponse := ChatResponseStream{
					Choices: []ChoiceStream{{
						Delta: Delta{
							Role:    MessageRoleAssistant,
							Content: "",
							ToolCalls: []ToolCall{{
								ID:       fmt.Sprintf("call_%d", time.Now().UnixNano()/int64(time.Millisecond)),
								Type:     "function",
								Function: toolJson,
							}},
						},
					}},
				}
				streamChan <- toolCallResponse
				close(streamChan)
				close(errorChan)
				return streamChan, errorChan
			} else {
				// If JSON parsing fails, proceed as a normal chat
				fmt.Printf("Warning: Tool generation response was not valid JSON, falling back to regular chat: %v\n", err)
			}
		}
	}

	// Default behavior: Regular streaming chat completion
	return q.MakeApiCallStream(request)
}

// GetRawChatResponse is an internal method to get raw chat response (non-streaming).
func (q *QwenAPI) GetRawChatResponse(request ChatCompletionRequest) (string, error) {
	response, err := q.MakeApiCallNonStream(request)
	if err != nil {
		return "", fmt.Errorf("failed to get raw chat response: %w", err)
	}

	if len(response.Choices) == 0 || response.Choices[0].Message.Content == nil {
		return "", nil // No content or choices
	}

	content := response.Choices[0].Message.Content

	// Check if content is a string
	if bytes.HasPrefix(content, []byte(`"`)) && bytes.HasSuffix(content, []byte(`"`)) {
		var s string
		json.Unmarshal(content, &s)
		return s, nil
	}

	// Assume it's an array of ContentBlock
	var contentBlocks []ContentBlock
	if err := json.Unmarshal(content, &contentBlocks); err != nil {
		return "", fmt.Errorf("failed to unmarshal content blocks in _getRawChatResponse: %w", err)
	}

	var resultContent string
	for _, block := range contentBlocks {
		switch block.BlockType {
		case "text":
			var textBlock TextBlock
			json.Unmarshal(block.Raw, &textBlock)
			resultContent += textBlock.Text
		case "image":
			var imageBlock ImageBlock
			json.Unmarshal(block.Raw, &imageBlock)
			if imageBlock.URL != "" {
				resultContent += fmt.Sprintf("![image](%s)", imageBlock.URL)
			}
		case "audio":
			var audioBlock AudioBlock
			json.Unmarshal(block.Raw, &audioBlock)
			if audioBlock.URL != "" {
				resultContent += fmt.Sprintf("![audio](%s)", audioBlock.URL)
			}
		}
	}
	return resultContent, nil
}

// _makeApiCallStream is an internal method for actual streaming API call.
func (q *QwenAPI) MakeApiCallStream(request ChatCompletionRequest) (<-chan ChatResponseStream, <-chan error) {
	streamChan := make(chan ChatResponseStream)
	errorChan := make(chan error, 1)

	go func() {
		defer close(streamChan)
		defer close(errorChan)

		payloadMessages := make([]InternalPayloadMessage, len(request.Messages))
		for i, msg := range request.Messages {
			var finalContent interface{}
			if bytes.HasPrefix(msg.Content, []byte("[")) && bytes.HasSuffix(msg.Content, []byte("]")) {
				// It's an array of ContentBlock
				var contentBlocks []ContentBlock
				if err := json.Unmarshal(msg.Content, &contentBlocks); err != nil {
					errorChan <- fmt.Errorf("failed to unmarshal content blocks for streaming: %w", err)
					return
				}

				internalBlocks := make([]InternalPayloadContentBlock, len(contentBlocks))
				for j, block := range contentBlocks {
					switch block.BlockType {
					case "text":
						var textBlock TextBlock
						json.Unmarshal(block.Raw, &textBlock)
						internalBlocks[j] = InternalPayloadContentBlock{Type: textBlock.BlockType, Text: textBlock.Text}
					case "image":
						var imageBlock ImageBlock
						json.Unmarshal(block.Raw, &imageBlock)
						internalBlocks[j] = InternalPayloadContentBlock{Type: imageBlock.BlockType, Image: imageBlock.URL}
					case "audio":
						var audioBlock AudioBlock
						json.Unmarshal(block.Raw, &audioBlock)
						internalBlocks[j] = InternalPayloadContentBlock{Type: audioBlock.BlockType, Audio: audioBlock.URL}
					default:
						internalBlocks[j] = InternalPayloadContentBlock{Type: block.BlockType}
					}
				}
				finalContent = internalBlocks
			} else {
				var contentStr string
				json.Unmarshal(msg.Content, &contentStr)
				finalContent = contentStr
			}

			payloadMessages[i] = InternalPayloadMessage{
				Role:     msg.Role,
				Content:  finalContent,
				ChatType: "t2t",
				FeatureConfig: struct {
					ThinkingEnabled bool        `json:"thinking_enabled"`
					ThinkingBudget  int         `json:"thinking_budget"`
					OutputSchema    interface{} `json:"output_schema"`
				}{
					ThinkingEnabled: false,
					ThinkingBudget:  0,
					OutputSchema:    nil,
				},
				Extra: make(map[string]interface{}),
			}
		}

		payload := struct {
			Model             string                   `json:"model"`
			Messages          []InternalPayloadMessage `json:"messages"`
			Stream            bool                     `json:"stream"`
			IncrementalOutput bool                     `json:"incremental_output"`
			Temperature       *float64                 `json:"temperature,omitempty"`
			MaxTokens         *int                     `json:"max_tokens,omitempty"`
		}{
			Model:             request.Model,
			Messages:          payloadMessages,
			Stream:            true,
			IncrementalOutput: true,
			Temperature:       request.Temperature,
			// MaxTokens:         request.MaxTokens,
		}

		jsonPayload, err := json.Marshal(payload)
		if err != nil {
			errorChan <- fmt.Errorf("failed to marshal streaming request payload: %w", err)
			return
		}

		req, err := http.NewRequest("POST", q.baseURL+"/api/chat/completions", bytes.NewBuffer(jsonPayload))
		if err != nil {
			errorChan <- fmt.Errorf("failed to create streaming HTTP request: %w", err)
			return
		}

		req.Header = q.buildHeaders()

		resp, err := q.client.Do(req)
		if err != nil {
			errorChan <- fmt.Errorf("failed to send streaming HTTP request: %w", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			bodyBytes, _ := io.ReadAll(resp.Body)
			errorChan <- fmt.Errorf("streaming API request failed with status %d: %s", resp.StatusCode, string(bodyBytes))
			return
		}

		reader := bufio.NewReader(resp.Body)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					break // End of stream
				}
				errorChan <- fmt.Errorf("error reading stream: %w", err)
				return
			}

			line = strings.TrimSpace(line)
			if strings.HasPrefix(line, "data:") {
				jsonData := strings.TrimPrefix(line, "data:")
				var chatResponseStream ChatResponseStream
				if err := json.Unmarshal([]byte(jsonData), &chatResponseStream); err != nil {
					// Ignore parsing errors, as per original TS code
					continue
				}
				streamChan <- chatResponseStream
			}
		}
	}()

	return streamChan, errorChan
}

# qwen-api

Node Js ported of Unofficial Python SDK for accessing [Qwen AI](https://chat.qwen.ai) API.

---

## ✨ Features

- **Prompt AI with various Qwen models**  
  Supports multiple models including: `qwen-max-latest`, `qwen-plus-latest`, `qwq-32b`, `qwen-turbo-latest`, `qwen2.5-omni-7b`, `qvq-72b-preview-0310`, `qwen2.5-vl-32b-instruct`, `qwen2.5-14b-instruct-1m`, `qwen2.5-coder-32b-instruct`, and `qwen2.5-72b-instruct`.

- **Streaming Response**  
  Get token-by-token output in real-time for interactive applications.

- **Synchronous & Asynchronous Support**  
  Seamless integration for both sync and async workflows with the same intuitive API.

- **Web Search Integration**  
  Enhance responses with real-time information using web search capabilities.

- **File Upload Support**  
  Upload files (including images) to the Qwen API for processing and analysis.

- **Advanced Reasoning**  
  Suitable for complex tasks requiring multi-hop reasoning and deep thinking capabilities.

---

## 📦 Installation

To install the package, use:

## 🚀 Usage

### Basic Usage

```typescript
import * as dotenv from "dotenv"

// Load .env file from the current working directory
dotenv.config()

import { QwenAPI } from "./packages/qwen-api" // Importing from src to run directly with ts-node
import { ChatMessage } from "./packages/qwen-api/core/types/chat"

async function main() {
  const authToken = process.env.QWEN_AUTH_TOKEN
  const cookie = process.env.QWEN_COOKIE

  if (!authToken || !cookie) {
    console.error(
      "Error: QWEN_AUTH_TOKEN and QWEN_COOKIE must be set in your .env file."
    )
    process.exit(1)
  }

  const client = new QwenAPI(authToken, cookie)

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "What is the capital Of Paris?",
    },
  ]

  console.log("Sending request to Qwen Chat API...")

  try {
    const response = await client.create({
      model: "qwen-max-latest", // Use the model name from the Python client
      messages: messages,
    })

    console.log("API Response:")
    console.log(JSON.stringify(response, null, 2))

    const content = response.choices[0]?.message?.content
    console.log("\nAssistant's Message:", content)
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()
```

### File Upload Example

Here's how to upload a file and include it in a chat request:

```typescript
import * as dotenv from "dotenv"
import * as path from "path"

// Load .env file from the root of the project
dotenv.config({ path: path.resolve(__dirname, "./env") })

import { QwenAPI } from "./packages/qwen-api"
import {
  ChatMessage,
  TextBlock,
  ImageBlock,
} from "./packages/qwen-api/core/types/chat"

async function main() {
  const authToken = process.env.QWEN_AUTH_TOKEN
  const cookie = process.env.QWEN_COOKIE

  if (!authToken || !cookie) {
    console.error(
      "Error: QWEN_AUTH_TOKEN and QWEN_COOKIE must be set in your .env file."
    )
    process.exit(1)
  }

  const client = new QwenAPI(authToken, cookie)

  // IMPORTANT: Replace this with the actual path to your image file.
  const imagePath = path.resolve(__dirname, "./tes_image.png")

  try {
    console.log(`Uploading image: ${imagePath}...`)
    const { file_url } = await client.uploadFile(imagePath)
    console.log(`Image uploaded successfully. URL: ${file_url}`)

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: [
          {
            block_type: "image",
            url: file_url,
          } as ImageBlock,
          {
            block_type: "text",
            text: "ini gambar apa?",
          } as TextBlock,
        ],
      },
    ]

    console.log("\nSending multimodal request to Qwen Chat API...")

    const response = await client.create({
      model: "qwen-max-latest",
      messages: messages,
    })

    console.log("\nAPI Response:")
    console.log(JSON.stringify(response, null, 2))

    const content = response.choices[0]?.message?.content
    console.log("\nAssistant's Message:", content)
  } catch (error) {
    console.error("\nAn error occurred:", error)
  }
}

main()
```

**Output:**

```
choices=Choice(message=Message(role='assistant', content='A Large Language Model (LLM) is a type of artificial intelligence model that utilizes machine learning techniques to understand and generate human language [[2]]. It is designed for natural language processing tasks such as language generation [[1]]. LLMs are highly effective at generating the most plausible text in response to an input, which is the primary task they were built for [[5]]. These models are trained on vast datasets and consist of very large deep learning models that are pre-trained on extensive amounts of data [[4]]. Additionally, LLMs are a subset of generative AI that focuses specifically on generating text [[6]].'), extra=Extra(web_search_info=[WebSearchInfo(url='https://en.wikipedia.org/wiki/Large_language_model', title='Large language model - Wikipedia', snippet='A large language model (LLM) is a type of machine learning model designed for natural language processing tasks such as language generation.', hostname=None, hostlogo=None, date=''), WebSearchInfo(url='https://www.redhat.com/en/topics/ai/what-are-large-language-models', title='What are large language models? - Red Hat', snippet='A large language model (LLM) is a type of artificial intelligence model that utilizes machine learning techniques to understand and generate human language.', hostname='红帽', hostlogo='https://img.alicdn.com/imgextra/i2/O1CN01fvSs6e1d0HjVt2Buc_!!6000000003673-73-tps-48-48.ico', date=' (2023-09-26)'), WebSearchInfo(url='https://www.sap.com/resources/what-is-large-language-model', title='What is a large language model (LLM)? - SAP', snippet='A large language model (LLM) is a type of artificial intelligence (AI) that excels at processing, understanding, and generating human language.', hostname='思爱普SAP', hostlogo='https://img.alicdn.com/imgextra/i2/O1CN01egAMx022rHxuPkTZz_!!6000000007173-73-tps-48-48.ico', date=' (2024-07-01)'), WebSearchInfo(url='https://aws.amazon.com/what-is/large-language-model/', title='What is LLM? - Large Language Models Explained - AWS', snippet='Large language models, also known as LLMs, are very large deep learning models that are pre-trained on vast amounts of data. The underlying transformer is a', hostname='亚马逊', hostlogo='https://img.alicdn.com/imgextra/i4/O1CN01WOsM1L1YEPsOe7ywI_!!6000000003027-73-tps-48-48.ico', date=''), WebSearchInfo(url='https://developers.google.com/machine-learning/resources/intro-llms', title='Introduction to Large Language Models | Machine Learning', snippet='LLMs are highly effective at the task they were built for, which is generating the most plausible text in response to an input. They are even', hostname=None, hostlogo=None, date=' (2024-09-06)'), WebSearchInfo(url='https://medium.com/@meenn396/differences-between-llm-deep-learning-machine-learning-and-ai-3c7eb1c87ef8', title='Differences between LLM, Deep learning, Machine learning, and AI', snippet='A Large Language Model (LLM) is a subset of generative AI that focuses on generating text. The LLM is trained on a vast dataset and consists of', hostname=None, hostlogo=None, date=' (2024-09-30)'), WebSearchInfo(url='https://maddevs.io/glossary/large-language-model/', title='What Is a Large Language Model (LLM) | Machine Learing Glossary', snippet='A Large Language Model (LLM) is an AI system that understands and generates human language by analyzing vast amounts of text data. LLMs and Generative', hostname=None, hostlogo=None, date=''), WebSearchInfo(url='https://medium.com/@marketing_novita.ai/ml-vs-llm-what-is-the-difference-between-machine-learning-and-large-language-model-1d2ffa8756a6', title='ML vs LLM: What is the difference between Machine Learning and ', snippet="Initially, it's essential to recognize that Large Language Models (LLMs) are a subset of Machine Learning (ML). Machine Learning encompasses a", hostname=None, hostlogo=None, date=' (2024-05-08)'), WebSearchInfo(url='https://medium.com/@siladityaghosh/ai-machine-learning-llm-and-nlp-d09ae7b65582', title='AI, Machine Learning, LLM, and NLP | by Siladitya Ghosh - Medium', snippet='Large Language Models (LLM):. Definition: LLM involves training models on vast datasets to comprehend and generate human-like text, facilitating', hostname=None, hostlogo=None, date=' (2024-01-08)'), WebSearchInfo(url='https://github.com/Hannibal046/Awesome-LLM', title='Awesome-LLM: a curated list of Large Language Model - GitHub', snippet='Here is a curated list of papers about large language models, especially relating to ChatGPT. It also contains frameworks for LLM training, tools to deploy LLM', hostname='GitHub', hostlogo='https://img.alicdn.com/imgextra/i1/O1CN01Pzz5rH1SIBQeVFb7w_!!6000000002223-55-tps-32-32.svg', date='')]))
```

### Streaming

```typescript
onsole.log("\n--- Streaming Response ---")

const stream = client.stream({
  model: "qwen-max-latest",
  messages: messages,
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || ""
  process.stdout.write(content)
}
console.log("\n--- End of Stream ---")
```

**Output:**

```
{'choices': [{'delta': {'role': 'assistant', 'content': '', 'name': '', 'function_call': {'name': 'web_search', 'arguments': ''}, 'extra': None}}]}
{'choices': [{'delta': {'role': 'function', 'content': '', 'name': 'web_search', 'function_call': None, 'extra': {'web_search_info': [{'url': 'https://en.wikipedia.org/wiki/Large_language_model', 'title': 'Large language model - Wikipedia', 'snippet': 'A large language model (LLM) is a type of machine learning model designed for natural language processing tasks such as language generation.', 'hostname': None, 'hostlogo': None, 'date': ''}, {'url': 'https://www.redhat.com/en/topics/ai/what-are-large-language-models', 'title': 'What are large language models? - Red Hat', 'snippet': 'A large language model (LLM) is a type of artificial intelligence model that utilizes machine learning techniques to understand and generate human language.', 'hostname': '红帽', 'hostlogo': 'https://img.alicdn.com/imgextra/i2/O1CN01fvSs6e1d0HjVt2Buc_!!6000000003673-73-tps-48-48.ico', 'date': ' (2023-09-26)'}, {'url': 'https://www.sap.com/resources/what-is-large-language-model', 'title': 'What is a large language model (LLM)? - SAP', 'snippet': 'A large language model (LLM) is a type of artificial intelligence (AI) that excels at processing, understanding, and generating human language.', 'hostname': '思爱普SAP', 'hostlogo': 'https://img.alicdn.com/imgextra/i2/O1CN01egAMx022rHxuPkTZz_!!6000000007173-73-tps-48-48.ico', 'date': ' (2024-07-01)'}, {'url': 'https://aws.amazon.com/what-is/large-language-model/', 'title': 'What is LLM? - Large Language Models Explained - AWS', 'snippet': 'Large language models, also known as LLMs, are very large deep learning models that are pre-trained on vast amounts of data. The underlying transformer is a', 'hostname': '亚马逊', 'hostlogo': 'https://img.alicdn.com/imgextra/i4/O1CN01WOsM1L1YEPsOe7ywI_!!6000000003027-73-tps-48-48.ico', 'date': ''}, {'url': 'https://developers.google.com/machine-learning/resources/intro-llms', 'title': 'Introduction to Large Language Models | Machine Learning', 'snippet': 'LLMs are highly effective at the task they were built for, which is generating the most plausible text in response to an input. They are even', 'hostname': None, 'hostlogo': None, 'date': ' (2024-09-06)'}, {'url': 'https://medium.com/@meenn396/differences-between-llm-deep-learning-machine-learning-and-ai-3c7eb1c87ef8', 'title': 'Differences between LLM, Deep learning, Machine learning, and AI', 'snippet': 'A Large Language Model (LLM) is a subset of generative AI that focuses on generating text. The LLM is trained on a vast dataset and consists of', 'hostname': None, 'hostlogo': None, 'date': ' (2024-09-30)'}, {'url': 'https://maddevs.io/glossary/large-language-model/', 'title': 'What Is a Large Language Model (LLM) | Machine Learing Glossary', 'snippet': 'A Large Language Model (LLM) is an AI system that understands and generates human language by analyzing vast amounts of text data. LLMs and Generative', 'hostname': None, 'hostlogo': None, 'date': ''}, {'url': 'https://medium.com/@marketing_novita.ai/ml-vs-llm-what-is-the-difference-between-machine-learning-and-large-language-model-1d2ffa8756a6', 'title': 'ML vs LLM: What is the difference between Machine Learning and ', 'snippet': "Initially, it's essential to recognize that Large Language Models (LLMs) are a subset of Machine Learning (ML). Machine Learning encompasses a", 'hostname': None, 'hostlogo': None, 'date': ' (2024-05-08)'}, {'url': 'https://medium.com/@siladityaghosh/ai-machine-learning-llm-and-nlp-d09ae7b65582', 'title': 'AI, Machine Learning, LLM, and NLP | by Siladitya Ghosh - Medium', 'snippet': 'Large Language Models (LLM):. Definition: LLM involves training models on vast datasets to comprehend and generate human-like text, facilitating', 'hostname': None, 'hostlogo': None, 'date': ' (2024-01-08)'}, {'url': 'https://github.com/Hannibal046/Awesome-LLM', 'title': 'Awesome-LLM: a curated list of Large Language Model - GitHub', 'snippet': 'Here is a curated list of papers about large language models, especially relating to ChatGPT. It also contains frameworks for LLM training, tools to deploy LLM', 'hostname': 'GitHub', 'hostlogo': 'https://img.alicdn.com/imgextra/i1/O1CN01Pzz5rH1SIBQeVFb7w_!!6000000002223-55-tps-32-32.svg', 'date': '')]))
```

---

## 📂 Documentation

## in progress

## ⚙️ Environment Setup

To use `qwen-api`, you need to obtain your `AUTH TOKEN` and `COOKIE` from [https://chat.qwen.ai](https://chat.qwen.ai). Follow these steps:

To use Alibaba Cloud OSS functionality, you'll also need to ensure you have the SDK installed:

```bash
poetry add oss2
```

1. **Sign Up or Log In**
   Visit [https://chat.qwen.ai](https://chat.qwen.ai) and sign up or log in to your account.

2. **Open Developer Tools**

   - Right-click anywhere on the page and select `Inspect`, or
   - Use the shortcut: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Navigate to the `Network` tab

3. **Send a Message**
   Go back to [https://chat.qwen.ai](https://chat.qwen.ai) and send a message in the chat.

4. **Find the `completions` Request**
   In the `Network` tab, filter by `Fetch/XHR` and locate a request named `completions`.

5. **Copy the Authorization Token and Cookie**

   - Click the `completions` request and go to the `Headers` tab.
   - Look for the `Authorization` header that starts with `Bearer`, and copy **only the token part** (without the word "Bearer").
     Example:
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Scroll down and find the `Cookie` header. Copy the entire value.
     Example (partial):
     ```
     Cookie: cna=lyp6INOXADYCAbb9MozTsTcp; cnaui=83a0f88d-86d8-...; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

6. **Save in `.env` File**
   Create a `.env` file in the root directory of your project and paste the following:

   ```env
   QWEN_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # no "Bearer"
   QWEN_COOKIE="cna=lyp6INOXADYCA...; cnaui=83a0f88d-86d8-...; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

⚠️ **Note**:

- Never share your token or cookie publicly.
- Tokens and cookies may expire. If authentication fails, repeat the steps above to obtain a new one.

---

## 📂 Examples

Check the `examples/` folder for more advanced usage, including:

- **Basic Usage**: Simple synchronous and asynchronous examples for getting started
- **Streaming**: Examples demonstrating real-time response processing
- **File Upload**: Demonstrations of file upload capabilities, including image processing

---

## 📃 License

This project uses the MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 🙋‍♂️ Contributing

We welcome contributions! Here's how to contribute:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

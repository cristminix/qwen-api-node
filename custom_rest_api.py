from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime
import time
import asyncio
import json
from starlette.responses import StreamingResponse
from qwen_api.client import Qwen
import uuid
from qwen_api.core.exceptions import QwenAPIError
from qwen_api.core.types.chat import ChatMessage, TextBlock, ImageBlock
import base64
import base64
import re
# ----- Model List -----
MODEL_NAMES = [
     "qwen3-235b-a22b",
    "qwen3-30b-a3b",
    "qwen3-32b",
    "qwen-max-latest",
    "qwq-32b",
    "qwen2.5-omni-7b",
    "qvq-72b-preview-0310",
    "qwen2.5-vl-32b-instruct",
    "qwen2.5-14b-instruct-1m",
    "qwen2.5-coder-32b-instruct",
    "qwen2.5-72b-instruct"
]
def get_extension_from_data_url(data_url):
    # Regular expression to extract the MIME type from the data URL
    match = re.match(r'^data:(?P<mime>[\w/\-\.]+);base64,(?P<data>.+)$', data_url) 
    if not match:
        raise ValueError("Invalid data URL format")

    mime_type = match.group('mime')
    
    # Common MIME to extension mapping (can be extended as needed)
    mime_to_ext = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'text/plain': 'txt',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        # Add more mappings as needed
    }

    extension = mime_to_ext.get(mime_type)
    if not extension:
        raise ValueError(f"Unsupported MIME type: {mime_type}")

    return extension

def create_filename_from_data_url(data_url, base_name="file"):
    ext = get_extension_from_data_url(data_url)
    return f"{base_name}.{ext}"
app = FastAPI(title="OpenAI-compatible API")
client = Qwen()

# ----- Models -----
class ChatMessage(BaseModel):
    role: str
    content: Union[str, List]|None = None  # Accepts either a string or a list
    file: Optional[dict] = None  # or attachment: Optional[dict] = None
    web_search:bool=False,
    thinking:bool=False,
    web_development:bool=True,
    blocks: Optional[List[Union[TextBlock, ImageBlock]]] = None

class ChatCompletionRequest(BaseModel):
    model: str = "qwen-max-latest"
    messages: List[ChatMessage]
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.1
    stream: Optional[bool] = False

# ----- Streaming Helper -----
async def _resp_async_generator_stream(response, model):
    for i, chunkItem in enumerate(response):
        token = chunkItem.choices[0].delta.content
        chunk = {
            "id": i,
            "object": "chat.completion.chunk",
            "created": time.time(),
            "model": model,
            "choices": [{"delta": {"content": token}}],
        }
        yield f"data: {json.dumps(chunk)}\n"
        await asyncio.sleep(0.25)
    yield "data: [DONE]\n"



def generate_model_list():
    now = int(datetime.now().timestamp())
    return [
        {
            "id": name,
            "object": "model",
            "created": now,
            "owned_by": "local",
            "permission": [
                {
                    "id": "modelperm-local",
                    "object": "model_permission",
                    "created": now,
                    "allow_create_engine": False,
                    "allow_sampling": True,
                    "allow_logprobs": False,
                    "allow_search_indices": False,
                    "allow_view": True,
                    "allow_fine_tuning": False,
                    "organization": "*",
                    "group": None,
                    "is_blocking": False
                }
            ],
            "root": name,
            "parent": None
        }
        for name in MODEL_NAMES
    ]

@app.get("/v1/models")
async def list_models():
    return generate_model_list()

# ----- Chat Completion -----
def generate_response(request: ChatCompletionRequest):
    parsed_messages = []

    for message in request.messages:
        if isinstance(message.content, list):
            # content is a list
            # print("Content is a list:", message.content)
            text_content = ""
            # image_url = ""
            file_path = "tmpFile.png"
            getDataImage = None
            for item in message.content:
                if item["type"] == "text":
                    text_content = item["text"]
                elif item["type"] == "image_url":
                    base64_string = item["image_url"]["url"]
                    file_path = create_filename_from_data_url(base64_string, base_name="tmpFile")
                    if ',' in base64_string:
                        base64_string = base64_string.split(',')[1]
                    # Decode and write to file
                    with open(file_path, "wb") as f:
                        f.write(base64.b64decode(base64_string))
                        getDataImage = client.chat.upload_file(
                            file_path=file_path,
                        )
            if len(text_content) > 0 and getDataImage:
                parsed_messages = [
                    ChatMessage(
                        role=message.role,
                        web_search=False,
                        thinking=False,
                        web_development=True,
                        blocks=[
                            TextBlock(
                                block_type="text",
                                text=text_content
                            ),
                            ImageBlock(
                                block_type="image",
                                url=getDataImage.file_url,
                                image_mimetype=getDataImage.image_mimetype
                            )
                        ]
                    )
                ]
                # break
        else:
            parsed_messages.append({
                "role": message.role,
                "content": message.content,
                "web_search": False,
                "thinking": False
            })
    model = "qwen-max-latest"
    if request.model in MODEL_NAMES:
        model = request.model  
    response = client.chat.create(
        messages=parsed_messages,
        model=model,
        stream=request.stream,
        temperature= request.temperature,
        # max_tokens=request.max_tokens
    )
    if request.stream:
        return response
    return response.choices.message.content

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    print(request) 
    
    if request.messages:
        resp_content = generate_response(request)
    else:
        resp_content = "As a mock AI Assitant, I can only echo your last message, but there wasn't one!"
    if request.stream:
        return StreamingResponse(_resp_async_generator_stream(resp_content, request.model), media_type="text/event-stream")

    return {
        "id": str(uuid.uuid4()),  # Use uuid for id
        "object": "chat.completion",
        "created": time.time(),
        "model": request.model,
        "choices": [{
            "message": ChatMessage(role="assistant", content=resp_content)
        }]
    }

@app.post("/v1")
async def chat_completions(request: ChatCompletionRequest):
    print(request) 
    
    if request.messages:
        resp_content = generate_response(request)
    else:
        resp_content = "As a mock AI Assitant, I can only echo your last message, but there wasn't one!"
    if request.stream:
        return StreamingResponse(_resp_async_generator_stream(resp_content, request.model), media_type="text/event-stream")

    return {
        "id": str(uuid.uuid4()),  # Use uuid for id
        "object": "chat.completion",
        "created": time.time(),
        "model": request.model,
        "choices": [{
            "message": ChatMessage(role="assistant", content=resp_content)
        }]
    }

@app.middleware("http")
async def log_request_body(request: Request, call_next):
    if request.url.path == "/v1/chat/completions":
        body = await request.body()
        with open("request_log.txt", "a", encoding="utf-8") as f:
            f.write(f"Raw request body: {body.decode('utf-8')}\n")
    response = await call_next(request)
    return response
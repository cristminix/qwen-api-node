endpoint `https://chat.z.ai/api/config`

```json
{
    "status": true,
    "name": "Z",
    "version": "0.0.0",
    "default_locale": "",
    "oauth": {
        "providers": {
            "google": "google",
            "github": "github"
        }
    },
    "default_ppt_model": "0702-RL-API",
    "features": {
        "auth": true,
        "auth_trusted_header": false,
        "enable_ldap": false,
        "enable_api_key": false,
        "enable_signup": true,
        "enable_login_form": true,
        "enable_websocket": false,
        "enable_upload_image": false,
        "enable_artifacts_mode": true,
        "enable_mcp": true
    },
    "default_models": "GLM-4-6-API-V1",
    "mcp_servers": [
        {
            "name": "deep-web-search",
            "title": "Web Search",
            "title_zh": "全网搜索",
            "title_en": "Web Search",
            "description": "用于操作浏览器进行深度网络搜索",
            "icon_name": "search"
        },
        {
            "name": "ppt-maker",
            "title": "Slides Maker",
            "title_zh": "PPT 制作",
            "title_en": "Slides Maker",
            "description": "Embrace the Vibe, Elevate Your Slides!",
            "icon_name": "presentation"
        },
        {
            "name": "vibe-coding",
            "title": "Workspace",
            "title_zh": "工作空间",
            "title_en": "Workspace",
            "description": "普普通通的vibe",
            "icon_name": "workspace"
        },
        {
            "name": "image-search",
            "title": "Image Search",
            "title_zh": "图片搜索",
            "title_en": "Image Search",
            "description": "图片搜索",
            "icon_name": "image_search"
        },
        {
            "name": "deep-research",
            "title": "Deep Research",
            "title_zh": "深度研究",
            "title_en": "Deep Research",
            "description": null,
            "icon_name": "search"
        },
        {
            "name": "advanced-search",
            "title": "advanced browser search",
            "title_zh": "高级浏览器搜索",
            "title_en": "advanced browser search",
            "description": null,
            "icon_name": "search"
        },
        {
            "name": "rag-search",
            "title": "rag search",
            "title_zh": "rag 搜索",
            "title_en": "rag search",
            "description": null,
            "icon_name": "search"
        }
    ]
}
```
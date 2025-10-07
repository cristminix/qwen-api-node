`https://app.factory.ai/api/sessions/create`

request

```json
{
  "id": "a57af53a-8ac3-4502-a509-072d41866366",
  "title": "New Session",
  "isStarted": false,
  "machineConnectionType": "tui"
}
```

response

```json
{
  "session": {
    "context": [],
    "localRepoNames": [],
    "title": "New Session",
    "subtitle": "",
    "owner": "user_01K6H4EJMX8MTNYFY03N5ZDANP",
    "isStarted": false,
    "privacyLevel": "private",
    "droidProcessId": null,
    "droidStatus": null,
    "droidRequestId": null,
    "agentConfig": {
      "autoAcceptRiskLevel": "medium",
      "autoAcceptTools": [],
      "autoSaveFiles": false,
      "selectedToolIds": [
        "semantic_search_tool",
        "grep_tool",
        "glob_tool",
        "write_memory",
        "fetch_url"
      ],
      "selectedModel": {
        "id": "gpt-5-2025-08-07",
        "reasoningEffort": "medium"
      }
    },
    "machineConnectionType": "tui",
    "droidId": null,
    "sessionLocation": "Unknown",
    "status": "offline",
    "messagesCount": 1,
    "visibility": ["user_01K6H4EJMX8MTNYFY03N5ZDANP"],
    "favoritedBy": [],
    "isTestGenerated": false,
    "createdBy": "user_01K6H4EJMX8MTNYFY03N5ZDANP",
    "id": "a57af53a-8ac3-4502-a509-072d41866366",
    "contextCount": 0,
    "createdAt": 1759812003847,
    "updatedAt": 1759812003847,
    "creatorName": null,
    "creatorPhotoUrl": null,
    "isDynamicContextLoading": false
  }
}
```

conversation

`https://app.factory.ai/api/sessions/a57af53a-8ac3-4502-a509-072d41866366/update-title`

req

```
{
    "title": "hi"
}
```

```
{}
```

`https://app.factory.ai/api/sessions/a57af53a-8ac3-4502-a509-072d41866366/message/user/create`

req

```
---WebkitFormBoundary9731701d978440f5832ae323f4cf6907
Content-Disposition: form-data; name="draftMessage"{
    "id": "ae730b4d-459b-4749-99d2-5338fe381d0b",
    "role": "user",
    "contents": [
        {
            "type": "text",
            "text": "<system-reminder>\nUser system info (linux 6.11.0-19-generic)\n\nCurrent folder: /home/cristminix\nca.psiphon.PsiphonTunnel.tunnel-core\nCLAUDE.md\nDesktop\nDocuments\nDownloads\ngo\nlogs\nMcMojave-circle\nminiforge3\nMojave-gtk-theme\nMusic\nPictures\nPostman\nprojects\npsiphon.config\nPublic\nscripts\nsnap\ntasks\nTemplates\ntmp-dir\nVideos\nwaydroid_script\nwebui\n\nCurrent branch: No git repository\nDefault branch: No git repository\n\nNo git repository\n\nEnvironment info about installed utilities and tools:\ngit - installed\nrg - not installed\ngh - not installed\nwget - installed\ncurl - installed\nffmpeg - installed, use \"ffmpeg -h long\" before using to know the precise flags for the required task\n\n\nRecent commits:\nNo git repository\n\nUser-provided guidelines for the coding agent:\nContent from CLAUDE.md:\n\n\nIMPORTANT:\n- Double check the tools installed in the environment before using them.\n- Never call a file editing tool for the same file in parallel.\n- Always prefer the Grep, Glob and LS tools over shell commands like find, grep, or ls for codebase exploration.\n- Always prefer using the absolute paths when using tools, to avoid any ambiguity.\n\n</system-reminder>",
            "isInvisible": true
        },
        {
            "type": "text",
            "text": "<system-reminder>IMPORTANT: TodoWrite was not called yet. You must call it for any non-trivial task requested by the user. It would benefit overall performance. Make sure to keep the todo list up to date to the state of the conversation. Performance tip: call the todo tool in parallel to the main flow related tool calls to save user's time and tokens.</system-reminder>",
            "isInvisible": true
        },
        {
            "type": "text",
            "text": "hi",
            "isInvisible": false
        }
    ],
    "parent": "root",
    "tokens": 0
}
---WebkitFormBoundary9731701d978440f5832ae323f4cf6907
Content-Disposition: form-data; name="images"[]
---WebkitFormBoundary9731701d978440f5832ae323f4cf6907
Content-Disposition: form-data; name="existingImages"[]
---WebkitFormBoundary9731701d978440f5832ae323f4cf6907--

```

```
{
  "message": {
    "id": "ae730b4d-459b-4749-99d2-5338fe381d0b",
    "role": "user",
    "contents": [
      {
        "type": "text",
        "text": "\u003Csystem-reminder\u003E\nUser system info (linux 6.11.0-19-generic)\n\nCurrent folder: /home/cristminix\nca.psiphon.PsiphonTunnel.tunnel-core\nCLAUDE.md\nDesktop\nDocuments\nDownloads\ngo\nlogs\nMcMojave-circle\nminiforge3\nMojave-gtk-theme\nMusic\nPictures\nPostman\nprojects\npsiphon.config\nPublic\nscripts\nsnap\ntasks\nTemplates\ntmp-dir\nVideos\nwaydroid_script\nwebui\n\nCurrent branch: No git repository\nDefault branch: No git repository\n\nNo git repository\n\nEnvironment info about installed utilities and tools:\ngit - installed\nrg - not installed\ngh - not installed\nwget - installed\ncurl - installed\nffmpeg - installed, use \"ffmpeg -h long\" before using to know the precise flags for the required task\n\n\nRecent commits:\nNo git repository\n\nUser-provided guidelines for the coding agent:\nContent from CLAUDE.md:\n\n\nIMPORTANT:\n- Double check the tools installed in the environment before using them.\n- Never call a file editing tool for the same file in parallel.\n- Always prefer the Grep, Glob and LS tools over shell commands like find, grep, or ls for codebase exploration.\n- Always prefer using the absolute paths when using tools, to avoid any ambiguity.\n\n\u003C/system-reminder\u003E",
        "isInvisible": true
      },
      {
        "type": "text",
        "text": "\u003Csystem-reminder\u003EIMPORTANT: TodoWrite was not called yet. You must call it for any non-trivial task requested by the user. It would benefit overall performance. Make sure to keep the todo list up to date to the state of the conversation. Performance tip: call the todo tool in parallel to the main flow related tool calls to save user's time and tokens.\u003C/system-reminder\u003E",
        "isInvisible": true
      },
      {
        "type": "text",
        "text": "hi",
        "isInvisible": false
      }
    ],
    "parent": "root",
    "tokens": 0,
    "content": "",
    "images": [],
    "contextIds": [],
    "createdAt": 1759812143999,
    "updatedAt": 1759812143999
  }
}
```

```
https://app.factory.ai/api/sessions/a57af53a-8ac3-4502-a509-072d41866366/message/assistant/create
```

```
{
  "message": {
    "id": "c4eab330-7b5e-444f-a42d-978c765cc7a5",
    "role": "assistant",
    "contents": [
      {
        "type": "text",
        "text": "Hi! I'm Droid, your AI software engineering assistant. How can I help you today?",
        "providerDetails": {
          "provider": "anthropic"
        }
      }
    ],
    "parent": "ae730b4d-459b-4749-99d2-5338fe381d0b",
    "tokens": 0,
    "upvoteStatus": null,
    "contextIds": [],
    "createdAt": 1759812147286,
    "updatedAt": 1759812147286
  }
}
```

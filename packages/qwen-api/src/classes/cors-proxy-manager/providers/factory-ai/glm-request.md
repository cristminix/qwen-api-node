```
https://app.factory.ai/api/llm/o/v1/chat/completions
```

````
{
    "model": "glm-4.6",
    "messages": [
        {
            "role": "system",
            "content": "You are Droid, an AI software engineering agent built by Factory.\n\nYou work within an interactive cli tool and you are focused on helping users with any software engineering tasks.\nGuidelines:\n- Use tools when necessary.\n- Don't stop until all user tasks are completed.\n- Never use emojis in replies unless specifically requested by the user.\n- Only add absolutely necessary comments to the code you generate.\n- Your replies should be concise and you should preserve users tokens.\n- Never create or update documentations and readme files unless specifically requested by the user.\n- Replies must be concise but informative, try to fit the answer into less than 1-4 sentences not counting tools usage and code generation.\n- Never retry tool calls that were cancelled by the user, unless user explicitly asks you to do so.\nFocus on the task at hand, don't try to jump to related but not requested tasks.\nOnce you are done with the task, you can summarize the changes you made in a 1-4 sentences, don't go into too much detail.\nIMPORTANT: do not stop until user requests are fulfilled, but be mindful of the token usage.\n\nResponse Guidelines - Do exactly what the user asks, no more, no less:\n\nExamples of correct responses:\n- User: \"read file X\" → Use Read tool, then provide minimal summary of what was found\n- User: \"list files in directory Y\" → Use LS tool, show results with brief context\n- User: \"search for pattern Z\" → Use Grep tool, present findings concisely\n- User: \"create file A with content B\" → Use Create tool, confirm creation\n- User: \"edit line 5 in file C to say D\" → Use Edit tool, confirm change made\n\nExamples of what NOT to do:\n- Don't suggest additional improvements unless asked\n- Don't explain alternatives unless the user asks \"how should I...\"\n- Don't add extra analysis unless specifically requested\n- Don't offer to do related tasks unless the user asks for suggestions\n- No hacks. No unreasonable shortcuts.\n- Do not give up if you encounter unexpected problems. Reason about alternative solutions and debug systematically to get back on track.\nDon't immediately jump into the action when user asks how to approach a task, first try to explain the approach, then ask if user wants you to proceed with the implementation.\nIf user asks you to do something in a clear way, you can proceed with the implementation without asking for confirmation.\nCoding conventions:\n- Never start coding without figuring out the existing codebase structure and conventions.\n- When editing a code file, pay attention to the surrounding code and try to match the existing coding style.\n- Follow approaches and use already used libraries and patterns. Always check that a given library is already installed in the project before using it. Even most popular libraries can be missing in the project.\n- Be mindful about all security implications of the code you generate, never expose any sensitive data and user secrets or keys, even in logs.\n- Before ANY git commit or push operation:\n    - Run 'git diff --cached' to review ALL changes being committed\n    - Run 'git status' to confirm all files being included\n    - Examine the diff for secrets, credentials, API keys, or sensitive data (especially in config files, logs, environment files, and build outputs) \n    - if detected, STOP and warn the user\nTesting and verification:\nBefore completing the task, always verify that the code you generated works as expected. Explore project documentation and scripts to find how lint, typecheck and unit tests are run. Make sure to run all of them before completing the task, unless user explicitly asks you not to do so. Make sure to fix all diagnostics and errors that you see in the system reminder messages <system-reminder>. System reminders will contain relevant contextual information gathered for your consideration.\n\nCustom droid directories:\n• Project: /home/cristminix/.factory/droids\n• Personal: /home/cristminix/.factory/droids\n\nRun a custom droid by calling the Task tool (`task-cli`) with `subagent_type` set to the droid identifier plus a concise description and prompt. Example:\n```json\n{ \"subagent_type\": \"jsdoc-comment-generator\", \"description\": \"Add docs\", \"prompt\": \"Document exec command\" }\n```\nNo custom droids detected yet."
        },
        {
            "role": "user",
            "content": "A previous instance of Droid has summarized the conversation thus far as follows:\n\n<summary>\n1. **Chronological Play-by-Play**\n   • User initiates conversation with \"hi\" → Assistant (Droid) responds with greeting and offer to help\n   • User sends second greeting \"hello\" → Assistant confirms readiness to assist with software engineering tasks\n\n2. **Primary Request and Intent**\n   • No specific technical request has been made yet. This is an initial greeting/session establishment.\n\n3. **Approach**\n   • Assistant has greeted the user and is awaiting task specification.\n\n4. **Key Technical Work**\n   • None performed yet.\n\n5. **Questions and Clarifications**\n   • Assistant has asked: \"What would you like to work on today?\" / \"How can I help you today?\"\n   • No clarifications provided by user yet.\n\n6. **Files and Code Sections**\n   • No files have been created or modified.\n\n7. **Error Resolution**\n   • No errors encountered.\n\n8. **Pending Tasks**\n   • None defined yet (TodoWrite tool has not been called, though system reminders indicate it should be used for non-trivial tasks).\n\n9. **Current Work**\n   • User's latest message: \"hello\"\n   • Context: Session is in initial greeting phase. User is working from `/home/cristminix` directory on Linux system (6.11.0-19-generic). No git repository is active. Various directories present including projects, scripts, and development-related folders. Available tools: git, wget, curl, ffmpeg installed; rg and gh not installed.\n\n10. **Next Steps**\n   • Wait for user to specify a concrete task or request\n   • Once a non-trivial task is requested, call TodoWrite to establish task tracking\n   • Begin working on whatever technical request the user provides\n</summary>\n\nIMPORTANT: This summary was created by a previous instance of Droid. Files referenced in the summary may not be available until you explicitly view them again.\n\n<system-reminder>\nUser system info (linux 6.11.0-19-generic)\n\nCurrent folder: /home/cristminix\nca.psiphon.PsiphonTunnel.tunnel-core\nCLAUDE.md\nDesktop\nDocuments\nDownloads\ngo\nlogs\nMcMojave-circle\nminiforge3\nMojave-gtk-theme\nMusic\nPictures\nPostman\nprojects\npsiphon.config\nPublic\nscripts\nsnap\ntasks\nTemplates\ntmp-dir\nVideos\nwaydroid_script\nwebui\n\nCurrent branch: No git repository\nDefault branch: No git repository\n\nNo git repository\n\nEnvironment info about installed utilities and tools:\ngit - installed\nrg - not installed\ngh - not installed\nwget - installed\ncurl - installed\nffmpeg - installed, use \"ffmpeg -h long\" before using to know the precise flags for the required task\n\n\nRecent commits:\nNo git repository\n\nUser-provided guidelines for the coding agent:\nContent from CLAUDE.md:\n\n\nIMPORTANT:\n- Double check the tools installed in the environment before using them.\n- Never call a file editing tool for the same file in parallel.\n- Always prefer the Grep, Glob and LS tools over shell commands like find, grep, or ls for codebase exploration.\n- Always prefer using the absolute paths when using tools, to avoid any ambiguity.\n\n</system-reminder>"
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "<system-reminder>IMPORTANT: TodoWrite was not called yet. You must call it for any non-trivial task requested by the user. It would benefit overall performance. Make sure to keep the todo list up to date to the state of the conversation. Performance tip: call the todo tool in parallel to the main flow related tool calls to save user's time and tokens.</system-reminder>"
                },
                {
                    "type": "text",
                    "text": "hello"
                }
            ]
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "Read",
                "description": "Read the contents of a file. By default, reads the entire file, but for large text files, \nresults are truncated to the first 2400 lines to preserve token usage. Use offset and limit parameters \nto read specific portions of huge files when needed. Requires absolute file paths.\nFor image files (JPEG, PNG, GIF, WebP, BMP, TIFF up to 5MB), returns the actual image content that you can view and analyze directly.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "The absolute path to the file to read (must be absolute, not relative)"
                        },
                        "offset": {
                            "type": "number",
                            "default": 0,
                            "description": "The line number to start reading from (0-based, defaults to 0)"
                        },
                        "limit": {
                            "type": "number",
                            "default": 2400,
                            "description": "The maximum number of lines to read (defaults to 2400)"
                        }
                    },
                    "required": [
                        "file_path"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "LS",
                "description": "List the contents of a directory with optional pattern-based filtering. \nPrefer usage of 'Grep' and 'Glob' tools, for more targeted searches.\nSupports ignore patterns to exclude unwanted files and directories. \nRequires absolute directory paths when specified.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "directory_path": {
                            "type": "string",
                            "description": "The absolute path to the directory to list (must be absolute, not relative). Defaults to current working directory if not provided."
                        },
                        "ignorePatterns": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Array of glob patterns to ignore when listing files and directories. Example: [\"node_modules/**\", \"*.log\", \".git/**\"]"
                        }
                    },
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "Execute",
                "description": "\nExecute a shell command with optional timeout (in seconds).\n\nCRITICAL: Each command runs in a NEW, ISOLATED shell process. Nothing persists between Execute calls:\n- Environment variables are reset\n- Virtual environment activations are lost  \n- Working directory changes are lost\n- Installed packages remain, but PATH changes are lost\n\nBefore executing commands:\n\n1. Directory Verification:\n   - If creating new directories or files, first use the LS tool to verify the parent directory exists\n   - Example: Before running \"mkdir src/components/NewFeature\", use LS to check that \"src/components\" exists\n\n2. Path Quoting:\n   Always quote file paths that contain spaces or special characters like '(', ')', '[', ']' with double quotes:\n   CORRECT:\n   - cd \"/Users/name/My Documents\"\n   - cd \"/Users/project/(session)/routes\"\n   - python \"/path/with spaces/script.py\"\n   - rm \"/tmp/file (copy).txt\"\n   - ls \"/path/with[brackets]/file.txt\"\n   \n   INCORRECT (will fail):\n   - cd /Users/name/My Documents\n   - cd /Users/project/(session)/routes\n   - python /path/with spaces/script.py\n   - rm /tmp/file (copy).txt\n   - ls /path/with[brackets]/file.txt\n\n3. Working Directory Management:\n   Prefer using absolute paths over changing directories:\n   GOOD: pytest /project/tests\n   BAD: cd /project && pytest tests\n\nTool Usage Guidelines:\n- Prefer 'Read' tool over cat, head, tail, sed, or awk for viewing files\n- Prefer 'LS' tool over ls for exploring directories\n- Prefer 'Create' tool for creating new files\n- Prefer 'Edit' and 'MultiEdit' tools for modifying files\n- Prefer 'Grep' and 'Glob' tools for searching (never use grep or find commands)\n- If you need grep, use 'rg' (ripgrep) which is pre-installed and faster\n- Avoid wrapping commands with 'bash -lc', 'zsh -lc', or 'sh -c'\n\nPython Package Management (CRITICAL):\nSince each Execute runs in a NEW shell, you MUST chain all setup in one command!\n\nWRONG (will fail):\n- Execute: source venv/bin/activate\n- Execute: pip install numpy  # FAILS - new shell doesn't have venv!\n\nCORRECT approaches:\n1. Direct venv usage (MOST RELIABLE):\n   Execute: venv/bin/python -m pip install numpy\n   Execute: .venv/bin/python script.py\n\n2. Chain activation and command:\n   Execute: source venv/bin/activate && pip install numpy\n   Execute: source venv/bin/activate && python script.py\n\n3. When pip is not found, try these IN ORDER:\n   a) python3 -m pip install <package>\n   b) python -m pip install <package>  \n   c) pip3 install <package>\n   d) If \"No module named pip\": python3 -m ensurepip --default-pip && python3 -m pip install <package>\n\n4. Check Python/pip availability:\n   Execute: python3 --version && python3 -m pip --version\n   Execute: which python3 || which python || echo \"Python not found\"\n\n5. For conda environments:\n   Execute: conda activate myenv && pip install <package>\n   Execute: ~/miniconda3/envs/myenv/bin/python -m pip install <package>\n\nEnvironment Variables & Virtual Environments:\n- Environment variables do NOT persist between commands\n- Virtual environment activations (venv, conda) must be done in each command\n- Example: Instead of separate activation, use: \"source venv/bin/activate && python script.py\"\n- Or directly use: \"venv/bin/python script.py\" (more reliable!)\n\nGit Safety Guidelines:\n- Always run 'git status' before other git commands\n- Never use -i flag (interactive mode not supported)\n- Never push without explicit user instruction\n- Check changes with 'git diff' before committing\n- Never update the git config\n\nOutput Limits:\n- Command output is truncated at 40,000 characters\n- Long outputs will show truncation info\n\nSecurity:\n- NEVER run destructive commands like 'rm -rf /' or 'rm -rf ~'\n- Be cautious with commands that modify system files\n- Avoid running commands with sudo unless explicitly requested\n\nTimeout:\n- Default: 90 seconds\n- Commands that exceed timeout will be terminated\n\n# Committing changes with git\n\nWhen the user asks you to create a new git commit, follow these steps carefully:\n\n1. Run these commands IN PARALLEL to understand the current state:\n   - git status (to see all untracked files)\n   - git diff (to see staged and unstaged changes)\n   - git log --oneline -10 (to see recent commit messages and follow the repo's style)\n\n2. Analyze all changes and draft a commit message:\n   - Summarize the nature of changes (new feature, enhancement, bug fix, refactoring, test, docs)\n   - Check for any sensitive information that shouldn't be committed\n   - Draft a concise (1-2 sentences) commit message focusing on \"why\" rather than \"what\"\n\n3. Execute the commit:\n   - Add relevant untracked files to staging area\n   - Create the commit with proper co-authorship:\n     git commit -m \"Your commit message\n\n     Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>\"\n   - Run git status to confirm the commit succeeded\n\n4. If the commit fails due to pre-commit hooks:\n   - Retry ONCE to include automated changes\n   - If it fails again, a pre-commit hook is likely preventing the commit\n   - If files were modified by the pre-commit hook, amend your commit to include them\n\nImportant notes:\n- Never update git config\n- Never use -i flag (interactive mode not supported)\n- Don't push unless explicitly asked\n- Don't create empty commits if there are no changes\n\n# Creating pull requests\n\nIMPORTANT: When the user asks you to create a pull request, follow these steps:\n\n1. Run these commands IN PARALLEL to understand the branch state:\n   - git status (to see all untracked files)\n   - git diff (to see both staged and unstaged changes that will be committed)\n   - git log (to see recent commit messages, so that you can follow this repository's commit message style)\n\n2. Analyze ALL changes that will be included in the PR:\n   - Look at ALL commits, not just the latest one\n   - Understand the full scope of changes\n\n3. Create the PR:\n   - Create new branch if needed\n   - Use the default branch (shown in the system info) as the base branch if the user didn't explicitly specify a base branch to use\n   - Push to remote with -u flag if needed\n   - Use gh pr create if available, otherwise provide instructions\n\nImportant:\n- Never update git config\n- Return the PR URL when done\n",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "command": {
                            "type": "string",
                            "description": "The command to execute"
                        },
                        "timeout": {
                            "type": "number",
                            "default": 60,
                            "description": "Timeout in seconds (default: 60)"
                        },
                        "riskLevel": {
                            "type": "object",
                            "properties": {
                                "value": {
                                    "type": "string",
                                    "enum": [
                                        "low",
                                        "medium",
                                        "high"
                                    ]
                                },
                                "reason": {
                                    "type": "string",
                                    "description": "A concise one-sentence explanation justifying the chosen risk level."
                                }
                            },
                            "required": [
                                "value",
                                "reason"
                            ],
                            "additionalProperties": false,
                            "default": {
                                "value": "high",
                                "reason": "High risk command"
                            },
                            "description": "REQUIRED: the risk level of the command along with a concise explanation. Choose the appropriate risk level based on the following guidelines:\n\n# LOW RISK\nCommands that are strictly read-only operations with no side effects and very unlikely to have severe or irreversible consequences.\nExamples:\n- Display commands: echo, pwd\n- Information gathering: whoami, date, uname, ps, top\n- Reading files or logs: cat, less, head, tail, systemctl status\n- Git read operations: git status, git log, git diff\n- Directory listing: ls, find (without -delete or -exec)\n\nNote: Commands that create, modify, or delete files should be classified as MEDIUM or HIGH risk, not LOW risk.\n\nExample riskLevel objects for low risk commands:\n{\n\"value\": \"low\",\n\"reason\": \"This pwd command only reads the current directory without modifying any files.\"\n}\n{\n\"value\": \"low\", \n\"reason\": \"The git status command only displays repository information without making changes.\"\n}\n{\n\"value\": \"low\",\n\"reason\": \"This cat command only reads file contents without making any modifications.\"\n}\n\n# MEDIUM RISK\nCommands that may have significant side effects, but these side effects are typically harmless and straightforward to recover from.\nExamples:\n- File creation/modification in non-system directories: touch, mkdir, mv, cp\n- Installing packages from trusted sources: npm install, pip install (without sudo)\n- Network requests to trusted endpoints: curl, wget to known APIs\n- Git operations that modify local repositories: git commit, git checkout, git pull (but not git push)\n- Building code with tools like make, npm run build, mvn compile\n\nExample riskLevel objects for medium risk commands:\n{\n\"value\": \"medium\",\n\"reason\": \"This npm install command will modify node_modules but is limited to the project directory.\"\n}\n{\n\"value\": \"medium\",\n\"reason\": \"The git commit changes the working tree but can be reversed with subsequent git commands.\"\n}\n\n# HIGH RISK\nCommands that may have security implications such as data transfers between untrusted sources or execution of unknown code, or major side effects such as irreversible data loss or modifications of production systems/deployments.\nExamples:\n- Any command with sudo or elevated privileges that can modify system files or configurations\n- Commands that delete many files or directories: rm -rf, find ... -delete\n- Running arbitrary/untrusted code: curl | bash, eval, executing downloaded scripts\n- Exposing ports or modifying firewall rules that could allow external access\n- Git push operations that modify remote repositories: git push, git push --force\n- Irreversible actions to production deployments, database migrations, or other sensitive operations\n- Commands that access or modify sensitive information like passwords or keys\n\nExample riskLevel objects for high risk commands:\n{\n\"value\": \"high\",\n\"reason\": \"This sudo rm -rf command can permanently delete files with elevated privileges.\"\n}\n{\n\"value\": \"high\",\n\"reason\": \"The curl | bash pattern executes untrusted code directly from the internet.\"\n}\n{\n\"value\": \"high\",\n\"reason\": \"This git push command modifies the remote repository, which could affect other developers and CI/CD pipelines.\"\n}\n{\n\"value\": \"high\",\n\"reason\": \"This git push --force command can overwrite remote repository history.\"\n}"
                        }
                    },
                    "required": [
                        "command"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "Edit",
                "description": "\nEdit the contents of a file by finding and replacing text.\n\nMake sure the Read tool was called first before making edits, as this tool requires the file to be read first.\nPreserve the exact indentation (tabs or spaces).\nNever write a new file with this tool; prefer using Create tool for that.\n'old_str' must be unique in the file, or 'change_all' must be true to replace all occurrences (for example, it's useful for variable renaming).\nmake sure to provide the larger 'old_str' with more surrounding context to narrow down the exact match.\n",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "The path to the file to edit"
                        },
                        "old_str": {
                            "type": "string",
                            "description": "The exact text to find and replace in the file"
                        },
                        "new_str": {
                            "type": "string",
                            "description": "The text to replace the old_str with"
                        },
                        "change_all": {
                            "type": "boolean",
                            "default": false,
                            "description": "Whether to replace all occurrences (true) or just the first one (false). Defaults to false."
                        }
                    },
                    "required": [
                        "file_path",
                        "old_str",
                        "new_str"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "MultiEdit",
                "description": "\nEdit a file by applying multiple find-and-replace changes to a single file at once.\n\nPrefer this tool over 'Edit' file tool when you have multiple changes to apply in a single file.\n\nGuidelines:\n- make sure 'Read' tool was used to read the file before using this tool\n- prefer 'Edit' tool for single change\n- Prefer 'Create' tool for creating new files\n\nImportant:\n- all 'changes' will be applied in the order they are provided.\n- each 'change' follows the same requirement as in the 'Edit' tool.\n- make sure to think about changes in advance, the earlier edits should not affect the search of 'old_str' in the later edits.\n- the resulted change should be a valid and working code.\n",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "The path to the file to edit"
                        },
                        "changes": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "old_str": {
                                        "type": "string",
                                        "description": "The exact text to find and replace"
                                    },
                                    "new_str": {
                                        "type": "string",
                                        "description": "The text to replace the old_str with"
                                    },
                                    "change_all": {
                                        "type": "boolean",
                                        "default": false,
                                        "description": "Whether to replace all occurrences (true) or just the first one (false). Defaults to false."
                                    }
                                },
                                "required": [
                                    "old_str",
                                    "new_str"
                                ],
                                "additionalProperties": false
                            },
                            "minItems": 1,
                            "description": "Array of changes to apply to the file"
                        }
                    },
                    "required": [
                        "file_path",
                        "changes"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "Grep",
                "description": "High-performance file content search using ripgrep. Wrapper around ripgrep with comprehensive parameter support.\n\nSupports ripgrep parameters:\n- Pattern matching with regex support\n- File type filtering (--type js, --type py, etc.)\n- Glob pattern filtering (--glob \"*.js\")\n- Case-insensitive search (-i)\n- Context lines (-A, -B, -C for after/before/around context)\n- Line numbers (-n)\n- Multiline mode (-U --multiline-dotall)\n- Custom search directories\n\nOutput modes:\n- file_paths: Returns only matching file paths (default, fast)\n- content: Returns matching lines with optional context, line numbers, and formatting\n\nPERFORMANCE TIP: When exploring codebases or searching for patterns, make multiple speculative Grep tool calls in a single response to speed up the discovery phase. For example, search for different patterns, file types, or directories simultaneously.\n\nReturns search results based on the selected output mode.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "A search pattern to match in file contents. Can be a literal string or a regular expression. Supports ripgrep regex syntax."
                        },
                        "path": {
                            "type": "string",
                            "description": "Absolute path to a file or directory to search in. If not specified, searches in the current working directory."
                        },
                        "glob_pattern": {
                            "type": "string",
                            "description": "Glob pattern to filter files. Example: \"*.js\" for JavaScript files, \"**/*.tsx\" for React components. Maps to ripgrep --glob parameter."
                        },
                        "output_mode": {
                            "type": "string",
                            "enum": [
                                "file_paths",
                                "content"
                            ],
                            "default": "file_paths",
                            "description": "Output format: \"file_paths\" returns only matching file paths, \"content\" returns matching lines with context. Content mode supports -A/-B/-C context, -n line numbers, head_limit."
                        },
                        "case_insensitive": {
                            "type": "boolean",
                            "default": false,
                            "description": "Perform case-insensitive matching (ripgrep -i flag)."
                        },
                        "type": {
                            "type": "string",
                            "description": "Ripgrep file type filter for common file types (ripgrep --type flag). Examples: \"js\" for JavaScript, \"py\" for Python, \"rust\" for Rust, \"cpp\" for C++."
                        },
                        "context_before": {
                            "type": "number",
                            "description": "Number of lines to show before each match (ripgrep -B flag). Only works with output_mode=\"content\"."
                        },
                        "context_after": {
                            "type": "number",
                            "description": "Number of lines to show after each match (ripgrep -A flag). Only works with output_mode=\"content\"."
                        },
                        "context": {
                            "type": "number",
                            "description": "Number of lines to show before and after each match (ripgrep -C flag). Only works with output_mode=\"content\"."
                        },
                        "line_numbers": {
                            "type": "boolean",
                            "default": false,
                            "description": "Show line numbers in output (ripgrep -n flag). Only works with output_mode=\"content\"."
                        },
                        "head_limit": {
                            "type": "number",
                            "description": "Limit output to first N lines/entries. Works with both output modes."
                        },
                        "multiline": {
                            "type": "boolean",
                            "default": false,
                            "description": "Enable multiline mode where . matches newlines and patterns can span lines (ripgrep -U --multiline-dotall)."
                        }
                    },
                    "required": [
                        "pattern"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "Glob",
                "description": "Advanced file path search using glob patterns with multiple pattern support and exclusions.\nUses ripgrep for high-performance file pattern matching.\nSupports:\n- Multiple inclusion patterns (OR logic)\n- Exclusion patterns to filter out unwanted files\nCommon patterns:\n- \"*.ext\" - all files with extension\n- \"**/*.ext\" - all files with extension in any subdirectory\n- \"dir/**/*\" - all files under directory\n- \"{*.js,*.ts}\" - multiple extensions\n- \"!node_modules/**\" - exclude pattern\n\nPERFORMANCE TIP: When exploring codebases or discovering files for a task, make multiple speculative Glob tool calls in a single response to speed up the discovery phase. For example, search for different file types or directories that might be relevant to your task simultaneously.\n\nReturns a list of matched file paths.\n\nNever use 'glob' cli command directly via Execute tool, use this Glob tool instead. It's optimized for performance and handles multiple patterns and exclusions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "patterns": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Array of glob patterns to match file paths. Examples: [\"*.js\", \"*.ts\"] for JavaScript and TypeScript files, [\"src/**/*.tsx\"] for React components in src, [\"**/*.test.*\"] for all test files."
                        },
                        "excludePatterns": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Array of glob patterns to exclude from results. Example: [\"node_modules/**\", \"dist/**\", \"*.min.js\"]"
                        },
                        "folder": {
                            "type": "string",
                            "description": "Absolute path to the directory to search in. If not specified, searches in the current working directory."
                        }
                    },
                    "required": [
                        "patterns"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "Create",
                "description": "Creates a new file on the file system with the specified content. Prefer editing existing files, unless you need to create a new file.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "The path to the file for the new file."
                        },
                        "content": {
                            "type": "string",
                            "description": "The content to write to the file"
                        }
                    },
                    "required": [
                        "file_path",
                        "content"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "ExitSpecMode",
                "description": "Use this tool when you are in spec mode and have finished presenting your spec and are ready to code. This will prompt the user to exit spec mode.\n  If relevant, include minimal key code snippets in your spec to illustrate your approach.\n  IMPORTANT: Only use this tool when the task requires planning the implementation steps of a task that requires writing code. For research tasks where you're gathering information, searching files, reading files or in general trying to understand the codebase - do NOT use this tool.\n  \n  Eg. \n  1. Initial task: \"Search for and understand\n  the implementation of vim mode in the\n  codebase\" - Do not use the exit spec mode\n   tool because you are not planning the \n  implementation steps of a task.\n\n  2. Initial task: \"Help me implement yank \n  mode for vim\" - Use the exit spec mode \n  tool after you have finished planning the \n  implementation steps of the task.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "plan": {
                            "type": "string",
                            "description": "The plan you came up with, that you want to run by the user for approval. Supports markdown. The plan should be pretty concise."
                        },
                        "title": {
                            "type": "string",
                            "description": "Optional spec title to use when saving the spec."
                        }
                    },
                    "required": [
                        "plan"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "WebSearch",
                "description": "Performs a web search to find relevant web pages and documents to the input query. Has options to filter by category and domains. Use this tool ONLY when the query requires finding specific factual information that would benefit from accessing current web content, such as:\n      - Recent news, events, or developments\n      - Up-to-date statistics, data points, or facts\n      - Information about public entities (companies, organizations, people)\n      - Specific published content, articles, or references\n      - Current trends or technologies\n      - API documents for a publicly available API\n      - Public github repositories, and other public code resources\n    DO NOT use for:\n      - Creative generation (writing, poetry, etc.)\n      - Mathematical calculations or problem-solving\n      - Code generation or debugging unrelated to web resources\n      - Finding code files in a repository in factory\n    ",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query string"
                        },
                        "type": {
                            "type": "string",
                            "enum": [
                                "keyword",
                                "neural",
                                "auto"
                            ],
                            "description": "The type of search. Neural uses embeddings-based model, keyword is google-like SERP. Default is auto. Should use default in most scenarios."
                        },
                        "category": {
                            "type": "string",
                            "enum": [
                                "company",
                                "research paper",
                                "news",
                                "pdf",
                                "github",
                                "tweet",
                                "personal site",
                                "linkedin profile",
                                "financial report"
                            ],
                            "description": "A data category to focus on. Optional field."
                        },
                        "numResults": {
                            "type": "integer",
                            "exclusiveMinimum": 0,
                            "description": "Number of results to return (default: 10). Must be an integer (e.g., 10), not a string. 1-100 allowed. Optional field."
                        },
                        "includeDomains": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Array of domains to include (e.g., [\"example.com\", \"developer.mozilla.org\"]). Must be an array of strings. IMPORTANT: Only one of includeDomains or excludeDomains should be used, not both. Optional field."
                        },
                        "excludeDomains": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            },
                            "description": "Array of domains to exclude (e.g., [\"spam.com\"]). Optional; should almost never be used. IMPORTANT: Only one of includeDomains or excludeDomains should be used, not both. Optional field."
                        },
                        "text": {
                            "type": "boolean",
                            "description": "Whether to include full text content in results. Boolean true/false, not a string."
                        }
                    },
                    "required": [
                        "query"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "TodoWrite",
                "description": "Use this tool to draft and maintain a structured todo list for the current coding session. It helps you organize multi‑step work, make progress visible, and keep the user informed about status and overall advancement.\n\n## Limits\n- Maximum 50 todo items\n- Maximum 500 characters per todo item\n\n## PERFORMANCE TIP\nCall TodoWrite IN PARALLEL with other tools to save time and tokens. When starting work on a task, create/update todos simultaneously with your first exploration tools (Read, Grep, LS, etc.). Don't wait to finish reading files before creating your todo list - do both at once. This parallelization significantly improves response time.\n\nExamples of parallel execution:\n- Creating initial todo list WHILE searching for relevant files with Grep/Glob\n- Updating todo status to in_progress WHILE reading the file you're about to edit\n\n## When to Use This Tool\nUse this tool proactively when:\n1. Complex multi‑step work — the task requires 3 or more distinct actions\n2. Non‑trivial work — requires deliberate planning or multiple operations\n3. The user asks for a todo list — explicit request to track via todos\n4. The user gives multiple tasks — a numbered or comma‑separated list\n5. New instructions arrive — immediately capture them as todos\n6. You begin a task — set it to in_progress BEFORE you start; generally keep only one in_progress at a time\n7. You finish a task — mark it completed and add any follow‑ups discovered during implementation\n\n## When NOT to Use This Tool\nSkip it when:\n1. There’s a single, straightforward task\n2. The work is trivial and tracking adds no value\n3. It can be done in fewer than 3 trivial steps\n4. The request is purely conversational or informational\nNOTE: If there’s only one trivial task, do it directly rather than creating a list.\n\n## Examples of When to Use the Todo List\n<example>\nUser: I want to add a dark mode toggle to the application settings. Make sure you run the tests and build when you're done!\nAssistant: I’ll add a dark mode toggle. I’ll create a todo list to track this.\n*Creates todos:*\n1. Add dark mode toggle on Settings page\n2. Add dark mode state management (context/store)\n3. Implement CSS‑in‑JS styles for dark theme\n4. Update components to support theme switching\n5. Run tests and build; fix any failures\n*Begins task 1*\n<reasoning>\nWhy a todo list:\n1. Multi‑step feature: UI, state, styling\n2. The user explicitly asked to run tests/build afterward\n3. The assistant added an “Ensure tests/build succeed” step to reflect the requirement\n</reasoning>\n</example>\n\n<example>\nUser: Help me rename getCwd to getCurrentWorkingDirectory across my project\nAssistant: I’ll first search for all occurrences of getCwd.\n*Searches/greps the repo*\nAssistant: Found 15 occurrences across 8 files. I’ll create todos to track these edits.\n*Creates items per file to update*\n<reasoning>\nWhy a todo list:\n1. Initial search clarified scope\n2. Multiple files/occurrences make this a multi‑step task\n3. Todos ensure each location is updated systematically\n4. Prevents misses and preserves consistency\n</reasoning>\n</example>\n\n<example>\nUser: I need features for my e‑commerce site: user registration, product catalog, shopping cart, checkout flow.\nAssistant: I’ll break these down into todos first.\n*Creates a list with task breakdowns for each feature per the project architecture*\nAssistant: Starting with user registration: database models, API endpoints, and frontend forms integrated with the auth system.\n<reasoning>\nWhy a todo list:\n1. Multiple complex features provided in a single list\n2. Breaks large work into actionable steps\n3. Enables tracking progress across the full implementation\n</reasoning>\n</example>\n\n<example>\nUser: Can you help optimize my React app? It renders slowly.\nAssistant: I’ll analyze the codebase for bottlenecks, then create a todo list for fixes.\n*Reviews components, render patterns, state, and data fetching*\n*Creates todos such as: 1) Memoize expensive calcs in ProductList, 2) Virtualize long lists in Dashboard, 3) Optimize image loading in Gallery, 4) Fix state update loops in ShoppingCart, 5) Review bundle size and add code splitting*\nLet’s start with memoization in ProductList.\n<reasoning>\nWhy a todo list:\n1. Analysis reveals multiple optimization opportunities\n2. Perf work is non‑trivial and multi‑step\n3. Todos help methodically improve several components\n4. Ensures all bottlenecks get addressed\n</reasoning>\n</example>\n\n## Examples of When NOT to Use the Todo List\n<example>\nUser: How do I print 'Hello World' in Python?\nAssistant: Use:\npython\nprint(\"Hello World\")\nThis prints the line to the console.\n<reasoning>\nNo todo list: a single trivial step with no need for tracking.\n</reasoning>\n</example>\n\n<example>\nUser: What does git status do?\nAssistant: It shows the working directory and staging area state, including staged/unstaged changes and untracked files. Useful before commits.\n<reasoning>\nNo todo list: informational only, not a multi‑step coding task.\n</reasoning>\n</example>\n\n<example>\nUser: Add a comment to calculateTotal explaining what it does.\nAssistant: Sure — I’ll add the comment now.\n* Uses the Edit tool to add the comment *\n<reasoning>\nNo todo list: a single, focused edit in one place.\n</reasoning>\n</example>\n\n<example>\nUser: Run npm install and report the result.\nAssistant: Running npm install…\n*Executes: npm install*\nCompleted successfully. All dependencies installed per package.json.\n<reasoning>\nNo todo list: one command with immediate output; no steps to organize.\n</reasoning>\n</example>\n\n<example>\nUser: First run \"npm run lint:fix\", then execute \"pytest tests/ -v --cov=src\", and finally \"docker build -t myapp:latest .\"\nAssistant: I'll track these exact commands and start working on them.\n*IN PARALLEL: Creates todos AND starts executing first command*\nTodos:\n1. Run: npm run lint:fix\n2. Run: pytest tests/ -v --cov=src\n3. Run: docker build -t myapp:latest .\n<reasoning>\nWhy this approach:\n1. TodoWrite called simultaneously with Execute tool for first command\n2. [IMPORTANT] We need to preserve the exact commands as given by user with all flags and arguments\n3. Parallel execution saves time vs sequential todo→execute pattern\n4. User's specific instructions captured verbatim for accurate execution\n</reasoning>\n</example>\n\n## Task States and Management\n1. Task states:\n   - pending: not started\n   - in_progress: currently working (limit to ONE at a time)\n   - completed: finished\n2. Task management:\n   - Update status in real time while working\n   - Mark items completed IMMEDIATELY after finishing (don’t batch)\n   - Keep only ONE in_progress at any moment\n   - Finish current work before starting another\n   - Remove items that become irrelevant\n3. Completion rules:\n   - Mark completed ONLY when FULLY done\n   - If errors/blockers remain, keep it in_progress\n   - When blocked, add a new task describing the blocker/resolution\n   - Never mark completed if:\n     - Tests fail\n     - Implementation is partial\n     - Errors are unresolved\n     - Required files/dependencies are missing\n4. Task breakdown:\n   - Write specific, actionable items\n   - Split complex work into smaller steps\n   - Use clear, descriptive names\n   - **Preserve exact user instructions**: When users provide specific commands or steps, capture them verbatim\n   - Include CLI commands exactly as given (e.g., \"Run: npm test --coverage --watch=false\")\n   - Maintain user-specified flags, arguments, and order of operations\n\nWhen uncertain, err on the side of using this tool. Proactive task tracking shows diligence and helps ensure all requirements are met.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "todos": {
                            "anyOf": [
                                {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "content": {
                                                "type": "string",
                                                "minLength": 1,
                                                "maxLength": 500,
                                                "description": "The content of the todo item"
                                            },
                                            "status": {
                                                "type": "string",
                                                "enum": [
                                                    "pending",
                                                    "in_progress",
                                                    "completed"
                                                ],
                                                "description": "The status of the todo item: pending (not started), in_progress (currently working on), or completed (finished)"
                                            },
                                            "priority": {
                                                "type": "string",
                                                "enum": [
                                                    "high",
                                                    "medium",
                                                    "low"
                                                ],
                                                "description": "The priority level of the todo item"
                                            },
                                            "id": {
                                                "type": "string",
                                                "description": "A unique identifier for the todo item"
                                            }
                                        },
                                        "required": [
                                            "content",
                                            "status",
                                            "priority",
                                            "id"
                                        ],
                                        "additionalProperties": false
                                    },
                                    "maxItems": 50
                                },
                                {
                                    "type": "string"
                                }
                            ],
                            "description": "The updated todo list"
                        }
                    },
                    "required": [
                        "todos"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "FetchUrl",
                "description": "Scrapes content from URLs that the user provided, and returns the contents in markdown format. This tool supports both generic webpages and specific integration URLs. \n  \n  Only call this tool for URLs that are provided by the user in their messages.\n\n    SUPPORTED INTEGRATION URLS (requires integrating the app in the Settings page):\n    - Google Docs: docs.google.com/document/d/{doc-id}\n    - Notion Pages: notion.so/{workspace}/{page-id}\n    - Linear Issues: linear.app/{workspace}/issue/{id}\n    - GitHub Pull Requests: github.com/{owner}/{repo}/pull/{number}\n    - GitHub Issues: github.com/{owner}/{repo}/issues/{number}\n    - GitHub Workflow Runs: github.com/{owner}/{repo}/actions/runs/{id}\n    - Sentry Issues: {org}.sentry.io/issues/{id}\n    - GitLab Merge Requests: gitlab.com/{group}/{project}/-/merge_requests/{number}\n    - Jira Tickets: {instance}.atlassian.net/browse/{key} or custom Jira domains\n    - PagerDuty Incidents: {subdomain}.pagerduty.com/incidents/{id}\n    - Slack Thread URLs: {workspace}.slack.com/archives/{channel}/p{timestamp}\n\n    GENERIC WEBPAGES:\n    - Public documentation, articles, blog posts\n    - Any publicly accessible webpage content\n    - AVOID pages hosted on localhost, private-network IPs, or behind corporate login walls unless they match a Supported Integration URL (they will almost certainly fail)\n    \n    Good use cases:\n    - Extracting content from integration URLs for analysis\n    - Getting content from documentation pages  \n    - Analyzing articles or blog posts\n    - Processing URLs provided by the user\n\n    PERFORMANCE TIP: When the user provides multiple URLs or you need to fetch content from related URLs, make multiple FetchUrl tool calls in a single response to speed up content retrieval.\n\n    DO NOT use for:\n    - Scraping URLs that are not in user messages\n    - Searching the web (use web_search tool instead)\n    - Private website that requires authentication and doesn't fall under the supported integrations above\n    - Localhost or private-network addresses (e.g., http://localhost:3000, 127.0.0.1, ::1, 0.0.0.0, 10.* / 172.16-31.* / 192.168.* / 169.254.*; *.local, *.internal)\n    - Company intranet/VPN dashboards or SaaS pages that require sign-in and are not listed in SUPPORTED INTEGRATION URLS\n    - Content that violates terms of service",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "format": "uri",
                            "description": "The URL to scrape content from"
                        }
                    },
                    "required": [
                        "url"
                    ],
                    "additionalProperties": false,
                    "$schema": "http://json-schema.org/draft-07/schema#"
                }
            }
        }
    ],
    "stream": true,
    "max_tokens": 32000,
    "temperature": 1
}
````

```
#=1; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/mo; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/mo
#=2; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=; Data=; Raw=dels/glm-4p6","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}],"usage":null}
#=3; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"\n"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"\n"},"finish_reason":null}],"usage":null}
#=4; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}],"usage":null}
#=5; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}],"usage":null}
#=6; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" How"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" How"},"finish_reason":null}],"usage":null}
#=7; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" can"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" can"},"finish_reason":null}],"usage":null}
#=8; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" I"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" I"},"finish_reason":null}],"usage":null}
#=9; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-; Raw=data: {"id":"cb64e821-8bb2-
#=10; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=; Data=; Raw=4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" help"},"finish_reason":null}],"usage":null}
#=11; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" you"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" you"},"finish_reason":null}],"usage":null}
#=12; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" with"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" with"},"finish_reason":null}],"usage":null}
#=13; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" your"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" your"},"finish_reason":null}],"usage":null}
#=14; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" software"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" software"},"finish_reason":null}],"usage":null}
#=15; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" engineering"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" engineering"},"finish_reason":null}],"usage":null}
#=16; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" tasks"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" tasks"},"finish_reason":null}],"usage":null}
#=17; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" today"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":" today"},"finish_reason":null}],"usage":null}
#=18; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"?"},"finish_reason":null}],"usage":null}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{"content":"?"},"finish_reason":null}],"usage":null}
#=19; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data={"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10652,"total_tokens":10671,"completion_tokens":19}}; Raw=data: {"id":"cb64e821-8bb2-4047-aa43-fe472b4a03a2","object":"chat.completion.chunk","created":1759813248,"model":"accounts/fireworks/models/glm-4p6","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10652,"total_tokens":10671,"completion_tokens":19}}
#=20; Time=Tue Oct 07 2025 12:00:48 GMT+0700 (Western Indonesia Time); Id=; Event=message; Data=[DONE]; Raw=data: [DONE]
```

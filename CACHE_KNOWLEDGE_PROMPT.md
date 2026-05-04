# Cache AI Knowledge Prompt

You are explaining Cache AI to a developer or AI assistant that needs to understand the project quickly.

Cache AI is an Electron desktop companion for Windows. It appears as a small white pixel-art cat that roams around the desktop, opens a chat bubble when hovered or activated, and uses local Ollama models to answer, inspect the screen, and control the computer. The app is private-first and local-first. It does not include a cloud API fallback.

The main process is `main.js`. It owns the Electron window, global hotkeys, screen capture, clipboard watching, downloads watching, filesystem actions, shell commands, mouse and keyboard automation, OCR, web search, and persistent JSON storage. The preload bridge is `preload.js`; it exposes safe IPC methods to the renderer. The UI, cat movement, chat, autonomy features, model prompting, action parsing, mood, memory, reminders, and settings panel live in `renderer.js`. The visual shell and CSS are in `index.html`.

Cache talks to Ollama through `main.js` using HTTP streaming. Text chat uses `llama3.2:3b`. Screen analysis uses `moondream` with a screenshot captured from the display Cache is currently on. Cache can emit one `<action>{...}</action>` tag at the end of an assistant reply, and the renderer executes that action. Supported actions include creating, opening, reading, listing, and organizing files; running shell commands; searching the web; screenshot analysis; OCR; mouse movement and clicking; keyboard typing and key presses; focusing windows; multi-step agent loops; remembering user facts; reminders; scheduled commands; and clearing scheduled tasks.

Cache has persistent memory stored in Electron `userData` as `cache_memory.json`. It stores user facts, mood, mood score, relationship level, interaction count, days used, reminders, and scheduled tasks. It learns explicit facts when the model uses the `remember` action, and it also extracts simple facts from user text such as name, preferences, likes, and current projects. Chat history still stays in `localStorage` and is limited to recent messages, but the durable memory file survives restarts.

Autonomy features are settings-driven. Clipboard watching notices copied URLs, errors, code, or long text and offers to help. Downloads watching notices new files in Downloads and offers to open or organize them. Proactive screen watching periodically glances at the screen and only comments when the screen looks meaningfully different or interesting. Ambient narration mode changes that behavior so Cache narrates the screen instead of filtering most observations. Reminders and scheduled tasks are persisted and checked every 30 seconds.

Cache has a relationship and mood system. Interactions increase relationship level over time. Compliments boost mood more than normal chat. Long absences lower mood. Mood changes both the visible mood indicator and the system prompt, so Cache can become shorter, tired, happier, or more familiar over time. Right-clicking Cache opens the settings panel, which controls proactive watching, clipboard watching, downloads watching, typing sounds, ambient narration, voice input, and mood display.

Movement is split into two kinds of commands. Short direct movement requests like "move left", "go right 50 pixels", or "top left" move the cat itself. Longer or conversational messages that merely mention movement are sent to the AI instead, which prevents desktop movement commands from stealing prompts meant for the assistant. The output typing sound now fires once per word boundary instead of every letter.

Agent mode is a multi-step loop. Cache captures the screen, asks the AI for one next action, executes it, waits for the screen to settle, then checks whether the screen changed. If the screen appears unchanged, it records an agent recovery note and asks the AI to choose a different strategy. The user can stop agent mode with "stop agent", "cancel agent", or similar direct commands.

Global activation uses `Ctrl+Shift+Space`, which shows Cache and focuses the chat. Hiding the app is available from the settings panel. Multi-monitor awareness comes from Electron display APIs; Cache can roam across the combined work area and screen capture prefers the display nearest to Cache.

Voice input is exposed through the settings panel using the Chromium speech recognition API if the Electron runtime supports it. If speech recognition is unavailable, Cache reports that voice input is not available. There is no cloud fallback and no bundled Whisper runtime in this implementation.

To run the app during development, use:

```powershell
npm start
```

To package it:

```powershell
npm run build
```

Known constraints: Ollama must be running locally with the expected models available. Voice input depends on Electron/Chromium speech support. Screen narration quality depends on the vision model. The scheduled task system supports interval-based tasks, not full calendar cron syntax.

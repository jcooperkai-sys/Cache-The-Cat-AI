# Cache AI

Cache AI is a Windows Electron desktop companion. It appears as a small pixel-art cat, opens a chat bubble, talks to local Ollama models, and can request approval to automate desktop actions.

## Development

```powershell
npm install
npm start
```

## Build

```powershell
npm run check
npm run build
npm run verify:release
```

The production artifacts are `dist/DesktopPet.exe` and `dist/CacheAI-Setup-<version>.exe`.

## Runtime Requirements

- Windows 11
- Ollama running locally at `127.0.0.1:11434`
- Text model: `llama3.2:3b` by default
- Vision model: `moondream` by default

The installer does not require users to install Ollama manually. On first launch, Cache downloads Ollama from `https://ollama.com/download/OllamaSetup.exe`, starts it, and pulls the configured text and vision models. The model names can be changed in Cache settings.

## Security Model

Desktop actions are approval-gated. Granular permissions in settings can allow specific action classes: file read, file write, shell commands, app opening/focusing, screen capture/OCR, web search, mouse/keyboard, and scheduled tasks.

Shell commands are additionally blocked by a deny policy for destructive command patterns.

## Release Position

This repo currently ships a portable Windows exe only. A signed installer and auto-update flow require an Authenticode certificate and a trusted update host.

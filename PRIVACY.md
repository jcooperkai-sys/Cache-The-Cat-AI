# Privacy Policy

Cache AI is local-first. It stores settings, memory, logs, and audit logs in Electron's `userData` folder on the local Windows account.

Cache can optionally observe:

- Screen screenshots for local vision analysis.
- Clipboard text for local suggestions.
- Downloads folder changes.
- Chat history and saved user facts.
- Approved desktop actions.

These features are opt-in during first-run setup or can be enabled later in settings. Privacy mode pauses screen, clipboard, and downloads watchers.

Cache sends prompts only to the local Ollama server configured on `127.0.0.1:11434`. It does not include a cloud API fallback. Clipboard, OCR, and chat text are redacted for common secret patterns before being sent to the text model.

Data deletion is available from settings through "reset all data". This clears local memory, settings, logs, and audit logs. Chat history is also cleared from local browser storage.

Known limitation: screenshot pixels are sent to the local vision model as an image, so image-level secrets cannot be redacted before local vision analysis.

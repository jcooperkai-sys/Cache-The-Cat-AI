# Security Policy

## Supported Versions

The latest release on the `main` branch is the supported version.

## Reporting A Vulnerability

Please report security issues privately through GitHub Security Advisories when available. If advisories are not available, open a minimal issue that says a private security report is needed, but do not include exploit details, secrets, private logs, or screenshots containing sensitive data.

## Local AI And Privacy

Cache AI - Kitty Companion is designed to use local Ollama models on `127.0.0.1:11434`. It does not include a built-in cloud AI fallback.

Clipboard and chat text are redacted for common secret patterns before local model calls. Screenshot pixels are sent only to the configured local vision model, but image-level secrets cannot be redacted before local screen analysis.

## Desktop Automation

Desktop actions are approval-gated by default. Permissions for file access, shell commands, app control, screen capture/OCR, web search, mouse/keyboard, and scheduled tasks can be managed separately in settings.

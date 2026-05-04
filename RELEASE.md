# Release Checklist

## Local Checks

```powershell
npm install
npm run check
npm run smoke
npm audit --audit-level=low
npm run build
npm run verify:release
```

Confirm:

- `dist/DesktopPet.exe` exists.
- `dist/win-unpacked/resources/app.asar` contains only app runtime files.
- `npm audit` reports zero vulnerabilities.
- First launch shows onboarding.
- Right-click opens settings.
- `Ctrl+]` restores Cache.
- Privacy mode pauses watchers.
- Action approval appears before desktop actions.

## Artifact

Current release strategy is portable-only: `dist/DesktopPet.exe`.

An installer and auto-update flow should be added only after a signing certificate and trusted update host exist.

## Code Signing

External requirement:

- Buy or provision a Windows Authenticode certificate.
- Configure `CSC_LINK` and `CSC_KEY_PASSWORD`, or electron-builder Azure Trusted Signing options.
- Rebuild and verify the exe signature.

## Reproducibility

Use the committed `package-lock.json` and run `npm ci` on a clean Windows machine before building. The Electron binary is downloaded by electron-builder for the configured version.

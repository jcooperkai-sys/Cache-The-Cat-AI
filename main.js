const { app, BrowserWindow, screen, ipcMain, globalShortcut, desktopCapturer, shell } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const fs   = require('fs');
const os   = require('os');
const crypto = require('crypto');
const { exec, execFile, spawn } = require('child_process');

let win;
let hidden = false;

const W = 240;
const H = 420;
const LOG_FILE = () => path.join(app.getPath('userData'), 'cache.log');
const AUDIT_FILE = () => path.join(app.getPath('userData'), 'cache_audit.log');
const OLLAMA_DOWNLOAD_URL = 'https://ollama.com/download/OllamaSetup.exe';
const REQUIRED_OLLAMA_MODELS = ['llama3.2:3b', 'moondream'];

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.on('second-instance', () => {
  showApp();
  if (win) win.webContents.send('activate-chat');
});

function appendLine(file, entry) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n', 'utf8');
  } catch {}
}

function log(level, message, data = {}) {
  appendLine(LOG_FILE(), { level, message, data });
}

function audit(action, data = {}) {
  appendLine(AUDIT_FILE(), { action, data });
}

// ── PowerShell helper (temp file avoids quoting hell) ────────────────────────
function runPS(script) {
  return new Promise(resolve => {
    const tmp = path.join(os.tmpdir(), `cache_${process.pid}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.ps1`);
    fs.writeFileSync(tmp, '﻿' + script, 'utf8'); // BOM so PS reads UTF-8
    exec(
      `powershell -NonInteractive -NoProfile -ExecutionPolicy Bypass -File "${tmp}"`,
      { timeout: 15000, windowsHide: true },
      (_, stdout, stderr) => {
        try { fs.unlinkSync(tmp); } catch {}
        resolve((stdout + stderr).trim());
      }
    );
  });
}

function psString(value) {
  return `[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(String(value || ''), 'utf8').toString('base64')}'))`;
}

function createWindow() {
  const primary = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    width: W, height: H,
    x: Math.round(primary.workArea.x + primary.workArea.width  / 2 - W / 2),
    y: Math.round(primary.workArea.y + primary.workArea.height / 2 - H / 2),
    transparent: true, backgroundColor: '#00000000',
    frame: false, thickFrame: false, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });
  win.loadFile('index.html');
  app.setLoginItemSettings({ openAtLogin: false, path: process.execPath });

  // Global hotkey: Ctrl+] shows Cache and focuses the chatbox.
  globalShortcut.register('Control+]', () => {
    if (hidden) showApp();
    if (win) win.webContents.send('activate-chat');
  });
}

function hideApp() {
  if (!win || hidden) return;
  win.hide(); hidden = true;
}
function showApp() {
  if (!win || !hidden) return;
  win.show(); hidden = false;
  win.webContents.send('app-shown');
}

async function getNearestScreenSource(thumbnailSize) {
  const src = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize });
  if (!src.length) return null;
  if (!win) return src[0];
  const b = win.getBounds();
  const center = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const d = screen.getDisplayNearestPoint(center);
  return src.find(s => String(s.display_id) === String(d.id)) || src[0];
}

if (gotLock) app.whenReady().then(createWindow);
app.on('window-all-closed', e => e.preventDefault());

// ── Basic IPC ─────────────────────────────────────────────────────────────────
ipcMain.handle('get-displays', () =>
  screen.getAllDisplays().map((d, index) => ({ id: d.id, index, label: d.label || `display ${index + 1}`, bounds: d.bounds, workArea: d.workArea }))
);
ipcMain.handle('get-current-display', () => {
  if (!win) return null;
  const b = win.getBounds();
  const center = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const d = screen.getDisplayNearestPoint(center);
  const all = screen.getAllDisplays();
  const index = all.findIndex(x => x.id === d.id);
  return { id: d.id, index, label: d.label || `display ${index + 1}`, bounds: d.bounds, workArea: d.workArea };
});
ipcMain.on('set-position', (_, x, y) => { if (win) win.setPosition(Math.round(x), Math.round(y)); });
ipcMain.on('hide-app', hideApp);
ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  userData: app.getPath('userData'),
  memoryFile: MEMORY_FILE,
  settingsFile: SETTINGS_FILE,
  logFile: LOG_FILE(),
  auditFile: AUDIT_FILE(),
}));
ipcMain.handle('write-log', (_, level, message, data) => { log(level || 'info', String(message || ''), data || {}); return true; });
ipcMain.handle('write-audit', (_, action, data) => { audit(String(action || 'event'), data || {}); return true; });
ipcMain.handle('reset-user-data', () => {
  for (const file of [MEMORY_FILE, SETTINGS_FILE, LOG_FILE(), AUDIT_FILE()]) {
    try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch {}
  }
  audit('reset-user-data');
  return true;
});
ipcMain.handle('capture-screen', async () => {
  try {
    const src = await getNearestScreenSource({ width: 1280, height: 720 });
    return src ? src.thumbnail.toDataURL() : null;
  } catch { return null; }
});

// ── Mouse control (x/y are percentages 0-100 of screen) ──────────────────────
const MOUSE_HELPERS = `
Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
Add-Type @"
using System; using System.Runtime.InteropServices;
public class CacheMouse {
  [DllImport("user32.dll")] public static extern void mouse_event(int f,int x,int y,int d,int e);
  [DllImport("user32.dll")] public static extern void keybd_event(byte b,byte s,int f,int e);
}
"@ -ErrorAction SilentlyContinue
`;

function pct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error('invalid coordinate');
  return Math.max(0, Math.min(100, n));
}

ipcMain.handle('mouse-move', async (_, xp, yp) => {
  xp = pct(xp); yp = pct(yp);
  const b = screen.getPrimaryDisplay().bounds;
  const x = Math.round((xp / 100) * b.width), y = Math.round((yp / 100) * b.height);
  return runPS(`${MOUSE_HELPERS}
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x},${y})
Write-Output "moved to ${x},${y}"`);
});

ipcMain.handle('mouse-click', async (_, xp, yp, right) => {
  xp = pct(xp); yp = pct(yp);
  const b = screen.getPrimaryDisplay().bounds;
  const x = Math.round((xp / 100) * b.width), y = Math.round((yp / 100) * b.height);
  const [dn, up] = right ? [8, 16] : [2, 4];
  return runPS(`${MOUSE_HELPERS}
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x},${y})
Start-Sleep -Milliseconds 150
[CacheMouse]::mouse_event(${dn},0,0,0,0)
Start-Sleep -Milliseconds 80
[CacheMouse]::mouse_event(${up},0,0,0,0)
Write-Output "clicked at ${x},${y}"`);
});

ipcMain.handle('mouse-dblclick', async (_, xp, yp) => {
  xp = pct(xp); yp = pct(yp);
  const b = screen.getPrimaryDisplay().bounds;
  const x = Math.round((xp / 100) * b.width), y = Math.round((yp / 100) * b.height);
  return runPS(`${MOUSE_HELPERS}
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x},${y})
Start-Sleep -Milliseconds 150
[CacheMouse]::mouse_event(2,0,0,0,0); Start-Sleep -Milliseconds 60; [CacheMouse]::mouse_event(4,0,0,0,0)
Start-Sleep -Milliseconds 120
[CacheMouse]::mouse_event(2,0,0,0,0); Start-Sleep -Milliseconds 60; [CacheMouse]::mouse_event(4,0,0,0,0)
Write-Output "double-clicked at ${x},${y}"`);
});

ipcMain.handle('scroll-at', async (_, xp, yp, amount) => {
  xp = pct(xp); yp = pct(yp);
  amount = Math.max(-10, Math.min(10, Number(amount) || 0));
  const b = screen.getPrimaryDisplay().bounds;
  const x = Math.round((xp / 100) * b.width), y = Math.round((yp / 100) * b.height);
  return runPS(`${MOUSE_HELPERS}
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x},${y})
Start-Sleep -Milliseconds 100
[CacheMouse]::mouse_event(0x800,0,0,${Math.round(amount * 120)},0)
Write-Output "scrolled at ${x},${y}"`);
});

// ── Keyboard control ──────────────────────────────────────────────────────────
ipcMain.handle('keyboard-type', async (_, text) => {
  if (typeof text !== 'string') throw new Error('invalid text');
  if (text.length > 2000) throw new Error('text too long');
  // Escape SendKeys special chars
  const esc = text.replace(/[+^%~(){}\[\]]/g, c => `{${c}}`);
  return runPS(`Add-Type -AssemblyName System.Windows.Forms
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait(${JSON.stringify(esc)})
Write-Output "typed"`);
});

ipcMain.handle('keyboard-key', async (_, key) => {
  if (typeof key !== 'string' || key.length > 50) throw new Error('invalid key');
  const low = key.toLowerCase().trim();

  // Win+X combos
  const winM = low.match(/^win\+(.+)$/);
  if (winM) {
    const vk = { 'd':0x44,'r':0x52,'e':0x45,'i':0x49,'s':0x53,'l':0x4C,'tab':0x09 }[winM[1]]
      || winM[1].toUpperCase().charCodeAt(0);
    return runPS(`${MOUSE_HELPERS}
[CacheMouse]::keybd_event(0x5B,0,0,0)
Start-Sleep -Milliseconds 50
[CacheMouse]::keybd_event(${vk},0,0,0)
Start-Sleep -Milliseconds 50
[CacheMouse]::keybd_event(${vk},0,2,0)
[CacheMouse]::keybd_event(0x5B,0,2,0)
Write-Output "win+${winM[1]}"`);
  }

  const map = {
    'enter':'{ENTER}','return':'{ENTER}','tab':'{TAB}','escape':'{ESC}','esc':'{ESC}',
    'backspace':'{BACKSPACE}','delete':'{DELETE}','del':'{DELETE}','space':' ',
    'up':'{UP}','down':'{DOWN}','left':'{LEFT}','right':'{RIGHT}',
    'home':'{HOME}','end':'{END}','pageup':'{PGUP}','pagedown':'{PGDN}',
    'f1':'{F1}','f2':'{F2}','f3':'{F3}','f4':'{F4}','f5':'{F5}','f6':'{F6}',
    'f7':'{F7}','f8':'{F8}','f9':'{F9}','f10':'{F10}','f11':'{F11}','f12':'{F12}',
    'ctrl+c':'^c','ctrl+v':'^v','ctrl+a':'^a','ctrl+z':'^z','ctrl+y':'^y',
    'ctrl+s':'^s','ctrl+w':'^w','ctrl+n':'^n','ctrl+t':'^t','ctrl+f':'^f',
    'ctrl+r':'^r','ctrl+x':'^x','ctrl+l':'^l','ctrl+d':'^d',
    'alt+f4':'%{F4}','alt+tab':'%{TAB}','alt+f':'%f',
  };
  const sendKey = map[low] || `{${key.toUpperCase()}}`;
  return runPS(`Add-Type -AssemblyName System.Windows.Forms
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait(${JSON.stringify(sendKey)})
Write-Output "pressed ${key}"`);
});

// ── Window management ─────────────────────────────────────────────────────────
ipcMain.handle('focus-window', async (_, title) => {
  if (typeof title !== 'string' || !title.trim() || title.length > 120) throw new Error('invalid title');
  const titleExpr = psString(title);
  return runPS(`$title = ${titleExpr}
$p = Get-Process | Where-Object { $_.MainWindowTitle -like "*$title*" } | Select-Object -First 1
if ($p) {
  ${MOUSE_HELPERS}
  Add-Type @"
  using System; using System.Runtime.InteropServices;
  public class CacheWin { [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h,int n); }
"@ -ErrorAction SilentlyContinue
  [CacheWin]::ShowWindow($p.MainWindowHandle,9)
  [CacheWin]::SetForegroundWindow($p.MainWindowHandle)
  Write-Output "focused: $($p.MainWindowTitle)"
} else { Write-Output "not found: $title" }`);
});

ipcMain.handle('get-windows', async () =>
  runPS(`Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | ForEach-Object {"$($_.ProcessName): $($_.MainWindowTitle)"} | Select-Object -First 20`)
);

// ── File operations ───────────────────────────────────────────────────────────
const HOME = os.homedir();
const KNOWN = {
  desktop:   path.join(HOME, 'Desktop'),
  downloads: path.join(HOME, 'Downloads'),
  documents: path.join(HOME, 'Documents'),
  pictures:  path.join(HOME, 'Pictures'),
  music:     path.join(HOME, 'Music'),
  videos:    path.join(HOME, 'Videos'),
};
function resolvePath(p) {
  if (typeof p !== 'string' || !p.trim()) throw new Error('invalid path');
  const raw = p.trim();
  const known = KNOWN[raw.toLowerCase()];
  const full = path.resolve(known || (path.isAbsolute(raw) ? raw : path.join(KNOWN.desktop, raw)));
  const allowedRoots = Object.values(KNOWN).map(v => path.resolve(v).toLowerCase());
  const lower = full.toLowerCase();
  const allowed = allowedRoots.some(root => lower === root || lower.startsWith(root + path.sep.toLowerCase()));
  if (!allowed) throw new Error('path outside allowed user folders');
  return full;
}

ipcMain.handle('create-file', async (_, filePath, content) => {
  const full = resolvePath(filePath);
  if (typeof content !== 'string') throw new Error('content must be text');
  if (Buffer.byteLength(content, 'utf8') > 5 * 1024 * 1024) throw new Error('file too large');
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
});

ipcMain.handle('save-image', async (_, filePath, dataUrl) => {
  const full = resolvePath(filePath);
  if (path.extname(full).toLowerCase() !== '.png') throw new Error('pixel art must be saved as .png');
  if (typeof dataUrl !== 'string') throw new Error('image data must be text');
  const m = dataUrl.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new Error('only png data urls are supported');
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > 10 * 1024 * 1024) throw new Error('image too large');
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, buf);
  return full;
});

ipcMain.handle('read-file', async (_, filePath) => {
  const full = resolvePath(filePath);
  const st = fs.statSync(full);
  if (!st.isFile()) throw new Error('not a file');
  if (st.size > 2 * 1024 * 1024) throw new Error('file too large to read');
  return fs.readFileSync(full, 'utf8');
});

ipcMain.handle('list-dir', async (_, dirPath) => {
  try {
    const full = resolvePath(dirPath);
    return fs.readdirSync(full, { withFileTypes: true })
      .map(e => (e.isDirectory() ? `[DIR] ` : '') + e.name)
      .join('\n').substring(0, 3000);
  } catch (e) { return `error: ${e.message}`; }
});

ipcMain.handle('organize-folder', async (_, folderPath) => {
  const full = resolvePath(folderPath);
  const cats = {
    'Images':      ['.jpg','.jpeg','.png','.gif','.bmp','.svg','.webp','.ico','.tiff'],
    'Videos':      ['.mp4','.avi','.mkv','.mov','.wmv','.flv','.m4v','.webm'],
    'Documents':   ['.pdf','.doc','.docx','.txt','.odt','.rtf','.xlsx','.xls','.pptx','.ppt','.csv'],
    'Code':        ['.js','.ts','.py','.html','.css','.json','.cpp','.c','.h','.java','.rs','.go','.rb','.php','.sh','.ps1'],
    'Archives':    ['.zip','.rar','.7z','.tar','.gz','.bz2'],
    'Audio':       ['.mp3','.wav','.flac','.aac','.ogg','.m4a'],
    'Executables': ['.exe','.msi','.bat','.cmd'],
  };
  try {
    const files = fs.readdirSync(full, { withFileTypes: true });
    const moved = [];
    for (const f of files) {
      if (f.isDirectory()) continue;
      const ext = path.extname(f.name).toLowerCase();
      const cat = Object.entries(cats).find(([, exts]) => exts.includes(ext));
      if (cat) {
        const dest = path.join(full, cat[0]);
        fs.mkdirSync(dest, { recursive: true });
        const target = path.join(dest, f.name);
        if (!fs.existsSync(target)) { fs.renameSync(path.join(full, f.name), target); moved.push(`${f.name} → ${cat[0]}/`); }
      }
    }
    return moved.length ? `moved ${moved.length} files:\n${moved.slice(0,15).join('\n')}` : 'nothing to organize';
  } catch (e) { return `error: ${e.message}`; }
});

// ── Screen OCR (Windows.Media.Ocr via WinRT) ──────────────────────────────────
ipcMain.handle('ocr-screen', async () => {
  const tmpImg = path.join(os.tmpdir(), `cache_ocr_${Date.now()}.png`);
  try {
    const src = await getNearestScreenSource({ width: 1920, height: 1080 });
    if (!src) return 'no screen source';
    fs.writeFileSync(tmpImg, src.thumbnail.toPNG());

    const imgPathPs = tmpImg.replace(/\\/g, '\\\\');
    const script = `Add-Type -AssemblyName System.Runtime.WindowsRuntime
$methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskGeneric = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -like 'IAsyncOperation*' })[0]
function Await($task, $type) {
  $m = $asTaskGeneric.MakeGenericMethod($type)
  $t = $m.Invoke($null, @($task))
  $t.Wait(-1) | Out-Null
  $t.Result
}
[void][Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
[void][Windows.Graphics.Imaging.SoftwareBitmap,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine,Windows.Media.Ocr,ContentType=WindowsRuntime]
$file    = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync("${imgPathPs}")) ([Windows.Storage.StorageFile])
$stream  = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$raw     = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$bmp     = [Windows.Graphics.Imaging.SoftwareBitmap]::Convert($raw,[Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8,[Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied)
$engine  = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) { Write-Output "ocr engine unavailable"; exit }
$result  = Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
if ($result.Text) { Write-Output $result.Text } else { Write-Output "no text found" }`;

    const text = await runPS(script);
    try { fs.unlinkSync(tmpImg); } catch {}
    return (text || 'no text detected').substring(0, 4000);
  } catch (e) {
    try { fs.unlinkSync(tmpImg); } catch {}
    return `ocr error: ${e.message}`;
  }
});

ipcMain.handle('open-target', async (_, target) => {
  if (typeof target !== 'string' || !target.trim()) throw new Error('invalid target');
  target = target.trim();
  if (target.includes('\\') || target.includes('/') || /\.\w{2,4}$/.test(target)) {
    return shell.openPath(resolvePath(target));
  }
  const apps = {
    notepad: 'notepad.exe',
    calculator: 'calc.exe',
    calc: 'calc.exe',
    paint: 'mspaint.exe',
    mspaint: 'mspaint.exe',
    explorer: 'explorer.exe',
  };
  const appName = apps[target.toLowerCase()];
  if (!appName) throw new Error(`app not allowed: ${target}`);
  return new Promise(resolve => {
    const child = execFile(appName, [], { windowsHide: false }, error => resolve(error ? error.message : `opened ${target}`));
    child.unref?.();
  });
});

ipcMain.handle('run-cmd', async (_, cmd) => {
  if (typeof cmd !== 'string' || !cmd.trim()) throw new Error('invalid command');
  if (cmd.length > 2000) throw new Error('command too long');
  const dangerous = /\b(remove-item|rm|rmdir|del|erase|format|shutdown|restart-computer|stop-computer|reg\s+delete|reg\s+add|bcdedit|cipher|diskpart|taskkill|takeown|icacls|set-acl|new-item|set-content|add-content|out-file|move-item|copy-item|rename-item|start-process|invoke-expression|iex|invoke-webrequest|iwr|curl|wget|bitsadmin|certutil|schtasks|sc\s+|net\s+user|netsh)\b|[;&|`]/i;
  if (dangerous.test(cmd)) throw new Error('command blocked by safety policy');
  audit('run-cmd', { cmd });
  return new Promise(r => execFile(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', cmd],
    { shell: false, timeout: 10000, cwd: HOME, windowsHide: true, maxBuffer: 1024 * 1024 },
    (_, o, e) => r((o + e).substring(0, 2000))
  ));
});

// ── Background web search ─────────────────────────────────────────────────────
ipcMain.handle('web-search', async (_, query) => {
  if (typeof query !== 'string' || !query.trim()) return 'no query';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 200))}`;
  return new Promise(resolve => {
    const req = https.get(url, { headers: { 'User-Agent': 'CacheAI/1.0' }, timeout: 10000 }, res => {
      let html = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        html += chunk;
        if (html.length > 200000) req.destroy();
      });
      res.on('end', () => {
        const clean = s => s
          .replace(/<[^>]+>/g, ' ')
          .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ').trim();
        const results = [];
        const re = /<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let m;
        while ((m = re.exec(html)) && results.length < 6) results.push(`${clean(m[1])}: ${clean(m[2])}`);
        resolve((results.join('\n\n') || clean(html).slice(0, 1500) || 'no results').slice(0, 2000));
      });
    });
    req.on('timeout', () => req.destroy(new Error('search timeout')));
    req.on('error', e => resolve(`search failed: ${e.message}`));
  });
});

// ── Ollama (Node http) ────────────────────────────────────────────────────────
function getOllamaStatus(timeout = 3000) {
  return new Promise(resolve => {
    const req = http.request(
      { hostname: '127.0.0.1', port: 11434, path: '/api/tags', method: 'GET', timeout },
      res => {
        let body = '';
        res.on('data', chunk => { body += chunk.toString(); });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const models = Array.isArray(parsed.models) ? parsed.models.map(m => m.name) : [];
            resolve({ ok: true, models });
          } catch (e) {
            resolve({ ok: false, error: e.message, models: [] });
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('ollama timeout')));
    req.on('error', e => resolve({ ok: false, error: e.message, models: [] }));
    req.end();
  });
}

function normalizeModelName(name) {
  return String(name || '').trim().toLowerCase().replace(/:latest$/, '');
}

function hasModel(models, model) {
  const wanted = normalizeModelName(model);
  return Array.isArray(models) && models.some(name => normalizeModelName(name) === wanted);
}

function findOllamaExe() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama.exe'),
    path.join(process.env.PROGRAMFILES || '', 'Ollama', 'ollama.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Ollama', 'ollama.exe'),
  ].filter(Boolean);
  return candidates.find(file => {
    try { return fs.existsSync(file); } catch { return false; }
  }) || 'ollama';
}

function downloadFile(url, destination, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    const request = https.get(url, { headers: { 'User-Agent': 'CacheAI/1.0' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        try { fs.unlinkSync(destination); } catch {}
        downloadFile(response.headers.location, destination, onProgress).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destination); } catch {}
        reject(new Error(`download failed: HTTP ${response.statusCode}`));
        return;
      }
      const total = Number(response.headers['content-length'] || 0);
      let received = 0;
      response.on('data', chunk => {
        received += chunk.length;
        if (total && onProgress) onProgress(Math.round((received / total) * 100));
      });
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    request.on('error', error => {
      file.close();
      try { fs.unlinkSync(destination); } catch {}
      reject(error);
    });
  });
}

function runProcess(command, args, options = {}, onLine) {
  return new Promise((resolve, reject) => {
    const { timeout, ...spawnOptions } = options;
    const child = spawn(command, args, { windowsHide: true, ...spawnOptions });
    let output = '';
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      fn(value);
    };
    const timer = timeout ? setTimeout(() => {
      try { child.kill(); } catch {}
      finish(reject, new Error(`${command} timed out`));
    }, timeout) : null;
    const collect = data => {
      const text = data.toString();
      output += text;
      if (onLine) text.split(/\r?\n/).filter(Boolean).forEach(onLine);
    };
    if (child.stdout) child.stdout.on('data', collect);
    if (child.stderr) child.stderr.on('data', collect);
    child.on('error', error => finish(reject, error));
    child.on('close', code => code === 0 ? finish(resolve, output) : finish(reject, new Error(output.trim() || `${command} exited ${code}`)));
  });
}

async function waitForOllama(ms = 45000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const status = await getOllamaStatus(2500);
    if (status.ok) return status;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  return getOllamaStatus(2500);
}

function startOllamaServer(ollamaExe) {
  try {
    const child = spawn(ollamaExe, ['serve'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
  } catch (e) {
    log('warn', 'ollama serve start failed', { error: e.message });
  }
}

async function installOllamaIfNeeded(sendProgress) {
  let status = await getOllamaStatus();
  if (status.ok) return findOllamaExe();

  let ollamaExe = findOllamaExe();
  if (ollamaExe !== 'ollama') {
    sendProgress('starting Ollama');
    startOllamaServer(ollamaExe);
    status = await waitForOllama();
    if (status.ok) return ollamaExe;
  }

  sendProgress('downloading Ollama');
  const installer = path.join(app.getPath('userData'), 'OllamaSetup.exe');
  await downloadFile(OLLAMA_DOWNLOAD_URL, installer, percent => sendProgress(`downloading Ollama ${percent}%`));

  sendProgress('installing Ollama');
  try {
    await runProcess(installer, ['/S'], { timeout: 10 * 60 * 1000 });
  } catch (e) {
    sendProgress('opening Ollama installer');
    await shell.openPath(installer);
    throw new Error('Ollama installer opened. Finish the installer, then restart Cache.');
  }

  ollamaExe = findOllamaExe();
  sendProgress('starting Ollama');
  startOllamaServer(ollamaExe);
  status = await waitForOllama();
  if (!status.ok) throw new Error(status.error || 'Ollama did not start');
  return ollamaExe;
}

ipcMain.handle('ollama-bootstrap', async (event, requestedModels) => {
  const models = (Array.isArray(requestedModels) && requestedModels.length ? requestedModels : REQUIRED_OLLAMA_MODELS)
    .map(model => String(model || '').trim())
    .filter(model => /^[a-zA-Z0-9._:-]{1,80}$/.test(model));
  const sendProgress = message => {
    try { event.sender.send('ollama-bootstrap-progress', String(message || 'working')); } catch {}
  };

  try {
    sendProgress('checking Ollama');
    const ollamaExe = await installOllamaIfNeeded(sendProgress);
    let status = await waitForOllama();
    if (!status.ok) throw new Error(status.error || 'Ollama is offline');

    for (const model of models) {
      if (hasModel(status.models, model)) continue;
      sendProgress(`pulling ${model}`);
      await runProcess(ollamaExe, ['pull', model], { timeout: 60 * 60 * 1000 }, line => {
        if (/pulling|downloading|verifying|writing|success/i.test(line)) sendProgress(`${model}: ${line.slice(0, 120)}`);
      });
      status = await getOllamaStatus(5000);
    }

    status = await getOllamaStatus(5000);
    sendProgress('models ready');
    return { ok: true, models: status.models || [] };
  } catch (e) {
    log('error', 'ollama bootstrap failed', { error: e.message });
    sendProgress(`setup failed: ${e.message}`);
    return { ok: false, error: e.message, models: [] };
  }
});

ipcMain.handle('ollama-status', async () => getOllamaStatus());

ipcMain.handle('ollama-chat', async (event, body) => {
  if (!body || typeof body !== 'object') throw new Error('invalid ollama request');
  if (typeof body.model !== 'string' || !/^[a-zA-Z0-9._:-]{1,80}$/.test(body.model)) throw new Error('invalid model name');
  if (body.prompt && String(body.prompt).length > 12000) throw new Error('prompt too long');
  if (Array.isArray(body.messages)) {
    if (body.messages.length > 60) throw new Error('too many messages');
    for (const msg of body.messages) {
      if (!msg || !['system', 'user', 'assistant'].includes(msg.role) || String(msg.content || '').length > 12000) {
        throw new Error('invalid message payload');
      }
    }
  }
  if (body.captureScreen) {
    delete body.captureScreen;
    try {
      const src = await getNearestScreenSource({ width: 1280, height: 720 });
      if (src) body.images = [src.thumbnail.toJPEG(85).toString('base64')];
    } catch {}
  }

  const apiPath = Array.isArray(body.messages) ? '/api/chat' : '/api/generate';

  return new Promise(resolve => {
    let totalBytes = 0;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try { event.sender.send('ollama-done'); } catch {}
      resolve();
    };
    const req = http.request(
      { hostname: '127.0.0.1', port: 11434, path: apiPath, method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 120000 },
      res => {
        let buf = '';
        res.on('data', chunk => {
          totalBytes += chunk.length;
          if (totalBytes > 2 * 1024 * 1024) {
            event.sender.send('ollama-error', 'ollama response too large');
            req.destroy();
            finish();
            return;
          }
          buf += chunk.toString();
          const lines = buf.split('\n'); buf = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const j = JSON.parse(line);
              if (j.error) event.sender.send('ollama-error', j.error);
              const tok = j.response || (j.message && j.message.content) || '';
              if (tok) event.sender.send('ollama-token', tok);
            } catch {}
          }
        });
        res.on('end', () => {
          if (buf.trim()) {
            try {
              const j = JSON.parse(buf);
              if (j.error) event.sender.send('ollama-error', j.error);
              const tok = j.response || (j.message && j.message.content) || '';
              if (tok) event.sender.send('ollama-token', tok);
            } catch {}
          }
          finish();
        });
        res.on('error', e => { event.sender.send('ollama-error', e.message); finish(); });
      }
    );
    req.on('timeout', () => {
      event.sender.send('ollama-error', 'ollama request timed out');
      req.destroy();
      finish();
    });
    req.on('error', e => { event.sender.send('ollama-error', e.message); finish(); });
    req.write(JSON.stringify(body));
    req.end();
  });
});

// ── Persistent memory & settings ─────────────────────────────────────────────
const MEMORY_FILE   = path.join(app.getPath('userData'), 'cache_memory.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), 'cache_settings.json');

function writeJsonAtomic(file, data, maxBytes) {
  const json = JSON.stringify(data, null, 2);
  if (Buffer.byteLength(json, 'utf8') > maxBytes) throw new Error(`${path.basename(file)} too large`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, json, 'utf8');
  fs.renameSync(tmp, file);
}

ipcMain.handle('read-memory',   () => { try { return JSON.parse(fs.readFileSync(MEMORY_FILE,   'utf8')); } catch { return {}; } });
ipcMain.handle('save-memory',   (_, d) => { try {
  writeJsonAtomic(MEMORY_FILE, d, 200000);
  return { ok: true };
} catch (e) {
  log('error', 'memory save failed', { error: e.message });
  return { ok: false, error: e.message };
} });
ipcMain.handle('read-settings', () => { try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch { return {}; } });
ipcMain.handle('save-settings', (_, d) => { try {
  writeJsonAtomic(SETTINGS_FILE, d, 50000);
  return { ok: true };
} catch (e) {
  log('error', 'settings save failed', { error: e.message });
  return { ok: false, error: e.message };
} });

// ── Clipboard watcher ─────────────────────────────────────────────────────────
const { clipboard } = require('electron');
let _lastClip = '', _clipTimer = null;

ipcMain.on('clipboard-watch-start', event => {
  if (_clipTimer) return;
  _lastClip = clipboard.readText();
  _clipTimer = setInterval(() => {
    try {
      const cur = clipboard.readText();
      if (cur && cur !== _lastClip && cur.length > 2 && cur.length < 8000) {
        _lastClip = cur;
        event.sender.send('clipboard-change', cur);
      }
    } catch {}
  }, 1200);
});
ipcMain.on('clipboard-watch-stop', () => { clearInterval(_clipTimer); _clipTimer = null; });

let _downloadWatcher = null;
ipcMain.on('downloads-watch-start', event => {
  if (_downloadWatcher) return;
  const dir = app.getPath('downloads');
  try {
    _downloadWatcher = fs.watch(dir, { persistent: false }, (eventType, filename) => {
      if (!filename || eventType !== 'rename') return;
      const full = path.join(dir, filename.toString());
      setTimeout(() => {
        try {
          if (fs.existsSync(full)) event.sender.send('download-change', filename.toString());
        } catch {}
      }, 500);
    });
  } catch {}
});
ipcMain.on('downloads-watch-stop', () => {
  try { if (_downloadWatcher) _downloadWatcher.close(); } catch {}
  _downloadWatcher = null;
});

ipcMain.on('quit', () => {
  globalShortcut.unregisterAll();
  app.setLoginItemSettings({ openAtLogin: false });
  app.exit(0);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  clearInterval(_clipTimer);
  try { if (_downloadWatcher) _downloadWatcher.close(); } catch {}
});

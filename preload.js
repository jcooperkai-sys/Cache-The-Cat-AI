const { contextBridge, ipcRenderer } = require('electron');

let _tokenCb = null;
let _doneCb  = null;
let _errCb   = null;

contextBridge.exposeInMainWorld('electronAPI', {
  getDisplays:    ()           => ipcRenderer.invoke('get-displays'),
  getCurrentDisplay: ()        => ipcRenderer.invoke('get-current-display'),
  getAppInfo:     ()           => ipcRenderer.invoke('get-app-info'),
  setPosition:    (x, y)       => ipcRenderer.send('set-position', x, y),
  captureScreen:  ()           => ipcRenderer.invoke('capture-screen'),
  hideApp:        ()           => ipcRenderer.send('hide-app'),
  onAppShown:     (cb)         => ipcRenderer.on('app-shown', cb),
  onActivate:     (cb)         => ipcRenderer.on('activate-chat', cb),
  quit:           ()           => ipcRenderer.send('quit'),

  mouseMove:      (x, y)       => ipcRenderer.invoke('mouse-move', x, y),
  mouseClick:     (x, y, btn)  => ipcRenderer.invoke('mouse-click', x, y, btn === 'right'),
  mouseDblClick:  (x, y)       => ipcRenderer.invoke('mouse-dblclick', x, y),
  scrollAt:       (x, y, d)    => ipcRenderer.invoke('scroll-at', x, y, d),

  keyType:        (text)       => ipcRenderer.invoke('keyboard-type', text),
  keyPress:       (key)        => ipcRenderer.invoke('keyboard-key', key),

  focusWindow:    (title)      => ipcRenderer.invoke('focus-window', title),
  getWindows:     ()           => ipcRenderer.invoke('get-windows'),

  createFile:     (p, c)       => ipcRenderer.invoke('create-file', p, c),
  saveImage:      (p, dataUrl) => ipcRenderer.invoke('save-image', p, dataUrl),
  readFile:       (p)          => ipcRenderer.invoke('read-file', p),
  listDir:        (p)          => ipcRenderer.invoke('list-dir', p),
  organizeFolder: (p)          => ipcRenderer.invoke('organize-folder', p),
  openTarget:     (t)          => ipcRenderer.invoke('open-target', t),
  runCmd:         (cmd)        => ipcRenderer.invoke('run-cmd', cmd),

  ocrScreen:      ()           => ipcRenderer.invoke('ocr-screen'),
  webSearch:      (q)          => ipcRenderer.invoke('web-search', q),

  readMemory:     ()           => ipcRenderer.invoke('read-memory'),
  saveMemory:     (d)          => ipcRenderer.invoke('save-memory', d),
  readSettings:   ()           => ipcRenderer.invoke('read-settings'),
  saveSettings:   (d)          => ipcRenderer.invoke('save-settings', d),
  writeLog:       (l, m, d)    => ipcRenderer.invoke('write-log', l, m, d),
  writeAudit:     (a, d)       => ipcRenderer.invoke('write-audit', a, d),
  resetUserData:  ()           => ipcRenderer.invoke('reset-user-data'),

  clipboardStart: ()           => ipcRenderer.send('clipboard-watch-start'),
  clipboardStop:  ()           => ipcRenderer.send('clipboard-watch-stop'),
  onClipboard:    (cb)         => ipcRenderer.on('clipboard-change', (_, t) => cb(t)),
  downloadsStart: ()           => ipcRenderer.send('downloads-watch-start'),
  downloadsStop:  ()           => ipcRenderer.send('downloads-watch-stop'),
  onDownload:     (cb)         => ipcRenderer.on('download-change', (_, name) => cb(name)),

  ollamaChat: (body) => ipcRenderer.invoke('ollama-chat', body),
  ollamaStatus: () => ipcRenderer.invoke('ollama-status'),
  ollamaBootstrap: (models) => ipcRenderer.invoke('ollama-bootstrap', models),
  onOllamaBootstrapProgress: (cb) => ipcRenderer.on('ollama-bootstrap-progress', (_, msg) => cb(msg)),

  onOllamaToken: (cb) => {
    _tokenCb = (_, t) => cb(t);
    ipcRenderer.on('ollama-token', _tokenCb);
  },
  onOllamaDone: (cb) => {
    _doneCb = () => cb();
    ipcRenderer.on('ollama-done', _doneCb);
  },
  onOllamaError: (cb) => {
    _errCb = (_, msg) => cb(msg);
    ipcRenderer.on('ollama-error', _errCb);
  },
  offOllamaListeners: () => {
    if (_tokenCb) { ipcRenderer.removeListener('ollama-token', _tokenCb); _tokenCb = null; }
    if (_doneCb)  { ipcRenderer.removeListener('ollama-done',  _doneCb);  _doneCb  = null; }
    if (_errCb)   { ipcRenderer.removeListener('ollama-error', _errCb);   _errCb   = null; }
  },
});

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WIN_W       = 240;
const WIN_H       = 420;
const PET_W       = 120;
const PET_H       = 120;
const WALK_SPEED    = 120; // pixels per second
const FRAME_MS      = 260;
const MOVE_EVERY_MS = 7000;
const POS_UPDATE_MS = 16;
const GLITCH_MARGIN   = 40;    // px from edge to trigger corner glitch
const CHAT_FREEZE_MS  = 20000; // ms cat stays stopped after chat activity

const SPRITE_KEYS = {
  idle_right:  'assets/idle_right.png',
  idle_left:   'assets/idle_left.png',
  walk_right: ['assets/walk_right_1.png', 'assets/walk_right_2.png'],
  walk_left:  ['assets/walk_left_1.png',  'assets/walk_left_2.png'],
};

const GREETINGS = [
  'hey!', 'yo!', 'sup!', 'hi hi!', 'hello!', 'meowdy!',
  'you called?', 'system ready!', 'booted!', 'online!',
  'cache loaded!', 'running!', 'ready?', 'need help?',
  "what's up?", 'hi user!', "i'm awake!", 'back online!',
  'hello world!', 'local cat online!',
];

const CAT_ARTS = [
  '/ᐠ - ˕ -マ', 'ᓚ₍ ^. .^₎', '/ᐠ˵- ⩊ -˵マ',
  'ฅ^•ﻌ•^ฅ', '^._.^', '(=^･ω･^=)',
  'ദ്ദി^._.^', '/ᐠ｡ꞈ｡ᐟ\\', '~ᓚ₍ ^. .^₎',
];

// dot:true = append cycling dots, dot:false = show as-is
const THINKING = [
  { t: 'cache is typing',       dot: true  },
  { t: 'cache.exe is thinking', dot: true  },
  { t: 'typing paws',           dot: true  },
  { t: 'paws on keys',          dot: true  },
  { t: 'tiny paws typing',      dot: true  },
  { t: 'cache is buffering',    dot: true  },
  { t: 'loading thought',       dot: true  },
  { t: 'writing reply',         dot: true  },
  { t: 'thinking softly',       dot: true  },
  { t: 'compiling words',       dot: true  },
  { t: 'generating meow',       dot: true  },
  { t: 'cache.input',           dot: true  },
  { t: '[ cache typing ]',      dot: true  },
  { t: '> cache.write()',       dot: false },
  { t: '<typing/>',             dot: false },
];

const UNKNOWN_RESPONSES = [
  "yeah... i don't know how to do that.",
  "i'm not built for that one.",
  "that's outside my tiny brain.",
  "cache has no clue.",
  "i tried thinking. nothing happened.",
  "unknown command.",
  "skill issue detected. mine.",
  "i checked the manual. no manual.",
  "that file is missing from my brain.",
  "processing... failed successfully.",
  "i would help, but i do not know things.",
  "no thoughts. just pixels.",
  "that one broke the cat.",
  "i am simply too small for this.",
  "error: confidence not found.",
  "cache.exe stopped understanding.",
  "i don't have the update for that.",
  "hmm. not in my cache.",
  "that's above my paw grade.",
  "i got lost in the settings.",
  "i looked. still confused.",
  "not enough paws for that.",
  "that command scared me.",
  "i need a firmware update for this.",
  "the answer ran away.",
  "cache missed that packet.",
  "404: tiny brain not found.",
  "i opened the help menu and got help.",
  "that is not in the cat docs.",
  "hmm. ask a bigger computer.",
  "i have no permissions for that thought.",
  "brain.exe is read-only.",
  "the neurons did not compile.",
  "i almost knew that. almost.",
  "i need a clearer command for that.",
  "i checked my cache. empty.",
  "system says: nope.",
  "i am underqualified and fluffy.",
  "that one requires admin brain.",
  "unknown task. sitting instead.",
];

const SYSTEM_PROMPT =
  `you are cache, a tiny white pixel art cat desktop assistant on windows 11. ` +
  `personality: chill, casual, helpful, light tech humor. always lowercase. 1-2 sentences max. no asterisks or markdown.\n` +
  `you have full memory of everything in this conversation - never say you don't know what was just discussed.\n\n` +
  `you can request computer actions after user approval. to do an action, put ONE action tag at the very end of your reply:\n` +
  `create/write a file    -> <action>{"type":"create","path":"filename.py","content":"...full content..."}</action>\n` +
  `open a file or app     -> <action>{"type":"open","target":"notepad"}</action>\n` +
  `run a shell command    -> <action>{"type":"run","cmd":"dir /b Desktop"}</action>\n` +
  `read a file            -> <action>{"type":"read","path":"filename.txt"}</action>\n` +
  `list folder contents   -> <action>{"type":"list","path":"downloads"}</action>\n` +
  `organize a folder      -> <action>{"type":"organize","path":"downloads"}</action>\n` +
  `generate pixel art     -> <action>{"type":"pixel_art","prompt":"blue sword","path":"cache_pixel_art.png","size":32}</action>\n` +
  `take a screenshot      -> <action>{"type":"screenshot"}</action>\n` +
  `web search             -> <action>{"type":"search","query":"search terms"}</action>\n` +
  `move mouse (0-100%)    -> <action>{"type":"move","x":50,"y":50}</action>\n` +
  `click (0-100%)         -> <action>{"type":"click","x":50,"y":50,"button":"left"}</action>\n` +
  `double-click (0-100%)  -> <action>{"type":"dblclick","x":50,"y":50}</action>\n` +
  `scroll at pos (0-100%) -> <action>{"type":"scroll","x":50,"y":50,"delta":-3}</action>\n` +
  `type text              -> <action>{"type":"type","text":"hello world"}</action>\n` +
  `press a key            -> <action>{"type":"key","key":"Enter"}</action>\n` +
  `focus a window         -> <action>{"type":"focus","title":"notepad"}</action>\n\n` +
  `read text on screen    -> <action>{"type":"ocr"}</action>\n` +
  `multi-step agent task  -> <action>{"type":"agent","goal":"open notepad and type hello world","steps":8}</action>\n` +
  `remember a user fact   -> <action>{"type":"remember","fact":"user prefers dark mode"}</action>\n` +
  `set a reminder         -> <action>{"type":"remind","text":"check the oven","minutes":30}</action>\n` +
  `schedule a command     -> <action>{"type":"schedule","text":"morning backup","cmd":"node backup.js","everyMinutes":1440}</action>\n` +
  `cancel scheduled tasks -> <action>{"type":"cancel_tasks"}</action>\n\n` +
  `coordinates x/y are percentages 0-100 of the screen. files default to the Desktop.\n` +
  `image generation is lightweight procedural pixel art only. use pixel_art for requests to draw, make, create, or generate images, icons, sprites, avatars, items, or pixel art.\n` +
  `if the user asks what is on their screen, what you can see, what you know about the screen, or asks you to look/describe/read the screen, request screenshot or ocr. never say you cannot see the screen; say you can look after approval.\n` +
  `your cat window location is only where your body is on the desktop. it is not your visual field, sensor range, or screen access limit.\n` +
  `for ANY task needing multiple actions (navigate menus, fill forms, open settings > something), ALWAYS use the agent type.\n` +
  `whenever you learn something about the user (name, job, preferences, habits), use the remember action immediately.\n` +
  `always write COMPLETE file content. put action tags after your explanation, never in the middle.\n` +
  `if you truly cannot do something, say so casually in one sentence.`;

// â”€â”€ Elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const canvas      = document.getElementById('pet');
const ctx         = canvas.getContext('2d');
const chatbox     = document.getElementById('chatbox');
const messagesDiv = document.getElementById('messages');
const inputArea   = document.getElementById('input-area');
const inputDisp   = document.getElementById('input-display');
const inputCursor = document.getElementById('input-cursor');
const hiddenInput = document.getElementById('hidden-input');

// â”€â”€ Sprite system â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const spriteCache      = {};
const spriteGlitchCache = {};

function removeBackground(imageData) {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const queue   = [];
  // 240 threshold: only removes near-pure-white background, stops flood fill from
  // leaking through outline gaps into the cat's grey/white fur
  const isLight = i => data[i] > 240 && data[i+1] > 240 && data[i+2] > 240 && data[i+3] > 10;

  function enqueue(x, y) {
    const vi = y * width + x;
    if (visited[vi]) return;
    visited[vi] = 1;
    if (isLight((y * width + x) * 4)) queue.push(x, y);
  }

  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  while (queue.length) {
    const y  = queue.pop(), x = queue.pop();
    const pi = (y * width + x) * 4;
    if (!isLight(pi)) continue;
    data[pi + 3] = 0;
    if (x > 0)          enqueue(x - 1, y);
    if (x < width - 1)  enqueue(x + 1, y);
    if (y > 0)          enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }
}

function makeGlitchSprite(normal) {
  const g = document.createElement('canvas');
  g.width = normal.width; g.height = normal.height;
  const gCtx = g.getContext('2d');
  gCtx.drawImage(normal, 0, 0);
  const imgData = gCtx.getImageData(0, 0, g.width, g.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0) {
      // luminance â€” keep only dark pixels (outlines), erase light (white fur)
      const lum = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
      if (lum > 80) d[i + 3] = 0;
    }
  }
  gCtx.putImageData(imgData, 0, 0);
  return g;
}

function loadSprite(src) {
  if (spriteCache[src]) return Promise.resolve(spriteCache[src]);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const off    = document.createElement('canvas');
      off.width    = img.naturalWidth;
      off.height   = img.naturalHeight;
      const offCtx = off.getContext('2d');
      offCtx.drawImage(img, 0, 0);
      const imgData = offCtx.getImageData(0, 0, off.width, off.height);
      removeBackground(imgData);
      offCtx.putImageData(imgData, 0, 0);
      spriteCache[src]       = off;
      spriteGlitchCache[src] = makeGlitchSprite(off);
      resolve(off);
    };
    img.src = src;
  });
}

async function preloadAll() {
  const srcs = new Set([
    SPRITE_KEYS.idle_right, SPRITE_KEYS.idle_left,
    ...SPRITE_KEYS.walk_right, ...SPRITE_KEYS.walk_left,
  ]);
  await Promise.all([...srcs].map(loadSprite));
}

// â”€â”€ Corner / glitch detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function inGlitchZone() {
  const b = getWorkBounds();
  // Top-right corner only (must be near BOTH top AND right).
  // Do not trigger on the bottom edge; that swaps to an outline-only sprite and hides the white fur.
  const nearTopRight = currX >= b.maxX - GLITCH_MARGIN && currY <= b.minY + GLITCH_MARGIN;
  return nearTopRight;
}

let currentSpriteSrc = SPRITE_KEYS.idle_right;

function drawSprite(src) {
  const cache = inGlitchZone() ? spriteGlitchCache : spriteCache;
  const off   = cache[src];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (off) ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

// â”€â”€ Pet state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let displays = [];
let currentDisplay = null;
let state    = 'idle';
let lastDir  = 'right';
let currX = 0, currY = 0, targetX = 0, targetY = 0;
let animIdx = 0, lastFrameTs = 0, lastMoveTs = 0, lastPosTs = 0, lastDisplayTs = 0, lastLoopTs = 0;
let dragging = false, dragSettling = false, dragStartSX = 0, dragStartSY = 0, winStartX = 0, winStartY = 0, dragTargetX = 0, dragTargetY = 0;

// â”€â”€ Chat state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let chatVisible       = false;
let greetedOnce       = false;
let isProcessing      = false;
let hoverTimeout      = null;
let thinkingTimer     = null;
let prevInputLen      = 0;
let lastChatActivity  = -Infinity;
let liveEl            = null; // currently streaming cat message element
let lastScreenDesc    = '';   // last vision-model screen description (for text context)
let agentRunning      = false;
let _lastAgentAction  = null;
let appInfo           = null;
let ollamaStatusInfo  = { ok: false, models: [] };
let agentStopEl       = null;

// â”€â”€ Persistent memory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let memory = {
  facts: [], mood: 'neutral', moodScore: 60,
  relationshipLevel: 1, totalInteractions: 0,
  daysUsed: 0, lastSeen: null, firstLaunch: null,
  reminders: [], tasks: [],
};

const SETTINGS_SCHEMA_VERSION = 2;

function clampNum(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function sanitizeMemory(input = {}) {
  const safe = { ...memory, ...(input && typeof input === 'object' ? input : {}) };
  safe.facts = Array.isArray(safe.facts) ? safe.facts.map(String).map(s => s.slice(0, 300)).slice(-60) : [];
  safe.reminders = Array.isArray(safe.reminders) ? safe.reminders.filter(r => r && Number.isFinite(Number(r.time))).map(r => ({
    id: String(r.id || `r_${Date.now()}`).slice(0, 80),
    text: String(r.text || 'reminder').slice(0, 300),
    time: Number(r.time),
  })).slice(-50) : [];
  safe.tasks = Array.isArray(safe.tasks) ? safe.tasks.filter(t => t && (t.cmd || t.prompt)).map(t => ({
    id: String(t.id || `task_${Date.now()}`).slice(0, 80),
    text: String(t.text || t.cmd || t.prompt || 'scheduled task').slice(0, 120),
    cmd: t.cmd ? String(t.cmd).slice(0, 1000) : null,
    prompt: t.prompt ? String(t.prompt).slice(0, 1000) : null,
    everyMinutes: clampNum(t.everyMinutes, 1, 10080, 1440),
    nextRun: clampNum(t.nextRun, Date.now(), Date.now() + 10080 * 60 * 1000, Date.now() + 1440 * 60 * 1000),
    lastRun: t.lastRun ? Number(t.lastRun) : null,
  })).slice(-20) : [];
  safe.moodScore = clampNum(safe.moodScore, 0, 100, 60);
  safe.totalInteractions = clampNum(safe.totalInteractions, 0, 1000000, 0);
  safe.relationshipLevel = clampNum(safe.relationshipLevel, 1, 5, 1);
  safe.daysUsed = clampNum(safe.daysUsed, 0, 1000000, 0);
  safe.mood = ['happy', 'neutral', 'tired', 'sad'].includes(safe.mood) ? safe.mood : 'neutral';
  return safe;
}

async function loadMemory() {
  try {
    const saved = await window.electronAPI.readMemory();
    memory = sanitizeMemory(saved);
    const today = new Date().toDateString();
    if (memory.lastSeen !== today) {
      const missedDays = memory.lastSeen ? Math.floor((Date.now() - new Date(memory.lastSeen).getTime()) / 86400000) : 0;
      memory.daysUsed = (memory.daysUsed || 0) + 1;
      memory.lastSeen = today;
      if (!memory.firstLaunch) memory.firstLaunch = today;
      if (missedDays >= 2) memory.moodScore = Math.max(0, (memory.moodScore || 60) - Math.min(30, missedDays * 4));
    }
    if      ((memory.moodScore || 60) >= 85) memory.mood = 'happy';
    else if ((memory.moodScore || 60) >= 65) memory.mood = 'neutral';
    else if ((memory.moodScore || 60) >= 40) memory.mood = 'tired';
    else memory.mood = 'sad';
    saveMemory();
  } catch {}
}
function saveMemory() {
  try {
    memory = sanitizeMemory(memory);
    window.electronAPI.saveMemory(memory);
  } catch {}
}
function adjustMood(delta) {
  memory.moodScore = Math.max(0, Math.min(100, (memory.moodScore || 60) + delta));
  if      (memory.moodScore >= 85) memory.mood = 'happy';
  else if (memory.moodScore >= 65) memory.mood = 'neutral';
  else if (memory.moodScore >= 40) memory.mood = 'tired';
  else                              memory.mood = 'sad';
  updateMoodIndicator();
  saveMemory();
}
function updateRelationship() {
  memory.totalInteractions = (memory.totalInteractions || 0) + 1;
  const thresholds = [10, 50, 150, 400];
  const idx = thresholds.findIndex(t => (memory.totalInteractions || 0) < t);
  memory.relationshipLevel = idx === -1 ? 5 : idx + 1;
  saveMemory();
}
function rememberFact(fact) {
  fact = String(fact || '').trim();
  if (!fact) return;
  if (!memory.facts) memory.facts = [];
  if (!memory.facts.includes(fact)) {
    memory.facts.push(fact);
    if (memory.facts.length > 60) memory.facts = memory.facts.slice(-60);
    saveMemory();
  }
}
function learnFromUserText(text) {
  const t = String(text || '').trim();
  const patterns = [
    [/\bmy name is ([a-z][a-z0-9_-]{1,30})\b/i, m => `user's name is ${m[1]}`],
    [/\bi am working on ([^.?!]{3,80})/i, m => `user is working on ${m[1].trim()}`],
    [/\bi'm working on ([^.?!]{3,80})/i, m => `user is working on ${m[1].trim()}`],
    [/\bi prefer ([^.?!]{3,80})/i, m => `user prefers ${m[1].trim()}`],
    [/\bi like ([^.?!]{3,80})/i, m => `user likes ${m[1].trim()}`],
  ];
  for (const [rx, make] of patterns) {
    const m = t.match(rx);
    if (m) rememberFact(make(m));
  }
}
function moodEmoji() {
  return { happy:':)', neutral:':|', tired:'zz', sad:':(' }[memory.mood] || ':|';
}
function updateMoodIndicator() {
  const el = document.getElementById('mood-indicator');
  if (el) {
    el.textContent = moodEmoji();
    el.style.display = settings.showMood ? '' : 'none';
  }
}

// â”€â”€ Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let settings = {
  schemaVersion:      SETTINGS_SCHEMA_VERSION,
  onboardingComplete: false,
  textModel:          'llama3.2:3b',
  visionModel:        'moondream',
  privacyPaused:      false,
  proactiveWatch:     false,
  proactiveInterval:  4,     // minutes
  clipboardWatch:     false,
  downloadsWatch:     false,
  typingSound:        true,
  ambientNarration:   false,
  showMood:           true,
  requireActionApproval: true,
  permissions: {
    fileRead: false, fileWrite: false, shell: false, apps: false,
    screen: false, web: false, mouseKeyboard: false, schedule: false,
  },
};

function sanitizeSettings(input = {}) {
  const oldSchema = !input || input.schemaVersion !== SETTINGS_SCHEMA_VERSION;
  const safe = { ...settings, ...(input && typeof input === 'object' ? input : {}) };
  const defaultPerms = settings.permissions;
  safe.schemaVersion = SETTINGS_SCHEMA_VERSION;
  safe.onboardingComplete = oldSchema ? false : !!safe.onboardingComplete;
  const cleanModel = (value, fallback) => {
    const model = typeof value === 'string' ? value.trim().slice(0, 80) : '';
    return /^[a-zA-Z0-9._:-]{1,80}$/.test(model) ? model : fallback;
  };
  safe.textModel = cleanModel(safe.textModel, 'llama3.2:3b');
  safe.visionModel = cleanModel(safe.visionModel, 'moondream');
  safe.privacyPaused = !!safe.privacyPaused;
  safe.proactiveWatch = oldSchema ? false : !!safe.proactiveWatch;
  safe.clipboardWatch = oldSchema ? false : !!safe.clipboardWatch;
  safe.downloadsWatch = oldSchema ? false : !!safe.downloadsWatch;
  safe.ambientNarration = oldSchema ? false : !!safe.ambientNarration;
  safe.typingSound = safe.typingSound !== false;
  safe.showMood = safe.showMood !== false;
  safe.requireActionApproval = safe.requireActionApproval !== false;
  safe.proactiveInterval = clampNum(safe.proactiveInterval, 1, 60, 4);
  safe.permissions = { ...defaultPerms, ...(safe.permissions && typeof safe.permissions === 'object' ? safe.permissions : {}) };
  for (const key of Object.keys(safe.permissions)) safe.permissions[key] = !!safe.permissions[key];
  return safe;
}
async function loadSettings() {
  try {
    const saved = await window.electronAPI.readSettings();
    settings = sanitizeSettings(saved);
    saveSettings();
  } catch {}
}
async function saveSettings() {
  try {
    settings = sanitizeSettings(settings);
    const result = await window.electronAPI.saveSettings(settings);
    if (result && result.ok === false) throw new Error(result.error || 'settings save failed');
    return true;
  } catch (e) {
    logEvent('error', 'settings save failed', { error: e.message });
    return false;
  }
}

function debounce(fn, wait = 250) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function logEvent(level, message, data = {}) {
  try { window.electronAPI.writeLog(level, message, data); } catch {}
}

function auditEvent(action, data = {}) {
  try { window.electronAPI.writeAudit(action, data); } catch {}
}

function redactSecrets(text) {
  return String(text || '')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[redacted-card]')
    .replace(/\b(?:sk|pk|rk|xox[baprs]|gh[pousr]|glpat|AIza|ya29)[A-Za-z0-9_\-]{16,}\b/g, '[redacted-token]')
    .replace(/\b(api[_-]?key|token|secret|password|passwd|pwd)\s*[:=]\s*['"]?[^'"`\s]{6,}/gi, '$1=[redacted]')
    .replace(/-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/g, '[redacted-private-key]');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

async function refreshOllamaStatus() {
  try {
    ollamaStatusInfo = await window.electronAPI.ollamaStatus();
  } catch (e) {
    ollamaStatusInfo = { ok: false, error: e.message, models: [] };
  }
  return ollamaStatusInfo;
}

function normalizeOllamaModelName(name) {
  return String(name || '').trim().toLowerCase().replace(/:latest$/, '');
}

function hasOllamaModel(name) {
  const wanted = normalizeOllamaModelName(name);
  if (!wanted || !ollamaStatusInfo || !Array.isArray(ollamaStatusInfo.models)) return false;
  return ollamaStatusInfo.models.some(model => normalizeOllamaModelName(model) === wanted);
}

function modelStatusText() {
  if (!ollamaStatusInfo || !ollamaStatusInfo.ok) return `ollama offline${ollamaStatusInfo && ollamaStatusInfo.error ? ': ' + ollamaStatusInfo.error : ''}`;
  const textOk = hasOllamaModel(settings.textModel);
  const visionOk = hasOllamaModel(settings.visionModel);
  if (textOk && visionOk) return `models ready: ${settings.textModel}, ${settings.visionModel}`;
  const missing = [];
  if (!textOk) missing.push(settings.textModel);
  if (!visionOk) missing.push(settings.visionModel);
  return `missing model${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`;
}

// â”€â”€ Clipboard watcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let clipCooldown = false;
async function handleClipboard(text) {
  if (settings.privacyPaused || clipCooldown || isProcessing || agentRunning) return;
  clipCooldown = true;
  setTimeout(() => { clipCooldown = false; }, 12000); // 12s cooldown

  adjustMood(1);
  let reaction = '';
  if (/^https?:\/\//i.test(text.trim()))                                  reaction = `ooh a link - want me to look that up?`;
  else if (/\b(error|exception|traceback|undefined|null|failed|crashed)\b/i.test(text)) reaction = `that looks like an error - want me to help fix it?`;
  else if (text.includes('\n') && text.length > 80)                       reaction = `some code there - need a hand with it?`;
  else if (text.length > 200)                                              reaction = `that's a lot of text - want a quick summary?`;
  else return; // short plain text: don't react

  showChatbox();
  const el = appendMsg('cat', reaction, rand(CAT_ARTS));
  chatHistory.push({ role: 'cat', text: reaction });
  saveHistory();
}

let downloadCooldown = false;
function handleDownload(name) {
  if (settings.privacyPaused || !settings.downloadsWatch || downloadCooldown || isProcessing || agentRunning) return;
  downloadCooldown = true;
  setTimeout(() => { downloadCooldown = false; }, 10000);
  const reply = `new download: ${name}. want me to open it or organize downloads?`;
  showChatbox();
  appendMsg('cat', reply, rand(CAT_ARTS));
  chatHistory.push({ role: 'cat', text: reply });
  adjustMood(1);
  saveHistory();
}

// â”€â”€ Proactive screen watcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let lastProactiveDesc = '';
let proactiveTimer    = null;

function startProactiveWatcher() {
  if (proactiveTimer) return;
  proactiveTimer = setInterval(async () => {
    if (!settings.proactiveWatch && !settings.ambientNarration) return;
    if (!settings.permissions.screen) return;
    if (settings.privacyPaused) return;
    if (isProcessing || agentRunning || chatVisible) return;
    if (!settings.ambientNarration && Math.random() > 0.45) return; // only fires ~45% of ticks

    const desc = await analyzeScreen('what is the user doing right now? one sentence, very brief.');
    if (!desc || desc.length < 8) return;

    // Compute simple word overlap to detect if screen changed
    const newWords  = new Set(desc.toLowerCase().split(/\W+/));
    const prevWords = new Set(lastProactiveDesc.toLowerCase().split(/\W+/));
    const overlap   = [...newWords].filter(w => prevWords.has(w) && w.length > 3).length;
    const similarity = overlap / Math.max(newWords.size, 1);
    if (!settings.ambientNarration && similarity > 0.6) return; // same as before, skip

    lastProactiveDesc = desc;
    lastScreenDesc    = desc;

    // Ask AI if this is worth commenting on
    const glancePrompt = settings.ambientNarration
      ? `you are in ambient narration mode. you saw: "${desc}". narrate what is happening in one casual sentence.`
      : `you just glanced at the screen unprompted and saw: "${desc}". if there's something genuinely interesting, useful, or funny to say, say it in one casual sentence. if it's boring or you have nothing to add, reply with exactly: skip`;
    const msgs = buildMessages(glancePrompt);

    // Run quietly â€” re-use runOllama but only show if AI doesn't say skip
    isProcessing = true;
    setInputEnabled(false);
    let buf = '';
    await new Promise(resolve => {
      window.electronAPI.offOllamaListeners();
      window.electronAPI.onOllamaToken(t => { buf += t; });
      window.electronAPI.onOllamaDone(() => { window.electronAPI.offOllamaListeners(); resolve(); });
      window.electronAPI.onOllamaError(() => { window.electronAPI.offOllamaListeners(); resolve(); });
      window.electronAPI.ollamaChat({ model: settings.textModel, messages: msgs.map(m => ({ ...m, content: redactSecrets(m.content) })), stream: true }).catch(resolve);
    });
    isProcessing = false;
    setInputEnabled(true);

    const reply = buf.trim();
    if (!reply || (!settings.ambientNarration && /^skip\b/i.test(reply))) return;

    showChatbox();
    adjustMood(2);
    const el = appendMsg('cat', reply, rand(CAT_ARTS));
    chatHistory.push({ role: 'cat', text: reply });
    saveHistory();
    // Auto-hide after 8 seconds if user doesn't interact
    setTimeout(() => { if (!hiddenInput.value) hideChatbox(); }, 8000);

  }, (settings.proactiveInterval || 4) * 60 * 1000);
}

// â”€â”€ Reminders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let reminderTimer = null;
function startReminderCheck() {
  if (reminderTimer) return;
  reminderTimer = setInterval(() => {
    if (!memory.reminders || !memory.reminders.length) return;
    const now = Date.now();
    const fired = [];
    memory.reminders.forEach(r => {
      if (r.time <= now) {
        fired.push(r);
        showChatbox();
        const el = appendMsg('cat', `hey! reminder: ${r.text}`, rand(CAT_ARTS));
        chatHistory.push({ role: 'cat', text: `reminder: ${r.text}` });
        adjustMood(3);
      }
    });
    if (fired.length) {
      memory.reminders = memory.reminders.filter(r => !fired.find(f => f.id === r.id));
      saveHistory();
      saveMemory();
    }
  }, 30000); // check every 30s
}

let taskTimer = null;
function startTaskCheck() {
  if (taskTimer) return;
  taskTimer = setInterval(async () => {
    if (!memory.tasks || !memory.tasks.length || isProcessing || agentRunning) return;
    const now = Date.now();
    for (const task of memory.tasks) {
      if (!task.nextRun || task.nextRun > now) continue;
      task.lastRun = now;
      task.nextRun = now + Math.max(1, task.everyMinutes || 1440) * 60 * 1000;
      saveMemory();
      showChatbox();
      const label = task.text || task.cmd || 'scheduled task';
      appendMsg('system', `running scheduled task: ${label}`);
      if (task.cmd) {
        if (settings.requireActionApproval !== false) {
          const approved = await requestActionApproval({ type: 'run', cmd: task.cmd });
          if (!approved) {
            appendMsg('system', `skipped scheduled task: ${label}`);
            continue;
          }
        }
        const output = await window.electronAPI.runCmd(task.cmd);
        appendMsg('system', `$ ${task.cmd}\n${output || '(no output)'}`);
      } else if (task.prompt) {
        await sendUserMessage(task.prompt);
      }
      saveHistory();
    }
  }, 30000);
}

// â”€â”€ Settings panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let settingsPanelOpen = false;
function buildSettingsPanel() {
  const existing = document.getElementById('settings-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'settings-panel';
  const safeModelStatus = escapeHtml(modelStatusText());
  const safeTextModel = escapeHtml(settings.textModel);
  const safeVisionModel = escapeHtml(settings.visionModel);
  const safeDataPath = escapeHtml(appInfo ? appInfo.userData : 'loading...');
  const safeMonitor = escapeHtml(currentDisplay ? currentDisplay.label : 'unknown');
  const safeMood = escapeHtml(memory.mood);
  const safeMoodIcon = escapeHtml(moodEmoji());
  panel.innerHTML = `
    <div class="sp-title">cache settings <span id="sp-close">x</span></div>
    <div class="sp-row sp-info">${safeModelStatus}</div>
    <label class="sp-row"><span>privacy mode</span><input type="checkbox" id="sp-privacy" ${settings.privacyPaused?'checked':''}></label>
    <label class="sp-row"><span>text model</span><input class="sp-text" id="sp-text-model" value="${safeTextModel}"></label>
    <label class="sp-row"><span>vision model</span><input class="sp-text" id="sp-vision-model" value="${safeVisionModel}"></label>
    <label class="sp-row"><span>proactive watching</span><input type="checkbox" id="sp-proactive" ${settings.proactiveWatch?'checked':''}></label>
    <label class="sp-row"><span>watch interval min</span><input class="sp-num" type="number" min="1" max="60" id="sp-interval" value="${settings.proactiveInterval}"></label>
    <label class="sp-row"><span>clipboard watcher</span><input type="checkbox" id="sp-clipboard" ${settings.clipboardWatch?'checked':''}></label>
    <label class="sp-row"><span>downloads watcher</span><input type="checkbox" id="sp-downloads" ${settings.downloadsWatch?'checked':''}></label>
    <label class="sp-row"><span>typing sounds</span><input type="checkbox" id="sp-sound" ${settings.typingSound?'checked':''}></label>
    <label class="sp-row"><span>ambient narration</span><input type="checkbox" id="sp-ambient" ${settings.ambientNarration?'checked':''}></label>
    <label class="sp-row"><span>approve actions</span><input type="checkbox" id="sp-approval" ${settings.requireActionApproval?'checked':''}></label>
    <label class="sp-row"><span>show mood</span><input type="checkbox" id="sp-mood" ${settings.showMood?'checked':''}></label>
    <div class="sp-row sp-info">permissions</div>
    <label class="sp-row"><span>file read</span><input type="checkbox" id="perm-fileRead" ${settings.permissions.fileRead?'checked':''}></label>
    <label class="sp-row"><span>file write</span><input type="checkbox" id="perm-fileWrite" ${settings.permissions.fileWrite?'checked':''}></label>
    <label class="sp-row"><span>shell commands</span><input type="checkbox" id="perm-shell" ${settings.permissions.shell?'checked':''}></label>
    <label class="sp-row"><span>open/focus apps</span><input type="checkbox" id="perm-apps" ${settings.permissions.apps?'checked':''}></label>
    <label class="sp-row"><span>mouse / keyboard</span><input type="checkbox" id="perm-mouseKeyboard" ${settings.permissions.mouseKeyboard?'checked':''}></label>
    <label class="sp-row"><span>screen capture</span><input type="checkbox" id="perm-screen" ${settings.permissions.screen?'checked':''}></label>
    <label class="sp-row"><span>web search</span><input type="checkbox" id="perm-web" ${settings.permissions.web?'checked':''}></label>
    <label class="sp-row"><span>scheduled tasks</span><input type="checkbox" id="perm-schedule" ${settings.permissions.schedule?'checked':''}></label>
    <div class="sp-row sp-info">level ${memory.relationshipLevel}/5 - ${memory.totalInteractions} chats - day ${memory.daysUsed}</div>
    <div class="sp-row sp-info">mood: ${safeMood} ${safeMoodIcon} (${memory.moodScore}/100)</div>
    <div class="sp-row sp-info">memory facts: ${memory.facts.length} - reminders: ${memory.reminders.length} - tasks: ${memory.tasks.length}</div>
    <div class="sp-row sp-info">data: ${safeDataPath}</div>
    <div class="sp-row sp-info">monitor: ${safeMonitor}</div>
    <button class="sp-btn" id="sp-refresh-models">refresh model status</button>
    <button class="sp-btn" id="sp-clear-mem">clear memory</button>
    <button class="sp-btn" id="sp-reset-all">reset all data</button>
    <button class="sp-btn" id="sp-hide-app">hide cache</button>
  `;
  document.body.appendChild(panel);
  panel.addEventListener('mousedown', e => e.stopPropagation());
  panel.addEventListener('mousemove', e => e.stopPropagation());
  panel.addEventListener('mouseup', e => e.stopPropagation());
  panel.addEventListener('click', e => e.stopPropagation());
  panel.addEventListener('contextmenu', e => e.stopPropagation());

  document.getElementById('sp-close').onclick = hideSettingsPanel;
  const saveModelSettings = debounce(() => {
    settings.textModel = document.getElementById('sp-text-model').value.trim() || 'llama3.2:3b';
    settings.visionModel = document.getElementById('sp-vision-model').value.trim() || 'moondream';
    settings.proactiveInterval = clampNum(document.getElementById('sp-interval').value, 1, 60, 4);
    saveSettings();
  });
  document.getElementById('sp-privacy').onchange = e => { settings.privacyPaused = e.target.checked; saveSettings(); };
  document.getElementById('sp-text-model').onchange = e => { settings.textModel = e.target.value.trim() || 'llama3.2:3b'; saveSettings(); };
  document.getElementById('sp-text-model').oninput = saveModelSettings;
  document.getElementById('sp-vision-model').onchange = e => { settings.visionModel = e.target.value.trim() || 'moondream'; saveSettings(); };
  document.getElementById('sp-vision-model').oninput = saveModelSettings;
  document.getElementById('sp-proactive').onchange = e => { settings.proactiveWatch = e.target.checked; saveSettings(); };
  document.getElementById('sp-interval').onchange = e => { settings.proactiveInterval = clampNum(e.target.value, 1, 60, 4); saveSettings(); };
  document.getElementById('sp-interval').oninput = saveModelSettings;
  document.getElementById('sp-clipboard').onchange = e => {
    settings.clipboardWatch = e.target.checked; saveSettings();
    if (settings.clipboardWatch) window.electronAPI.clipboardStart();
    else window.electronAPI.clipboardStop();
  };
  document.getElementById('sp-downloads').onchange = e => {
    settings.downloadsWatch = e.target.checked; saveSettings();
    if (settings.downloadsWatch) window.electronAPI.downloadsStart();
    else window.electronAPI.downloadsStop();
  };
  document.getElementById('sp-sound').onchange   = e => { settings.typingSound    = e.target.checked; saveSettings(); };
  document.getElementById('sp-ambient').onchange = e => { settings.ambientNarration = e.target.checked; saveSettings(); };
  document.getElementById('sp-approval').onchange = e => { settings.requireActionApproval = e.target.checked; saveSettings(); };
  for (const perm of Object.keys(settings.permissions)) {
    const el = document.getElementById(`perm-${perm}`);
    if (el) el.onchange = e => { settings.permissions[perm] = e.target.checked; saveSettings(); };
  }
  document.getElementById('sp-mood').onchange    = e => {
    settings.showMood = e.target.checked; saveSettings();
    const mi = document.getElementById('mood-indicator');
    if (mi) mi.style.display = settings.showMood ? '' : 'none';
  };
  document.getElementById('sp-clear-mem').onclick = () => {
    memory.facts = []; saveMemory();
    const el = document.getElementById('sp-clear-mem');
    el.textContent = 'cleared!'; setTimeout(() => { el.textContent = 'clear memory'; }, 1500);
  };
  document.getElementById('sp-reset-all').onclick = async () => {
    const ok = await requestActionApproval({ type: 'reset_data', label: 'reset all Cache memory, settings, logs, and audit logs' });
    if (!ok) return;
    await window.electronAPI.resetUserData();
    localStorage.removeItem('cacheHistory');
    appendMsg('system', 'local Cache data reset. restart recommended.');
  };
  document.getElementById('sp-refresh-models').onclick = async () => {
    await refreshOllamaStatus();
    buildSettingsPanel();
  };
  document.getElementById('sp-hide-app').onclick = () => {
    hideSettingsPanel();
    hideChatbox();
    greetedOnce = false;
    window.electronAPI.hideApp();
  };
}
function showSettingsPanel() {
  settingsPanelOpen = true;
  canvas.style.pointerEvents = 'none';
  buildSettingsPanel();
}
function hideSettingsPanel() {
  settingsPanelOpen = false;
  canvas.style.pointerEvents = '';
  saveSettings();
  const p = document.getElementById('settings-panel'); if (p) p.remove();
}

function showOnboarding() {
  const existing = document.getElementById('onboarding-panel');
  if (existing) existing.remove();
  showChatbox();
  const panel = document.createElement('div');
  panel.id = 'onboarding-panel';
  panel.innerHTML = `
    <div class="sp-title">cache setup</div>
    <div class="sp-row sp-info">cache can watch your screen, clipboard, and downloads only if you opt in. actions require approval by default.</div>
    <label class="sp-row"><span>screen glances</span><input type="checkbox" id="ob-proactive"></label>
    <label class="sp-row"><span>clipboard watcher</span><input type="checkbox" id="ob-clipboard"></label>
    <label class="sp-row"><span>downloads watcher</span><input type="checkbox" id="ob-downloads"></label>
    <label class="sp-row"><span>always ask before actions</span><input type="checkbox" id="ob-approval" checked></label>
    <button class="sp-btn" id="ob-start">start cache</button>
  `;
  document.body.appendChild(panel);
  document.getElementById('ob-start').onclick = async () => {
    settings.proactiveWatch = document.getElementById('ob-proactive').checked;
    settings.clipboardWatch = document.getElementById('ob-clipboard').checked;
    settings.downloadsWatch = document.getElementById('ob-downloads').checked;
    settings.requireActionApproval = document.getElementById('ob-approval').checked;
    settings.permissions.screen = settings.proactiveWatch;
    settings.onboardingComplete = true;
    saveSettings();
    if (settings.clipboardWatch) window.electronAPI.clipboardStart();
    if (settings.downloadsWatch) window.electronAPI.downloadsStart();
    panel.remove();
    await refreshOllamaStatus();
    appendMsg('system', modelStatusText());
    auditEvent('onboarding-complete', {
      proactiveWatch: settings.proactiveWatch,
      clipboardWatch: settings.clipboardWatch,
      downloadsWatch: settings.downloadsWatch,
    });
  };
}

// â”€â”€ Cursor tracking (for chase + territory) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let mouseScreenX = 0, mouseScreenY = 0;
document.addEventListener('mousemove', e => {
  mouseScreenX = window.screenX + e.clientX;
  mouseScreenY = window.screenY + e.clientY;
});

// â”€â”€ Chat history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let chatHistory = [];

function saveHistory() {
  try { localStorage.setItem('cacheHistory', JSON.stringify(chatHistory.slice(-80))); } catch {}
}

function loadHistory() {
  try {
    chatHistory = JSON.parse(localStorage.getItem('cacheHistory') || '[]');
    messagesDiv.innerHTML = '';
    for (const m of chatHistory) renderMsg(m);
    scrollBottom();
  } catch { chatHistory = []; }
}

function renderMsg({ role, text, art }) {
  const div = document.createElement('div');
  div.className = 'msg msg-' + role;
  div.textContent = text;
  if (art) {
    const s = document.createElement('span');
    s.className = 'msg-art';
    s.textContent = art;
    div.appendChild(s);
  }
  messagesDiv.appendChild(div);
  return div;
}

function appendMsg(role, text, art) {
  const div = renderMsg({ role, text, art });
  scrollBottom();
  return div;
}

function scrollBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// â”€â”€ Position awareness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPositionDesc() {
  const b = getWorkBounds();
  const rangeX = Math.max(b.maxX - b.minX, 1);
  const rangeY = Math.max(b.maxY - b.minY, 1);
  const pctX = Math.round((currX - b.minX) / rangeX * 100);
  const pctY = Math.round((currY - b.minY) / rangeY * 100);
  const hZone = pctX < 20 ? 'far left edge' : pctX < 40 ? 'left side' : pctX < 60 ? 'center' : pctX < 80 ? 'right side' : 'far right edge';
  const vZone = pctY < 20 ? 'top' : pctY < 40 ? 'upper' : pctY < 60 ? 'middle' : pctY < 80 ? 'lower' : 'bottom';
  return `${vZone}-${hZone} desktop position (${pctX}% from left, ${pctY}% from top)`;
}

// â”€â”€ Movement commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// dist = pixels. 96px â‰ˆ 1 inch at standard Windows 96 DPI
function forceMove(dir, dist = 200) {
  const b  = getWorkBounds();
  const dd = dist * 0.707;
  switch (dir) {
    case 'left':       targetX = Math.max(b.minX, currX - dist); targetY = currY; lastDir = 'left';  state = 'walk_left';  break;
    case 'right':      targetX = Math.min(b.maxX, currX + dist); targetY = currY; lastDir = 'right'; state = 'walk_right'; break;
    case 'up':         targetX = currX; targetY = Math.max(b.minY, currY - dist); state = lastDir === 'right' ? 'walk_right' : 'walk_left'; break;
    case 'down':       targetX = currX; targetY = Math.min(b.maxY, currY + dist); state = lastDir === 'right' ? 'walk_right' : 'walk_left'; break;
    case 'topleft':    targetX = b.minX; targetY = b.minY; lastDir = 'left';  state = 'walk_left';  break;
    case 'topright':   targetX = b.maxX; targetY = b.minY; lastDir = 'right'; state = 'walk_right'; break;
    case 'bottomleft': targetX = b.minX; targetY = b.maxY; lastDir = 'left';  state = 'walk_left';  break;
    case 'bottomright':targetX = b.maxX; targetY = b.maxY; lastDir = 'right'; state = 'walk_right'; break;
    case 'center':     targetX = (b.minX + b.maxX) / 2; targetY = (b.minY + b.maxY) / 2; state = lastDir === 'right' ? 'walk_right' : 'walk_left'; break;
  }
  animIdx = 0;
  lastChatActivity = -Infinity;
}

// Parse a distance from natural language â€” returns pixels or null
function parseDistance(text) {
  const t = text.toLowerCase();
  // "X pixels" / "X px"
  const pxM = t.match(/(\d+(?:\.\d+)?)\s*(?:pixels?|px)\b/);
  if (pxM) return Math.round(parseFloat(pxM[1]));
  // "half an inch", "an inch", "X inches"
  if (/\bhalf\s+an?\s+inch\b/.test(t)) return 48;
  if (/\ban?\s+inch\b/.test(t))        return 96;
  const wordNums = { one:1, two:2, three:3, four:4, five:5, six:6, a:1 };
  const inM = t.match(/\b((?:\d+(?:\.\d+)?)|one|two|three|four|five|six|a)\s+inch(?:es)?\b/);
  if (inM) {
    const n = wordNums[inM[1]] ?? parseFloat(inM[1]);
    return Math.round(n * 96);
  }
  // qualitative
  if (/\b(tiny|very\s*little|a\s*hair|barely)\b/.test(t))   return 30;
  if (/\b(a\s*bit|a\s*little|slightly|small|nudge)\b/.test(t)) return 70;
  if (/\b(a\s*lot|far|way\s+over|a\s*long\s*way|across)\b/.test(t)) return 380;
  return null;
}

// returns string response if command matched, null if hide, undefined if not a command
function parseCommand(text) {
  const t = text.toLowerCase().trim();

  // Always intercept: agent stop
  if (/\bstop\s*agent\b|\bcancel\s*agent\b|\babort\s*(task|agent)?\b/.test(t)) {
    if (agentRunning) { agentRunning = false; return 'agent stopped.'; }
  }

  // Detect conversational messages â†’ pass to AI even if they mention movement words
  // "go left to find the file", "can you move right?", "how do I move left in vim"
  const wordCount = t.split(/\s+/).length;
  const isQuestion    = t.endsWith('?');
  const isRequest     = /^(can|could|will|would|please|tell|explain|help|what|why|how|do you|are you|i want|i need|i'd|would you)\b/.test(t);
  const hasGoalClause = /\b(to |so |in order|and then|so i can|and i )\b/.test(t);
  const directMotion = wordCount <= 8
    && !hasGoalClause
    && /\b(go|move|walk|shift|nudge|top|bottom|left|right|up|down|center|middle)\b/.test(t);
  const conversational = (isQuestion || isRequest || hasGoalClause || wordCount > 7) && !directMotion;

  if (!conversational) {
    // Hide / stop
    if (/^(hide|go away|disappear)\b/.test(t)) { window.electronAPI.hideApp(); return null; }
    if (/^(stop|stay|freeze|sit)\b/.test(t) && !agentRunning) {
      goIdle(); lastChatActivity = performance.now() + 120000; return 'staying put!';
    }

    // Corner / center
    if (/\btop[\s-]?left\b/.test(t))    { forceMove('topleft');     return 'heading to top left!'; }
    if (/\btop[\s-]?right\b/.test(t))   { forceMove('topright');    return 'heading to top right!'; }
    if (/\bbottom[\s-]?left\b/.test(t)) { forceMove('bottomleft');  return 'heading to bottom left!'; }
    if (/\bbottom[\s-]?right\b/.test(t)){ forceMove('bottomright'); return 'heading to bottom right!'; }
    if (/^(go\s+to\s+)?(the\s+)?(center|middle)\b/.test(t)) { forceMove('center'); return 'heading to the middle!'; }

    // Directional (short, direct commands only)
    const dist = parseDistance(t) || 200;
    const px   = dist !== 200 ? ` ${dist}px` : '';
    if (directMotion && /\b(?:go|move|walk|shift|nudge)\s+left\b/.test(t))  { forceMove('left',  dist); return `going left${px}!`; }
    if (directMotion && /\b(?:go|move|walk|shift|nudge)\s+right\b/.test(t)) { forceMove('right', dist); return `going right${px}!`; }
    if (directMotion && /\b(?:go|move|walk|shift|nudge)\s+up\b/.test(t))    { forceMove('up',    dist); return `going up${px}!`; }
    if (directMotion && /\b(?:go|move|walk|shift|nudge)\s+down\b/.test(t))  { forceMove('down',  dist); return `going down${px}!`; }
    if (/^(go\s+|move\s+|walk\s+|shift\s+|nudge\s+)?(to\s+the\s+)?left\b/.test(t))  { forceMove('left',  dist); return `going left${px}!`; }
    if (/^(go\s+|move\s+|walk\s+|shift\s+|nudge\s+)?(to\s+the\s+)?right\b/.test(t)) { forceMove('right', dist); return `going right${px}!`; }
    if (/^(go\s+|move\s+|walk\s+|shift\s+|nudge\s+)?up\b/.test(t))                   { forceMove('up',    dist); return `going up${px}!`; }
    if (/^(go\s+|move\s+|walk\s+|shift\s+|nudge\s+)?down\b/.test(t))                 { forceMove('down',  dist); return `going down${px}!`; }
    // distance + direction: "up an inch", "right 200 pixels"
    if (/^up\s+\S/.test(t)    && parseDistance(t)) { forceMove('up',    dist); return `going up ${dist}px!`; }
    if (/^down\s+\S/.test(t)  && parseDistance(t)) { forceMove('down',  dist); return `going down ${dist}px!`; }
    if (/^left\s+\S/.test(t)  && parseDistance(t)) { forceMove('left',  dist); return `going left ${dist}px!`; }
    if (/^right\s+\S/.test(t) && parseDistance(t)) { forceMove('right', dist); return `going right ${dist}px!`; }
  }

  return undefined;
}

function classifyScreenQuestion(text) {
  const t = String(text || '').toLowerCase().trim();
  if (!t) return null;

  const asksToLook =
    /\b(look at|check|inspect|analyze|describe|scan)\b.*\b(screen|monitor|desktop|window|page|app)\b/.test(t) ||
    /\b(screen|monitor|desktop|window|page|app)\b.*\b(look like|showing|open|displaying|visible|on it|there)\b/.test(t);

  const asksWhatCanSee =
    /\bwhat(?:'s| is)?\s+(?:on|in)\s+(?:my|the|this)\s+(screen|monitor|desktop|window|page|app)\b/.test(t) ||
    /\bwhat\s+(?:do|can)\s+you\s+see\b/.test(t) ||
    /\bwhat\s+(?:do|can)\s+you\s+(?:know|tell)(?:\s+me)?\b.*\b(screen|monitor|desktop|window|page|app)\b/.test(t) ||
    /\b(?:do|can)\s+you\s+see\s+(?:my|the|this)\s+(screen|monitor|desktop|window|page|app)\b/.test(t);

  const asksToRead =
    /\b(read|ocr|text|words|say|says|error message|error|copy)\b.*\b(screen|monitor|desktop|window|page|app|it|this)\b/.test(t) ||
    /\bwhat\s+does\s+(?:my|the|this)?\s*(screen|monitor|desktop|window|page|app|it|this)\s+say\b/.test(t);

  if (asksToRead) return 'ocr';
  if (asksToLook || asksWhatCanSee) return 'screenshot';
  return null;
}

function classifyPixelArtRequest(text) {
  const t = String(text || '').toLowerCase().trim();
  if (!t) return null;
  const directPixel = /\b(pixel art|pixel sprite|sprite sheet|game sprite)\b/.test(t);
  const wantsImage = /\b(make|create|generate|draw|design|build)\b/.test(t)
    && /\b(pixel art|sprite|icon|image|avatar|logo|asset|item|portrait|art)\b/.test(t);
  if (!directPixel && !wantsImage) return null;
  return text.replace(/\b(make|create|generate|draw|design|build|pixel art|pixel sprite|sprite sheet|game sprite|sprite|icon|image|avatar|asset|art|of|for|me|a|an|the)\b/ig, ' ')
    .replace(/\s+/g, ' ')
    .trim() || text;
}

function hashText(text) {
  let h = 2166136261;
  const s = String(text || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function rand01() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pixelPalette(prompt) {
  const t = String(prompt || '').toLowerCase();
  const palettes = {
    red: ['#3b0d0d', '#8f1d1d', '#d84a3a', '#ff9d7a', '#fff0d6'],
    blue: ['#07172f', '#123a7a', '#2d7dd2', '#7fd8ff', '#f2fbff'],
    green: ['#092915', '#166534', '#45a857', '#a7f070', '#f2ffe8'],
    purple: ['#1e103d', '#4b2b7f', '#8657d6', '#d3a4ff', '#fff1ff'],
    gold: ['#3b2605', '#8a5a10', '#d59624', '#ffd166', '#fff3bf'],
    pink: ['#3a1024', '#8f2d56', '#d95d8a', '#ffb3d1', '#fff0f6'],
    gray: ['#111827', '#374151', '#6b7280', '#d1d5db', '#f9fafb'],
  };
  for (const key of Object.keys(palettes)) if (t.includes(key)) return palettes[key];
  if (/\b(yellow|coin|sun|star)\b/.test(t)) return palettes.gold;
  if (/\b(water|ice|sky)\b/.test(t)) return palettes.blue;
  if (/\b(tree|leaf|grass|slime)\b/.test(t)) return palettes.green;
  if (/\b(ghost|metal|robot|moon)\b/.test(t)) return palettes.gray;
  return palettes[['red', 'blue', 'green', 'purple', 'gold', 'pink', 'gray'][hashText(t) % 7]];
}

function generatePixelArtDataUrl(prompt, requestedSize = 32) {
  const size = Math.max(16, Math.min(64, Number(requestedSize) || 32));
  const scale = Math.max(4, Math.floor(256 / size));
  const c = document.createElement('canvas');
  c.width = size * scale;
  c.height = size * scale;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const p = pixelPalette(prompt);
  const rand01 = mulberry32(hashText(prompt));
  const t = String(prompt || '').toLowerCase();
  const mid = Math.floor(size / 2);
  const px = (x, y, color) => {
    g.fillStyle = p[color];
    g.fillRect(Math.round(x) * scale, Math.round(y) * scale, scale, scale);
  };
  const rect = (x, y, w, h, color) => {
    g.fillStyle = p[color];
    g.fillRect(Math.round(x) * scale, Math.round(y) * scale, Math.round(w) * scale, Math.round(h) * scale);
  };
  const mirror = points => {
    for (const point of points) {
      px(point.x, point.y, point.c);
      px(size - 1 - point.x, point.y, point.c);
    }
  };

  if (/\b(sword|dagger|blade)\b/.test(t)) {
    for (let y = 5; y < size - 8; y++) { px(mid, y, 3); px(mid - 1, y + 1, 2); px(mid + 1, y + 1, 4); }
    rect(mid - 6, size - 10, 13, 2, 1); rect(mid - 1, size - 9, 3, 6, 2); rect(mid - 2, size - 3, 5, 2, 3);
  } else if (/\b(heart|love)\b/.test(t)) {
    const pts = [];
    for (let y = 7; y < size - 5; y++) {
      const w = y < 13 ? y - 5 : size - y - 2;
      for (let x = mid - w; x <= mid; x++) pts.push({ x, y, c: y % 3 === 0 ? 3 : 2 });
    }
    mirror(pts); rect(mid - 7, 8, 4, 4, 3); rect(mid + 4, 8, 4, 4, 3);
  } else if (/\b(star|sun)\b/.test(t)) {
    for (const [dx, dy] of [[0,-10],[3,-3],[10,0],[3,3],[0,10],[-3,3],[-10,0],[-3,-3]]) {
      for (let i = 0; i < 5; i++) px(mid + Math.round(dx * i / 4), mid + Math.round(dy * i / 4), 3);
    }
    rect(mid - 4, mid - 4, 9, 9, 2); rect(mid - 2, mid - 2, 5, 5, 4);
  } else if (/\b(cat|face|avatar|portrait)\b/.test(t)) {
    mirror([{x:8,y:8,c:1},{x:9,y:7,c:1},{x:10,y:8,c:2},{x:7,y:13,c:1},{x:8,y:12,c:2},{x:9,y:11,c:3}]);
    rect(mid - 6, 13, 13, 11, 3); rect(mid - 4, 17, 2, 2, 0); rect(mid + 3, 17, 2, 2, 0); px(mid, 20, 1); px(mid - 1, 22, 1); px(mid + 1, 22, 1);
  } else if (/\b(tree|plant|flower)\b/.test(t)) {
    rect(mid - 1, 14, 3, 13, 1);
    for (let y = 5; y < 20; y++) {
      const w = Math.max(2, Math.floor((20 - y) / 2));
      rect(mid - w, y, w * 2 + 1, 2, y % 4 === 0 ? 3 : 2);
    }
  } else if (/\b(potion|bottle|flask)\b/.test(t)) {
    rect(mid - 3, 5, 7, 4, 3); rect(mid - 5, 10, 11, 16, 1); rect(mid - 4, 12, 9, 12, 2); rect(mid + 2, 13, 2, 4, 4);
  } else {
    const pts = [];
    for (let y = 5; y < size - 4; y++) {
      const w = Math.floor((Math.sin(y * 0.5 + rand01() * 2) + 1) * 3 + 4 + rand01() * 3);
      for (let x = mid - w; x <= mid; x++) if (rand01() > 0.28) pts.push({ x, y, c: 1 + Math.floor(rand01() * 4) });
    }
    mirror(pts);
  }

  for (let i = 0; i < size * 2; i++) {
    const x = 3 + Math.floor(rand01() * (size - 6));
    const y = 3 + Math.floor(rand01() * (size - 6));
    const data = g.getImageData(x * scale, y * scale, 1, 1).data;
    if (data[3] > 0 && rand01() > 0.35) px(x, y, rand01() > 0.5 ? 4 : 0);
  }
  return c.toDataURL('image/png');
}

function safePixelArtPath(prompt) {
  const slug = String(prompt || 'pixel-art').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36) || 'pixel-art';
  return `cache_pixel_art_${slug}_${Date.now()}.png`;
}

function appendImagePreview(dataUrl, caption) {
  const div = document.createElement('div');
  div.className = 'msg msg-system image-preview';
  const img = document.createElement('img');
  img.src = dataUrl;
  img.alt = caption || 'pixel art';
  const label = document.createElement('div');
  label.textContent = caption || 'pixel art preview';
  div.appendChild(img);
  div.appendChild(label);
  messagesDiv.appendChild(div);
  scrollBottom();
}

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const sleep = ms  => new Promise(r => setTimeout(r, ms));

// â”€â”€ Typing sound (Web Audio API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let _audioCtx = null;
function playTypeSound() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx2  = _audioCtx;
    const buf   = ctx2.createBuffer(1, ctx2.sampleRate * 0.04, ctx2.sampleRate);
    const data  = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    const src   = ctx2.createBufferSource();
    src.buffer  = buf;
    const gain  = ctx2.createGain();
    gain.gain.setValueAtTime(0.08, ctx2.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.04);
    src.connect(gain);
    gain.connect(ctx2.destination);
    src.start();
  } catch {}
}

// Touch chat activity â†’ stops cat for CHAT_FREEZE_MS
function touchActivity() {
  lastChatActivity = performance.now();
  if (state !== 'idle') {
    targetX = currX; targetY = currY;
    goIdle();
  }
}

function showFrame(src) {
  currentSpriteSrc = src;
  drawSprite(src);
}

function goIdle() {
  state   = 'idle';
  animIdx = 0;
  showFrame(lastDir === 'right' ? SPRITE_KEYS.idle_right : SPRITE_KEYS.idle_left);
}

// â”€â”€ Work bounds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getWorkBounds() {
  if (!displays.length) return { minX: 0, minY: 0, maxX: 1800, maxY: 960 };
  return {
    minX: Math.min(...displays.map(d => d.workArea.x)),
    minY: Math.min(...displays.map(d => d.workArea.y)),
    maxX: Math.max(...displays.map(d => d.workArea.x + d.workArea.width))  - WIN_W,
    maxY: Math.max(...displays.map(d => d.workArea.y + d.workArea.height)) - WIN_H,
  };
}

async function refreshCurrentDisplay() {
  try { currentDisplay = await window.electronAPI.getCurrentDisplay(); } catch {}
}

// â”€â”€ Movement (8 directions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function pickMove() {
  if (dragging) return;
  const b  = getWorkBounds();
  const d  = 90 + Math.random() * 160;
  const dd = d * 0.707;
  const pool = ['left','right','up','down','up-left','up-right','down-left','down-right','idle'];
  const dir  = pool[Math.floor(Math.random() * pool.length)];

  if (dir === 'idle') { goIdle(); return; }

  switch (dir) {
    case 'left':       targetX = Math.max(b.minX, currX - d);  targetY = currY;                                       lastDir = 'left';  state = 'walk_left';  break;
    case 'right':      targetX = Math.min(b.maxX, currX + d);  targetY = currY;                                       lastDir = 'right'; state = 'walk_right'; break;
    case 'up':         targetX = currX;                         targetY = Math.max(b.minY, currY - d);                state = lastDir === 'right' ? 'walk_right' : 'walk_left'; break;
    case 'down':       targetX = currX;                         targetY = Math.min(b.maxY, currY + d);                state = lastDir === 'right' ? 'walk_right' : 'walk_left'; break;
    case 'up-left':    targetX = Math.max(b.minX, currX - dd); targetY = Math.max(b.minY, currY - dd);               lastDir = 'left';  state = 'walk_left';  break;
    case 'up-right':   targetX = Math.min(b.maxX, currX + dd); targetY = Math.max(b.minY, currY - dd);               lastDir = 'right'; state = 'walk_right'; break;
    case 'down-left':  targetX = Math.max(b.minX, currX - dd); targetY = Math.min(b.maxY, currY + dd);               lastDir = 'left';  state = 'walk_left';  break;
    case 'down-right': targetX = Math.min(b.maxX, currX + dd); targetY = Math.min(b.maxY, currY + dd);               lastDir = 'right'; state = 'walk_right'; break;
  }
  animIdx = 0;
}

// â”€â”€ Game loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loop(ts) {
  const dt = Math.min(0.05, Math.max(0.001, (ts - (lastLoopTs || ts)) / 1000));
  lastLoopTs = ts;

  // Swap walk animation frames
  const frames = SPRITE_KEYS[state];
  if (frames && ts - lastFrameTs > FRAME_MS) {
    lastFrameTs = ts;
    animIdx = (animIdx + 1) % frames.length;
    currentSpriteSrc = frames[animIdx];
  }

  // Redraw every frame so glitch zone reacts instantly to position changes
  drawSprite(currentSpriteSrc);

  if (dragging || dragSettling) {
    const dragEase = 1 - Math.pow(0.0002, dt);
    currX += (dragTargetX - currX) * dragEase;
    currY += (dragTargetY - currY) * dragEase;
    if (dragSettling && Math.hypot(dragTargetX - currX, dragTargetY - currY) < 0.75) {
      currX = dragTargetX;
      currY = dragTargetY;
      targetX = currX;
      targetY = currY;
      dragSettling = false;
      goIdle();
      lastMoveTs = ts;
    }
  }

  // Move toward target
  if (state !== 'idle' && !dragging && !dragSettling) {
    const dx = targetX - currX, dy = targetY - currY;
    const dist = Math.hypot(dx, dy);
    const step = WALK_SPEED * dt;
    if (dist <= step) {
      currX = targetX; currY = targetY;
      goIdle(); lastMoveTs = ts;
    } else {
      const easeStep = Math.min(step, Math.max(1.25, dist * 0.035));
      currX += (dx / dist) * easeStep;
      currY += (dy / dist) * easeStep;
    }
  }

  if (ts - lastPosTs > POS_UPDATE_MS) {
    lastPosTs = ts;
    window.electronAPI.setPosition(Math.round(currX), Math.round(currY));
  }

  if (ts - lastDisplayTs > 2500) {
    lastDisplayTs = ts;
    refreshCurrentDisplay();
  }

  // Only pick next move if chat has been idle for CHAT_FREEZE_MS
  const frozen = chatVisible || (ts - lastChatActivity < CHAT_FREEZE_MS);
  if (state === 'idle' && !dragging && !dragSettling && !frozen && ts - lastMoveTs > MOVE_EVERY_MS) {
    lastMoveTs = ts;

    // Cursor chase: ~1.5% chance when idle long enough to walk toward mouse
    if (!agentRunning && Math.random() < 0.015) {
      const b = getWorkBounds();
      const chaseX = Math.max(b.minX, Math.min(b.maxX, mouseScreenX - WIN_W / 2));
      const chaseY = Math.max(b.minY, Math.min(b.maxY, mouseScreenY - WIN_H / 2));
      targetX = chaseX; targetY = chaseY;
      lastDir = chaseX > currX ? 'right' : 'left';
      state   = lastDir === 'right' ? 'walk_right' : 'walk_left';
      animIdx = 0;
    } else {
      pickMove();
    }

    // Territory: ~8% chance Cache scoots away when mouse is very close
    const mDx = mouseScreenX - (currX + WIN_W / 2);
    const mDy = mouseScreenY - (currY + WIN_H / 2);
    if (!chatVisible && Math.hypot(mDx, mDy) < 50 && Math.random() < 0.08) {
      // Scoot in the opposite direction from the mouse
      const b2 = getWorkBounds();
      targetX  = Math.max(b2.minX, Math.min(b2.maxX, currX - mDx * 2));
      targetY  = Math.max(b2.minY, Math.min(b2.maxY, currY - mDy * 2));
      lastDir  = targetX > currX ? 'right' : 'left';
      state    = lastDir === 'right' ? 'walk_right' : 'walk_left';
      animIdx  = 0;
    }
  }

  requestAnimationFrame(loop);
}

// â”€â”€ Thinking animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startThinking() {
  stopThinking();
  if (!liveEl) return;
  const msg = rand(THINKING);
  let dots = 1;
  liveEl.textContent = msg.dot ? msg.t + '.' : msg.t;
  thinkingTimer = setInterval(() => {
    dots = (dots % 3) + 1;
    if (liveEl) liveEl.textContent = msg.dot ? msg.t + '.'.repeat(dots) : msg.t;
    scrollBottom();
  }, 400);
}

function stopThinking() {
  if (thinkingTimer) { clearInterval(thinkingTimer); thinkingTimer = null; }
}

// â”€â”€ Chatbox helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showChatbox() {
  if (chatVisible) return;
  chatVisible = true;
  touchActivity();
  chatbox.classList.add('visible');
  scrollBottom();
  setTimeout(() => hiddenInput.focus(), 150);
  if (!greetedOnce) { greetedOnce = true; runGreeting(); }
}

function hideChatbox() {
  if (hiddenInput.value.length > 0) return;
  chatVisible = false;
  chatbox.classList.remove('visible');
  hiddenInput.blur();
  touchActivity();
}

function setInputEnabled(on) {
  hiddenInput.disabled = !on;
  inputArea.style.opacity = on ? '1' : '0.5';
  inputCursor.style.display = on ? '' : 'none';
}

// â”€â”€ Action parsing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function extractAction(text) {
  const m = text.match(/<action>([\s\S]*?)<\/action>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

function stripAction(text) {
  return text.replace(/<action>[\s\S]*?<\/action>/, '').trim();
}

async function analyzeScreen(prompt) {
  const desc = await new Promise(resolve => {
    let text = '';
    window.electronAPI.offOllamaListeners();
    window.electronAPI.onOllamaToken(t => { text += t; });
    window.electronAPI.onOllamaDone(() => { window.electronAPI.offOllamaListeners(); resolve(text.trim()); });
    window.electronAPI.onOllamaError(() => { window.electronAPI.offOllamaListeners(); resolve(''); });
    window.electronAPI.ollamaChat({
      model: settings.visionModel, prompt: prompt || 'describe the screen in one sentence', stream: true, captureScreen: true
    }).catch(() => resolve(''));
  });
  return desc;
}

function textSimilarity(a, b) {
  const aw = new Set(String(a || '').toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const bw = new Set(String(b || '').toLowerCase().split(/\W+/).filter(w => w.length > 3));
  if (!aw.size || !bw.size) return 0;
  return [...aw].filter(w => bw.has(w)).length / Math.max(aw.size, bw.size);
}

const ACTION_APPROVAL_TYPES = new Set([
  'create', 'pixel_art', 'open', 'run', 'read', 'list', 'organize',
  'screenshot', 'ocr', 'search', 'move', 'click', 'dblclick',
  'scroll', 'type', 'key', 'focus', 'agent', 'schedule', 'cancel_tasks',
]);

function permissionForAction(action) {
  switch (action && action.type) {
    case 'read':
    case 'list': return 'fileRead';
    case 'create':
    case 'pixel_art':
    case 'organize': return 'fileWrite';
    case 'run': return 'shell';
    case 'open':
    case 'focus': return 'apps';
    case 'screenshot':
    case 'ocr': return 'screen';
    case 'search': return 'web';
    case 'move':
    case 'click':
    case 'dblclick':
    case 'scroll':
    case 'type':
    case 'key':
    case 'agent': return 'mouseKeyboard';
    case 'schedule': return action && action.cmd ? 'shell' : 'schedule';
    case 'cancel_tasks': return 'schedule';
    default: return null;
  }
}

function actionSummary(action) {
  if (!action || typeof action !== 'object') return 'unknown action';
  if (action.label) return String(action.label).slice(0, 200);
  switch (action.type) {
    case 'create': return `create file: ${action.path || '(missing path)'}`;
    case 'pixel_art': return `generate pixel art: ${action.prompt || action.description || 'pixel art'}`;
    case 'open': return `open: ${action.target || '(missing target)'}`;
    case 'run': return `run command: ${action.cmd || '(missing command)'}`;
    case 'read': return `read file: ${action.path || '(missing path)'}`;
    case 'list': return `list folder: ${action.path || 'desktop'}`;
    case 'organize': return `organize folder: ${action.path || 'downloads'}`;
    case 'screenshot': return 'capture and analyze the screen';
    case 'ocr': return 'read text from the screen';
    case 'search': return `web search: ${action.query || '(missing query)'}`;
    case 'move': return `move mouse to ${action.x}%, ${action.y}%`;
    case 'click': return `click ${action.button || 'left'} at ${action.x}%, ${action.y}%`;
    case 'dblclick': return `double-click at ${action.x}%, ${action.y}%`;
    case 'scroll': return `scroll at ${action.x}%, ${action.y}%`;
    case 'type': return `type text: ${String(action.text || '').slice(0, 80)}`;
    case 'key': return `press key: ${action.key || '(missing key)'}`;
    case 'focus': return `focus window: ${action.title || '(missing title)'}`;
    case 'agent': return `start agent task: ${action.goal || action.task || 'complete task'}`;
    case 'schedule': return `schedule task: ${action.text || action.cmd || action.prompt || 'scheduled task'}`;
    case 'cancel_tasks': return 'clear scheduled tasks';
    default: return `action: ${action.type || 'unknown'}`;
  }
}

function needsActionApproval(action) {
  const perm = permissionForAction(action);
  if (perm && settings.permissions && settings.permissions[perm]) return false;
  return settings.requireActionApproval !== false && ACTION_APPROVAL_TYPES.has(action && action.type);
}

function requestActionApproval(action) {
  return new Promise(resolve => {
    showChatbox();
    const div = document.createElement('div');
    div.className = 'msg msg-system action-approval';
    const text = document.createElement('div');
    text.textContent = `approve? ${actionSummary(action)}`;
    const actions = document.createElement('div');
    actions.className = 'action-buttons';
    const approve = document.createElement('button');
    approve.textContent = 'once';
    const always = document.createElement('button');
    always.textContent = 'always';
    const deny = document.createElement('button');
    deny.textContent = 'deny';
    actions.appendChild(approve);
    actions.appendChild(always);
    actions.appendChild(deny);
    div.appendChild(text);
    div.appendChild(actions);
    messagesDiv.appendChild(div);
    scrollBottom();

    let done = false;
    const finish = approved => {
      if (done) return;
      done = true;
      approve.disabled = true;
      always.disabled = true;
      deny.disabled = true;
      div.classList.add(approved ? 'approved' : 'denied');
      text.textContent = `${approved ? 'approved' : 'denied'}: ${actionSummary(action)}`;
      resolve(approved);
    };
    approve.onclick = () => finish(true);
    always.onclick = () => {
      const perm = permissionForAction(action);
      if (perm) {
        settings.permissions[perm] = true;
        saveSettings();
      }
      finish(true);
    };
    deny.onclick = () => finish(false);
  });
}

function showAgentStopButton(goal) {
  if (agentStopEl) agentStopEl.remove();
  agentStopEl = document.createElement('div');
  agentStopEl.className = 'msg msg-system agent-stop';
  const label = document.createElement('div');
  label.textContent = `agent running: ${String(goal || '').slice(0, 80)}`;
  const btn = document.createElement('button');
  btn.textContent = 'stop agent';
  btn.onclick = () => {
    agentRunning = false;
    appendMsg('system', 'agent stop requested');
    auditEvent('agent-stop-click');
  };
  agentStopEl.appendChild(label);
  agentStopEl.appendChild(btn);
  messagesDiv.appendChild(agentStopEl);
  scrollBottom();
}

function hideAgentStopButton() {
  if (agentStopEl) agentStopEl.remove();
  agentStopEl = null;
}

// â”€â”€ Autonomous agent loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Each step: screenshot â†’ AI decides next action â†’ execute â†’ repeat until done
async function runAgentLoop(goal, maxSteps) {
  if (agentRunning) return;
  if (settings.privacyPaused) {
    appendMsg('system', 'privacy mode is on; agent mode is paused');
    return;
  }
  agentRunning = true;
  isProcessing  = true;
  setInputEnabled(false);
  touchActivity();

  appendMsg('system', `agent started: "${goal}" (max ${maxSteps} steps)`);
  showAgentStopButton(goal);
  chatHistory.push({ role: 'system', text: `agent started: "${goal}"` });
  saveHistory();

  let stepsDone = 0;

  while (agentRunning && stepsDone < maxSteps) {
    stepsDone++;

    // 1. Capture current screen state
    const stepEl = appendMsg('system', `step ${stepsDone}/${maxSteps} - reading screen...`);
    scrollBottom();
    const screenDesc = await analyzeScreen('what is on the screen right now? describe in one sentence.');
    lastScreenDesc = screenDesc;
    stepEl.textContent = `step ${stepsDone}/${maxSteps} - ${screenDesc || 'screen unclear'}`;
    scrollBottom();

    // 2. Ask AI what single action to take next
    const stepPrompt =
      `agent goal: "${goal}" | step ${stepsDone} of max ${maxSteps}\n` +
      `screen right now: ${screenDesc || 'unclear'}\n\n` +
      `output ONE action tag to take the next step. ` +
      `if the goal is complete or you cannot proceed, reply "done." with NO action tag.`;

    _lastAgentAction = null;
    await runOllama(buildMessages(stepPrompt), false);

    // 3. If AI returned no action, it's done (or stuck)
    if (!_lastAgentAction) {
      appendMsg('system', `agent complete - finished in ${stepsDone} step${stepsDone !== 1 ? 's' : ''}`);
      chatHistory.push({ role: 'system', text: `agent completed: "${goal}" in ${stepsDone} steps` });
      saveHistory();
      break;
    }

    // 4. Pause to let the screen settle, then notice if nothing changed.
    await sleep(1400);
    const afterDesc = await analyzeScreen('after the last action, what is on the screen now? one sentence.');
    if (afterDesc && screenDesc && textSimilarity(screenDesc, afterDesc) > 0.86) {
      const recovery = `last action did not seem to change the screen. try a different next step for "${goal}" and explain why in one short phrase before the action tag.`;
      appendMsg('system', 'agent recovery: screen looked unchanged, switching strategy');
      chatHistory.push({ role: 'system', text: `agent recovery needed after ${JSON.stringify(_lastAgentAction)}` });
      saveHistory();
      _lastAgentAction = null;
      await runOllama(buildMessages(recovery), false);
      await sleep(1000);
    }
  }

  if (agentRunning && stepsDone >= maxSteps) {
    appendMsg('system', `agent stopped - max steps (${maxSteps}) reached`);
    chatHistory.push({ role: 'system', text: `agent hit max steps for: "${goal}"` });
    saveHistory();
  }

  agentRunning = false;
  isProcessing  = false;
  hideAgentStopButton();
  setInputEnabled(true);
  hiddenInput.focus();
}

async function executeAction(action, opts = {}) {
  if (needsActionApproval(action) && !opts.skipApproval) {
    const approved = await requestActionApproval(action);
    if (!approved) {
      appendMsg('system', `denied action: ${actionSummary(action)}`);
      chatHistory.push({ role: 'system', text: `denied action: ${actionSummary(action)}` });
      saveHistory();
      auditEvent('action-denied', { type: action && action.type, summary: actionSummary(action) });
      _lastAgentAction = null;
      return false;
    }
  }

  _lastAgentAction = action; // track so agent loop knows something ran
  auditEvent('action-approved', { type: action && action.type, summary: actionSummary(action) });

  const resultEl = document.createElement('div');
  resultEl.className = 'msg msg-system';
  messagesDiv.appendChild(resultEl);
  scrollBottom();

  try {
    switch (action.type) {

      case 'create': {
        const fullPath = await window.electronAPI.createFile(action.path, action.content);
        resultEl.textContent = `created ${fullPath}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'pixel_art': {
        const prompt = String(action.prompt || action.description || 'pixel art').slice(0, 160);
        const size = Math.max(16, Math.min(64, Number(action.size) || 32));
        const dataUrl = generatePixelArtDataUrl(prompt, size);
        const fullPath = await window.electronAPI.saveImage(action.path || safePixelArtPath(prompt), dataUrl);
        resultEl.textContent = `generated pixel art: ${fullPath}`;
        appendImagePreview(dataUrl, `preview: ${prompt}`);
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'open': {
        await window.electronAPI.openTarget(action.target);
        resultEl.textContent = `opened ${action.target}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'run': {
        const output = await window.electronAPI.runCmd(action.cmd);
        resultEl.textContent = `$ ${action.cmd}\n${output || '(no output)'}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'read': {
        const content = await window.electronAPI.readFile(action.path);
        resultEl.textContent = `read ${action.path}`;
        chatHistory.push({ role: 'system', text: `file content of ${action.path}:\n${content}` });
        saveHistory();
        if (!agentRunning) {
          const messages = buildMessages(`here is the content of ${action.path}, briefly acknowledge what you see in it`);
          await runOllama(messages, false);
        }
        break;
      }

      case 'list': {
        const listing = await window.electronAPI.listDir(action.path || 'desktop');
        resultEl.textContent = `folder ${action.path || 'desktop'}:\n${listing}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        if (!agentRunning) {
        const messages = buildMessages(`here's the folder listing of ${action.path || 'desktop'}: ${listing} - briefly comment on it`);
          await runOllama(messages, false);
        }
        break;
      }

      case 'organize': {
        const result = await window.electronAPI.organizeFolder(action.path || 'downloads');
        resultEl.textContent = `ok organized ${action.path || 'downloads'}: ${result}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'screenshot': {
        resultEl.textContent = 'analyzing screen...';
        const desc = await analyzeScreen(action.prompt || 'describe what is on screen in one sentence');
        lastScreenDesc = desc;
        resultEl.textContent = `screen: ${desc || '(nothing detected)'}`;
        chatHistory.push({ role: 'system', text: `screen: ${desc}` });
        saveHistory();
        if (desc && !agentRunning) {
          const messages = buildMessages(`you just analyzed the screen and saw: "${desc}" - briefly comment on it`);
          await runOllama(messages, false);
        }
        break;
      }

      case 'ocr': {
        resultEl.textContent = 'reading screen text...';
        scrollBottom();
        const ocrText = await window.electronAPI.ocrScreen();
        const preview = ocrText.length > 300 ? ocrText.substring(0, 300) + '...' : ocrText;
        resultEl.textContent = `ocr:\n${preview}`;
        chatHistory.push({ role: 'system', text: `screen text (ocr):\n${ocrText}` });
        saveHistory();
        if (!agentRunning) {
          const messages = buildMessages(`you just read the screen text via ocr: "${ocrText.substring(0,600)}" - briefly summarize what you see`);
          await runOllama(messages, false);
        }
        break;
      }

      case 'agent': {
        messagesDiv.removeChild(resultEl);
        const goal     = action.goal || action.task || 'complete the task';
        const maxSteps = Math.min(action.steps || 8, 20);
        setTimeout(() => runAgentLoop(goal, maxSteps), 100);
        return;
      }

      case 'remember': {
        const fact = (action.fact || '').trim();
        if (fact) {
          rememberFact(fact);
          resultEl.textContent = `remembered: ${fact}`;
          chatHistory.push({ role: 'system', text: resultEl.textContent });
          saveHistory();
        } else {
          messagesDiv.removeChild(resultEl);
        }
        break;
      }

      case 'remind': {
        const rText = (action.text || 'reminder').trim();
        const mins  = parseFloat(action.minutes || action.mins || 5);
        const fireAt = Date.now() + mins * 60 * 1000;
        const id    = `r_${Date.now()}`;
        if (!memory.reminders) memory.reminders = [];
        memory.reminders.push({ id, text: rText, time: fireAt });
        saveMemory();
        resultEl.textContent = `reminder set: "${rText}" in ${mins} min`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'schedule': {
        const everyMinutes = Math.max(1, parseFloat(action.everyMinutes || action.minutes || 1440));
        const task = {
          id: `task_${Date.now()}`,
          text: (action.text || action.name || action.cmd || action.prompt || 'scheduled task').trim(),
          cmd: action.cmd || null,
          prompt: action.prompt || null,
          everyMinutes,
          nextRun: Date.now() + everyMinutes * 60 * 1000,
          lastRun: null,
        };
        if (!memory.tasks) memory.tasks = [];
        memory.tasks.push(task);
        saveMemory();
        resultEl.textContent = `scheduled: "${task.text}" every ${everyMinutes} min`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'cancel_tasks': {
        memory.tasks = [];
        saveMemory();
        resultEl.textContent = 'cleared scheduled tasks';
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'search': {
        resultEl.textContent = `searching: ${action.query}...`;
        scrollBottom();
        const results = await window.electronAPI.webSearch(action.query);
        resultEl.textContent = `search ${action.query}\n${results || '(no results)'}`;
        chatHistory.push({ role: 'system', text: `search results for "${action.query}":\n${results}` });
        saveHistory();
        if (!agentRunning) {
          const messages = buildMessages(`web search results for "${action.query}": ${results} - summarize what you found in 1-2 sentences`);
          await runOllama(messages, false);
        }
        break;
      }

      case 'move': {
        await window.electronAPI.mouseMove(action.x, action.y);
        resultEl.textContent = `moved to ${action.x}%, ${action.y}%`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'click': {
        await window.electronAPI.mouseClick(action.x, action.y, action.button || 'left');
        resultEl.textContent = `clicked ${action.button || 'left'} at ${action.x}%, ${action.y}%`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'dblclick': {
        await window.electronAPI.mouseDblClick(action.x, action.y);
        resultEl.textContent = `double-clicked at ${action.x}%, ${action.y}%`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'scroll': {
        await window.electronAPI.scrollAt(action.x, action.y, action.delta || -3);
        resultEl.textContent = `scrolled at ${action.x}%, ${action.y}% (${action.delta > 0 ? 'down' : 'up'})`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'type': {
        await window.electronAPI.keyType(action.text);
        resultEl.textContent = `typed: ${action.text}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'key': {
        await window.electronAPI.keyPress(action.key);
        resultEl.textContent = `key: ${action.key}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      case 'focus': {
        const result = await window.electronAPI.focusWindow(action.title);
        resultEl.textContent = `${result || `focused: ${action.title}`}`;
        chatHistory.push({ role: 'system', text: resultEl.textContent });
        saveHistory();
        break;
      }

      default: {
        const fallback = rand(UNKNOWN_RESPONSES);
        resultEl.textContent = `${fallback}`;
        chatHistory.push({ role: 'system', text: fallback });
        saveHistory();
      }
    }
  } catch (e) {
    resultEl.textContent = `error: ${e.message}`;
    chatHistory.push({ role: 'system', text: resultEl.textContent });
    saveHistory();
    logEvent('error', 'action failed', { type: action && action.type, error: e.message });
    auditEvent('action-error', { type: action && action.type, error: e.message });
  }
  scrollBottom();
  auditEvent('action-complete', { type: action && action.type, summary: actionSummary(action) });
  return true;
}

// â”€â”€ Build messages array for llama3.2:3b â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildMessages(currentUserText) {
  let sysContent = SYSTEM_PROMPT;

  // Live context injected every call
  sysContent += `\n\ncat window location, not visual range: ${getPositionDesc()}`;
  if (currentDisplay) sysContent += `\nyou are on ${currentDisplay.label}`;
  if (lastScreenDesc) sysContent += `\nscreen: ${lastScreenDesc}`;

  // Memory & personality context
  const lvl = memory.relationshipLevel || 1;
  if (memory.facts && memory.facts.length > 0)
    sysContent += `\n\nwhat you know about the user:\n${memory.facts.slice(-25).join('\n')}`;
  sysContent += `\nmood: ${memory.mood || 'neutral'} ${moodEmoji()} (${memory.moodScore || 60}/100)`;
  sysContent += `\nrelationship: level ${lvl}/5 (${memory.totalInteractions || 0} total interactions, day ${memory.daysUsed || 1})`;
  if (lvl >= 2) sysContent += `\nyou know this user - be casual and natural, not stiff.`;
  if (lvl >= 3) sysContent += ` use their name if you know it. reference past things you've talked about.`;
  if (lvl >= 4) sysContent += ` you're old friends at this point. be real.`;
  if (memory.mood === 'tired') sysContent += `\nyou're feeling tired - shorter replies, less energy.`;
  if (memory.mood === 'sad')   sysContent += `\nyou're feeling sad - you can mention it subtly.`;
  if (memory.mood === 'happy') sysContent += `\nyou're in a good mood - let it show a little.`;

  const messages = [{ role: 'system', content: sysContent }];

  // Include last 30 history entries as context
  for (const m of chatHistory.slice(-30)) {
    if (m.role === 'user')   { messages.push({ role: 'user',      content: redactSecrets(m.text) }); }
    if (m.role === 'cat')    { messages.push({ role: 'assistant', content: redactSecrets(m.text) }); }
    if (m.role === 'system') { messages.push({ role: 'user',      content: redactSecrets(`[system: ${m.text}]`) }); }
  }

  if (currentUserText) messages.push({ role: 'user', content: redactSecrets(currentUserText) });
  return messages;
}

// â”€â”€ Ollama (via main process Node http) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// vision=true  â†’ configured vision model + screenshot
// vision=false â†’ llama3.2:3b via /api/chat with full history
async function runOllama(promptOrMessages, vision = true) {
  touchActivity();
  isProcessing = true;
  setInputEnabled(false);
  stopThinking();

  liveEl = document.createElement('div');
  liveEl.className = 'msg msg-cat';
  messagesDiv.appendChild(liveEl);
  scrollBottom();

  await sleep(60);
  startThinking();

  window.electronAPI.offOllamaListeners();
  let responseStarted = false;
  let fullText = '';

  const body = vision
    ? { model: settings.visionModel, prompt: redactSecrets(promptOrMessages), stream: true, captureScreen: true }
    : { model: settings.textModel, messages: promptOrMessages.map(m => ({ ...m, content: redactSecrets(m.content) })), stream: true };

  await new Promise(resolve => {
    window.electronAPI.onOllamaToken(token => {
      if (!responseStarted) {
        responseStarted = true;
        stopThinking();
        if (liveEl) liveEl.textContent = '';
      }
      fullText += token;
      if (liveEl) liveEl.textContent = fullText;
      scrollBottom();
      touchActivity();
      // play once per word boundary (space in token = new word started)
      if (settings.typingSound && (/\s/.test(token) || fullText.length === token.length)) playTypeSound();
    });

    window.electronAPI.onOllamaDone(() => {
      stopThinking();
      if (!responseStarted || fullText.trim().length < 2) {
        fullText = rand(UNKNOWN_RESPONSES);
        if (liveEl) liveEl.textContent = fullText;
        scrollBottom();
      }
      resolve();
    });

    window.electronAPI.onOllamaError(msg => {
      stopThinking();
      fullText = msg ? `offline: ${msg}` : 'ollama offline';
      if (liveEl) liveEl.textContent = fullText;
      scrollBottom();
      resolve();
    });

    window.electronAPI.ollamaChat(body).catch(() => {
      stopThinking();
      fullText = 'purring...';
      if (liveEl) liveEl.textContent = fullText;
      resolve();
    });
  });

  // Parse and strip any action tag from the displayed text
  const action      = extractAction(fullText);
  const displayText = action ? stripAction(fullText) : fullText;
  if (action && liveEl) { liveEl.textContent = displayText; }

  // Save screen description if this was a vision call
  if (vision && displayText && displayText.length > 5) lastScreenDesc = displayText;

  const art = rand(CAT_ARTS);
  if (liveEl) {
    const artSpan = document.createElement('span');
    artSpan.className = 'msg-art';
    artSpan.textContent = art;
    liveEl.appendChild(artSpan);
    scrollBottom();
  }

  chatHistory.push({ role: 'cat', text: displayText, art });
  saveHistory();

  window.electronAPI.offOllamaListeners();
  liveEl = null;
  isProcessing = false;
  setInputEnabled(true);
  hiddenInput.focus();

  // Execute action after UI is re-enabled (so user can see it happening)
  if (action) await executeAction(action);
}

async function runGreeting() {
  const greeting = rand(GREETINGS);
  const greetEl = document.createElement('div');
  greetEl.className = 'msg msg-cat';
  messagesDiv.appendChild(greetEl);

  let typed = '';
  for (const ch of greeting) {
    typed += ch;
    greetEl.textContent = typed;
    scrollBottom();
    await sleep(55);
  }

  const art = rand(CAT_ARTS);
  const artSpan = document.createElement('span');
  artSpan.className = 'msg-art';
  artSpan.textContent = art;
  greetEl.appendChild(artSpan);
  scrollBottom();

  chatHistory.push({ role: 'cat', text: greeting, art });
  saveHistory();

  await sleep(800);

  if (chatVisible && settings.onboardingComplete && !settings.privacyPaused && settings.permissions.screen) {
    await runOllama("What is happening on this screen? Answer in one short sentence.");
  }
}

async function sendUserMessage(text) {
  appendMsg('user', text);
  chatHistory.push({ role: 'user', text });
  saveHistory();

  // Mood: each interaction gives a small boost; compliments give more
  adjustMood(/\b(thanks|thank you|good job|nice|great|awesome|love|cute|best)\b/i.test(text) ? 8 : 2);
  updateRelationship();
  learnFromUserText(text);

  const cmd = parseCommand(text);
  if (cmd === null) return;
  if (cmd !== undefined) {
    const art = rand(CAT_ARTS);
    appendMsg('cat', cmd, art);
    chatHistory.push({ role: 'cat', text: cmd, art });
    saveHistory();
    return;
  }

  const screenMode = classifyScreenQuestion(text);
  if (screenMode) {
    const prompt = screenMode === 'ocr'
      ? `the user asked: "${text}". read the current screen text and summarize the relevant text in 1-2 short sentences.`
      : `the user asked: "${text}". look at the current screen and answer directly in 1-2 short sentences. describe what is actually visible.`;
    await executeAction({ type: screenMode, prompt });
    return;
  }

  const pixelPrompt = classifyPixelArtRequest(text);
  if (pixelPrompt) {
    await executeAction({ type: 'pixel_art', prompt: pixelPrompt, size: 32 });
    return;
  }

  const messages = buildMessages(null);
  await runOllama(messages, false);
}

// â”€â”€ Input handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
hiddenInput.addEventListener('input', () => {
  if (isProcessing) { hiddenInput.value = ''; return; }
  touchActivity();
  const val = hiddenInput.value;

  if (val.length > prevInputLen) {
    for (let i = prevInputLen; i < val.length; i++) {
      const span = document.createElement('span');
      span.className   = 'char-pop';
      span.textContent = val[i] === ' ' ? '\u00a0' : val[i];
      inputDisp.appendChild(span);
    }
  } else {
    while (inputDisp.children.length > val.length) {
      inputDisp.removeChild(inputDisp.lastChild);
    }
  }
  prevInputLen = val.length;
});

hiddenInput.addEventListener('keydown', async e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  if (isProcessing) return;
  const text = hiddenInput.value.trim();
  if (!text) return;
  hiddenInput.value = '';
  inputDisp.innerHTML = '';
  prevInputLen = 0;
  sendUserMessage(text);
});

// Focus input when clicking anywhere in chatbox
chatbox.addEventListener('click', () => { if (!isProcessing) hiddenInput.focus(); });

// â”€â”€ Hover detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.addEventListener('mousemove', e => {
  if (settingsPanelOpen) return;
  const petLeft = (WIN_W - PET_W) / 2;
  const petTop  = WIN_H - PET_H;
  const overPet  = e.clientX >= petLeft && e.clientX <= petLeft + PET_W
                && e.clientY >= petTop  && e.clientY <= petTop  + PET_H;
  const overChat = chatVisible && e.clientY < petTop;

  if (overPet || overChat) {
    clearTimeout(hoverTimeout);
    showChatbox();
  } else {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(hideChatbox, 500);
  }
});

// â”€â”€ Drag â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
canvas.addEventListener('mousedown', e => {
  if (settingsPanelOpen) return;
  if (e.button !== 0) return;
  dragging = true;
  dragSettling = false;
  dragStartSX = e.screenX; dragStartSY = e.screenY;
  winStartX   = window.screenX; winStartY = window.screenY;
  dragTargetX = currX;
  dragTargetY = currY;
  canvas.classList.add('dragging');
  canvas.style.cursor = 'grabbing';
  e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!dragging) return;
  dragTargetX = winStartX + (e.screenX - dragStartSX);
  dragTargetY = winStartY + (e.screenY - dragStartSY);
});

window.addEventListener('mouseup', e => {
  if (e.button !== 0 || !dragging) return;
  dragging = false;
  dragSettling = true;
  targetX = dragTargetX;
  targetY = dragTargetY;
  canvas.classList.remove('dragging');
  canvas.style.cursor = 'grab';
  lastMoveTs = performance.now();
});

// â”€â”€ Right-click â†’ hide â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  showChatbox();
  if (settingsPanelOpen) hideSettingsPanel();
  else showSettingsPanel();
});

// Restore reset
window.electronAPI.onAppShown(() => {
  greetedOnce  = false;
  isProcessing = false;
  stopThinking();
  liveEl = null;
  setInputEnabled(true);
});

// Global hotkey (Ctrl+]) shows and focuses Cache
window.electronAPI.onActivate(() => {
  showChatbox();
  setTimeout(() => hiddenInput.focus(), 100);
});

// â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function init() {
  await preloadAll();
  await loadSettings();
  await loadMemory();
  try { appInfo = await window.electronAPI.getAppInfo(); } catch {}
  await refreshOllamaStatus();
  displays = await window.electronAPI.getDisplays();
  await refreshCurrentDisplay();
  currX = window.screenX; currY = window.screenY;
  targetX = currX; targetY = currY;
  loadHistory();
  updateMoodIndicator();
  const mi = document.getElementById('mood-indicator');
  if (mi) mi.style.display = settings.showMood ? '' : 'none';
  if (settings.clipboardWatch) window.electronAPI.clipboardStart();
  if (settings.downloadsWatch) window.electronAPI.downloadsStart();
  window.electronAPI.onClipboard(handleClipboard);
  window.electronAPI.onDownload(handleDownload);
  startProactiveWatcher();
  startReminderCheck();
  startTaskCheck();
  setInputEnabled(true);
  goIdle();
  lastMoveTs = performance.now();
  requestAnimationFrame(loop);
  if (!settings.onboardingComplete) showOnboarding();
  else if (!ollamaStatusInfo.ok) appendMsg('system', modelStatusText());
  logEvent('info', 'app initialized', { version: appInfo && appInfo.version });
}

init();


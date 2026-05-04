const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`release check failed: ${message}`);
    process.exit(1);
  }
}

run('node', ['--check', 'main.js']);
run('node', ['--check', 'preload.js']);
run('node', ['--check', 'renderer.js']);
run('npm', ['audit', '--audit-level=low']);

const exe = path.join(root, 'dist', 'DesktopPet.exe');
assert(fs.existsSync(exe), 'dist/DesktopPet.exe does not exist; run npm run build first');
const size = fs.statSync(exe).size;
assert(size > 50 * 1024 * 1024, 'portable exe is unexpectedly small');
assert(size < 200 * 1024 * 1024, 'portable exe is unexpectedly large');

const installerName = `CacheAI-Setup-${pkg.version}.exe`;
const installer = path.join(root, 'dist', installerName);
assert(fs.existsSync(installer), `dist/${installerName} does not exist; run npm run build first`);
const installerSize = fs.statSync(installer).size;
assert(installerSize > 50 * 1024 * 1024, 'installer exe is unexpectedly small');
assert(installerSize < 250 * 1024 * 1024, 'installer exe is unexpectedly large');

const appAsar = path.join(root, 'dist', 'win-unpacked', 'resources', 'app.asar');
assert(fs.existsSync(appAsar), 'app.asar does not exist');

console.log('release checks passed');

const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const electronBin = require('electron');

const child = spawn(electronBin, ['.'], {
  cwd: root,
  stdio: 'ignore',
  windowsHide: true,
});

let exited = false;
child.on('exit', code => {
  exited = true;
  console.error(`electron exited early with code ${code}`);
  process.exit(code || 1);
});

setTimeout(() => {
  if (!exited) {
    child.kill();
    console.log('smoke launch passed');
    process.exit(0);
  }
}, 8000);

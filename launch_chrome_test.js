const { spawn } = require('child_process');

console.log('Spawning Chrome...');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const args = [
  '--headless',
  '--remote-debugging-port=9222',
  '--user-data-dir=e:\\nextgengrowth\\chrome-profile',
  '--enable-logging',
  '--v=1'
];

const child = spawn(chromePath, args);

child.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`STDERR: ${data}`);
});

child.on('close', (code) => {
  console.log(`Chrome process exited with code ${code}`);
});

setTimeout(() => {
  console.log('Stopping test after 5 seconds.');
  child.kill();
  process.exit(0);
}, 5000);

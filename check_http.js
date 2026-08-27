const http = require('http');

function printBody(path) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:9222${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n--- Path: ${path} (Status: ${res.statusCode}) ---`);
        console.log(data);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`\n--- Path: ${path} (Failed: ${err.message}) ---`);
      resolve();
    });
  });
}

async function run() {
  await printBody('/');
  await printBody('/json');
  await printBody('/json/version');
  await printBody('/json/list');
}

run();

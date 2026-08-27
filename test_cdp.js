const http = require('http');

function checkPort(port) {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Port ${port} /json/version: Success (${res.statusCode})`);
        console.log(data);
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`Port ${port} /json/version: Failed - ${err.message}`);
      
      // Try /json if /json/version failed
      http.get(`http://127.0.0.1:${port}/json`, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log(`Port ${port} /json: Success (${res2.statusCode})`);
          console.log(data2);
          resolve(true);
        });
      }).on('error', (err2) => {
        console.log(`Port ${port} /json: Failed - ${err2.message}`);
        resolve(false);
      });
    });
  });
}

async function run() {
  console.log('Checking port 9222...');
  await checkPort(9222);
  console.log('\nChecking port 8884...');
  await checkPort(8884);
}

run();

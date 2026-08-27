const https = require('https');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\shukl\\.gemini\\antigravity\\brain\\7c2c8925-4933-4cd8-96d1-89da3305a9c6';

const localUrl = 'http://10.91.37.108:3000/redeem/BW000001';
const prodUrl = 'https://nextgengrowth.in/redeem/BW000001';

function downloadQR(url, filename) {
  return new Promise((resolve, reject) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&color=451a03&bgcolor=fffbeb&data=${encodeURIComponent(url)}`;
    const filePath = path.join(artifactDir, filename);
    const fileStream = fs.createWriteStream(filePath);

    https.get(qrApiUrl, (res) => {
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Downloaded QR code image: ${filePath}`);
        resolve(filePath);
      });
    }).on('error', (err) => {
      console.error(`❌ Error downloading QR code:`, err);
      reject(err);
    });
  });
}

async function main() {
  await downloadQR(localUrl, 'qr_local_bw000001.png');
  await downloadQR(prodUrl, 'qr_prod_bw000001.png');
  process.exit(0);
}

main();

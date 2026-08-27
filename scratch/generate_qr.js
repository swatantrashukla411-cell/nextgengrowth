const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generate() {
  const artifactDir = 'C:\\Users\\shukl\\.gemini\\antigravity\\brain\\7c2c8925-4933-4cd8-96d1-89da3305a9c6';
  const localUrl = 'http://10.91.37.108:3000/redeem/BW000001';
  const prodUrl = 'https://nextgengrowth.in/redeem/BW000001';

  const localFile = path.join(artifactDir, 'qr_local_bw000001.png');
  const prodFile = path.join(artifactDir, 'qr_prod_bw000001.png');

  await QRCode.toFile(localFile, localUrl, {
    color: { dark: '#451A03', light: '#FFFBEB' },
    width: 400,
    margin: 2
  });

  await QRCode.toFile(prodFile, prodUrl, {
    color: { dark: '#451A03', light: '#FFFBEB' },
    width: 400,
    margin: 2
  });

  console.log("✅ Local QR saved to:", localFile);
  console.log("✅ Production QR saved to:", prodFile);
}

generate();

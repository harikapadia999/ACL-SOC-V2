import https from 'https';

const req = https.request({
  hostname: 'aisoc-backend-production.up.railway.app',
  path: '/auth/me',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', (e) => console.error(e));
req.end();

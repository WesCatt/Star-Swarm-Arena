import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function getLanAddress() {
  const interfaces = os.networkInterfaces();
  for (const values of Object.values(interfaces)) {
    for (const details of values || []) {
      if (details.family === 'IPv4' && !details.internal && details.address.startsWith('192.168.')) {
        return details.address;
      }
    }
  }
  return 'localhost';
}

function resolveRequestPath(requestUrl) {
  const requestPath = decodeURIComponent(new URL(requestUrl, `http://${host}:${port}`).pathname);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[\\/])+/, '');
  let filePath = path.join(distDir, safePath === path.sep ? 'index.html' : safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  return filePath;
}

if (!fs.existsSync(distDir)) {
  console.error('dist folder is missing. Run `npm run build` first.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || '/');
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, host, () => {
  const lanAddress = getLanAddress();
  console.log(`Local:   http://localhost:${port}`);
  console.log(`Network: http://${lanAddress}:${port}`);
});

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/bestilling.html', ['bestilling.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ...['catalog.js', 'flavor-combinations.js', 'taste-chat.js', 'app.js', 'professor.js', 'bestilling.js'].map(file => [`/${file}`, [file, 'text/javascript; charset=utf-8']]),
]);
function createServer() {
  return http.createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = files.get(pathname);
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' };
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Siden finnes ikke.'); return; }
    if (!file && pathname.startsWith('/assets/')) {
      const assetPath = path.resolve(__dirname, `.${decodeURIComponent(pathname)}`);
      if (!assetPath.startsWith(path.resolve(__dirname, 'assets') + path.sep)) {
        res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Siden finnes ikke.'); return;
      }
      try {
        const data = await fs.promises.readFile(assetPath);
        const contentType = assetPath.endsWith('.png') ? 'image/png' : assetPath.endsWith('.jpg') || assetPath.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream';
        res.writeHead(200, { ...headers, 'Content-Type': contentType }); res.end(req.method === 'HEAD' ? undefined : data); return;
      } catch {
        res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Siden finnes ikke.'); return;
      }
    }
    if (!file) { res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Siden finnes ikke.'); return; }
    try {
      const data = await fs.promises.readFile(path.join(__dirname, file[0]));
      res.writeHead(200, { ...headers, 'Content-Type': file[1] });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(500, headers); res.end('Kunne ikke lese siden.'); }
  });
}
if (require.main === module) {
  const server = createServer();
  server.listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1', () => console.log(`Fryda: http://127.0.0.1:${server.address().port} · lagrede smakskombinasjoner, ingen KI nødvendig`));
  server.on('error', error => { console.error(`Serveren kunne ikke starte (${error.code}).`); process.exitCode = 1; });
}
module.exports = { createServer };

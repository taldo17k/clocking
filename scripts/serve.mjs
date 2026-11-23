// Local preview server for the site/ folder: `npm run serve` → http://localhost:8000
//
// Why not `python3 -m http.server`? It sends no Cache-Control header, so browsers
// guess how long to keep each file, and after an edit they can mix old and new
// JavaScript modules (e.g. a new lessons.js with an old time.js), which breaks the
// page. This server sends `Cache-Control: no-cache` plus an ETag, so the browser
// always checks and gets the newest file (unchanged files come back as a quick 304).
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.SITE_DIR ? normalize(process.env.SITE_DIR + sep) : fileURLToPath(new URL('../site/', import.meta.url));
const PORT = Number(process.env.PORT || process.argv[2] || 8000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    if (info.isDirectory()) { res.writeHead(301, { Location: `${path}/` }).end(); return; }
    const etag = `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
    const headers = { 'Cache-Control': 'no-cache', ETag: etag, 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers).end(); return; }
    res.writeHead(200, { ...headers, 'Content-Length': info.size });
    if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(PORT, () => console.log(`Clocking preview: http://localhost:${PORT}  (Ctrl+C to stop)`));

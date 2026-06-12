const http = require('http');
const fs   = require('fs');
const path = require('path');

const env = {};
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split(/\r?\n/)
    .forEach(line => {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim();
        env[key] = val;
      }
    });
} catch (e) {
  console.error('.env 파일을 읽지 못했습니다:', e.message);
}

const API_KEY = env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error('❌ OPENROUTER_API_KEY가 .env에 없습니다. 서버를 종료합니다.');
  process.exit(1);
}

const htmlPath = path.join(__dirname, 'index.html');
function getHtml() {
  const raw = fs.readFileSync(htmlPath, 'utf8');
  return raw.replace('__OPENROUTER_API_KEY__', API_KEY);
}

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const html = getHtml();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500);
      res.end('서버 오류: ' + e.message);
    }
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ AI 공감 다이어리 서버 시작`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   OPENROUTER_API_KEY: ${API_KEY.slice(0, 16)}...`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}이 이미 사용 중입니다.`);
  } else {
    console.error('서버 오류:', err.message);
  }
  process.exit(1);
});

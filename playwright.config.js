const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: "node -e \"var http=require('http'), fs=require('fs'), path=require('path'), url=require('url'); http.createServer(function(req,res){ var uri=url.parse(req.url).pathname; if(uri === '/') uri = '/index.html'; var filename = path.join(process.cwd(), uri); fs.readFile(filename, function(err,data){ if(err){ res.statusCode = 404; res.end('Not found'); return; } res.end(data); }); }).listen(3000);\"",
    port: 3000,
    cwd: '.',
    reuseExistingServer: !process.env.CI,
  },
});

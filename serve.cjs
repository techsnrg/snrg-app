const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3457;
const BASE = __dirname;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

http.createServer((req, res) => {
  const url = req.url === "/" ? "/preview.html" : req.url;
  const file = path.join(BASE, url.split("?")[0]);
  const ext = path.extname(file);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found: " + url);
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log("Sales PWA preview: http://localhost:" + PORT + "/preview.html");
});

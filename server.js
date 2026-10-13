const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const publicDir = path.join(__dirname, "public");
const rooms = new Map();
const clientInfo = new Map();

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  if (pathname !== "/" && pathname !== "/index.html") {
    res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"}); return res.end("Not found");
  }
  fs.readFile(path.join(publicDir, "index.html"), (err, data) => {
    if (err) { res.writeHead(500); return res.end("Could not load chat page."); }
    res.writeHead(200, {"Content-Type":"text/html; charset=utf-8", "Cache-Control":"no-store"});
    res.end(data);
  });
});
const wss = new WebSocket.Server({ server, maxPayload: 4096 });

function send(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}
function roomClients(room) {
  return [...clientInfo.entries()].filter(([ws, info]) => info.room === room && ws.readyState === WebSocket.OPEN).map(([ws]) => ws);
}
function broadcast(room, obj) {
  roomClients(room).forEach(ws => send(ws, obj));
}
function safeText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
wss.on("connection", ws => {
  ws.on("message", raw => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return send(ws, {type:"error", text:"Invalid message format."}); }

    if (data.type === "join") {
      const username = safeText(data.username, 24) || "Guest";
      const room = (safeText(data.room, 40).replace(/[^a-zA-Z0-9 _-]/g, "") || "lobby");
      const old = clientInfo.get(ws);
      if (old) {
        broadcast(old.room, {type:"notice", text:`${old.username} left the room.`});
        broadcast(old.room, {type:"count", count:roomClients(old.room).length - 1});
      }
      clientInfo.set(ws, {username, room});
      send(ws, {type:"joined", count:roomClients(room).length});
      broadcast(room, {type:"notice", text:`${username} joined the room.`});
      broadcast(room, {type:"count", count:roomClients(room).length});
      return;
    }

    const info = clientInfo.get(ws);
    if (!info) return send(ws, {type:"error", text:"Join a room before sending messages."});
    if (data.type === "message") {
      const text = safeText(data.text, 1000);
      if (!text) return;
      broadcast(info.room, {type:"message", username:info.username, text, timestamp:Date.now()});
    }
  });
  ws.on("close", () => {
    const info = clientInfo.get(ws);
    if (!info) return;
    clientInfo.delete(ws);
    broadcast(info.room, {type:"notice", text:`${info.username} left the room.`});
    broadcast(info.room, {type:"count", count:roomClients(info.room).length});
  });
});
server.listen(PORT, HOST, () => console.log(`OpenChat running at http://localhost:${PORT}`));

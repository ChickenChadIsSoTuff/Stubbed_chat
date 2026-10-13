# OpenChat — starter website

A small real-time chat site using HTML/CSS/JavaScript in the browser and a Node.js WebSocket server.

## Run it on your computer

1. Install Node.js (LTS) from https://nodejs.org/.
2. Unzip this folder and open a terminal in the `chat_website` folder.
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000 in your browser.

## Chat with another computer on the same Wi-Fi/LAN

1. Find the host computer's local IPv4 address:
   - Windows: open Command Prompt and run `ipconfig`; find the IPv4 Address for your active network.
2. On the host computer, allow Node.js / TCP port 3000 through the private-network firewall if prompted.
3. On the other computer, open `http://HOST-IP:3000` (replace HOST-IP with the host's address).
4. Choose a display name and the same room name on both computers.

Both computers need network access to the host. The server must remain running.

## Chat with people over the internet

The server must be deployed to a host that allows WebSocket connections. Use a platform that supports persistent Node.js processes and WebSockets, configure HTTPS/WSS, and share the public URL. Do not expose your home computer directly to the internet unless you understand the security implications.

## Current limitations

- Messages are not saved; they disappear when users disconnect or the server restarts.
- Anyone who knows a room name can join. Room names are not passwords.
- No accounts, encryption at rest, moderation, or abuse protection.
- Use only test messages until you add authentication, rate limiting, and appropriate security for your intended audience.

# Real-Time Chat App

A full-stack real-time messaging application built with the MERN stack and Socket.io — featuring live messaging, typing indicators, presence tracking, direct messages, and read receipts.

🔗 **Live demo:** https://realtime-chat-app-green-rho.vercel.app

!(c:\Users\Msi\OneDrive - Bingöl Üniversitesi\Resimler\Ekran görüntüleri\Screenshot 2026-09-10 140415.png)

![video](<Recording 2026-09-10 153731.gif>)

## Why this project

Built to go deeper into WebSockets and real-time communication than typical CRUD projects allow — exploring persistent bidirectional connections, presence systems across multiple device sessions, and the tradeoffs between optimistic and confirmed message delivery.

## Features

- 🔐 JWT authentication with httpOnly cookies
- 💬 Real-time messaging via Socket.io, scoped to rooms
- ⌨️ Typing indicators with debounced events
- 🟢 Online/offline presence, correctly handling multiple simultaneous sessions per user
- 📨 Direct messages (1:1), built on the same room infrastructure as group chats
- ✓✓ Read receipts
- 📜 Persistent message history with pagination support
- 🎨 Responsive UI with sent/received message bubbles, grouped consecutive messages, and smart auto-scroll

## Tech stack

**Frontend:** React (Vite), Socket.io-client, Axios
**Backend:** Node.js, Express, Socket.io, MongoDB (Mongoose)
**Auth:** JWT in httpOnly cookies
**Deployment:** Vercel (frontend), Railway (backend), MongoDB Atlas

## Architecture

C:\Users\Msi\realtime-chat-app\arc..diygrram.png

## Running locally

\`\`\`bash
git clone https://github.com/<sana727-eng>/realtime-chat-app.git
cd realtime-chat-app

# Server
cd server
npm install
cp .env.example .env   
npm run dev

# Client (separate terminal)
cd client
npm install
cp .env.example .env
npm run dev
\`\`\`

## Notable engineering decisions

- **Presence tracking uses a Set of socket IDs per user, not a boolean** — this correctly handles a user having multiple tabs/devices open, only marking them offline once every connection has closed.
- **DMs reuse the existing Room/Message infrastructure** rather than a separate data model, treating a direct message as a 2-person room with a unique pairing key to prevent duplicates.
- **Message persistence uses save-then-broadcast**, guaranteeing nothing is broadcast that isn't already safely stored — a deliberate tradeoff of a few milliseconds of latency for stronger consistency guarantees.

## Known limitations

- Presence and rate-limiting state are held in-memory on the server; in a multi-instance production deployment, this would need to move to Redis to stay consistent across instances.
- Read receipts marked via history-fetch (rather than live delivery) don't push a real-time update to the sender — only the live-delivery path does.

## License

MIT
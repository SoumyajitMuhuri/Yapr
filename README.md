<p align="center">
  <img src="client/public/logo-dark.png" alt="Yapr" width="220" />
</p>

# Yapr

Yapr is a real-time messaging app with a React client and an Express API. It supports user authentication with Clerk, one-to-one conversations, online status, live message delivery, and image or video attachments.

## Features

- Sign in and user management with Clerk
- Browse users and recent conversations
- Send text messages and image or video attachments
- Receive messages and online status updates over Socket.IO
- Customize the chat appearance with themes and wallpapers

## Tech stack

- **Client:** React, Vite, Tailwind CSS, HeroUI, Zustand
- **Server:** Node.js, Express, Socket.IO
- **Data and services:** MongoDB with Mongoose, Clerk, ImageKit

## Services

- **Authentication:** Clerk handles sign-in and identity. The server verifies authenticated requests and syncs user records through Clerk webhooks.
- **Images and media:** ImageKit stores uploaded chat images and videos and provides the URLs used in messages.
- **Real-time connections:** Socket.IO delivers new messages and online status updates between connected users.

## Requirements

- Node.js and npm
- A MongoDB database
- Clerk credentials for authentication and the server webhook
- ImageKit credentials to enable media uploads

## Run locally

1. Install dependencies in both application folders:

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Create `server/.env` with the server configuration below. Set `CLIENT_URL` to the client origin (typically `http://localhost:5173`) and `PORT` to `3000` for the included development client configuration.

   ```dotenv
   PORT=3000
   CLIENT_URL=http://localhost:5173
   MONGO_DB_URI=mongodb_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_signing_secret
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   ```

   Configure Clerk's webhook to send user events to `/api/webhooks/clerk` on the server. `IMAGEKIT_PRIVATE_KEY` is required for image and video uploads.

3. Start the server and client in separate terminals:

   ```bash
   cd server && npm run dev
   ```

   ```bash
   cd client && npm run dev
   ```

   Open the client URL printed by Vite. The client uses `http://localhost:3000` for its development API and Socket.IO connections.

## Scripts

| Folder | Command | Description |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run build` | Build the production client into `client/dist` |
| `client` | `npm run preview` | Preview the production client build |
| `client` | `npm run lint` | Run ESLint |
| `server` | `npm run dev` | Start the API with Node watch mode |
| `server` | `npm start` | Start the API |
| `server` | `npm run build` | Copy server source into `server/dist` |
| `server` | `npm run db:seeds` | Run the user seed script |

## API overview

- `GET /health` — health check
- `GET /api/auth/check` — check the authenticated user
- `GET /api/messages/users` — list other users
- `GET /api/messages/conversations` — list conversations
- `GET /api/messages/:id?limit=50&cursor=...` — load a chronological page of up to 50 messages with a user (maximum 100); use `nextCursor` for the next older page
- `POST /api/messages/send/:id` — send a message, optionally with media
- `POST /api/webhooks/clerk` — Clerk user event webhook

Message and user endpoints require authentication.

Message sends are limited per authenticated user to 60 requests per minute, with multipart media uploads additionally limited to 10 per 15 minutes. Uploads accept JPEG, PNG, WebP, GIF, AVIF, MP4, QuickTime, or WebM content, validate file signatures, and are capped at 50 MiB. Message text is capped at 5,000 characters. Rate-limit counters are in-memory per server process; multi-instance deployments should use a shared rate-limit store.

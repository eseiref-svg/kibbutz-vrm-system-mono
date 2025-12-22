# naan-vrm-server

Backend server for the VRM System - part of the `kibbutz-vrm-system-mono` monorepo.

## Location

Server must run from this directory: `naan-vrm-server/`

## Running the Server

### Install dependencies
```bash
cd naan-vrm-server
npm install
```

### Environment Setup

Create a `.env` file in `naan-vrm-server/` (or copy from `.env.example`):

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Zaq1Xsw2
DB_NAME=naan_vrm
JWT_SECRET=VRM_Super_Secret_Key_2024_!@#$%^&*()_Naan_Kibbutz_System
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Start Server

```bash
npm start
```

Server will run on: `http://localhost:5000`

## Database Connection

The server supports two environments:

1. **Development (Local)**: Uses separate env vars (`DB_HOST`, `DB_USER`, etc.)
2. **Production (Railway)**: Uses `DATABASE_URL` (automatically set by Railway)

`db.js` automatically checks the environment and connects accordingly.

## Health Check

After starting the server, check:
- "Connected to DB" message in console
- Access `http://localhost:5000/health` to confirm server is up

## Directory Structure

```
naan-vrm-server/
├── server.js              # Main entry point
├── db.js                  # Database connection config
├── package.json           # Project settings
├── .env                   # Environment variables
├── middleware/            # Middleware (authentication)
├── services/              # Services (payment monitoring, alerts)
└── migrations/            # DB migrations
```

## Important!

- Server **MUST** run from `naan-vrm-server/`
- `.env` file must be in `naan-vrm-server/`
- Do not commit `.env` to git!


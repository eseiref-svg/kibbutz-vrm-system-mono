# naan-vrm-client

Frontend React application for the VRM System - part of the `kibbutz-vrm-system-mono` monorepo.

## Location

Client must run from this directory: `naan-vrm-client/`

## Running the Client

### Install dependencies
```bash
cd naan-vrm-client
npm install
```

### Environment Setup

Create a `.env` file in `naan-vrm-client/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Important**: For Production (Vercel), `REACT_APP_API_URL` is set in the Vercel Dashboard, not in `.env`.

### Start Client

```bash
npm start
```

App will run on: `http://localhost:3000`

## Server Connection (Backend)

The client connects to the server via:
- **Development**: `http://localhost:5000/api` (set in `.env`)
- **Production**: Server URL in Vercel Dashboard

`src/api/axiosConfig.js` handles axios configuration and token injection.

## Health Check

After starting the client:
1. Ensure server is running on `http://localhost:5000`
2. Open browser at `http://localhost:3000`
3. Try to login with:
   - Email: `admin@naan.com`
   - Password: `111222333`

## Directory Structure

```
naan-vrm-client/
├── src/
│   ├── api/
│   │   └── axiosConfig.js      # Axios config
│   ├── components/             # React Components
│   ├── context/                # React Context (Auth)
│   ├── pages/                  # Pages
│   ├── App.js                  # Main App Component
│   └── index.js                # Entry Point
├── public/                     # Static files
├── package.json                # Project settings
└── .env                        # Environment variables
```

## Technologies

- **React 18.2.0** - UI Library
- **React Router** - Navigation
- **Material-UI (MUI)** - UI Components
- **Axios** - HTTP Requests
- **Chart.js** - Visualizations
- **Tailwind CSS** - Styling

## Important!

- Client **MUST** run from `naan-vrm-client/`
- `.env` file must be in `naan-vrm-client/`
- Do not commit `.env` to git!
- Ensure server is running before starting client

## Production Build

```bash
npm run build
```

Creates a `build/` directory ready for deployment.

## Running Tests

```bash
npm test
```

## Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**One-way operation!** Ejects from Create React App (not recommended)

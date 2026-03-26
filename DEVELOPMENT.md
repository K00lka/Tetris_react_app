# Tetris React App - Local Development Guide

## Prerequisites
- .NET 8.0 SDK
- Node.js 20+ and npm
- Git

## Quick Start

Install all dependencies:
```bash
npm install
```

## Frontend Development

Start frontend in development mode:
```bash
npm run frontend:dev
```

The frontend will be available at `http://localhost:5173`

Build frontend for production:
```bash
npm run frontend:build
```

Lint frontend code:
```bash
npm run frontend:lint
```

## Backend Development

Restore backend dependencies:
```bash
npm run backend:restore
```

Run backend server:
```bash
npm run backend:run
```

The backend will be available at `http://localhost:5000` with Swagger docs at `http://localhost:5000/swagger`

Build backend:
```bash
npm run backend:build
```

Publish backend for production:
```bash
npm run backend:publish
```

## Environment Configuration

### Frontend Environment (.env files)
- `.env` - Development configuration (included in repo)
- `.env.production` - Production configuration (included in repo)
- `.env.local` - Local overrides (ignored by git)
- `.env.example` - Example configuration template

Default frontend API URL: `http://localhost:5000/api`

### Backend Environment (.env files)
- `.env` - Development configuration (included in repo)
- `.env.production` - Production configuration (included in repo)
- `.env.example` - Example configuration template

Default backend URL: `http://localhost:5000`

## Docker Deployment (when registry access is available)

Build and run both services:
```bash
npm run docker:build
```

Or use docker-compose directly:
```bash
docker-compose up --build
```

- Backend: http://localhost:5001
- Frontend: http://localhost:3000

View logs:
```bash
npm run docker:logs
```

Stop services:
```bash
npm run docker:down
```

## Build All for Production

```bash
npm run build
```

This will build the frontend and publish the backend.

## API Endpoints

- `GET /health` - Health check
- `GET /api/leaderboard` - Get top 10 scores
- `GET /api/leaderboard/top/{count}` - Get top N scores (1-100)
- `POST /api/leaderboard` - Save a new score
  - Body: `{ "playerName": "string", "score": number }`
- `GET /api/players/{playerName}/scores` - Get player statistics
- `GET /api/game/config` - Get game configuration

## Database

The application uses SQLite for data storage. The database file is stored at:
- Development: `./tetris_scores.db`
- Production (Docker): `/app/data/tetris_scores.db`

The database is automatically created and initialized on first run.

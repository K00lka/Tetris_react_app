# Tetris React App - Local Development Guide

## Prerequisites
- .NET 8.0 SDK
- Node.js 20+ and npm
- Git

## Backend Setup

```bash
cd backend
dotnet restore
dotnet run
```

The backend will be available at `http://localhost:5000` with Swagger docs at `http://localhost:5000/swagger`

## Frontend Setup

```bash
cd frontend/Toadtris
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Building for Production

### Backend Build
```bash
cd backend
dotnet publish -c Release -o ./bin/Release/publish
```

### Frontend Build
```bash
cd frontend/Toadtris
npm run build
```

## Docker Deployment (when registry access is available)

```bash
docker-compose up --build
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## API Endpoints

- `GET /health` - Health check
- `GET /api/leaderboard` - Get top 10 scores
- `GET /api/leaderboard/top/{count}` - Get top N scores
- `POST /api/leaderboard` - Save a new score
- `GET /api/players/{playerName}/scores` - Get player statistics
- `GET /api/game/config` - Get game configuration

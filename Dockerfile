# Multi-stage build for .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY backend/ .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/backend

# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/Toadtris/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/Toadtris/ .
RUN npm run build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-build /app/backend .

# Copy frontend dist to wwwroot
COPY --from=frontend-build /app/dist ./wwwroot

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "CloudBackend.dll"]
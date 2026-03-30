# Multi-stage build for .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src/backend
COPY backend/ .
RUN dotnet publish -c Release -o /app/backend

# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /src/frontend/Toadtris
COPY frontend/Toadtris/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/Toadtris/ .
RUN npm run build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/backend .
COPY --from=frontend-build /src/frontend/Toadtris/dist ./wwwroot

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "YourProjectName.dll"]
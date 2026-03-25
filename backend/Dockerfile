# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY CloudBackend.csproj .
COPY Program.cs .

# Restore and build the application
RUN dotnet restore CloudBackend.csproj
RUN dotnet build CloudBackend.csproj -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish CloudBackend.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application from publish stage
COPY --from=publish /app/publish .

# Create directory for database
RUN mkdir -p /app/data

# Expose ports
EXPOSE 80
EXPOSE 443
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Set entry point
ENTRYPOINT ["dotnet", "Toadtris.dll"]
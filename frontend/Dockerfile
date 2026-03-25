# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY Toadtris/package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY Toadtris/ .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]

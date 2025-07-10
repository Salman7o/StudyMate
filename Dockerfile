FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --production=false --silent

# Copy all source code
COPY . .

# Build the frontend using Vite (configured to use client directory as root)
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
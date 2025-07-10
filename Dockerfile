FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --production=false

# Copy all source code
COPY . .

# Set permissions and ensure build directory exists
RUN mkdir -p dist/public

# Verify that all necessary files are present
RUN ls -la && echo "Checking client directory..." && ls -la client/

# Build the frontend using Vite (configured to use client directory as root)
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
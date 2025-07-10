FROM node:18-alpine

WORKDIR /app

# Copy all source code first
COPY . .

# Install dependencies (only root package.json exists)
RUN npm install

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
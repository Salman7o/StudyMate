FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
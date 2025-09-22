# Use an official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS app
RUN npm run build

# Start the app
CMD ["node", "dist/main"]

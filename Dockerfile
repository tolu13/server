# ---------------------------------------------
# 1. Base image
# ---------------------------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS project
RUN npm run build

# ---------------------------------------------
# 2. Production image
# ---------------------------------------------
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only necessary build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the app port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Run Prisma migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

# ---------------------------------------------
# 1. Base Build Stage
# ---------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build


# ---------------------------------------------
# 2. Production Stage
# ---------------------------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts and prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port (Render automatically detects it)
EXPOSE 5000

ENV NODE_ENV=production

# Run Prisma migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

# Multi-stage production build for DevHub (Node.js + Vite + Express)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies for both client and server
RUN npm install --prefix server
RUN npm install --prefix client

# Copy application code
COPY server ./server
COPY client ./client

# Build client production bundle
RUN npm run build --prefix client

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy package files and install only production dependencies for server
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev

# Copy server code and built client bundle
COPY server/src ./server/src
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5001

CMD ["npm", "start", "--prefix", "server"]

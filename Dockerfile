# ==============================================================================
# Multi-stage Dockerfile for Personal AI Journal (Single-Service Cloud Run)
# 
# Secrets configuration note:
# Cloud Run mounts GEMINI_API_KEY from Google Cloud Secret Manager (GEMINI_API_KEY:1)
# at runtime as an environment variable (process.env.GEMINI_API_KEY).
# ==============================================================================

# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Build Express TypeScript Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies for backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend into public directory for Express static SPA serving
COPY --from=frontend-builder /app/dist ./public

EXPOSE 8080

CMD ["node", "dist/server.js"]

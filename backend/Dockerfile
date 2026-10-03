FROM node:20-alpine AS builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY sign-in ./sign-in

WORKDIR /app/backend
USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]

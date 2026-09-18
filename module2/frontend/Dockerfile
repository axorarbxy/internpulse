FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY module2/frontend/package*.json ./module2/frontend/
WORKDIR /app/module2/frontend
RUN npm ci

# Copy sources for both frontend and Module-04 frontend dependencies
WORKDIR /app
COPY Module-04/frontend/ ./Module-04/frontend/
COPY module2/frontend/ ./module2/frontend/

WORKDIR /app/module2/frontend
RUN npm run build

# Production static server stage with Nginx
FROM nginx:alpine

COPY --from=builder /app/module2/frontend/dist /usr/share/nginx/html
COPY module2/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

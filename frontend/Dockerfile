# ==========================================
# Frontend Dockerfile (React + Vite + Nginx)
# ==========================================

# Stage 1: Build
FROM node:20-slim as builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (Nginx default is 80, but docker-compose / nginx proxy might handle it differently)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

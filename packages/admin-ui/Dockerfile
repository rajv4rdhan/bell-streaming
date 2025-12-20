# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy all package files
COPY package*.json ./
COPY packages/admin-ui/package*.json ./packages/admin-ui/
COPY packages/shared-ui/package*.json ./packages/shared-ui/

# Install dependencies
RUN npm ci

# Copy entire project (source code, configs, etc.)
COPY . .

# Build shared-ui first
WORKDIR /app/packages/shared-ui
RUN npm run build

# Build the application
WORKDIR /app/packages/admin-ui
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/packages/admin-ui/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY packages/admin-ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

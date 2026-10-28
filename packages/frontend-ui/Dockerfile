# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/frontend-ui/package*.json ./packages/frontend-ui/
COPY packages/shared-ui/package*.json ./packages/shared-ui/

# Install dependencies
RUN npm ci --legacy-peer-deps --quiet

# Copy source code and configs
COPY . .

# Build shared-ui first
WORKDIR /app/packages/shared-ui
RUN npm run build

# Build the application
WORKDIR /app/packages/frontend-ui

ARG VITE_API_BASE_URL
ARG VITE_CLOUDFRONT_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLOUDFRONT_URL=$VITE_CLOUDFRONT_URL

RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/packages/frontend-ui/dist /usr/share/nginx/html
COPY packages/frontend-ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

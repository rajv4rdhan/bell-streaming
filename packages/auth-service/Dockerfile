# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy root package.json and package-lock.json (if available)
COPY package*.json ./

# Copy workspaces package.json
COPY packages/auth-service/package*.json ./packages/auth-service/

# Install all dependencies
RUN npm install --workspaces

# Copy the rest of the source code
COPY . .

# Build the specific workspace
RUN npm run build --workspace=@bell-streaming/auth-service

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/auth-service/package.json ./packages/auth-service/package.json
COPY --from=builder /usr/src/app/packages/auth-service/dist ./packages/auth-service/dist

# Set the command to run the service
CMD ["node", "packages/auth-service/dist/index.js"]

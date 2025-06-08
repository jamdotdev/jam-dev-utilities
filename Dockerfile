FROM node:20.9.0-alpine

WORKDIR /app

# Install dependencies for node-canvas
RUN apk add --no-cache \
    build-base \
    g++ \
    make \
    python3 \
    git \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    freetype-dev

# Configure npm for better network handling and reduced connection issues
# maxsockets 1: Limits concurrent connections to prevent EventEmitter warnings
# fetch-retries 5: Retry failed downloads up to 5 times
# fetch-retry-*: Set timeout ranges for retries (20s min, 2min max)
RUN npm config set maxsockets 1 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Configure Node.js environment variables
# max-old-space-size=4096: Increase heap memory to 4GB to prevent OOM during builds
# UV_THREADPOOL_SIZE=128: Increase thread pool for better I/O performance
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV UV_THREADPOOL_SIZE=128

# Configure npm to prefer prebuilt binaries over source compilation
# This helps avoid native compilation issues with tree-sitter and similar packages
ENV npm_config_build_from_source=false
ENV npm_config_cache=/tmp/.npm

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
# --maxsockets 1: Limit concurrent connections during install
RUN npm ci --audit-level=high --maxsockets 1

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]

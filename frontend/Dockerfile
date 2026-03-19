# frontend/Dockerfile

# ── Stage 1: BUILD ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build

# "alpine" = minimal Linux distribution (~5MB vs ~200MB for standard)
#used it for smaller image sizes

WORKDIR /app

# Copy package files first — same cache optimization trick as the C# Dockerfile.
# If package.json hasn't changed, Docker reuses the cached npm install layer.
COPY package*.json ./
RUN npm ci  
# "npm ci" = clean install (faster, more reliable than "npm install" in CI/CD)
# It installs EXACTLY what's in package-lock.json — no surprises

COPY . .

# Build the React app for production
# Vite compiles React → optimized HTML/CSS/JS bundle in the "dist" folder
RUN npm run build

# ── Stage 2: SERVE ──────────────────────────────────────────────────────────
# used Nginx to serve the static built files
# Nginx is a high-performance web server — much better than "npm run dev" for production
FROM nginx:alpine AS runtime

# Copy the built React app to Nginx's default web root
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config for React Router (SPA support)
# Without this, refreshing on /dashboard gives a 404 because Nginx
# tries to find a file called "dashboard" — it doesn't exist, React Router handles it
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
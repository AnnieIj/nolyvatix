# Nolyvatix Production Deployment Guide

This document outlines deployment procedures for running **Nolyvatix** in local, staging, and enterprise production environments.

---

## 📋 System Requirements

| Environment Component | Minimum Requirement | Recommended Production |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 / Windows Server 2022 | Ubuntu 24.04 LTS |
| **Node.js** | `v20.10.0` LTS | `v22.x` LTS |
| **Memory (RAM)** | 2 GB | 4 GB+ |
| **CPU** | 2 vCPUs | 4 vCPUs |
| **Network** | Outbound HTTPS to Horizon / Soroban RPC | Unrestricted outbound 443 |

---

## ⚙️ Environment Variables

Create `.env` based on `.env.example`:

```env
# Google Gemini AI API Configuration
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Application URL
APP_URL="https://nolyvatix.yourdomain.io"

# Platform Settings
VITE_APP_TITLE="Nolyvatix - Stellar Blockchain BI Platform"
VITE_STELLAR_NETWORK="mainnet"

# Blockchain RPC & REST Endpoints
VITE_HORIZON_URL="https://horizon.stellar.org"
VITE_SOROBAN_RPC_URL="https://mainnet.soroban.stellar.org"

# Feature Flags
VITE_ENABLE_MOCK_DATA="false"
VITE_ENABLE_AI_COPILOT="true"
```

---

## 🚀 Option 1: Standard Node.js Production Build

### 1. Build the Bundled Server & Static Assets
```bash
npm run build
```
This executes:
1. `vite build` → Compiles frontend assets into `dist/` (`dist/index.html`, `dist/assets/`).
2. `esbuild server.ts ...` → Bundles Node.js Express backend into `dist/server.cjs`.

### 2. Start the Production Server
```bash
NODE_ENV=production npm start
```
By default, the production Express server serves static assets from `dist/` and mounts API routes on `/api`, listening on `http://0.0.0.0:3000`.

---

## 🔄 Option 2: PM2 Process Manager Deployment

For production process supervision, auto-restarts, and log management:

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Start Nolyvatix with PM2**:
   ```bash
   pm2 start dist/server.cjs --name "nolyvatix-engine" --env production
   ```

3. **Configure PM2 Startup**:
   ```bash
   pm2 save
   pm2 startup
   ```

---

## 🐳 Option 3: Docker Deployment

### Dockerfile
Create `Dockerfile` in the root directory:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

### Build & Run Docker Container
```bash
docker build -t nolyvatix:1.0.0 .
docker run -d -p 3000:3000 --env-file .env --name nolyvatix-app nolyvatix:1.0.0
```

---

## 🛡️ Reverse Proxy Configuration (Nginx)

For SSL termination and custom domain routing:

```nginx
server {
    listen 80;
    server_name nolyvatix.yourdomain.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nolyvatix.yourdomain.io;

    ssl_certificate /etc/letsencrypt/live/nolyvatix.yourdomain.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nolyvatix.yourdomain.io/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🏥 Health Check Verification

After deployment, verify system health by querying the Network Health endpoint:

```bash
curl -i https://nolyvatix.yourdomain.io/api/network/health
```

Expected HTTP 200 response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "network": "mainnet",
    "horizonStatus": "healthy",
    "sorobanRpcStatus": "healthy",
    "currentLedgerSequence": 52148900
  }
}
```

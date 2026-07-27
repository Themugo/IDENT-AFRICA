# IDENT AFRICA - Deployment Guide

This guide covers deploying IDENT AFRICA to production environments.

## Architecture Overview

IDENT AFRICA uses a **monolithic server architecture**:
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **AI**: Google Gemini API
- **Database**: PostgreSQL (optional - uses mock data by default)

### Deployment Options

| Option | Description | Recommended For |
|--------|-------------|----------------|
| **Vercel** | Full-stack deployment with serverless functions | Quickest setup, managed infrastructure |
| **Node.js VPS** | Traditional server deployment | Full control, custom domains |
| **Docker** | Containerized deployment | Consistent environments |
| **AWS/GCP/Azure** | Cloud deployment | Enterprise scale |

---

## Build & Optimization

### Local Build Test
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Preview production build
npm run preview

# Full build with server
npm run build:full
```

### Build Output Structure
```
dist/
├── assets/
│   ├── js/          # JavaScript chunks
│   ├── images/       # Optimized images
│   └── fonts/        # Font files
├── index.html
└── ...other assets
```

### Bundle Optimization
The build automatically:
- Code splits vendor libraries (React, Motion, Icons, PDF)
- Hashes assets for cache busting
- Minifies code in production
- Removes console.log/debugger in production

---

## Option 1: Vercel Deployment (Recommended)

### Prerequisites
- Vercel account (sign up at vercel.com)
- GitHub repository connected to Vercel

### Step 1: Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Step 2: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Required for All Environments:**
| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `NEXT_PUBLIC_APP_ENV` | `production` | Yes |

**Required for Production:**
| Variable | Value | Required |
|----------|-------|----------|
| `GEMINI_API_KEY` | Your API key | Yes |
| `JWT_SECRET` | Random 64-char string | Yes |
| `SESSION_SECRET` | Random 64-char string | Yes |
| `ALLOWED_ORIGINS` | `yourdomain.com` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No (mock data) |

Generate secrets:
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 64
```

### Step 3: Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Or use Git integration (auto-deploy on push)
```

### Step 4: Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `identafrica.com`)
3. Update DNS records as instructed

### SPA Routing
Vercel is configured for SPA (Single Page Application) routing:
- All routes redirect to `/dist/index.html`
- Client-side routing handles navigation
- API routes are handled by Express server

### Environment Variable Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `NEXT_PUBLIC_API_URL` | API endpoint | Yes |
| `NEXT_PUBLIC_GEMINI_API_KEY` | AI API key | Yes |
| `DATABASE_URL` | PostgreSQL | No |

---

## Option 2: Node.js VPS Deployment

### Prerequisites
- VPS with Ubuntu 20.04+
- Node.js 18+
- Nginx (for reverse proxy)
- PostgreSQL (optional)

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Clone & Build
```bash
# Clone repository
git clone https://github.com/Themugo/IDENT-AFRICA.git
cd IDENT-AFRICA

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 3: Environment Configuration
```bash
# Create .env file
cp .env.example .env

# Edit with production values
nano .env
```

### Step 4: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ident-africa
```

Add configuration:
```nginx
server {
    listen 80;
    server_name identafrica.com www.identafrica.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ident-africa /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: Start Application
```bash
# Start with PM2
pm2 start dist/server.mjs --name ident-africa

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup
```

### Step 6: SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d identafrica.com -d www.identafrica.com
```

---

## Option 3: Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.mjs"]
```

### Build & Run
```bash
# Build image
docker build -t ident-africa .

# Run container
docker run -d -p 3000:3000 \
  --env-file .env \
  --name ident-africa \
  ident-africa
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

---

## Database Setup (PostgreSQL)

### Local Development
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE ident_africa;
CREATE USER ident_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ident_africa TO ident_user;
\q

# Set DATABASE_URL
export DATABASE_URL="postgresql://ident_user:your_password@localhost:5432/ident_africa"
```

### Run Migrations
```bash
npm run db:migrate
```

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes (production) |
| `PORT` | Server port | `3000` | No |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | localhost | Yes |
| `GEMINI_API_KEY` | Google AI API key | - | Yes |
| `JWT_SECRET` | Token signing secret | - | Yes |
| `JWT_EXPIRY` | Token expiry (seconds) | `86400` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | No |
| `APP_URL` | Public app URL | localhost | No |

### Payment Gateway Variables (Optional)
```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxx
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=xxx
MPESA_PASSKEY=xxx
```

---

## Rollback Process

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### VPS/PM2
```bash
# Check PM2 logs
pm2 logs ident-africa

# Restart application
pm2 restart ident-africa

# Rollback to previous version
git checkout [previous-commit]
npm run build
pm2 restart ident-africa
```

### Docker
```bash
# Stop current container
docker stop ident-africa

# Remove container
docker rm ident-africa

# Pull previous image (if tagged)
docker pull ident-africa:previous

# Start with previous image
docker run -d -p 3000:3000 --name ident-africa ident-africa:previous
```

---

## Health Checks

### Application Health
```bash
curl https://api.identafrica.com/api/health
```

Response:
```json
{
  "status": "ok",
  "app": "Ident Africa",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### Database Health
```bash
curl https://api.identafrica.com/api/db/health
```

---

## Troubleshooting

### Build Failures
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node.js version: `node --version` (requires 18+)
3. Clear Vercel cache: `vercel --force`

### Runtime Errors
1. Check logs: `pm2 logs` or Vercel dashboard
2. Verify environment variables are set
3. Check database connection if using PostgreSQL

### CORS Errors
1. Verify `ALLOWED_ORIGINS` includes your domain
2. Check for protocol mismatch (http vs https)

---

## Monitoring

### Uptime Monitoring
- Use UptimeRobot, Pingdom, or similar
- Monitor: `https://identafrica.com/api/health`

### Error Tracking (Sentry)
```bash
# Set Sentry DSN
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Analytics
Add to index.html head:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

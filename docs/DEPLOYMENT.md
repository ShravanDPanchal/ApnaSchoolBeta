# Production Deployment & Operations Guide

## 1. Quick Start via Docker Compose

To deploy the entire production stack (PostgreSQL, Redis, Express API, Next.js Frontend) in one command:

```bash
cd docker
docker-compose up -d --build
```

---

## 2. Bare-Metal / VPS Deployment (Ubuntu 22.04 LTS)

### Prerequisites:
- Node.js 20.x LTS & npm 10+
- PostgreSQL 16+ or SQLite
- PM2 Process Manager (`npm install -g pm2`)
- Nginx Reverse Proxy with Let's Encrypt SSL

### Step-by-Step Setup:

1. **Clone & Install Dependencies**:
   ```bash
   git clone <REPO_URL> apna-school
   cd apna-school
   npm install
   ```

2. **Build Shared Packages & Applications**:
   ```bash
   npm --workspace=packages/shared-types run build
   npm --workspace=apps/api run build
   npm --workspace=apps/web run build
   ```

3. **Database Migration & Seeding**:
   ```bash
   npm --workspace=apps/api run db:migrate
   npm --workspace=apps/api run db:seed
   ```

4. **Start Background Processes via PM2**:
   ```bash
   pm2 start apps/api/dist/main.js --name "apna-api" -i max
   pm2 start "npm --workspace=apps/web run start" --name "apna-web"
   pm2 save
   pm2 startup
   ```

---

## 3. Automated Backup Strategy

To ensure zero financial data loss, schedule daily database snapshots:

```bash
# Crontab entry: Every night at 2:00 AM
0 2 * * * pg_dump -U postgres apna_school_db | gzip > /backups/apna_db_$(date +\%F).sql.gz
```

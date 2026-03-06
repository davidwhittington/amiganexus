# Server Setup — One-time steps (run on VPS)

These steps are only needed once. After this, all deploys are automatic via GitHub Actions.

---

## 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

## 2. Install PM2

```bash
npm install -g pm2
pm2 startup   # follow the printed command to register PM2 on boot
```

## 3. Create .env on the server

```bash
cp /var/www/amiganexus.com/server/.env.example /var/www/amiganexus.com/server/.env
nano /var/www/amiganexus.com/server/.env
```

Fill in:
- `SUPABASE_URL` — from Supabase project > Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` — from same page (service role, not anon)
- `ADMIN_API_KEY` — generate with `openssl rand -hex 32`

## 4. Enable Apache proxy modules

```bash
a2enmod proxy proxy_http
systemctl reload apache2
```

## 5. Update Apache vhost to proxy /api and /health to Bun

Add to `/etc/apache2/sites-available/amiganexus.com-le-ssl.conf` inside `<VirtualHost>`:

```apache
ProxyPreserveHost On
ProxyPass        /api/    http://127.0.0.1:3000/api/
ProxyPassReverse /api/    http://127.0.0.1:3000/api/
ProxyPass        /health  http://127.0.0.1:3000/health
ProxyPassReverse /health  http://127.0.0.1:3000/health
```

Then reload:
```bash
apache2ctl configtest && systemctl reload apache2
```

## 6. Start the server for the first time

```bash
cd /var/www/amiganexus.com/server
bun install
cd /var/www/amiganexus.com
pm2 start ecosystem.config.cjs
pm2 save
```

## 7. Run the database schema

- Go to your Supabase project > SQL Editor
- Paste and run the contents of `db/schema.sql`

## 8. Verify

```bash
curl https://amiganexus.com/health
# → {"status":"ok","service":"amiganexus",...}

curl -X POST https://amiganexus.com/api/warps \
  -H "Content-Type: application/json" \
  -d '{"destination":"https://eab.abime.net","label":"English Amiga Board"}'
# → {"ok":true}
```

# Syqon Platform (Wasp Base)

Project reset to the Wasp Open SaaS app base.

Domains (target setup):

- `lunastudio.it` -> frontend app
- `control.syqon.it` -> admin area (`/admin`)

## Deploy to VPS

```bash
cd "/Users/michaelruggeri/Desktop/continuum founder beta"
bash scripts/deploy.sh
```

This syncs the Wasp project into:

- `/var/www/syqonplatform`

## Apache vhosts

Configs in `ops/apache/` assume Wasp app is running on:

- `127.0.0.1:3000`

`control.syqon.it` redirects `/` to `/admin` and keeps `noindex` header.

Enable required Apache modules:

```bash
sudo a2enmod proxy proxy_http headers rewrite
sudo apachectl configtest
sudo systemctl reload apache2
```

## Run Wasp on VPS (baseline)

Inside `/var/www/syqonplatform`:

```bash
npm install -g @wasp.sh/wasp-cli
cp .env.client.example .env.client
cp .env.server.example .env.server
wasp start db
wasp start
```

Then Apache reverse-proxy serves it on your domains.

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# AK1A Contabo — PROD-BYGGBOX + SJÄLVHOSTAD PROD (styrelsens beslutsrevision
# 2026-09-08, e30af98). Kopiera denna fil till servern och kör som root:
#   bash setup-prod.sh
# Idempotent. Ubuntu 24.04. Leverantörsoberoende (apt) — Contabo Cloud VPS 4.
# Nätregler (Mimosa): endast fasta https-literaler; fjärrskript pipas ALDRIG
# till skalet; inga URL:ar ur variabler; inga localhost/privata mål.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
echo "── AK1A Contabo: provisionering (prod + byggmiljö) ─────────────────"

command -v apt-get >/dev/null 2>&1 || { echo "FEL: ej apt-baserat system." >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive

# 1. Bas + säkerhet (åtskilda steg — idempotenta)
apt-get update -y
apt-get upgrade -y
apt-get install -y curl gnupg git ufw fail2ban unattended-upgrades nginx rsync ca-certificates certbot python3-certbot-nginx

# 2. Node 22 via SIGNERAT NodeSource-repo (nyckel via gpg — aldrig skript-pipe)
if ! command -v node >/dev/null 2>&1 || ! node -v 2>/dev/null | grep -q '^v2[2-9]'; then
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/nodesource.gpg
  echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs
fi
node -v

# 3. Driftkontot ak1a (sudo; ärver root:s publikapar)
id -u ak1a >/dev/null 2>&1 || useradd -m -s /bin/bash -G sudo ak1a
if [ -f /root/.ssh/authorized_keys ]; then
  mkdir -p /home/ak1a/.ssh
  cat /root/.ssh/authorized_keys > /home/ak1a/.ssh/authorized_keys
  chown -R ak1a:ak1a /home/ak1a/.ssh
  chmod 700 /home/ak1a/.ssh
  chmod 600 /home/ak1a/.ssh/authorized_keys
fi

# 4. Brandvägg: SSH + webb
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5. PM2 under ak1a + boot-start
sudo -u ak1a bash -lc 'npm install -g pm2@latest'
sudo -u ak1a bash -lc 'pm2 startup systemd -u ak1a --hp /home/ak1a' > /tmp/pm2-startup.sh || true
[ -s /tmp/pm2-startup.sh ] && bash /tmp/pm2-startup.sh

# 6. Härdning av SSH: endast nycklar — aktiveras av main EFTER verifierad
#    ak1a-nyckellogg (rader avkommenteras då; aldrig före — lås-risk)
cat > /etc/ssh/sshd_config.d/99-ak1a-hardening.conf <<'EOF'
# AK1A-härdning — aktiveras av main efter verifierad ak1a-inloggning:
# PasswordAuthentication no
# PermitRootLogin prohibit-password
EOF

# 7. nginx: default bort + AK1A-plats (pm2/next på port 3000); SSL vid DNS-flip
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/ak1a <<'EOF'
# AK1A prod — pm2 (next start, port 3000) bakom nginx.
# Certbot (-d lab.ak1nvestor.com) utökar denna vid DNS-flippen.
server {
    listen 80;
    server_name lab.ak1nvestor.com _;
    client_max_body_size 5m;
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
EOF
ln -sf /etc/nginx/sites-available/ak1a /etc/nginx/sites-enabled/ak1a
nginx -t
systemctl reload nginx

# 8. Auto-säkerhetsuppdateringar
dpkg-reconfigure -f noninteractive unattended-upgrades

echo ""
echo "── KLAR: box + nginx + pm2 redo ──"
echo "Nästa steg (main-agenten): verifiera ak1a-nyckellogg → aktivera"
echo "härdningen → klona repo → bygg → pm2 start → smoke-test → DNS-flip."

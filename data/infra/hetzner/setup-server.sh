#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# AK1A Hetzner-byggmiljö — PROVISIONERING (fas H1)
# STYRELSE-HETZNER-ARKITEKTUR.md är kontraktet. Körs EN gång som root på
# servern (65.108.241.93) via:  bash -s < data/infra/hetzner/setup-server.sh
# Idempotent — körbart igen utan skada. Ändrar ALDRIG prod (Vercel).
# Nätregler (Mimosa-kontraktet): endast fasta https-literaler nedan — inga
# URL:ar ur variabler; inga anrop mot localhost/privata adresser; ALDRIG
# fjärrskript pipade till bash (NodeSource läggs till som signerat apt-repo).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "── AK1A Hetzner fas H1: provisionering ──────────────────────────"

# 0. Endast apt-baserade system (Ubuntu/Debian — CX23-standard).
if ! command -v apt-get >/dev/null 2>&1; then
  echo "FEL: inte apt-baserat system — avbryter ärligt (styrelsens kontrakt)." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# 1. Systemuppdatering + baspaket.
apt-get update -y
apt-get upgrade -y
apt-get install -y curl gnupg git ufw fail2ban unattended-upgrades nginx rsync ca-certificates

# 2. Node.js 22 LTS — NodeSource som SIGNERAT APT-REPO (nyckeln via gpg,
#    aldrig setup-skript-pipe). Fasta https-literaler mot deb.nodesource.com.
if ! command -v node >/dev/null 2>&1 || ! node -v 2>/dev/null | grep -q '^v2[2-9]'; then
  echo "── Installerar Node 22 (NodeSource apt-repo, signerat) ──"
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor --yes -o /usr/share/keyrings/nodesource.gpg
  echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs
fi
node -v

# 3. Byggkontot ak1a (sudo; ärver root:s publikapar = automationens nyckel).
if ! id -u ak1a >/dev/null 2>&1; then
  useradd -m -s /bin/bash -G sudo ak1a
fi
if [ -f /root/.ssh/authorized_keys ]; then
  mkdir -p /home/ak1a/.ssh
  cat /root/.ssh/authorized_keys > /home/ak1a/.ssh/authorized_keys
  chown -R ak1a:ak1a /home/ak1a/.ssh
  chmod 700 /home/ak1a/.ssh
  chmod 600 /home/ak1a/.ssh/authorized_keys
fi

# 4. Brandvägg: endast SSH/HTTP/HTTPS (styrelsens säkerhetskontrakt §4).
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5. PM2 (processhanterare för fas H2/H3 — installeras nu, startas ej).
sudo -u ak1a bash -lc 'npm install -g pm2@latest' || npm install -g pm2@latest

# 6. Auto-säkerhetsuppdateringar.
dpkg-reconfigure -f noninteractive unattended-upgrades

# 7. nginx: beredd men passiv (ingen site förrän fas H2/H3 beslut) — default-
#    sajten bort så inget läcker serverns existens i klartext.
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx || true

echo ""
echo "── H1 KLAR ──"
echo "Testa byggkontot:  ssh -i ~/.ssh/hetzner_key ak1a@65.108.241.93"
echo "NÄSTA STEG (görs av AI): verifiera ak1a-inloggning, SEDAN stäng"
echo "root-lösenordsinloggning (PasswordAuthentication no) — aldrig före."

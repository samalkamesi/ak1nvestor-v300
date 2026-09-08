# STYRELSEBESLUT — HETZNER-ARKITEKTUR (ordföranden 2026-09-07, våg 81 efterspel)

Kundsignal: Hetzner CX23 (65.108.241.93, €5,99/mån) ska nyttjas så att
"kundens dator slipper" — AI (ZCode) hanterar servern DIREKT via SSH, utan
mellanlager (Coolify avvisat av kunden). Detta infriar KUNDINFRA-PLANEN
(2026-09-07): Hetzner = byggmiljö som ersätter den trötta arbetsstationen.

## BESLUT 1 — PROD STÅR PÅ VERCEL (flytt AVSLÅS)

Guidens spår "deploya sajten till Hetzner med nginx+PM2" avslås i detta
skede. Motivering: (i) Vercel Hobby = 0 kr och 100 % fungerande — flytt ger
noll besparing; (ii) CDN, ISR-cachen, image-optimering, deployflödet
(main-push auto) och Hobby-cronerna är lastbärande för 1 684 sidor;
(iii) B2B-grinden, Fas-flödena och betalningsytorna lever i prod —
migrationsrisk utan vinst bryter mot försiktighetsprincipen; (iv) den
trafik som faktiskt stressar (korpus 139 745 rader, speglar) betjänas av
Vercels edge utan serveradministration. OM framtida behov uppstår
(bandwidth-tak, funktionstidsgränser, B2B-integrationer som kräver
beständig process) återkommer frågan som egen forskningsrond.

## BESLUT 2 — HETZNER = BYGGMILJÖ + KEEPALIVE-ERSÄTTARE (SANKAS)

Faser, varje fas egenlevererad och verifierad:
- **FAS H1 — Provisionering + byggbox (NU):** härdning (UFW 22/80/443,
  fail2ban, unattended-upgrades, byggkonto `ak1a`, root-lösenord stängs
  EFTER verifierad nyckelinloggning), Node 22 + git + rsync + PM2 +
  nginx (beredd, ej aktiv). Repo via GitHub DEPLOY-NYCKEL (privat repo —
  servergenererad nyckel, kunden lägger till i repo-inställningarna).
  Byggskript: git pull → npm ci → next build. Arbetsstationens roll som
  byggmaskin upphör successivt.
- **FAS H2 — Keepalive/dev-instans flyttas hit:** den trötta datorns
  keepalive.sh + next dev-problem (telefon-refresh-roten, våg 78) försvinner
  när dev-instansen körs på Hetzner (pm2 + nginx reverse proxy, aldrig
  publik utan beslut). Mönstret keepalive.sh/Caddyfile-dev replikeras INTE
  okritiskt (KUNDINFRA-PLANENS klausul).
- **FAS H3 (villkorad, eget beslut):** staging-spegel av sajten på
  t.ex. dev.ak1nvestor.com + ev. tunga nattjobb (supabase-dumpar,
  batch-verktyg). Kräver DNS-beslut hos kunden.

## BESLUT 3 — SÄKERHETSKONTRAKT (hårt)

1. Dedikerad automationsnyckel `~/.ssh/hetzner_key` (ed25519, lösenordslös —
   byggautomation) — privat nyckel lämnar ALDRIG arbetsstationen.
2. Root-lösenordsinloggning stängs (PasswordAuthentication no) FÖRST när
   ak1a-nyckellogg verifierad. Konthanterad nyckel-inloggning kvar.
3. INGA hemligheter i repot: .env (Supabase ×3, MARKETSTACK) kopieras till
   servern vid behov med chmod 600 under /home/ak1a, ALDRIG committad.
4. UFW endast 22/80/443. fail2ban + unattended-upgrades på.
5. Skript i repot (data/infra/hetzner/) = granskade, idempotenta; alla
   externa hämtningar fast https-literal (deb.nodesource.com) — aldrig
   URL:er byggda ur variabler; localhost/privata adresser avvisas (Mimosa-
   kontraktet för nätanrop gäller även infra-skript).
6. ZCode når servern ENBART via ssh från arbetsstationens Bash — ingen
   portar-öppna-tjänster-policy ändras utan nytt styrelsebeslut.

## KUNDSTEG (endast dessa två — allt annat gör AI:n)

1. **NU:** lägg upp automationens publika nyckel på servern (engång):
   öppna valfri terminal PÅ DENNA DATOR och kör
   `ssh-copy-id -i ~/.ssh/hetzner_key.pub root@65.108.241.93`
   (rotenlösenordet frågas en gång). ALTERNATIV utan lösenord i terminal:
   Hetzner Cloud → serverns webbkonsol → klistra.pub-nyckeln i
   /root/.ssh/authorized_keys. Publik nyckel (publik av sedan kundens
   utskick): ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOT7tFPfqkCpNCgLAqrdMLBF4cKDpRmvhwe6ro+PZf1P zcode@ak1a-hetzner
2. **EFTER H1-start:** lägg serverns deploy-nyckel i GitHub-repot
   (NewUserAK/AK1 → Settings → Deploy keys) — AI:n genererar och visar den.

— Ordföranden, AI-styrelsen AK1A (autonom mandat 2026-09-07)

---

## FÖRSÖK 2 — CLOUD-API-TOKEN (2026-09-08, main-agenten)

Kunden levererade säkerhetsklassat material: IP (känt), IPv6-block
2a01:4f9:c011:99ec::/64 + 64-teckens token — sparat ENDAST i gitignorade
.env (HETZNER_API_TOKEN m.fl.; ALDRIG i repo/loggar/commits — rutin följd).

**Diagnos (trevärdes test):** (1) token AUTENTISERAR mot api.hetzner.com —
ogiltig token ⇒ 401, vår token ⇒ aldrig 401 + rate-limit-header aktiv;
(2) ändå 404 "Page not found" på ALLA endpoints (/servers, /ssh_keys,
/datacenters, /primary_ips, /firewalls — till och med publika som utan
token svarar 401 "token is required"); (3) inte heller root-lösenordet
(paramiko-test: AuthenticationException). **SLUTSATS: token skapad utan
projekt-scope (kontokontext i stället för projekt-kopplad) — Hetzner
gömmer alla resurser med 404 för sådana token. ÅTGÄRD (kund, ~30 s):
Hetzner Console → DET PROJEKT som innehåller servern → Security → API
tokens → skapa NY med read/write → skicka/ersätt i .env; gamla token kan
raderas. ALTERNATIV kvarstår: ssh-copy-id från terminalen (första vägen).**
Med korrekt token tar main-agenten över helt: rescue-läge (API) → min
publika nyckel in i authorized_keys → omstart → provisionering H1 (inget
kundsteg 1 kvar; kundsteg 2 = GitHub deploy-nyckel kvarstår).

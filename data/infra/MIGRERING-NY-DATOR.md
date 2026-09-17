# MIGRERINGSGUIDE — fortsätt på din nya dator

> Skapad av huvudagenten (arbetsstation 1) 2026-09-16.
> Kunden skall kunna fortsätta bygga AK1A från valfri dator.

## KVICKSTART (3 steg)

### 1. Öppna studion i webbläsaren (fungerar direkt — inget behövs)
```
URL:      https://lab.ak1nvestor.com/studio
Lösenord: AK1A-b47a45d1f1ab
```
Agenten lever på servern och minns ALLT. Tråden, målet, 119 innehållsposter, hela organisationen.

### 2. Kopiera SSH-nyckeln (för terminal-arbete)
Från denna dator, kopiera filen:
```
C:\Users\Public\ak1a-contabo-key
```
Till samma plats på nya datorn.

### 3. Klona repot (för kodändringar)
```bash
git clone ssh://ak1a@5.189.162.162/home/ak1a/AK1
```

## ALLA INLOGGNINGSUPPGIFTER

| Tjänst | URL | Inloggning |
|---|---|---|
| Studio (AI-chatten) | lab.ak1nvestor.com/studio | AK1A-b47a45d1f1ab |
| Admin-panel | lab.ak1nvestor.com/admin | AK1A-b47a45d1f1ab |
| Redaktör (blogg) | lab.ak1nvestor.com | 12d2d550486cdc5e55d111be |
| Chat-terminal | lab.ak1nvestor.com/chat | ak1a / AK1A-Lund422-Eken25 |
| SSH till server | ssh -i C:\Users\Public\ak1a-contabo-key ak1a@5.189.162.162 | (nyckelfil) |

## SERVER-FAKTA

| | |
|---|---|
| IP | 5.189.162.162 |
| OS | Ubuntu 24.04 |
| CPU/RAM | 8 vCore / 8 GB RAM |
| App | Next.js 16.3.2 (pm2 'ak1a' port 3000) |
| Daemon | pm2 'ak1a-pumpor' (16 pumpor, 30-sek-tick) |
| Webb | https://lab.ak1nvestor.com |

## VAD SOM LEVER PÅ SERVERN (behöver INTE flyttas)

- Hela kodbasen (git repo /home/ak1a/AK1)
- Databasen med ALL sessionhistorik (~/.zcode/cli/db/db.sqlite)
- Alla 119 innehållsposter (data/blogg-utkast/, data/kurser-tillagg/)
- Agentfabriken (verktyg/agentfabrik.mjs + 18+ manifest)
- Alla 16 pumpor (hjärta, kraschvakt, fabrik, synk, evighet, juridik...)
- Minnesfilerna (data/vakten/)
- Huvudtrådens bok (data/vakten/huvudtrad.json)
- Sticky-kontexten (data/vakten/trad-kontext.json — 260 890 tokens)
- Mål-state (data/vakten/mal-state.json)
- Audit-loggen (data/vakten/audit-logg.jsonl)
- Juridikgrindens larm (data/vakten/juridik-larm.json)

## VAD SOM LEVER LOKALT (behöver flyttas om du vill)

| Fil/Mapp | Vad den innehåller | Viktig? |
|---|---|---|
| ~/.zcode/cli/memories/ | Huvudagentens minnen (AK1A-projektet) | ✅ Kritisk |
| ~/.zcode/cli/db/ | Lokal sessionhistorik (din chatt med mig) | ✅ Viktigt |
| ~/.zcode/cli/config.json | Z Code konfiguration + API-nyckel | ✅ Kritisk |
| ~/.agents/skills/ | ak1a-analys skill (5×5×4 metodiken) | ✅ Viktant |

## SÅ FORTSÄTTER DU PÅ NYA DATORN

### Via webbläsaren (enkast — rekommenderas):
1. Öppna lab.ak1nvestor.com/studio
2. Logga in
3. Skriv "Hej, fortsätt" — agenten har TRÅDENS MINNE och vet allt

### Via Z Code CLI (för utveckling):
```bash
# Om du vill ha lokal klon:
git clone ssh://ak1a@5.189.162.162/home/ak1a/AK1
cd AK1
npm install

# För att skicka kod till prod:
git add -A
git commit -m "bygg från dator 2"
git push
# Prod-synken deployar inom 10 minuter automatiskt
```

### Berätta för nya Z Code-agenten:
```
Jag har en AK1A Research Lab som lever på Contabo-servern
5.189.162.162. Klonad repo finns på [sökväg]. Studion lever
på https://lab.ak1nvestor.com/studio (lösenord AK1A-b47a45d1f1ab).
Organismen — agentfabriken, mål-loopen, alla pumpor — kör på
servern 24/7. Jag vill fortsätta bygga härifrån.
```

## AK1A-ARKITEKTUREN I KORTHET

```
CONTABO-SERVERN (5.189.162.162) — ALLT lever här
├── Next.js app (pm2 'ak1a' :3000) → https://lab.ak1nvestor.com
├── Studio (AI-chatten) → /studio (webbläsare)
├── Agent (zcode-app-cli) → barnprocess, sessioner i db.sqlite
├── Agentfabriken → parallella bygg-agenter (manifest-kö)
├── 16 Pumpor → hjärta :x1, fabrik :x5, synk :x7, evighet :x8
│   ├── Målhjärtat (10 min) — återarmar mål, låser orders
│   ├── Kraschvakten (10 min) — räddningsbygg vid crash
│   ├── Prod-synken (10 min) — auto-deploy från git
│   ├── Evighetsmotorn (10 min) — aldrig stilla
│   ├── Juridikgrinden (1 h) — rådsförbudsscan
│   ├── Konfigintegritetsvakten (10 min) — crontab+pm2
│   ├── Feljägaren (15 min) — 7 jaktspår
│   ├── Scenariotestet (04:44) — 5 E2E-scenarier
│   ├── Minnesberedaren (6 h) — matar minnesextraktionen
│   └── Styrelseronden (3 h) — AI-organen sammanträder
├── Databas (db.sqlite) — ALL sessionhistorik
└── 119 innehållsposter — SEO-guider, kvartalsanalyser, kurser
```

## ÖVERFÖRING AV LOKALA FILER

Om du vill flytta dina lokala minnen till nya datorn:

### Paketera på denna dator:
```bash
# Skapa zip med allt viktigt
7z a -tzip ak1a-migration.zip ^
  "%USERPROFILE%\.zcode\cli\memories" ^
  "%USERPROFILE%\.zcode\cli\db" ^
  "%USERPROFILE%\.zcode\cli\config.json" ^
  "%USERPROFILE%\.agents\skills" ^
  "C:\Users\Public\ak1a-contabo-key"
```

### På nya datorn:
```bash
# Packa upp
7z x ak1a-migration.zip -o"%USERPROFILE%\"

# Flytta filerna till rätt platser
# (filerna hamnar i rätt mappar automatiskt om du packar upp i %USERPROFILE%)
```

## FELSÖKNING

| Problem | Lösning |
|---|---|
| Studion svarar inte | Vänta 2 min (omstart sker) eller kontrollera: ssh -i C:\Users\Public\ak1a-contabo-key ak1a@5.189.162.162 'pm2 status' |
| Agenten minns inte | Kontrollera: https://lab.ak1nvestor.com/api/studio/mal/status (målet skall vara aktivt) |
| Push nekas | git fetch + git merge + git push (servern kan ha nya commits från fabriken) |
| Kontext visar 0 | Vänta 30 sekunder — värme-systemet fyller kontexten från disk |

---
Skapad av AK1A huvudagent (våg 172) — 2026-09-16

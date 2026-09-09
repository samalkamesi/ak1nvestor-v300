# V86-AUTOHEAL — Självläkande drift för lab.ak1nvestor.com

**Datum:** 2026-09-08 (installerad 21:56–21:57 servertid)
**Agent:** V86-AUTOHEAL
**Server:** Contabo 5.189.162.162 (ak1a@, sudo NOPASSWD)
**Status:** INSTALLERAD OCH TESTAD — full självläkning verifierad i drift.

---

## Vad som installerades (exakt två serverändringar)

1. **Skript** `/usr/local/bin/ak1a-halsa` (`root:root`, `755`, bash) — hälsokontroll + självläkning.
2. **Cron-rad** i `/etc/crontab` (rad 27, exakt en rad tillagd, inga befintliga rader rörla):

```
*/5 * * * * root /usr/local/bin/ak1a-halsa >/dev/null 2>&1
```

Verifikation: `grep -c ak1a-halsa /etc/crontab` = 1; de tre befintliga `api/cron`-raderna (vagscan/nyheter/portfolj-uppfoljning) intakta på rader 24–26.

Inga ändringar i nginx-config eller filer i `~/AK1`. Ingen python används i skriptet.

## Skriptets logik (tre steg)

1. **HTTP-kontroll via nginx på 127.0.0.1** med `Host: lab.ak1nvestor.com`, 10 s timeout.
   *Viktigimplementationsdetalj:* nginx svarar **301** (http→https-redirect) i sitt friska tillstånd — bokstavligen "!= 200 → restart" skulle ha startat om en frisk app var 5:e minut. Därför gäller: **frisk = 200 direkt, ELLER 3xx som landar i 200 på lokal https-kontroll** (`curl -sk https://127.0.0.1/` med Host-header). Allt annat (000/502/504/…) = fel.
2. **Vid fel — eskaleringskedja, max 1 omstart per steg per körning (aldrig loop):**
   logga → `sudo -u ak1a -H pm2 restart ak1a` → vänta 8 s → kontroll igen → fortfarande fel → `systemctl restart nginx` + logga → vänta 5 s → kontroll → fortfarande fel → **enbart logga** (manuell granskning krävs).
   *pm2-startar om även stoppad process* (verifierat i test 2). pm2-kommandon körs som användaren `ak1a` — appens pm2-daemon ägs av ak1a, root har en separat daemon som inte ser appen.
3. **Vid 200 — enbart förebyggande kontroll:** `df /` ≥ 90 % ELLER pm2-minne (`pm2 jlist | jq '.monit.memory'`, ~70 MB normalt) ≥ 1500 MB → `pm2 restart ak1a` + logga orsak. Annars loggas en kompakt OK-rad.

Loggen självsänkas: växer den över 10 000 rader behålls senaste 5 000.

## Logg

`/var/log/ak1a-halsa.log` (root, skrivs av skriptet). Läs med:

```bash
ssh -i ~/.ssh/contabo_key ak1a@5.189.162.162 'sudo cat /var/log/ak1a-halsa.log'
# senaste ingreppen:  sudo tail -20 /var/log/ak1a-halsa.log
# bara larm/ingrepp:  sudo grep -E "FEL|FÖREBYGGANDE|efter" /var/log/ak1a-halsa.log
```

Radformat: `ÅÅÅÅ-MM-DD TT:MM:SS <HÄNDELSE> (http=…[->https=…]) disk=X% mem=YMB`.
- `OK (http=301->https=200) …` = frisk ctrl (normalrad var 5:e minut).
- `FEL (…) — steg 1: pm2 restart ak1a` = ingrepp påbörjat.
- `OK … efter pm2-restart — självläkt` = lyckad självläkning.
- `FEL kvar … efter nginx-restart` = misslyckad självläkning — åtgärdas manuellt.

## Testresultat (2026-09-08 21:57, lågtrafik)

**Test 1 — frisk körning:** `sudo /usr/local/bin/ak1a-halsa` → exit 0, logg: `21:57:01 OK (http=301->https=200) disk=5% mem=69MB`. App orörd (uptime oberörd, 0 restarts).

**Test 2 — kontrollerat fel-test** (~11 s nere-tid, kunden informerad): `pm2 stop ak1a` → sajten gav 502 → skriptet kördes (8,7 s totalt) → `pm2 restart` startade den stoppade appen (ny pid 6400) → **lokal https = 200 och publik https://lab.ak1nvestor.com = 200 efter skriptet**. Loggen visar ingreppet:

```
2026-09-08 21:57:18 FEL (http=301->https=502): sajten svarar ej 200 — steg 1: pm2 restart ak1a
2026-09-08 21:57:26 OK (http=301->https=200) efter pm2-restart — självläkt
```

**Test 3 — cron-miljö:** skriptet kört med cron:s minimala PATH (`env PATH=/usr/bin:/bin`) → exit 0, OK loggad. Ingen beroende av login-shell.

## Driftnoteringar

- Skriptet kör var 5:e minut via cron (root). Max 1 pm2-omstart + 1 nginx-omstart per körning → värsta fall 12 omstarter/timme vid hårt fel, men aldrig restart-loop inom samma körning.
- Om `FEL kvar … efter nginx-restart` dyker upprepat i loggen: manuell granskning (disk full, app-crash-loop, port 3000 upptagen etc.).
- Gränser justeras i skriptets variabler `DISK_LIMIT_PCT` (90) och `MEM_LIMIT_MB` (1500).

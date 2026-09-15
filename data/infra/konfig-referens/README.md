# Konfig-referens — git-versionerad norm för serverns driftkritiska konfiguration

**Beslut:** fullmaktssammanträdet 2026-09-15, styrelsens beslut punkt 6.
**Vakt:** `verktyg/konfigintegritet-vakt.mjs` (körs av pumpor-daemonen var 10:e minut, `min % 10 === 9` → xx:09, :19, :29, :39, :49, :59).

## Varför detta finns

Serverns driftkritiska konfiguration — användarens crontab och pm2-processuppsättningen — har tidigare levt bara på servern. Om en rad försvinner (cron raderad, pm2-process nedstannad, "fungerade förra veckan") upptäcks det först när något redan är trasigt. Från och med nu finns normen **här i repot**, och en mekanisk vakt jämför verkligheten mot normen var 10:e minut och larmar vid drift.

## Filerna

| Fil | Innehåll |
|---|---|
| `crontab.reference` | De rader som SKA finnas i användarens crontab (`crontab -l` på contabo-servern). Rader som börjar med `#` är dokumentation och jämförs aldrig. |
| `pm2-processer.reference` | De pm2-processer som SKA finnas och vara `online` (ett namn per rad; första token är namnet). |

## Hur verifieringen går till

1. **crontab:** `crontab -l` läses på servern och jämförs rad-för-rad mot `crontab.reference` (blanksteg trimmas, kommentarsrader ignoreras).
2. **pm2:** `pm2 jlist` läses; varje namn ur `pm2-processer.reference` måste finnas med status `online`.
3. **Utfall:**
   - **Saknad rad / saknad eller ej online process** ⇒ larmrad (append-only) i `data/vakten/konfig-larm.jsonl` + `[KONFIG-DRIFT]`-rad på stdout (syns i pm2-loggen för `ak1a-pumpor`).
   - **Allt grönt** ⇒ en enda grön rad i samma journal.
   - Okända *extra* crontab-rader utanför referensen noteras som INFO på stdout — inte larmnivå (beslut 6 omfattar saknade rader/processer).
   - **Exit-kod är alltid 0** — vakten är inte en byggrind; larmet ska synas i journalen, aldrig krascha daemonen.

## Maskning av hemligheter

Crontaben innehåller en rad med databas-anslutningssträng (host, användare, lösenord). I referensen är hela det citerade värdet ersatt med platshållaren **`<DATABASE_URL>`**. Vakten jämför **radformen** — allt runt platshållaren, där platshållaren fungerar som joker — aldrig det faktiska värdet.

**Regel: ALDRIG riktiga hemligheter i dessa filer (eller någon annan fil i repot).** Vakten maskerar dessutom själv allt den skriver ut från servern (connsträngar, `password=…` → `<HEMLIG>`) som extra skydd. Vakten läser inga nyckelfiler och behöver inte `.env.production.local` — den kör bara systemkommandona `crontab -l` och `pm2 jlist`.

## Ändringsprotokoll

Ändras crontab eller pm2-uppsättningen på servern:

1. Uppdatera motsvarande `.reference`-fil **i samma ändring** (samma commit).
2. Committa enligt repo-protokollet och leverera.
3. Verifiera: `node verktyg/konfigintegritet-vakt.mjs` på servern ska ge `GRÖN`.

## Köra vakten manuellt ( första körningen / felsökning )

```bash
ssh -i /c/Users/Public/ak1a-contabo-key -o BatchMode=yes ak1a@5.189.162.162 \
  'node /home/ak1a/AK1/verktyg/konfigintegritet-vakt.mjs'
```

Utskrift: `GRÖN konfigintegritet — crontab 2/2 · pm2 4/4 online (ak1a, ak1a-test, ak1a-pumpor, pulsvakt)` eller `[KONFIG-DRIFT] …`-rader. Journal: `data/vakten/konfig-larm.jsonl`. Körningslogg: `data/vakten/konfigintegritetvakt.log` (retention 200 rader).

## Syskon

- `/etc/crontab` (system-wide, root-fält) dokumenteras i `data/infra/contabo/crontab-korrekt.txt` — dit hör rader som `ak1a-halsa` och innehålls-cronen; detta görs medvetet separat eftersom `/etc/crontab` kräver sudo att applicera.
- Övriga vaktjournaler ligger samlade i `data/vakten/` (se t.ex. `integritet-larm.jsonl`).

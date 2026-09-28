# DESK-U1 — Hälsosvit för /desk-kedjan (verktyg/desk-halsa.mjs)

**Datum:** 2026-09-28 · **Omgång:** v198 fabriksmanifest `v198-desk-a-o`, uppgift U1
**Roll:** BYGGARE (agentfabriken) · **Ägarskap:** ENDAST `verktyg/desk-halsa.mjs` + detta protokoll
**Kedja som bevakas:** nginx (landning exakt `/desk/` + proxy `/desk/*` → 127.0.0.1:6080, basic auth) → websockify (web-rot `/home/ak1a/desk-web`) → Xvnc `:10` (1280x720) + openbox (maximerar allt) + ZCode-AppImage.

---

## Vad som byggdes

`verktyg/desk-halsa.mjs` — hela /desk-kedjan i EN kontroll. Ren node-ESM
(`node:child_process` execFileSync, `node:fs`, `node:https`), inga beroenden,
inga skalsträngar. Nio kontrollrader med PASS/FAIL/SKIP:

| Kontroll | Vad den bevisar |
|---|---|
| `http-landning-401` | GET `/desk/` UTAN auth => exakt 401 (basic auth-bommen lever) |
| `systemd-enheter` | `systemctl is-active zdesk-xvnc zdesk-wm zdesk-zcode zdesk-novnc` => fyra `active` |
| `x-geometri` | `xprop -root _NET_WORKAREA` med `DISPLAY=:10` => exakt 1280x720 |
| `fonstermaximering` | `_NET_CLIENT_LIST` + `xprop -id <id> _NET_WM_STATE` => MAXIMIZED_VERT **och** HORZ på ALLA fönster (openbox-kontraktet); tom klientlista => SKIP (dokumenterat) |
| `http-auth-landning` | MED `DESK_AUTH` satt: GET `/desk/` => 200 + `<title>` innehåller `ZCode-skivbordet`; annars SKIP |
| `http-auth-vnc-html` | MED `DESK_AUTH`: GET `/desk/vnc.html` => 200; annars SKIP |
| `http-auth-ui-js` | MED `DESK_AUTH`: GET `/desk/app/ui.js` => 200; annars SKIP |
| `webrot-vnc-html` | `/home/ak1a/desk-web/vnc.html` existerar (fs-läs) |
| `webrot-defaults-json` | `/home/ak1a/desk-web/defaults.json` är giltig JSON (JSON.parse) |

**Kontrakt:** sista raden exakt `RESULTAT: N/M PASS` (M = PASS+FAIL, SKIP räknas
ej i M) · exit 0 endast utan FAIL · tak 30 s (per HTTP-anrop 6 s, värstafall
~24 s; mätt körtid 1,4–4,9 s).

**Säkerhetskontrakt:** lösenord gissas ALDRIG, hårdkodas ALDRIG,
`/etc/nginx/.htdesk` läses ALDRIG, `DESK_AUTH`-värdet loggas ALDRIG. Sviten är
ren läsning — dödar/omstartar INGA processer, skriver INGA filer.

## Fynd under bygget (dokumentation, inga fel)

1. **Title-kontrollen gäller LANDNINGEN, inte noVNC-sidan.** noVNC:s egna
   `vnc.html` har titeln "noVNC", men landningssidan på exakt `/desk/` serveras
   av nginx ur `/var/www/desk/index.html` med titeln
   **"AK1A Lab — ZCode-skivbordet"** — vilket innehåller märket
   `ZCode-skivbordet`. Kontrollen `http-auth-landning` är därför riktig mot
   landningssidan; detta är noterat i svitens huvudkommentar.
2. **`defaults.json` är ett tomt objekt `{}`** — giltig JSON och normalt för
   noVNC (inga överskrivningar = inbyggda standardvärden gäller). PASS med
   förklarande detaljrad, inte alarmerande.
3. **Live-läget vid leverans:** alla fyra zdesk-enheter `active`, arbetsytan
   exakt 1280x720, ett fönster (0x400003) maximerat VERT+HORZ, `/desk/` utan
   auth => 401. Kedjan är GRÖN.

## Determinism (dokontrakt)

Allt utom de två HTTP-kontrollgrupperna (`http-landning-401` + auth-trion) är
lokala processanrop/filäsningar — deterministiska. HTTP-kontrollerna går via
internet mot `https://lab.ak1nvestor.com/` (kundens telefonperspektiv):
nätverksfel/timeout ÄR ett kedjefel och FAILar ärligt; redirecter följs EJ
(exakta svar förväntas, 3xx => FAIL).

## KVD-bevis

`node --check verktyg/desk-halsa.mjs` => exit 0. Körning (`node
verktyg/desk-halsa.mjs`, 2026-09-28 15:54 UTC) => exit 0, **RESULTAT: 6/6
PASS**. Hela utdatan ordagrant:

```text
=== DESK-HÄLSA — /desk-kedjan i EN kontroll ===
Bas https://lab.ak1nvestor.com · display :10 · web-rot /home/ak1a/desk-web · 2026-09-28T15:54:00.501Z
Auth-läge: DESK_AUTH ej satt (auth-trion blir SKIP)
PASS http-landning-401: GET /desk/ utan auth => 401 (auth-bommen lever)
PASS systemd-enheter: fyra enheter active (zdesk-xvnc, zdesk-wm, zdesk-zcode, zdesk-novnc)
PASS x-geometri: _NET_WORKAREA = 0,0,1280,720 => exakt 1280x720
PASS fonstermaximering: 1 fönster maximerade både VERT och HORZ (0x400003)
SKIP http-auth-landning: DESK_AUTH ej satt — auth-kontrollerna kräver användare:lösenord i miljövariabeln (lösenord gissas/hårdkodas ALDRIG, .htdesk läses ALDRIG)
SKIP http-auth-vnc-html: DESK_AUTH ej satt — auth-kontrollerna kräver användare:lösenord i miljövariabeln (lösenord gissas/hårdkodas ALDRIG, .htdesk läses ALDRIG)
SKIP http-auth-ui-js: DESK_AUTH ej satt — auth-kontrollerna kräver användare:lösenord i miljövariabeln (lösenord gissas/hårdkodas ALDRIG, .htdesk läses ALDRIG)
PASS webrot-vnc-html: /home/ak1a/desk-web/vnc.html existerar (17810 byte)
PASS webrot-defaults-json: /home/ak1a/desk-web/defaults.json är giltig JSON (tomt objekt — noVNC:s inbyggda standardvärden gäller)
Summa: 6 PASS, 0 FAIL, 3 SKIP · 4.9 s (tak 30 s)
RESULTAT: 6/6 PASS
```

**Ärligt rött:** ett framtida FAIL är ett äkta kedjefel med förklaring på raden
— nivåsänkning sker ALDRIG. Rättning är EGEN fabriksuppgift (rapportera i
protokoll, lås sviten rapportera). För full täckning av auth-trion: kör
`DESK_AUTH='user:pass' node verktyg/desk-halsa.mjs` i en miljö med
desk-autentiseringsuppgifterna (M blir då 9).

## Gränser som respekterats

Berörda filer: ENDAST `verktyg/desk-halsa.mjs` + detta protokoll. Rör ALDRIG:
`~/.zcode/**`, `/etc/**` (läst ENDAST nginx-konfigureringen för diagnos —
`.htdesk` öppnades aldrig), `/usr/**`, `/root/**`, `/var/www/**`,
`/home/ak1a/desk-web/**` (läsning av `vnc.html`/`defaults.json` är svitens
kontroll 6), `.env*`, nycklar, R2-ytor. Inga processer dödades/omstartades. Ingen
`npm ci`/`npm install`/`npm run build`/`npx tsc` — typkontrollen är hela repets
pre-commit-grind (dessa filer är .mjs/.md, utanför src/**).

**Commit:** `studio: v198-u1 desk-halsasvit — 6/6 PASS [fabrik]` (utkvitto-hash
i fabriksloggen).

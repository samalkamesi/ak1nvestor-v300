// dokvåg s9-u3 3/3 (manifest auto-s9-1789709700201) — SYSTEMKARTAN-uppdatering
// Clobber-kur: färsk diskläsning + en-träff-ankare (avbryter HELT vid avvikelse) + EN skrivning.
import { readFileSync, writeFileSync } from "node:fs";

const P = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let t = readFileSync(P, "utf8");
const gjorda = [];

function byt(namn, fran, till) {
  const n = t.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ANKARE-FEL ${namn}: ${n} träffar (kräver exakt 1) — AVBRYTER, ingen skrivning.`);
    process.exit(1);
  }
  t = t.replace(fran, till);
  gjorda.push(namn);
}

// ── 1. Ny UPPDATERING-sektion före ÖVERSIKT ──────────────────────────────
const nySektion = `## UPPDATERING 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201 — E26 + C15 + E34 diffade mot verkligheten; kollisionspivot från E35+E37)

Objektval: anspråk FÖRE mätning (data/vakten/auto-s9-1789709700201-u3-ansprak.md,
05:36Z — E35+E26+E37, störst rörelse). KOLLISION: syskon u2:s commit 58cc326e
07:44:59 levererade E35+E37 medan mätningarna pågick — deras sektioner orörda
(disk-först-presedensen); mina oberoende tal bokförs som KORSVALIDERING nedan.
PIVOT: E26 (egen anspråkspost, orörd av syskonen) + C15 + E34 (båda med
verifierbar rörelse EFTER senaste passning). Varje rad MÄTT i arbetsytan
2026-09-18 ~07:3x–07:5x lokal — svitkörningar med sanna exitkoder, egen full
vaktkörning, wc/ls/grep/git, curl mot loopback, processlistor; protokoll-
korsläsning ENDAST som sekundärkälla.

### E26 — godkännandehärdningen KODVERIFIERAD (levererad 07:18, EFTER 02:3x-passningen)

| Mått | Kartan (02:3x) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Härdningstak | outtalt (våg 91 A2:s KÖRS DIREKT-post öppen) | **KODAD OCH EGENLÄST** (a20f15fa, protokoll o64-godkannande-hardningstak-s8.md): publicera-ruttens SKYDDSLAGER steg 1b — 6 authade försök/minut, sittande EFTER requireAdmin (anonym trafik kan aldrig förbruka fönstret och DoS:a kundens R2-knapp); val-ytan (route.ts:25) — 20 authade POST:er/minut, GET takfritt; 429 bär Retry-After 60 och pushar aldrig (takUppnaatt :61) |
| Audit-åtgärden | 8 åtgärdstyper | **+ "publicera-avvisad"** (skrivAudit "kund" :91) — append-only kvitto per avvisat publiceringsförsök (429/404/409/400); **0 förekomster ännu** (egen grep — flödet kodbevisat, ej driftbevisat: R2-knappen förblir kundens) |
| Audit-loggen | 312 884 B / 1 199 r | **336 540 B / 1 281 r** (egen wc; sista raden = DETTA barns uppgift_start — fabrikens driftlogg lever; 452 start + 430 klar + 206 katalogsynk + 181 deploy) |
| Svit + live | 14/14 · 401 ×2 (02:3x) | **14/14 exit 0 igen** (egen körning) · requireAdmin **401** på /api/admin/variabler + /api/studio/godkannande (egna sonder) |
| Granskningsköns mått | FLYTTKLAR 63 utkast (gap 5 brittare) | **FLYTTKLAR 0** — mätetalet DÖTT: utkastmappen omorganiserad till GRANSKNINGSKO-SAMMANSTALLNING.md (förnyad 05:22Z) + JSON-uppladdningsformat (52 json + 2 md i roten, s3-vågorna) |
| Juridik-FP | 17 VARNINGAR | **22 VARNINGAR** (larmfil 05:37Z, 0 FEL — kön växer vidare, nu på .json-utkast via tvärfall-regeln) |

| E26 | LEVER 8 → **LEVER 8** | Härdningstaket = belastningsrobusthet på kodbevisnivå (0 driftfall ännu — R2); kärn-gapen orörda (manuell spegling, publicera-E2E, IP-block, Elliott-test); FLYTTKLAR-mätetalet ersatt av kö-struktur-census. Ingen poängrörelse (E33/B14) |

### C15 — kön 175 → 199 filer med FÖRNYAD kundvy; publiceringsstocken orörd (R2)

| Mått | Kartan (09-17) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Utkastköten | 175 filer (rot 48 · m9-ko 7 · granskning 77 · kvartal 43) | **199 filer** (rot 54 · m9-ko 7 · granskning 89 · kvartal/2026-q3 49 — egen find-census; +24 på ett dygn: s4-läspaketen 37–39 + s1-mx + s3-översättningarna) |
| Kundens kö-vy | sammanställningen förnyad 09-17 16:58 | **FÖRNYAD IGEN 05:22Z idag** (mtime) — "åldrande vy"-gapet hålls stängt av leverantörerna själva |
| Publicerat | 55 (sedan 09-14) | **55 orörda** (egen ls; R2 — kundens beslut) · /blogg 200 (egen sond) · B2-rutten metodbevakad (GET /api/admin/blogg/publicera = 405, ej 404 — egen sond) |

| C15 | LEVER 8 → **LEVER 8** | Kö-växten + förnyade kundvyn är processhälsa; flaskhalsen förblir publiceringsuttaget (kundens klick, R2) och B2-E2E saknas fortfarande — ingen score-rörelse (B13) |

### E34 — nattens DR-födelsebevisövningar + dagens gröna deployfönster; driftminnet maskinellt i feljakt-ledgern

| Mått | Kartan (02:3x) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| DR-övningar | s10-köposter bokade | **S10-U1 + S10-U2 LEVERERADE I NATT** (DRIFTSBOKEN :1830 + :1863): blad 8 bevisat i sin födelsetimme, RPO-kurvans yngsta punkt, dagsteget dekomponerat — pump-noll STÄNGD, kvartsklocke-förutsägelse infriad EXAKT, WAL-platå; protokoll DR-OVNING-2026-09-18-FODELSEBEVIS.md + 2 maskinella |
| Deployfönstret | prod@5d5bbd1f 00:10Z | **prod@e5eca448 05:29:45Z** ("4 commits — HTTPS 200 verifierat", audit-kvitto egen grep) · BUILD_ID BBrkvx9Vkuq56S_7jW9CF (egen läsning) · next-server 16.3.5 i processlistan (egen ps) · pm2-omstart i fönstrets spår · 12 deploy-events idag |
| Patch-kön | [] + 2 ok-kvitton | **OFÖRÄNDRAT** ([] + 2 rader next/eslint 16.3.5 i data/vakten/patch-kvitton.jsonl, egen wc) |
| Driftminnet | kraschvakten + DRIFTSBOKEN | **+ feljakt-ledgern** (o65): 69 salvor ur 5 källloggar dom-kodifierade (18 kraschvakt-trigg · 15 ram-/byggfönster · 24 agentträd · 6 deploybygg · 5 deployfönster · 1 okänd), bygg-OOM ×3 (04:23/16:30/17:30 09-16–17) dokumenterade |

| E34 | LEVER 9 → **LEVER 9** | DR-övningarna fördjupar bevisen (födelsebeviset stående praxis — nästa blad 02:30 09-19) utan nytt rot-gap; deployfönstret grönt; kvar-listan oförändrad (ISR 12/44, hybrid-sync, Storage-restore, MIGRERING-lösenordet, idempotensgrinden) |

### KORSVALIDERING E35 + E37 (syskon u2:s 58cc326e — oberoende tal, identiska domar)

Egen full vaktkörning **12/12 PASS · 0 fel · 0 manuella · GRÖN 05:41:29Z**
(2 min efter u2:s 05:39:43Z — samma dom) · motorvalidering **107/0/0 (5,7 s)**
· testsviter **90** (egen ls) · stormar-sviten **20/0** (egen körning, domklasser 4)
· feljakt-ledgern **245 rader / 42 767 B** (egen wc) · SSR500-sviten **25/0/0**
(egen) · o56-koden prefetch={false} på home-section.tsx:313+324 med
o17/o41/o49-rotkommentar (egengrep) + hem-HTML:n bär 0 prefetch-linktaggar
(egen sond) · live / /en /ar /kurser 200 på 11–17 ms (egna sonder).
METODFYND (transparens): mätfönstergrindens pgrep FICK inte bära mönstertexten
okammad i eget argv — första grindsvaret var SJÄLVMATCHNING ("bygget aktivt"
medan processlistan visade vilande prod; kuren parentes-form \`next[ ]build\`
+ fullsekvens-kontroll i processlistan) — o55 §5:s klass lever hos varje ny
mätare; bokas som perpetuell metodregel.

Snitt **7,6 / 288 / 38 OFÖRÄNDRAT** (tre preciseringsdokvågar utan poäng).
Kö till huvudagenten: (1) o63-köposten (E37, u2 bokade — herons TREDJE länk);
(2) juridikgrindens citat-vs-råd-kur hastas (22 VARNINGAR på köns nya
JSON-format); (3) feljakt-ledgerns nyckelkollisions-härdning (verktygsägaren);
(4) B2-E2E förblir kundens första knapptryckning (R2); (5) E34:s kvar-lista
(ISR 12/44 främst).

`;

byt("UPPDATERING-insatt", "## ÖVERSIKT — 38 system", nySektion + "## ÖVERSIKT — 38 system");

// ── 2. E26-sektionen: stämpel + nytt stycke efter 09-17-stycket ──────────
byt(
  "E26-stampel",
  "## E26. Admin-panelen — LEVER — 8/10 *(uppdaterad 2026-09-17)*",
  "## E26. Admin-panelen — LEVER — 8/10 *(uppdaterad 2026-09-18)*"
);
byt(
  "E26-stycke",
  "GDPR-DATAKARTA.md lever (24 026 B). Score 8 kvar.*",
  `GDPR-DATAKARTA.md lever (24 026 B). Score 8 kvar.*

*Uppdatering 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201):
s8-u1:s godkännandehärdning (a20f15fa 07:18, EFTER 02:3x-passningen)
KODVERIFIERAD eigenhändigt: härdningstak EFTER requireAdmin — publicera
6 authade försök/minut · val-ytan 20 authade POST:er/minut · GET takfri ·
429 med Retry-After 60 som pushar aldrig; NY audit-åtgärd "publicera-avvisad"
(skrivAudit :91 — kvitto per avvisat försök; 0 driftfall ännu, R2-knappen
kundens); audit-loggen 336 540 B / 1 281 r (egen wc); sviten 14/14 exit 0;
requireAdmin 401 live ×2; rutter 25 + sessionresterna 77 orörda. MÄTEALSBYTE:
FLYTTKLAR-stocken 63 → 0 (utkastkön omorganiserad till GRANSKNINGSKO-
SAMMANSTALLNING + JSON-format, se C15) — gamla talet dött; juridik-FP
17 → 22 VARNINGAR (05:37Z, 0 FEL). Score 8 kvar (E33/B14-precedensen).*`
);

// ── 3. C15-sektionen: stämpel + nytt stycke + nyckelfiler-ciffror ────────
byt(
  "C15-stampel",
  "## C15. Bloggen + publiceringsflödet — LEVER — 8/10 *(uppdaterad 2026-09-17)*",
  `## C15. Bloggen + publiceringsflödet — LEVER — 8/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201):
kö-census 199 filer (rot 54 · m9-ko 7 · granskning 89 · kvartal/2026-q3 49 —
+24 på ett dygn: s4-läspaketen + s1-mx + s3-översättningarna; egen find);
GRANSKNINGSKO-SAMMANSTALLNING.md förnyad 05:22Z idag (kundens kö-vy lever);
publiceringsstocken 55 orörd (R2); /blogg 200 + B2-rutten metodbevakad
(GET = 405, ej 404) — egna sonder. Flaskhalsen förblir uttaget (kundens
klick) + B2-E2E. Score 8 kvar (B13-precedensen).*`
);
byt(
  "C15-nyckelfiler",
  "data/blogg-utkast/ (11 JSON + m9-ko/ 3 + kvartal/2026-q3/ 22 = 12 bolagspaket + 10 kalendrar, mätt 09-16 + granskning/)",
  "data/blogg-utkast/ (199 filer: rot 54 · m9-ko/ 7 · granskning/ 89 · kvartal/2026-q3/ 49, mätt 09-18)"
);

// ── 4. E34-sektionen: stämpel + nytt stycke ───────────────────────────────
byt(
  "E34-stampel",
  "## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-17)*",
  `## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201):
S10-U1 + S10-U2:s nattdokvåg LEVERERADE (DRIFTSBOKEN :1830/:1863): blad 8
bevisat i födelsetimmen, RPO-kurvans yngsta punkt, dagsteget dekomponerat
(pump-noll STÄNGD), kvartsklocke-förutsägelse infriad EXAKT, WAL-platå —
födelsebeviset stående praxis (nästa blad 02:30 09-19). Dagens deployfönster
grönt: prod@e5eca448 05:29:45Z med HTTPS-200-kvitto, BUILD_ID BBrkvx9 (egen
läsning), next-server 16.3.5 i processlistan (egen ps), 12 deploy-events
idag; patch-kön fortfarande [] + 2 ok-kvitton. Feljakt-ledgern (o65)
kodifierar driftminnet maskinellt — 69 salvor ur 5 källloggar, bygg-OOM ×3
dokumenterade. Score 9 orörd; kvar-listan oförändrad (ISR 12/44, hybrid-sync,
Storage-restore, MIGRERING-lösenordet, idempotensgrinden).*`
);

// ── 5. ÖVERSIKT-rader ─────────────────────────────────────────────────────
byt(
  "ÖVERSIKT-E26",
  "audit-loggen 312 884 B / 1 199 r (+21 %/dygn); sviten 14/14 + requireAdmin 401 live (egen mätning 09-18); juridik-FP-kön + FLYTTKLAR växer (gap 5 brittare); kvar: manuell spegling, publicera-E2E (R2-knapp orörd — val-filen finns ej), IP-block |",
  "godkännandehärdningen KODAD+EGENLÄST 09-18 (o64: tak EFTER auth — publicera 6/min · val-ytan 20/min POST · GET takfri · 429 Retry-After 60; audit-åtgärd publicera-avvisad, 0 driftfall = R2-knappen kundens); audit-loggen 336 540 B / 1 281 r; sviten 14/14 + requireAdmin 401 live ×2 (egen mätning 09-18); FLYTTKLAR-mätetalet DÖTT (63→0, kö-omorganisationen), juridik-FP 17→22; kvar: manuell spegling, publicera-E2E, IP-block |"
);
byt(
  "ÖVERSIKT-C15",
  "| C15 | Bloggen + publiceringsflödet | Innehåll | LEVER | 8 | Läge B STÄNGT (A består, beslut 2026-09-07); B2-publiceringsknapp lever (v82); kvar: B2-E2E, OG default tills deploy |",
  "| C15 | Bloggen + publiceringsflödet | Innehåll | LEVER | 8 | Läge B STÄNGT (A består, 09-07); B2-knappen lever metodbevakad (GET 405, ej 404 — egen sond 09-18); kön 199 filer (rot 54 · m9-ko 7 · granskning 89 · kvartal 49; +24/dygn) med FÖRNYAD kundvy (GRKO 05:22Z); 55 publicerade orörda (R2); kvar: B2-E2E (kundens knapp), OG default tills deploy |"
);
byt(
  "ÖVERSIKT-E34",
  "prod 200 ×4 egen (/, /kurser, /blogg, /studio); pm2 online; kvar:",
  "prod 200 ×4 egen (/, /kurser, /blogg, /studio); 09-18 DAG: deploy prod@e5eca448 05:29:45Z HTTPS-200-kvitto + BUILD_ID BBrkvx9 + next-server 16.3.5 live (egna mätningar) + nattens S10-födelsebevisövningar (blad 8 i födelsetimmen, pump-noll STÄNGD, WAL-platå) + driftminnet maskinellt i feljakt-ledgern (o65: 69 salvor, bygg-OOM ×3); pm2 online; kvar:"
);

writeFileSync(P, t);
console.log(`OK — ${gjorda.length} byten genomförda: ${gjorda.join(" · ")}`);

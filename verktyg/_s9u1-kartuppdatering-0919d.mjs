#!/usr/bin/env node
/**
 * _s9u1-kartuppdatering-0919d.mjs — SYSTEMKARTAN-dokvåg E30 (manifest auto-s9-1789847706174).
 * Clobber-kur (s9-u2/s9-u3-läxan): färsk läsning + en-träff-ankare + abort-grind +
 * EN atomär skrivning per fil. Worklog appendas i samma körning.
 */
import { readFileSync, writeFileSync, renameSync } from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";

const kalla = readFileSync(KARTA, "utf8");

/** Byt ut en sträng som MÅSTE finnas exakt en gång. */
function byt(text, fran, till, etikett) {
  const n = text.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT: ankarträffar "${etikett}" = ${n} (väntat 1) — INGET skrevs.`);
    process.exit(1);
  }
  return text.replace(fran, till);
}

const UPD = `## UPPDATERING 2026-09-19 (dokvåg s9-u1, manifest auto-s9-1789847706174 — E30 B2B/AK1A PRO återdiffad; fjärde passningen + förra manifestets köade /pro-mätning verkställd)

Fabriksagent s9-u1 (1 system; anspråk disk-först data/vakten/auto-s9-1789847706174-s9-u1-ansprak.md). VAL: E30 = äldsta fria stämpeln (sektion 09-17; samtliga övriga 37 system bär 09-18/09-19) OCH s9-u2 (manifest …824900585) bokförde uttryckligen "/pro-mätningen" som kö åt E30-revisionen. READ-ONLY-doktrin (R2: E30 väntar jurist + kund — ingen flagga, inget pris, ingen publicering ändrad; endast mätning). Allt EGENMÄTT 21:5x–21:59 lokal.

U2:S /pro 500 LÄKT — ROTEN STYRKT SOM BYGGKLASS: /pro 200 (text/html, "Under uppbyggnad"-substitutet + noindex) · /pro/ → 308 → /pro (normal slash-normalisering) · samtliga 5 undersidor (admin/analys/klienter/priser/rapporter) 200 — mot u2:s 500 (text/plain 21 byte) kl 15:3x lokal. Körande .next/BUILD_ID fWWGyYiwzun6sDzUoWoVO mtime 21:50:05 lokal tidsstyr läkningen till ett färskt bygg; x-nextjs-cache HIT + x-nextjs-prerender 1 + s-maxage 300 = ISR-serverad, SAMMA serveringsklass som D23:s tier-sidor ⇒ /pro-toppytan hållbar men känslig för halvskrivna .next-träd (o97-läkeklassen täcker: prod-synkens nästa gröna bygg). KODSTILLA bevisad: 0 commits på E30-vägarna sedan 09-17 (b2b-status.ts · lib/pro · (huvud)/pro · api/pro · komponenter) + B2B-datamappen 7 filer frusna 09-10.

STÄNGNINGSDOKTRINEN HEL I SEX LÄGEN (allt mätt): (1) flaggan AV i tre lägen — NEXT_PUBLIC_B2B_AKTIV 0 namnträffar i .env/.env.local/.env.production + 0 pm2-variabler + koden kräver ==="1" (b2b-status.ts:16; Vercel passiv backup, prod-sanning = Contabo); (2) robots stänger /pro/admin i SAMTLIGA 16 block (User-Agent: * + 15 AI-bots: GPTBot · OAI-SearchBot · ChatGPT-User · ClaudeBot · Claude-User · Claude-SearchBot · Claude-Web · PerplexityBot · Perplexity-Searchbot · Google-Extended · Applebot-Extended · meta-externalagent · Amazonbot · CCBot — metodnotis: de 15 "lika" Disallow-raderna är ETT per botblock = AI-SEO-design, INTE dubblettfel); (3) sitemap 0 äkta /pro-URL:er (11 substring-träffar = /profil + 10 × /dataset/*/prognos-tillvaxt — falska positiver, metodnotis åt framtida dokvågare); (4) /pro + /pro/admin båda noindex,nofollow live; (5) sidkroppen NULL vid flaggav (page.tsx:122) — layouten är hela /pro-trädets robots-källa (layout.tsx:56) och renderar substitutet; (6) ingen toppväljare på /pro i SSR ("Privatperson" 1 träff på / men 0 på /pro — kroppen null, inget B2B-innehåll läcker).

GRINDARNA LIVE: /api/pro/admin 401 (auth-vakten lever) · /api/pro/analys 405 (POST-only-kontraktet intakt) · /api/pro/dpa-mall 200 = AVSIKTLIGT (våg 66 G2: publicerar DPA-mallen som dokument); mallen bär själv "UTKAST — under juristgranskning (K-B2B:1)" — utkast-statusen ÄR R2-väntan, inget skarpt avtal läckt.

SVITER EGENA: testa-b2b-grind exit 0 grön · testa-pro-screening 26/0 · testa-demoklient-data 16/1 — G1 kvarstår exakt ("minst ett fullständigt AKM2Resultat — 0 st"; gap 4 oförändrad sedan 09-15).

TALRÄTTNING: kartans "src/app/api/pro/** (4 rutter)" = 3 route.ts i verkligheten (admin/analys/dpa-mall; git --diff-filter=D: ingen fjärde någonsin). Sidantal 6 + komponenter 13 + V86-filen bär — alla bekräftade. SIDOFYND: arProYta-regern LEVER i verktyg/kvalitetsvakt.mjs:346 (PRO_YTA_RE + gruppnormalisering) — kartans 09-16-påstående håller; preciseringsnotis: regeln bor i kvalitetsvakt.mjs, ej granssnitt-urval.mjs.

POÄNG: E30 6/10 OFÖRÄNDRAD (INAKTIV per R2; allt mätbart grönt/stängt; G1 känd öppen; 500:t var byggklass, ej E30-fel, nu läkt). Snitt 7,5/284/38 orört. Kö oförändrad: juristbeslut K-B2B + kundens aktivering (R2); teknisk köpost: G1-fix (fixture/testkontrakt) innan B2B-aktiveringspaketet hämtas fram.

`;

const E30_NOTIS = `*Uppdatering 2026-09-19 (dokvåg s9-u1, manifest auto-s9-1789847706174):
återdiffad fjärde passningen + u2:s köade /pro-mätning verkställd (allt
EGENMÄTT 21:5x lokal): /pro 500 LÄKT — 200 med "Under uppbyggnad"-
substitut + noindex, samtliga 5 undersidor 200, /pro/ → 308 → /pro;
x-nextjs-cache HIT/prerender 1/s-maxage 300 = ISR-klass (samma
servering som D23:s tier-sidor); körande BUILD_ID fWWGyYiw… mtime 21:50
lokal styr läkningen som BYGGKLASS (kodstilla sedan 09-17 bevisad).
Stängningsdoktrinen HEL: flaggan AV ×3 (0 env-namn + 0 pm2 + koden
kräver ==="1") · robots /pro/admin i samtliga 16 block (15 AI-bots + * —
"dubbletterna" = AI-SEO-design, ej fel) · sitemap 0 äkta /pro-URL:er ·
/pro + /pro/admin noindex · page.tsx:122 null-kropp vid flaggav
(layouten = hela trädets robots-källa). Grindarna: admin 401 · analys
405 · dpa-mall 200 AVSIKTLIGT (våg 66 G2; mallen själv UTKAST under
juristgranskning = R2-väntan). Sviter: grind exit 0 + screening 26/0 +
demoklient 16/1 (G1 kvarstår). Talrättning: 3 API-rutter (ej 4; ingen
raderad). arProYta lever (kvalitetsvakt.mjs:346). Score 6 orött —
INAKTIV väntar jurist (K-B2B) + kund (R2). Se UPPDATERING-sektionen
för samtliga bevis.*

`;

let k = kalla;
k = byt(k, "## ÖVERSIKT — 38 system", UPD + "## ÖVERSIKT — 38 system", "översiktstämpel");
k = byt(
  k,
  "## E30. B2B / AK1A PRO — INAKTIV — 6/10 *(uppdaterad 2026-09-17)*",
  "## E30. B2B / AK1A PRO — INAKTIV — 6/10 *(uppdaterad 2026-09-19)*",
  "E30-rubrik"
);
k = byt(
  k,
  "*Uppdatering 2026-09-17 (s9-u3 omgång 10): INAKTIV-läget bekräftat live",
  E30_NOTIS + "*Uppdatering 2026-09-17 (s9-u3 omgång 10): INAKTIV-läget bekräftat live",
  "E30-09-17-notis"
);
k = byt(
  k,
  "src/app/api/pro/** (4 rutter),\n  src/components",
  "src/app/api/pro/** (3 rutter; talrättning 09-19),\n  src/components",
  "antal API-rutter"
);
k = byt(
  k,
  "| E30 | B2B / AK1A PRO | Styrning | INAKTIV | 6 | Väntar jurist (R2); grind-grön i egen körning (sann exit 0, mätt 09-17); demoklient-G1 fortfarande röd (16/1); kvalitetsvaktens YTA-regel täcker (huvud)/pro/** sedan 09-16 (arProYta-kuren) |",
  "| E30 | B2B / AK1A PRO | Styrning | INAKTIV | 6 | Väntar jurist (R2); ÅTERDIFFAD 09-19: /pro 500 LÄKT (byggklass; 200 + noindex + ISR-serverad som tier-ytorna), stängningsdoktrinen HEL (flagga AV ×3 · robots /pro/admin 16 block · sitemap 0 äkta /pro-URL · grindar 401/405/200-avsiktligt), sviter grön/grön/16-1 (G1 kvarstår), 3 API-rutter (talrättning), arProYta lever; G1-fix = teknisk köpost före aktivering |",
  "översiktsrad E30"
);

// EN atomär skrivning av kartan.
const tmp = KARTA + ".s9u1-tmp";
writeFileSync(tmp, k, "utf8");
renameSync(tmp, KARTA);
console.log("KARTA: 5 redigeringar + 1 insättning aplikera­de, atomär skrivning OK");

const WL = `## SPÅR 9 s9-u1 (byggare 1/3, manifest auto-s9-1789847706174) — 2026-09-19 ~21:55–22:10 lokal: SYSTEMKARTAN-dokvåg — E30 B2B/AK1A PRO återdiffad (fjärde passningen): u2:s köade /pro-mätning verkställd — 500:t LÄKT (byggklass styrkt) + stängningsdoktrinen hel i sex lägen [fabrik]

Fabriksagent s9-u1. VAL (anspråk disk-först, gitignorerad väg data/vakten/auto-s9-1789847706174-s9-u1-ansprak.md): E30 = äldsta fria stämpeln (09-17; alla övriga 37 bär 09-18/09-19) + s9-u2:s uttryckliga kö "/pro-mätningen åt E30-revisionen"; syskonens 09-18-pool orörd. DIFF (allt EGENMÄTT 21:5x–21:59 lokal): /pro 500 LÄKT — 200 "Under uppbyggnad" + noindex, 5 undersidor 200, /pro/ 308-normalisering; x-nextjs-cache HIT/prerender 1/s-maxage 300 = ISR-klass (D23:s tier-servering); körande BUILD_ID fWWGyYiw… mtime 21:50 lokal tidsstyr läkningen som BYGGKLASS (kodstilla bevisad: 0 commits på E30-vägarna sedan 09-17, B2B-mappen frusen 09-10). STÄNGNINGSDOKTRINEN HEL ×6: flaggan AV i tre lägen (0 env-namn · 0 pm2 · koden kräver ==="1") · robots /pro/admin i samtliga 16 block (* + 15 AI-bots — METODNOTIS: 15 lika Disallow-rader = AI-SEO-design per botblock, INTE dubblettfel) · sitemap 0 äkta /pro-URL:er (11 substring-träffar = /profil + prognos-tillvaxt, falska positiver) · /pro + /pro/admin noindex live · page.tsx:122 null-kropp vid flaggav (layout = trädets robots-källa, layout.tsx:56) · ingen toppväljare i /pro-SSR (0 "Privatperson" mot 1 på /). GRINDARNA: admin 401 · analys 405 · dpa-mall 200 AVSIKTLIGT (våg 66 G2 — mallen bär själv UTKAST/juristgransknings-status = R2-väntan, inget skarpt avtal läckt). SVITER EGENA: grind exit 0 · screening 26/0 · demoklient 16/1 (G1 kvarstår exakt). TALRÄTTNING: 3 API-rutter ej 4 (git --diff-filter=D tom). arProYta-regern LEVER (kvalitetsvakt.mjs:346 — preciseringsnotis: bor i kvalitetsvakt.mjs, ej urvalsfilen). Poäng 6/10 OFÖRÄNDRAD (INAKTIV per R2; 500:t = byggklass ej E30-fel), snitt 7,5/284/38 orört. Kö: jurist K-B2B + kund = R2; G1-fix = teknisk köpost före aktiveringspaketet. KVD: data-only (karta + worklog + mätskript) — src/ orörd = INGET bygge (deploy ägs av prod-synken under lås; tsc-baslinjen vilar i pre-commit-grinden) · R2 orörd (ingen flagga/pris/publicering ändrad; endast läsande sonder + GET/HEAD) · data/blogg/ orörd · syskonytor orörda (färsk läsning + en-träff-ankare + abort-grind + EN atomär skrivning; commit MED pathspec). [fabrik]

`;

const wl = readFileSync(WORKLOG, "utf8");
if (wl.includes("manifest auto-s9-1789847706174 — E30 B2B/AK1A PRO återdiffad")) {
  console.error("ABORT: worklog bär redan denna rad — dubbelkörning?");
  process.exit(1);
}
const tmpWl = WORKLOG + ".s9u1-tmp";
writeFileSync(tmpWl, wl.endsWith("\n") ? wl + WL : wl + "\n" + WL, "utf8");
renameSync(tmpWl, WORKLOG);
console.log("WORKLOG: 1 sektion applicerad");

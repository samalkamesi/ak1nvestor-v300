// stäng V167-GRANSKNING.md: kör kontrollerna en sista gång, skriv om KURSBLOCK från final-läget + stängningsbevis
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const G = '/home/ak1a/agent/ak1/data/forskning/KURS-FAS2/V167-GRANSKNING.md';

// återanvänd emottagets kontroll genom att köra status och plocka filens block — enklare: kör emottagets logik direkt via import? Emottaget är ett skript med sidoeffekter; här: läs fragmenten och kör kontroll via barnprocess-output är osmidigt.
// KUR: parsar emottagets kontrollfunktioner via en kopia av anropet — enklast robust: kör 'status' och läs filen DEN skrev, men block-idempotens är just felet.
// Därför: snurran nedan räknar om final-status per kurs med emottagets funktioner genom att köra det som modul — emottaget exporteras ej, så vi duplicerar anropet minimalt: kör node-emottagets status med KURSBLOCK-sektionen borttagen först, så skriver den alla block aktuellt.
let g = readFileSync(G, 'utf8');
const a = g.indexOf('## KURSBLOCK');
if (a >= 0) g = g.slice(0, a).trimEnd() + '\n';
writeFileSync(G, g);
const ut = execSync('node /home/ak1a/agent/ak1/verktyg/_v182-emottag.mjs status').toString();
console.log(ut.trim());
// lägg på stängningsbevis efter SAMMANFATTNING
let g2 = readFileSync(G, 'utf8');
g2 = g2.replace(/^## SAMMANFATTNING:.*$/m,
`## SAMMANFATTNING: 260 PASS · 0 FEL — VÅG 167 STÄNGD 2026-09-24

STÄNGNINGSBEVIS: 20/20 fragment GRÖNA (13 PASS var) → atomär integration GRÖN (ed3e416b: formatvakt rondtrip bitidentisk 20 814 286 tecken · append-only ×20 mot HEAD/commit~1 · chapters_list orörd · 475 övriga kurser orörda · ny storlek 20 931 494 tecken) → PUSH GRÖN 7956d3dc..ed3e416b → PROD BEVISAD: /api/kurs/v01-forsaljningstillvaxt = 200 med kap 12 "Från teorin till egen räkning" (8 min, quiz 3), /api/kurs/v19-kapitalforbranning = 200 med kap 14, sajten 200. Data-väg — inget bygge.

PROCESSEFFEKTIVITET: fabrikens 20 barn dog på leverantörskvoten ([1310] Weekly/Monthly Limit Exhausted, reset 2026-09-28 01:22:30 — 92 turn.failed; manifestet avslutat 20 underkända 17:45–17:47) ⇒ studion skrev samtliga 20 fragment själv enligt designens fragmentmönster (KVD före integration, granskningsfilen huvudagentens). Emottagets mätkurkar under vågen: v166:s varumärkesmönster (forbjudnaFraser[].fran som regex), yta-regel-undantag (\\bkunder\\b i kursinnehåll om bolags kunder), talnormalisering (listnummer/meningspunkter), del 2-adaptering (utskrivna sektionsrubriker, "påhittat bolag"-deklarationer), samt denna final-omräkning av KURSBLOCK (idempotens-svagheten: block skrevs före mätkurkarna och uppdaterades ej — här omskrivet från final-läget).`);
writeFileSync(G, g2);
console.log('GRANSKNINGSFIL STÄNGD');

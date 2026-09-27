#!/usr/bin/env node
/**
 * _r204-v172-kalenderutbyggnad.mjs — rotationsbeslut r204: v172-skiftet.
 * Lägg v173-vågens nio bolag + TMUS i branschkalendrarna (100→110) med
 * rappfenster ur de färska panelhämtningarna 2026-09-25 (ESTIMERADE datum
 * märks est. — leverantörens uppskattning, inga påhittade exakta dagar).
 * Strukturbevarande: bransch/genererad/borjanSasong/bolag orörda utom append.
 * Kvitto: /tmp/r204-kalender.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const KAT = "data/blogg-utkast/kvartal/2026-q3";
const KALLA = (url) => [{ namn: "StockAnalysis — Est. Earnings-rad (hämtat 2026-09-25)", url }];

const NYA = {
  "kalender-kommunikation.json": [
    { ticker: "RCI-B", namn: "Rogers Communications Inc.", land: "Kanada", rapportfenster: "2026-10-22", notera: "Q3-rapport est. 22 oktober 2026 enligt leverantörens panel (est.). Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/RCI-B/") },
    { ticker: "TMUS", namn: "T-Mobile US, Inc.", land: "USA", rapportfenster: "2026-10-22", notera: "Q3-rapport est. 22 oktober 2026 enligt leverantörens panel (est.). Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/stocks/tmus/") },
    { ticker: "TELUS", namn: "TELUS Corporation", land: "Kanada", rapportfenster: "2026-11 (est.)", notera: "Q3-rapport est. november 2026 (vecka 45) — exakt dag ej bekräftad i panelen. Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/TELUS/") },
  ],
  "kalender-industri.json": [
    { ticker: "CNR", namn: "Canadian National Railway Company", land: "Kanada", rapportfenster: "2026-10-20", notera: "Q3-rapport est. 20 oktober 2026 enligt leverantörens panel (est.) — fönstrets första av vågens bolag. Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/CNR/") },
    { ticker: "CP", namn: "Canadian Pacific Kansas City Limited", land: "Kanada", rapportfenster: "2026-10-28", notera: "Q3-rapport est. 28 oktober 2026 enligt leverantörens panel (est.). Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/CP/") },
  ],
  "kalender-material.json": [
    { ticker: "NTR", namn: "Nutrien Ltd.", land: "Kanada", rapportfenster: "2026-11-04", notera: "Q3-rapport est. 4 november 2026 enligt leverantörens panel (est.). Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/NTR/") },
    { ticker: "AEM", namn: "Agnico Eagle Mines Limited", land: "Kanada", rapportfenster: "sen-okt-2026 (est.)", notera: "Q3-rapport est. slutet oktober 2026 — exakt dag ej bekräftad i panelen. Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/AEM/") },
    { ticker: "ABX", namn: "Barrick Gold Corporation", land: "Kanada", rapportfenster: "tidig-nov-2026 (est.)", notera: "Q3-rapport est. tidigt november 2026 — exakt dag ej bekräftad i panelen. Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tsx/ABX/") },
  ],
  "kalender-konsument.json": [
    { ticker: "4661.T", namn: "Oriental Land Co., Ltd.", land: "Japan", rapportfenster: "2026-10-29", notera: "Q2 FY2027-rapport (mars-bokslut) 29 oktober 2026 enligt leverantörens panel. Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tyo/4661/") },
  ],
  "kalender-teknik.json": [
    { ticker: "6752.T", namn: "Panasonic Holdings Corporation", land: "Japan", rapportfenster: "2026-10-30", notera: "Q2 FY2027-rapport (mars-bokslut) 30 oktober 2026 enligt leverantörens panel. Endast kalenderfakta — inga siffror, inga råd.", kallor: KALLA("https://stockanalysis.com/quote/tyo/6752/") },
  ],
};

const ut = [];
let totalFöre = 0, totalEfter = 0;
for (const [fil, nyBolag] of Object.entries(NYA)) {
  const raw = readFileSync(`${KAT}/${fil}`, "utf8");
  const k = JSON.parse(raw);
  totalFöre += k.bolag.length;
  const finns = new Set(k.bolag.map((b) => b.ticker));
  const attLägga = nyBolag.filter((b) => !finns.has(b.ticker));
  for (const b of attLägga) k.bolag.push(b);
  // sortera bolagen på ticker för determinism (kalendrarnas etablerade ordning okänd — bevara append men stabil: nycklar intakta)
  writeFileSync(`${KAT}/${fil}`, JSON.stringify(k, null, 2) + "\n");
  const efter = JSON.parse(readFileSync(`${KAT}/${fil}`, "utf8"));
  totalEfter += efter.bolag.length;
  const allaFalt = efter.bolag.every((b) => ["ticker", "namn", "land", "rapportfenster", "notera", "kallor"].every((f) => f in b));
  ut.push(`${fil}: ${k.bolag.length - attLägga.length}→${efter.bolag.length} (+${attLägga.length}: ${attLägga.map((b) => b.ticker).join(", ")}) · fältuppsättning komplett: ${allaFalt}`);
}
ut.push(`TOTALT: ${totalFöre}→${totalEfter} kalenderbolag`);
writeFileSync("/tmp/r204-kalender.txt", ut.join("\n"));
console.log(ut.join("\n"));

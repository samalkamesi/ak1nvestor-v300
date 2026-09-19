/**
 * SOND omgång 23, s6-u1 — ROND 3: ALTERNATIVA FAMILJER efter att rond 2
 * dödsförklarade indikator-paraplyet (BAS äger rsi/macd/bollinger/
 * candlestick/trendlinje/moving average/stöd och motstånd/25-cellers —
 * V19: deras fångst vinner). Denna rond provar mentorväglösa kurser från
 * rundräkningens största fria block:
 *   A  MAKROEKONOMI (mk-02/03/05/07/10/11 — arbetslöshet, handelsbalans,
 *      geopolitik, finanspolitik, oljepris, Kina)
 *   B  VÄRDERING (vr-05/06/07, v04-ps, v05-pb + VÄRDERINGSMETODER vm-02/
 *      05/07/09/10/11 — terminalvärdet, jämförelsebolag, FCF-avkastning,
 *      realoptioner, intrinsic value, P/S, substans)
 *   C  PRIVATE EQUITY & INVESTMENTBOLAG (pe-01, pe-05, ib-03, ib-04)
 *   D  RISKHANTERING (rk-05 cykelrisk, rk-06 regulatorisk, rk-10
 *      korrelation, rk-13 gdpr, rk-14 esg)
 *   E  BOKFÖRING (bk-06 obeskattade reserver + avsättningar)
 *   F  MAKRO&RÄNTA ma-07 (valutakursens mekanik: ränteparitet, PPP)
 *   G  TS-DETALJER (doji, guldencross, överköpt — bas äger paraplyet,
 *      men detaljorden var NULL i rond 2)
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const widgetKalla = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const FN_TILL_FIL = {};
for (const m of widgetKalla.matchAll(/import \{ (svaraLokalt\w*)(?:, )?(\w+)? \} from "@\/lib\/(ai-mentor-[a-z0-9-]+)";/g)) {
  if (m[1]) FN_TILL_FIL[m[1]] = m[3] + ".ts";
  if (m[2] && m[2].startsWith("svaraLokalt")) FN_TILL_FIL[m[2]] = m[3] + ".ts";
}
const rad = widgetKalla.match(/const lokalt = ([^;]+);/);
const fns = [...rad[1].matchAll(/svaraLokalt\w*/g)].map((x) => x[0]);

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

const MOTORER = [];
const KARNORD = [];
for (const fn of fns) {
  const fil = FN_TILL_FIL[fn];
  if (!fil) { console.log("VARNING: " + fn + " utan importrad"); continue; }
  const m = await import(pathToFileURL(join(ROT, "src/lib/" + fil)).href);
  MOTORER.push({ namn: fn.replace("svaraLokalt", "").toLowerCase() || "bas", fnk: m[fn] });
  const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
  if (arrNamn) for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? []));
}
const { readdirSync } = await import("node:fs");
const WIRADE = new Set(Object.values(FN_TILL_FIL));
for (const f of readdirSync(join(ROT, "src/lib"))) {
  if (!f.startsWith("ai-mentor-") || !f.endsWith("-fragor.ts") || WIRADE.has(f)) continue;
  try {
    const m = await import(pathToFileURL(join(ROT, "src/lib/" + f)).href);
    const arrNamn = Object.keys(m).find((k) => Array.isArray(m[k]) && /MONSTER/.test(k));
    if (arrNamn) { for (const mo of m[arrNamn]) KARNORD.push(...(mo.karnord ?? [])); console.log("  (diskutläsning: " + f + ")"); }
  } catch { /* syskonfil mitt i skrivning */ }
}
console.log("Kedja LIVE: " + MOTORER.length + " motorer · " + KARNORD.length + " kärnord (inkl. disk)");

function vem(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return m.namn;
  }
  return null;
}

const FAMILJER = {
  "A MAKROEKONOMI (mk-02/03/05/07/10/11)": [
    "vad är arbetslöshet?", "vad är arbetslösheten?", "vad är sysselsättningen?",
    "vad är oljepriset?", "vad är olja?", "hur påverkar oljepriset aktier?",
    "vad är finanspolitik?", "vad är finanspolitiken?", "vad är fiscal policy?",
    "vad är geopolitik?", "hur påverkar geopolitik börsen?",
    "vad är handelsbalansen?", "vad är handelsbalans?",
    "vad är kinaekonomin?", "vad är kinas ekonomi?",
  ],
  "B VÄRDERING (vr-05/06/07, v04/v05, vm-02/05/07/09/10/11)": [
    "vad är terminalvärdet?", "vad är terminal value?",
    "vad är jämförelsebolag?", "vad är jämförelsebolagen?",
    "vad är pris och värde?", "vad är p/s?", "vad är price to sales?",
    "vad är p/b?", "vad är price to book?",
    "vad är fri kassaflödesavkastning?", "vad är fcf yield?", "vad är free cash flow yield?",
    "vad är realoptioner?", "vad är en realoption?",
    "vad är intrinsic value?", "vad är verkligt värde?", "vad är inre värde?",
    "vad är substansvärdesmetoden?", "vad är waccfällor?",
  ],
  "C PRIVATE EQUITY & INVESTMENTBOLAG (pe-01/05, ib-03/04)": [
    "vad är private equity?", "vad är private equity-fonder?", "vad är pe-fonder?",
    "vad är andrahandsmarknaden?", "vad är förvaltarskapet?", "vad är förvaltarskap?",
    "vad är avkastningsräkningen?", "vad är avkastningsräkningen för investmentbolag?",
  ],
  "D RISKHANTERING (rk-05/06/10/13/14)": [
    "vad är cykelrisk?", "vad är cykelrisken?",
    "vad är regulatorisk risk?", "vad är myndighetsrisk?",
    "vad är korrelationsrisk?", "vad är gdpr-risk?", "vad är datarisk?",
    "vad är esg-risk?", "vad är hållbarhetsrisk?",
  ],
  "E BOKFÖRING (bk-06)": [
    "vad är obeskattade reserver?", "vad är avsättningar?", "vad är en avsättning?",
  ],
  "F VALUTAKURSENS MEKANIK (ma-07)": [
    "vad är ränteparitet?", "vad är täckt ränteparitet?",
    "vad är köpkraftsparitet?", "vad är ppp?", "vad är valutakursens mekanik?",
    "vad är burgarindex?", "vad är bytesbalansen?",
  ],
  "G TS-DETALJER (bas äger paraplyet — detaljord NULL i rond 2)": [
    "vad är en guldencross?", "vad är golden cross?", "vad är death cross?",
    "vad är överköpt?", "vad är översålt?", "vad är en doji?", "vad är whipsaw?",
    "vad är en oscillator?", "vad är chartmönster?",
  ],
};

console.log("\n── Kandidatfrågor genom kedjan (NULL = fria):");
for (const [fam, fragor] of Object.entries(FAMILJER)) {
  console.log("\n" + fam);
  for (const f of fragor) {
    const a = vem(f);
    console.log("  " + (a === null ? "NULL      " : "FÅNGAD " + a).padEnd(26) + " «" + f + "»");
  }
}

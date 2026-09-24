/**
 * Sond 2 för s6-u3: extrahera kärnord ur samtliga lager och visa vilka som
 * berör kandidatområdena (katalysator / gdpr-esg-regulatorisk / ts-indikatorer).
 * Kärnorden ligger i karnord: [...] -block i varje monster.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const lib = "/home/ak1a/AK1/src/lib";
const filer = readdirSync(lib).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));

const omraden = {
  katalysator: /katalys|lansering|produktlans|partnerskap|avtal|regulatorisk|händelse|event|nyhetsblob|_impuls/i,
  gdprEsgReg: /gdpr|esg|hållbar|datarisk|dataskydd|integritet|regulator|myndigh|tillsyn|compliance/i,
  tsIndikator: /rsi|macd|candlestick|bollinger|glidande|moving ?average|trendlinj|stöd och motstånd|motstånd|elliott|chartmonster|indikator/i,
};

for (const [namn, re] of Object.entries(omraden)) {
  console.log(`\n=== ${namn} ===`);
  for (const f of filer) {
    const txt = readFileSync(join(lib, f), "utf8");
    const block = [...txt.matchAll(/karnord:\s*\[([^\]]*)\]/g)].map((m) => m[1]);
    const traf = block.filter((b) => re.test(b));
    if (traf.length > 0) {
      console.log(`  ${f}:`);
      for (const b of traf) console.log(`    karnord: [${b.trim().replace(/\s+/g, " ")}]`);
    }
  }
}

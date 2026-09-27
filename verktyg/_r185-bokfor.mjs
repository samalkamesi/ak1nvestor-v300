// rond 185: worklog + beslutsminne (hårt protokoll § 6)
import { appendFileSync } from "node:fs";
appendFileSync(
  "/home/ak1a/agent/ak1/worklog.md",
  `
## ROND 185 [organ:Φ] — v170 KVD-LÄXOR LEVERERADE: emottaget kurerat (ersättnings-idempotens + levererad-ts + stängdvakt) + EMOTTAG-MÖNSTER databuret — 2026-09-24 ~21:2x lokal
PIPELINE-KO v170 verkställt: (1) EMOTTAGETS IDEMPOTENSSVAGHET KURAD I KODEN — _v182-emottag.mjs:s gamla skip-på-marker-logik ("if block finns → hoppa") var exakt roten till att block från mätningar FÖRE mätkurkorna låg kvar (dokumenterat i v167-stängningen); KURSBLOCK-sektionen byggs nu om från grunden varje körning = senaste mätningen gäller, block ERSÄTTS aldrig appendas. (2) VÄNTAR-LISTA VID LEVERANS förstärkt maskinellt: varje block bär "levererad <tidsstämpel>" ur fragmentets mtime (dubbelarbetets rot d13/d19/d22 — synligheten är nu tidsbestämd i granskningsfilen) + LÄGE-raden speglar disk-läget. (3) NY STÄNGDVAKT: status/integrera vägrar röra en STÄNGD vågs granskningsfil (bevisbevarande — stängningsmärket skrivs inte bort, kapitler dubbelappendas inte). SJÄLVTEST _v170-sjalvtest.mjs i sandbox (riktiga trädet orört): 7 PASS · 0 FEL — RÖT pre-kurka-block ersattes av GRÖN 13/0, ✗-rad borta, LÄGE "1 levererade · 19 väntar: v02…", levererad-ts 2026-09-24 synlig, ett block per kurs, DUBBELKÖRNING bitidentisk (sha256 58341c347ba7e094 ≡), stängdvakt: fil orörd + "VÅG STÄNGD"-svar. (4) EMOTTAG-MONSTER.md (data/forskning/KURS-FAS2/): mallen nästa vågs emottag byggs ifrån — fem bindande regler (fragmentmönstret, väntar-lista vid leverans med status-rop-som-sista-steg i manifestprompten, ombyggnad-idempotens, stängdvakt, integrationens måttkedja) + checklist vid vågstart + de två mindre v166-läxorna hanterade MED BESLUT (fem historiska d-KVD-verktygs sköra HEAD-mått + d16:s /tmp-beroende: engångsverktyg kureras ej historik — emottaget bär det rätta mönstret). PIPELINE-KO omrotad: v170 → rotationsloggen, v171 SEO NÄSTA VÅG, v172 kvartalsrapporter bokad (Q3 2026 slutar 09-30 — ramverket förbereds så rapportvågen kan starta vid publiceringarna), v173 dataset-djup bokad (= 3 kommande vågar, evighetsmotorn § 8). Ren dataleverans (verktyg + docs) — src orörd, inget bygge.
`,
);
appendFileSync(
  "/home/ak1a/agent/ak1/data/vakten/beslutsminne.jsonl",
  JSON.stringify({
    ts: new Date().toISOString(),
    rond: 185,
    beslut:
      "v170 KVD-LÄXOR LEVERERADE: emottaget _v182-emottag.mjs kurerat (KURSBLOCK ombyggs per körning = ersättnings-idempotens; levererad-tidsstämpel ur fragment-mtime; STÄNGDVAKT som vägrar röra stängd vågs fil) — självtest sandbox 7 PASS 0 FEL (dubbelkörning bitidentisk). EMOTTAG-MONSTER.md databuren som mall med fem bindande regler; de fem historiska d-KVD-verktygens HEAD-mått och d16:s /tmp-beroende hanterade med beslut: engångsverktyg, emottaget bär rätt mönster. Pipeline: v171 SEO nästa, v172 kvartalsrapporter (Q3 slutar 09-30), v173 dataset-djup.",
    landat: "(denna committ)",
  }) + "\n",
);
console.log("BOKFÖRD");

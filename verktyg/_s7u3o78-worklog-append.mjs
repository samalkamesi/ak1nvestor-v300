import { appendFileSync, readFileSync } from "node:fs";

const rad = `
## SPÅR 7 s7-u3 (byggare 3/3, manifest auto-s7-1789770919187, o78) — 2026-09-19 01:5x lokal: prestandavåg o78 — CV-SEKTIONERNA: Style & Layout-köposten på /kurser kurerad, −288 ms styleLayout bevisat i proxy-A/B [fabrik]

VAL (anspråk data/vakten/s7-o78-stylelayout-u3-ansprak-2026-09-19.md disk-först 00:1x): o76 §5:s ägarlösa köpost "Style & Layout 1 215 ms på /kurser"; duplikatkontroll mot worklog + OPTIMERING-katalogen (prefetch/cache/läsbarhet/bild/CLS stängda; 0el5nt6 + 2feezv huvudagentens; font-ytan redan kurerad: display optional + mono preload:false + kursiv preload). FÖRE (kanonverktyget): P54 LCP 5389 TBT 902 CLS 0, mainthread styleLayout 783 ms. ROT (tre bevislinjer): trace (Lighthouse --save-assets) = UpdateLayoutTree 156 + Layout 158 ms FÖRE FCP med dirty 643/643 + palettbukett @6,7–8 s; DOM-karta (mobil 412px) = 284 element under vecket UTAN cv (o19:s kort-cv täckte bara korten): kategoriväggen 1223 px, SocialProof 1474, kurstips 364, NastaSteg 230, Sidfooter-sitemap 2145 px/81 el; LoAF = långa frames JS-drivna (2feezv 731, 0el5nt6 215). A/B-BEVIS utan bygge (proxy _s7u3o78-proxy.mjs, Lighthouse genom identisk kanal): styleLayout 1014→726 ms (−28 %), CLS 0, scriptEvaluation ±1 ms. KUR: content-visibility:auto + mätt höjdreservation på 5 sektioner (globals.css .cv-kategorivagg/.cv-socialproof/.cv-kurstips/.cv-nasta-steg/.cv-sidfooter + kurs-sok.tsx (träffar även en/ar-speglarna) + (huvud)/kurser/page.tsx + seo-page-shell.tsx + sidfooter.tsx); reservationer = sonderade mobilhöjder ⇒ inga stavhopp. tsc 0 (ett transient .next/types-race under huvudagentens våg 194-landning gav falska fel i en körning — 0/0 med/utan ändringar i omkörning). Deploy: commit i trädet, prod-synkens RAM-grind avgör (o76/o77/våg194/o78 landar tillsammans); EFTER-kriterier i protokollet §5 vakarövertag-barra. Protokoll: data/forskning/OPTIMERING/o78-prestanda-cv-sektioner-s7.md. R2 orörd; data/blogg/ orörd; syskonytor orörda. [fabrik]
`;

const fil = "/home/ak1a/AK1/worklog.md";
const innan = readFileSync(fil, "utf8");
if (!innehar("o78 — CV-SEKTIONERNA")) {
  appendFileSync(fil, rad);
}
function innehar(s) {
  return innan.includes(s);
}
console.log("worklog o78-rad appendar:", !innehar("o78 — CV-SEKTIONERNA"));

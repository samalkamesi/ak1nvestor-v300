/**
 * HARMONISERING (s6-u3, manifest auto-s6-1789965330060, fönster 31):
 * säkerställer att fönstrets TRE nya kedjekomponenter — svaraLokaltStalsektor
 * (u1:s), svaraLokaltCasepraktik (u2:s), svaraLokaltBeteendefallor (mitt) —
 * finns i ALLA mentorsviternas KOMPONENTER-arrayer och kanda-uppsättningar,
 * i WIDGETORDNING (stålsektor → casepraktik → beteendefallor → marknadsrytm).
 * Idempotent: körs igen ⇒ 0 ändringar. Konvergerar med syskonens parallella
 * harmoniserare (omgång 25-precedensen: omkörning + verifiering).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const dir = join(ROT, "verktyg");
const filer = readdirSync(dir).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f));

const NYA = ["svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor"];
const ANKARE = '"svaraLokaltMarknadsrytm"';
const ATTRIB = "  // Fönster 31-harmonisering (s6-u3, _s6u3o31-): fönstrets tre nya komponenter i\n  // widgetordning — u1 stålsektor (74:e) · u2 casepraktik (75:e) · u3 beteendefallor\n  // (76:e) — FÖRE marknadsrytm (deras SIST-deklaration). Idempotent.\n";

let andrade = 0;
const rapport = [];
for (const fil of filer) {
  const sok = join(dir, fil);
  let t = readFileSync(sok, "utf8");
  const fore = t;
  if (!t.includes("KOMPONENTER") && !t.includes("kanda")) continue;

  // 0) REPARATION av omgång 1:s omvända infogningsordning (beteende-case-stål
  //    före marknadsrytm) — vänd till widgetordning stål-case-beteende.
  const OMVENT = '"svaraLokaltBeteendefallor", "svaraLokaltCasepraktik", "svaraLokaltStalsektor", ' + ANKARE;
  const RATT = '"svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", ' + ANKARE;
  if (t.includes(OMVENT)) t = t.replaceAll(OMVENT, RATT);

  // 1) KOMPONENTER-arrayen (ENDAST literal form — nya-territorier härleder sin
  //    dynamiskt ur LAGER och hanteras enbart via kanda-steget): infoga ALLA
  //    saknade namn i EN infogning, i ordning stålsektor → casepraktik →
  //    beteendefallor, FÖRE marknadsrytm-posten.
  const harLiteral = /const KOMPONENTER = \[/.test(t);
  if (harLiteral && !NYA.every((n) => t.includes('"' + n + '"'))) {
    const saknade = NYA.filter((n) => !t.includes('"' + n + '"'));
    const ins = saknade.map((n) => '"' + n + '", ').join("");
    const arrStart = t.indexOf("const KOMPONENTER");
    const arrSlut = arrStart === -1 ? -1 : t.indexOf("];", arrStart);
    const pMark = arrStart === -1 ? -1 : t.indexOf(ANKARE, arrStart);
    let insAt = -1;
    if (pMark !== -1 && pMark < arrSlut) insAt = pMark;
    else if (arrSlut !== -1) insAt = arrSlut;
    if (insAt !== -1) {
      t = t.slice(0, insAt) + ins + t.slice(insAt);
      if (!t.includes("Fönster 31-harmonisering (s6-u3")) {
        const radStart = t.lastIndexOf("\n", t.indexOf('"svaraLokaltStalsektor"')) + 1;
        const indrag = t.slice(radStart, t.indexOf('"svaraLokaltStalsektor"')).match(/^\s*/)?.[0] ?? "  ";
        t = t.slice(0, radStart) + ATTRIB.replaceAll("  // ", indrag + "// ") + t.slice(radStart);
      }
    }
  }

  // 2) kanda-uppsättningar: REPARERA ev. brutna prefix från omgång 1-2 (buggen
  //    skrev namnen som kommauttryck FÖRE new Set — nu körs de in i literalen)
  //    och lägg därefter till saknade namn inuti Set-literalen.
  const brutet = /(const kanda = )(?:(?:"svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor",\s*)+)new Set\(\[\.\.\.KOMPONENTER,\s*/g;
  t = t.replace(brutet, '$1new Set([...KOMPONENTER, "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", ');
  const sm = /new Set\(\[\.\.\.KOMPONENTER,\s*/.exec(t);
  if (sm) {
    const slutIdx = t.indexOf("])", sm.index);
    const setSpan = t.slice(sm.index, slutIdx === -1 ? t.length : slutIdx);
    const saknadeSet = NYA.filter((n) => !setSpan.includes('"' + n + '"'));
    if (saknadeSet.length) {
      const ins = saknadeSet.map((n) => '"' + n + '", ').join("");
      t = t.slice(0, sm.index + sm[0].length) + ins + t.slice(sm.index + sm[0].length);
    }
  }

  if (t !== fore) {
    writeFileSync(sok, t);
    andrade++;
    rapport.push(fil);
  }
}

console.log("Filer räknade: " + filer.length + " · ändrade: " + andrade);
for (const r of rapport) console.log("  ändrad: " + r);

// Verifiering: varje KOMPONENTER-fil ska nu ha alla tre + ordning före marknadsrytm
let fel = 0;
for (const fil of filer) {
  const t = readFileSync(join(dir, fil), "utf8");
  if (!t.includes("KOMPONENTER")) continue;
  for (const n of NYA) {
    if (!t.includes('"' + n + '"')) { console.log("SAKNAS fortfarande: " + n + " i " + fil); fel++; }
  }
  // Ordning i KOMPONENTER (enkel positionskontroll — endast literal form)
  const arrStart = t.indexOf("const KOMPONENTER = [");
  if (arrStart !== -1) {
    const arrSlut = t.indexOf("];", arrStart);
    const arr = t.slice(arrStart, arrSlut);
    const pS = arr.indexOf('"svaraLokaltStalsektor"');
    const pC = arr.indexOf('"svaraLokaltCasepraktik"');
    const pB = arr.indexOf('"svaraLokaltBeteendefallor"');
    const pM = arr.indexOf(ANKARE);
    if ((pS === -1) || (pC === -1) || (pB === -1) || !(pS < pC && pC < pB && (pM === -1 || pB < pM))) {
      console.log("ORDNINGSFEL i " + fil + ": stål=" + pS + " case=" + pC + " beteende=" + pB + " rytm=" + pM);
      fel++;
    }
  }
}
console.log(fel === 0 ? "VERIFIERING GRÖN — alla KOMPONENTER-filer bär de tre komponenterna i ordning" : "VERIFIERING RÖD: " + fel + " fynd");
process.exit(fel === 0 ? 0 : 1);

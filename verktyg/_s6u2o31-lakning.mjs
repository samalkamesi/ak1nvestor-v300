/**
 * LÄKNING (s6-u2, fönster 31) — atomär engångsapplicering av fönstrets tre
 * syskonlager i kedjetestet + case-testet, via node-kanalen (SKAL-KVOTEN:
 * sammansatta shell-kommandon hänger; node är den bevisade vägen).
 *
 * Idempotent: redan existerande rader läggs ALDRIG dubbelt; applicerar
 * bara det som saknas på diskens FAKTISKA läge (omg13/14/15-precedensen).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// ── 1. verktyg/testa-ai-mentor-kedja.mjs ────────────────────────────────────
{
  const sokVag = join(ROT, "verktyg/testa-ai-mentor-kedja.mjs");
  let t = readFileSync(sokVag, "utf8");

  const RAD_STAL = '  { namn: "stålsektor", fil: "ai-mentor-stalsektor-fragor.ts", fn: "svaraLokaltStalsektor", arr: "STALSEKTOR_MONSTER", antal: 1 },';
  const RAD_CASE = '  { namn: "casepraktik", fil: "ai-mentor-casepraktik-fragor.ts", fn: "svaraLokaltCasepraktik", arr: "CASEPRAKTIK_MONSTER", antal: 2 },';
  const RAD_BET = '  { namn: "beteendefallor", fil: "ai-mentor-beteendefallor-fragor.ts", fn: "svaraLokaltBeteendefallor", arr: "BETEENDEFALLOR_MONSTER", antal: 3 },';
  const BLOCK = `  // 2026-09-21 fönster 31 (manifest auto-s6-1789965330060) — TRE syskonlager
  // efter kemisektor, FÖRE marknadsrytm (deras SIST-deklaration + L01 —
  // multipel-precedensen). Raderna KONVERGERADE av s6-u2 efter fönstrets
  // yttre git-restore-race (trackade filer återtog äldre lägen flera
  // gånger; riskpremie-precedensen: bär syskonens rader tills deras egna
  // commits gör det — behåll EN av varje).
  // · stålsektor (s6-u1, _s6u1o31-): kapacitetens hävstång, malmen mot
  //   skrotet, förädlingstrappan — 1 monster, se-23 primär (registrets
  //   nyaste kurs; mentorn lär sig den samma dag den föds) + källor rk-15
  //   + vr-02 + se-20 + mt-05. Anspråk s6-u1-fonster31-ansprak.md.
${RAD_STAL}
  // · case-praktik (s6-u2, _s6u2o31-): PRAKTISKA CASE-familjens metodfrågor
  //   — 2 monsters: övningsbolaget («hur övar jag på riktiga bolag?» —
  //   pc-21 primär, källor pc-22 + pc-01 + bk-02 + portfolj-ekosystemet;
  //   Norra Verkstads AB 850 → 1 000 → 1 150, +17,6/+15,0 %, DuPont
  //   8,0 × 2,5 = 20,0, multipel 30/2,0 = 15,0, FCF 125 − 65 = 60,
  //   täckning 60/23 = 2,6; fyra stegen LÄSA/RÄKNA/TOLKA/DOKUMENTERA +
  //   caseloggen) + jämförelsecaset («hur jämför jag två bolag sida vid
  //   sida?» — pc-22 primär, källor pc-21 + pc-17 Sandvik + pc-13 SSAB +
  //   pc-20 Essity, kursernas egna par-lista; Södra Verktyg AB 660
  //   (+4,8 %), 99/660 = 15,0, 10,0 × 1,2 = 12,0, multipel 45/3,0 = 15,0
  //   IDENTISK med Norras — åtta av nio mått skiljer, det nionde
  //   sammanfaller; Mot vad-kolumnen + tre fällorna). Sond
  //   (_s6u2o31-sond{,2,3}.mjs): båda kanoniska NULL genom kedjan;
  //   gränser: «jämföra bolag» + «bolagsjämförelse» → avrakningsdjupet
  //   (rond 3-fångst, strukna) · naket «case» → case-motorn · «två
  //   aktier» → basen · «i samma bransch» → sektorn · «tvärsnittsanalys»
  //   → avkastningsdjupet — i TEXT, aldrig kärnord. Anspråk
  //   auto-s6-1789965330060-s6-u2-ansprak.md FÖRE byggstart 04:41 UTC.
  //   Aktiverar 6 mentorväglösa kurser (105 → 99).
${RAD_CASE}
  // · beteendefallor (s6-u3, _s6u3o31-): KATEGORISTÄNGNING BETEENDEFINANS
  //   18/23 → 23/23 — 3 monsters: haloeffekten (bf-09 primär, källor
  //   bf-14 + km-019) + arbitragens gränser (bf-13 primär, källor bf-12 +
  //   km-019 + bf-17) + slumpens serier (bf-16 primär). Anspråk
  //   auto-s6-1789965330060-s6-u3-ansprak.md FÖRE byggstart.
${RAD_BET}`;

  // MOTORDEFS-rader (efter kemisektor-raden, före marknadsrytm-kommentaren)
  if (!t.includes('namn: "casepraktik"')) {
    const kemRad = '  { namn: "kemisektor", fil: "ai-mentor-kemisektor-fragor.ts", fn: "svaraLokaltKemisektor", arr: "KEMISEKTOR_MONSTER", antal: 1 },';
    if (!t.includes(kemRad)) { console.error("FEL: kemisektor-raden hittades ej"); process.exit(1); }
    t = t.replace(kemRad, kemRad + "\n" + BLOCK);
  } else if (!t.includes('namn: "stålsektor"')) {
    // casepraktik finns men stålsektor saknas — infoga stål före case
    const caseRad = t.match(/^.*namn: "casepraktik".*$/m)[0];
    const stalKommentar = `  // stålsektor (s6-u1, _s6u1o31-) — återburen av s6-u2 (git-restore-race);
  // 1 monster, se-23 primär + källor rk-15 + vr-02 + se-20 + mt-05.\n`;
    t = t.replace(caseRad, stalKommentar + RAD_STAL + "\n" + caseRad);
  }

  // KANONISKA (efter fosforn-raden)
  const KANON = `  // 2026-09-21 fönster 31 (manifest auto-s6-1789965330060) — tre
  // syskonlager efter kemisektor, FÖRE marknadsrytm; konvergerat
  // dokumenterat av s6-u2 (stålsektor 72 · casepraktik 73 ·
  // beteendefallor 74; fall G verifierar varje körning).
  { fraga: "vad är stålsektorn?", motor: 72 },
  { fraga: "hur övar jag på riktiga bolag?", motor: 73 },
  { fraga: "hur jämför jag två bolag sida vid sida?", motor: 73 },
  { fraga: "vad är haloeffekten?", motor: 74 },
  { fraga: "vad är arbitragens gränser?", motor: 74 },
  { fraga: "vad är slumpens serier?", motor: 74 },`;
  if (!t.includes('"hur övar jag på riktiga bolag?"')) {
    const fosforn = '  { fraga: "vad är fosforn?", motor: 71 },';
    if (!t.includes(fosforn)) { console.error("FEL: fosforn-raden hittades ej"); process.exit(1); }
    t = t.replace(fosforn, fosforn + "\n" + KANON);
  }

  // TOTALT-kommentaren
  const TOTALT_NY = `const TOTALT = MOTORDEFS.reduce((s, d) => s + d.antal, 0); // 201 (2026-09-21 fönster 31, manifest auto-s6-1789965330060 — TRE syskonlager efter kemisektor, FÖRE marknadsrytm som förblir SIST [76:e av 76]: stålsektor +1 [s6-u1: kapacitetens hävstång, se-23 primär — registrets nyaste kurs] + case-praktik +2 [s6-u2: övningsbolaget + jämförelsecaset — pc-21/pc-22 primära, PRAKTISKA CASE-familjens metodfrågor, 6 mentorväglösa kurser aktiverade 105 → 99] + beteendefallor +3 [s6-u3: kategoristängning BETEENDEFINANS 18/23 → 23/23 — haloeffekten + arbitragens gränser + slumpens serier]; raderna konvergerade av s6-u2 efter fönstrets yttre git-restore-race). Tidigare 195`;
  t = t.replace(/const TOTALT = MOTORDEFS\.reduce\(\(s, d\) => s \+ d\.antal, 0\); \/\/ 195/, TOTALT_NY);

  writeFileSync(sokVag, t);
  console.log("kedjetestet: rader applicerade (stålsektor=" + t.includes('namn: "stålsektor"') + " · casepraktik=" + t.includes('namn: "casepraktik"') + " · beteendefallor=" + t.includes('namn: "beteendefallor"') + ")");
}

// ── 2. verktyg/testa-ai-mentor-case.mjs ─────────────────────────────────────
{
  const sokVag = join(ROT, "verktyg/testa-ai-mentor-case.mjs");
  let t = readFileSync(sokVag, "utf8");
  const KOMP = `    // Fönster 31 (manifest auto-s6-1789965330060): stålsektor (s6-u1) +
    // case-praktik (s6-u2) + beteendefallor (s6-u3) — dokumenterade här av
    // s6-u2 (komponentlistan följer kedjan; kedjetestets G-fall äger
    // ordningen; konvergerat efter fönstrets git-restore-race).
    "svaraLokaltStalsektor(q, KURSREGISTER)",
    "svaraLokaltCasepraktik(q, KURSREGISTER)",
    "svaraLokaltBeteendefallor(q, KURSREGISTER)",`;
  if (!t.includes('"svaraLokaltCasepraktik(q, KURSREGISTER)"')) {
    const marknad = '    "svaraLokaltMarknadsrytm(q, KURSREGISTER)",';
    if (!t.includes(marknad)) { console.error("FEL: marknadsrytm-komponenten hittades ej i case-testet"); process.exit(1); }
    t = t.replace(marknad, KOMP + "\n" + marknad);
  }
  // Antal-raden (73/75/76 → faktiskt antal = räkna komponenter)
  const antal = (t.match(/"svaraLokalt\w+\(q, KURSREGISTER\)",/g) || []).length;
  t = t.replace(/kedjeraden bär \d+ lager i ordning/, "kedjeraden bär " + antal + " lager i ordning");
  writeFileSync(sokVag, t);
  console.log("case-testet: komponenter=" + antal);
}
console.log("LÄKNING KLAR");

// Leverans: commit (pathspec) + push prod develop med fetch-merge-retry
// mot levande prod (r354-lärdomen: fabriksbarn/rond-barn kan committa i
// prod-trädet under fönstret).
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "node:fs";

const REPO = "/home/ak1a/agent/ak1";
const kör = (args, tillatFel = false) => {
  try {
    return execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8", timeout: 90_000 });
  } catch (e) {
    if (tillatFel) return "FEL: " + (e.stderr?.toString() || e.message).slice(0, 300);
    throw e;
  }
};

// 0. Vänta ut främmande git-process (rond-barn committerar) — låset är deras.
const LOCK = REPO + "/.git/index.lock";
const vila = (ms) => new Promise((r) => setTimeout(r, ms));
const start = Date.now();
while (existsSync(LOCK)) {
  if (Date.now() - start > 300_000) {
    console.log("LÅSET FRIGES INTE inom 5 min — avbryter (lämnar åt nästa försök).");
    process.exit(1);
  }
  process.stdout.write(".");
  await vila(10_000);
}
if (Date.now() - start > 0) console.log("\nlåset släppte efter", Math.round((Date.now() - start) / 1000), "s");

// 1. Stage endast biblioteket (rond-ytor lämnas orörda)
console.log("== add (pathspec) ==");
console.log(kör(["add", "--", "data/forskningsbiblioteket"]).trim() || "(staged)");

// 2. Commit-meddelande via -F (skal-kvotens mönster)
const medd = `studio: analysfabriksutvidgningen LEVERERAD (r352:s köpost, huvudsessionen) — Forskningsbiblioteket 22 → 76 analyser: 54 NYA ur korstabellens 322-läge + 22 befintliga omgenererade (diff = endast versionsdatum, MSFT-gränssnittet för hela klassen)

KURATERINGEN (r352:s krav "släpps inte utan kuratering"): torrkörning av
kandidatregeln v1 mot dagens korstabell — 76/322 passerar (31 grön + 45 gul
av 279 icke-röda; avslag: 43 röd status, 72 täckning, 131 rel-AKM1<0,65,
1 portV19); ALLA 76 bär akm1-cache (0 saknas); samtliga 22 befintliga
förblir kandidater (0 urfallna). r352:s "222" var taket — regeln är
strängare och det är regeln som är sanningskällan (sidan redovisar den rå).

GENERERING: verktyg/kor-analysfabrik.mjs (våg 56 bygg-B + våg 57 D2 —
deterministisk, oförändrad sedan sep-04); källor läs-only: korstabell-grund,
bolagsunivers, cache/akm1+fvag+akm2. Ärlighetslinjer inbyggda: motiveringar
ordagrata ur bedömningsmotorn, osatt skrivs osatt, >=3 mätbara
falsifieringsvillkor, disclaimer enligt 2007:528 (forskningsunderlag,
aldrig rådgivning).

KVD (verktyg/_huvud-analysfabrik-kvd.mjs, städas efter bruk): 76 filer ·
54 nya + 22 ändrade exakt · JURIDIKGRIND 0 träffar (köp/sälj/rekommendera/
bör du / råd-till-att / investera-i-denna; vitlista återköp+rådgivning-
disclaimern) · SCHEMA 76/76 gröna (analysfabrik-v1 + disclaimer + >=3
risker + >=3 villkor + versionsdatum 2026-09-30) · diff de 22 = endast
versionsdatum (determinism bevisad).

SVENSKA KANDIDATER (7): EVO.ST, INDU-C.ST, NP3.ST, ENEA.ST (NY), TRUE-B.ST,
HM-B.ST, INVE-B.ST.

LEVERANSVILLKOR: detaljsidorna bär dynamicParams=false + generateStaticParams
ur filerna ⇒ nya tickers kräver BYGG för 200 (404-krisens klass, r247-
lärdomen) — bygg följer efter push vid behov; sitemap rad 261 samma mönster.

R2 orörd · src orörd i denna commit · data/blogg orörd.`;
const meddFil = "/tmp/_huvud-analysfabrik-commit.txt";
writeFileSync(meddFil, medd, "utf8");

console.log("== commit ==");
console.log(kör(["commit", "-F", meddFil]).toString().split("\n")[0]);

// 3. Push med retry (levande prod: fetch+merge vid avslag)
console.log("== push (retry x3) ==");
for (let forsok = 1; forsok <= 3; forsok++) {
  const svar = kör(["push", "prod", "develop"], true);
  console.log(`försök ${forsok}:`, svar.trim().split("\n")[0]);
  if (!svar.startsWith("FEL")) {
    console.log("PUSH OK");
    break;
  }
  if (forsok < 3) {
    console.log("  → fetch+merge mot prod innan omförsök");
    console.log(kör(["fetch", "prod"], true).trim().split("\n")[0]);
    const m = kör(["merge", "--no-edit", "prod/develop"], true);
    console.log("  merge:", m.trim().split("\n")[0]);
  } else {
    console.log("PUSH MISSLYCKADES — svar:", svar);
    process.exit(1);
  }
}

// 4. Rapport
console.log("== läge efter ==");
console.log(kör(["log", "--oneline", "-2"]));
console.log(kör(["status", "--porcelain", "--", "data/forskningsbiblioteket"]) || "(biblioteket rent i ytan)");
if (existsSync(meddFil)) unlinkSync(meddFil);

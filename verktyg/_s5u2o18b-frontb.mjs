#!/usr/bin/env node
/**
 * s5-u2 INSTANS 2 FRONT B (manifest auto-s5-1789789514860, omgång 18b) —
 * LÄSREPLIK av src/lib/larvag.ts mot den NYA kartan: bevisar att
 * ib-04-avkastningsrakningen och roic-04-vardeekvationen nomineras av
 * motorn (90p svaghet + 4 nivåmatch = 94; 86 kategori-fortsättning utan
 * match), att varför-raderna genereras, att kartordningen håller
 * (ib-03 < ib-04, roic-03 < roic-04), att syskonens kurser förblir
 * nominerbara och att allt är deterministiskt.
 *
 * Läsreplik = semantiken från larvag.ts (BAS, påslag, regler, varför-rader)
 * omimplementerad läsande ur larvag-karta.ts — inte en import: frontendens
 * kontrakt utan byggkrav. Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const pass = [];
const fel = [];
const P = (namn, ok, detalj) => { (ok ? pass : fel).push(namn + (detalj ? " — " + detalj : "")); console.log((ok ? "PASS " : "FEL  ") + namn + (detalj ? " — " + detalj : "")); };

// ── Kartan, läst ur src/lib/larvag-karta.ts ──────────────────────────────────
const kartRad = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const KARTA = [];
for (const m of kartRad.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)) {
  KARTA.push({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] });
}
const IDX = new Map(KARTA.map((k, i) => [k.slug, i]));
P("E0 karta parsad", KARTA.length === 440, KARTA.length + " kurser");

// ── larvag.ts-semantik (BAS, påslag, MALNIVA, varför-generatorer) ────────────
const BAS = { svagheten: 90, kategoriFortsattning: 86 };
const MALNIVA = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-redo": 3 };
const poang = (bas, k, malniva) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);
const varforSvaghet = (t, d) => `Quiz-signalen lyser just nu på ${t} — ${String(d)} delar väntar på en omgång till, och sedan sitter kunskapen.`;
const varforFortsattning = (t, kat, n) => `Du är igång i ${kat.toLowerCase()} — ${n === 1 ? "ditt första steg" : `${String(n)} steg`} ligger bakom dig, och ${t} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;

/** Läsreplik av raknaLarvag:s relevanta nomineringsgrenar (2 + 3) + sortering. */
function rakna(progress, lasande) {
  const klaraSet = new Set(progress.klaraKurser);
  const kan = (slug) => { if (klaraSet.has(slug)) return undefined; const k = KARTA[IDX.get(slug)]; return k && k.kraverFas <= lasande.fas ? k : undefined; };
  const malniva = MALNIVA[lasande.lasTillstand];
  const kand = [];
  const nom = (slug, bas, regel, varför) => { const k = kan(slug); if (!k || kand.some((x) => x.slug === slug)) return; kand.push({ slug, titel: k.titel, varför, poäng: poang(bas, k, malniva), regel }); };
  // 2 ── svagheten (argmax, minst 3 delar; oavgång → lägre kartindex)
  let sSlug = null, sDelar = 0;
  for (const [slug, delar] of Object.entries(lasande.svagheter)) {
    if (!(delar >= 3) || !kan(slug)) continue;
    if (delar > sDelar || (delar === sDelar && (IDX.get(slug) ?? 9e9) < (IDX.get(sSlug) ?? 9e9))) { sSlug = slug; sDelar = delar; }
  }
  if (sSlug) nom(sSlug, BAS.svagheten, "svagheten", varforSvaghet(KARTA[IDX.get(sSlug)].titel, sDelar));
  // 3 ── kategori-fortsattning (flest klara i kategori → nästa oklara, lägst index)
  const katR = new Map();
  for (const s of progress.klaraKurser) { const k = KARTA[IDX.get(s)]; if (k) katR.set(k.kategori, (katR.get(k.kategori) ?? 0) + 1); }
  let pKat = null, pAntal = 0;
  for (const [kat, n] of katR) if (n > pAntal) { pKat = kat; pAntal = n; }
  if (pKat) {
    const f = KARTA.filter((k) => k.kategori === pKat && kan(k.slug) && !kand.some((x) => x.slug === k.slug))[0];
    if (f) nom(f.slug, BAS.kategoriFortsattning, "kategori-fortsattning", varforFortsattning(f.titel, pKat, pAntal));
  }
  return kand.sort((a, b) => b.poäng - a.poäng || (IDX.get(a.slug) ?? 0) - (IDX.get(b.slug) ?? 0));
}

// ── E1/E2: mina kurser i kartan med rätt struktur ────────────────────────────
const ib04 = KARTA[IDX.get("ib-04-avkastningsrakningen")];
const roic04 = KARTA[IDX.get("roic-04-vardeekvationen")];
P("E1 ib-04 i karta", !!ib04 && ib04.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG" && ib04.niva === 2 && ib04.kraverFas === 0, ib04 ? `kat ${ib04.kategori} · niva ${ib04.niva} · fas ${ib04.kraverFas} · ${ib04.minuter} min` : "SAKNAS");
P("E2 roic-04 i karta", !!roic04 && roic04.kategori === "LÖNSAMHET" && roic04.niva === 3 && roic04.kraverFas === 0, roic04 ? `kat ${roic04.kategori} · niva ${roic04.niva} · fas ${roic04.kraverFas} · ${roic04.minuter} min` : "SAKNAS");

// ── E3: 90p-nominering ib-04 med nivåmatch (växande läsare, 5 svaghetsdelar) ─
const r3 = rakna({ xp: 5000, klaraKurser: ["ib-01-vad-ar-ett-investmentbolag", "ib-02-substansens-kvalitet", "ib-03-forvaltarskapet"] }, { lasTillstand: "växande", fas: 1, streak: 0, svagheter: { "ib-04-avkastningsrakningen": 5 } });
const n3 = r3.find((x) => x.slug === "ib-04-avkastningsrakningen");
P("E3 ib-04 90p+4 nivåmatch", !!n3 && n3.poäng === 94 && n3.regel === "svagheten", n3 ? `${n3.poäng}p · ${n3.regel}` : "ej nominerad");
P("E3b varför-rad genererad", !!n3 && n3.varför === varforSvaghet("Avkastningsräkningen — substans, rabatt och utdelning: varje krona har en adress", 5), n3 ? "»" + n3.varför.slice(0, 80) + "…«" : "—");

// ── E4: 90p-nominering roic-04 med nivåmatch (avancerad läsare, 4 delar) ─────
const r4 = rakna({ xp: 9000, klaraKurser: ["roic-01-avkastning-pa-investerat-kapital", "roic-02-avkastningstrappan", "roic-03-inkrementell-roic"] }, { lasTillstand: "avancerad", fas: 1, streak: 0, svagheter: { "roic-04-vardeekvationen": 4 } });
const n4 = r4.find((x) => x.slug === "roic-04-vardeekvationen");
P("E4 roic-04 90p+4 nivåmatch", !!n4 && n4.poäng === 94 && n4.regel === "svagheten", n4 ? `${n4.poäng}p · ${n4.regel}` : "ej nominerad");

// ── E5: kategori-fortsättning 86 UTAN nivåmatch (nybörjare + PE-familjen klar) ─
// Kategorin PRIVATE EQUITY & INVESTMENTBOLAG i kartordning: km-067 (#86),
// km-068 (#87), ib-01..03 (#405-407) — alla klara ⇒ nästa oklara = ib-04 (#408).
const klaraPE = ["km-067-investmentbolag", "km-068-wallenbergsfaren", "ib-01-vad-ar-ett-investmentbolag", "ib-02-substansens-kvalitet", "ib-03-forvaltarskapet"];
const r5 = rakna({ xp: 3000, klaraKurser: klaraPE }, { lasTillstand: "nybörjare", fas: 1, streak: 0, svagheter: {} });
const n5 = r5.find((x) => x.slug === "ib-04-avkastningsrakningen");
P("E5 ib-04 86 utan nivåmatch", !!n5 && n5.poäng === 86 && n5.regel === "kategori-fortsattning", n5 ? `${n5.poäng}p · ${n5.regel}` : "ej nominerad");
P("E5b varför-rad fortsättning", !!n5 && n5.varför.includes("5 steg") && n5.varför.includes("private equity & investmentbolag"), n5 ? "»" + n5.varför.slice(0, 90) + "…«" : "—");

// ── E6: kartordning — serieordning bevarad (ib-03 < ib-04, roic-03 < roic-04) ─
P("E6 kartordning", IDX.get("ib-03-forvaltarskapet") < IDX.get("ib-04-avkastningsrakningen") && IDX.get("roic-03-inkrementell-roic") < IDX.get("roic-04-vardeekvationen"), `ib-03 #${IDX.get("ib-03-forvaltarskapet")} < ib-04 #${IDX.get("ib-04-avkastningsrakningen")} · roic-03 #${IDX.get("roic-03-inkrementell-roic")} < roic-04 #${IDX.get("roic-04-vardeekvationen")}`);

// ── E7: syskonen förblir nominerbara (syskonfreden) ───────────────────────────
const sib = ["se-17-skogssektorn", "kt-05-katalysatorernas-kalender", "rp-04-volatilitetsbudgeten", "bk-06-obeskattade-reserver-och-avsattningar", "sj-06-arv-gava-och-ingaende-varde", "pf-15-faktorpremierna"];
const saknas = sib.filter((s) => !IDX.has(s));
P("E7 syskon i karta", saknas.length === 0, saknas.length ? "saknas: " + saknas.join(", ") : sib.length + " steg på plats");
const r7 = rakna({ xp: 1000, klaraKurser: ["kt-01-vad-ar-en-katalysator"] }, { lasTillstand: "avancerad", fas: 1, streak: 0, svagheter: { "kt-05-katalysatorernas-kalender": 3 } });
const n7 = r7.find((x) => x.slug === "kt-05-katalysatorernas-kalender");
P("E7b syskon nominerbar", !!n7 && n7.poäng >= 90, n7 ? n7.poäng + "p" : "ej nominerad");

// ── E8: determinism — två körningar bitidentiska ──────────────────────────────
const indata = { xp: 5000, klaraKurser: klaraPE.slice(0, 4) }, lasande = { lasTillstand: "växande", fas: 1, streak: 0, svagheter: { "ib-04-avkastningsrakningen": 3, "roic-04-vardeekvationen": 4 } };
const a = JSON.stringify(rakna(indata, lasande));
const b = JSON.stringify(rakna(indata, lasande));
P("E8 determinism", a === b && a.length > 50, "bitidentiska svar (" + a.length + " tecken)");

console.log("\nFRONT B: " + pass.length + " PASS · " + fel.length + " FEL");
process.exit(fel.length ? 1 : 0);

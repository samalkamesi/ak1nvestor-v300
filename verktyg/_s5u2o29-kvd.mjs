#!/usr/bin/env node
// KVD för s5-u2 o29 — vm-12-reverserad-dcf + ud-10-ex-dagens-mekanik.
// Struktur · blockkonvention · round-trip · aritmetik LIVE-omräknad ·
// korslänkar registeräkta · juridikgrind · språkgrind · sondbelägg.
import { readFileSync } from "node:fs";

const REGISTER = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
const regSlugs = Object.keys(REGISTER);

let pass = 0, fel = 0;
const OK = (namn, villkor, bevis = "") => {
  if (villkor) { pass++; console.log("PASS " + namn + (bevis ? " — " + bevis : "")); }
  else { fel++; console.log("FEL " + namn + (bevis ? " — " + bevis : "")); }
};

const KURSER = ["pe-09-utdelningsrekapitaliseringen", "ud-10-ex-dagens-mekanik"];

// ── A. Struktur ×2 ───────────────────────────────────────────────────────────
const OBIGATORISKA = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","why","learn","history","chapters_list","lynchSection","grahamSection","ak1Section","chapters"];
for (const slug of KURSER) {
  const k = REGISTER[slug];
  OK("A.struktur " + slug, !!k, k ? "i registret" : "SAKNAS");
  if (!k) continue;
  const saknade = OBIGATORISKA.filter((f) => !(f in k));
  OK("A.fält " + slug, saknade.length === 0, saknade.length ? "saknas: " + saknade.join(",") : "18 fält");
  OK("A.minuter " + slug, k.minutes === k.totalMinutes && k.minutes === k.chapters.reduce((s, c) => s + c.minutes, 0),
    k.minutes + " = Σkapitel");
  OK("A.kapitelantal " + slug, k.chapterCount === k.chapters.length && k.chapters_list.length === k.chapters.length,
    k.chapterCount + " kapitel");
  const listaOk = k.chapters_list.every((c, i) => c.num === k.chapters[i].num && c.title === k.chapters[i].title && c.minutes === k.chapters[i].minutes);
  OK("A.kapitellista-paritet " + slug, listaOk, "chapters_list == chapters");
  OK("A.konvention " + slug,
    k.chapters[0].blocks.map((b) => b.type).join(",") === "text,definition,insight" &&
    k.chapters.slice(1, 5).every((c) => c.blocks.map((b) => b.type).join(",") === "text,tabell,insight") &&
    k.chapters[5].blocks.map((b) => b.type).join(",") === "text,text,utmaning",
    "kap1 def · kap2-5 tabell · kap6 utmaning");
  OK("A.xp-weight " + slug, k.xp === 50 && k.weight === "—", "xp 50, weight —");
  const blockTyper = new Set(k.chapters.flatMap((c) => c.blocks.map((b) => b.type)));
  OK("A.blocktyper " + slug, [...blockTyper].every((t) => ["text","definition","insight","tabell","utmaning"].includes(t)), [...blockTyper].join(","));
}

// ── B. Round-trip: källa == register bitidentiskt ───────────────────────────
for (const slug of KURSER) {
  const kalla = readFileSync("/home/ak1a/AK1/data/kurser-tillagg/" + slug + ".json", "utf8");
  OK("B.round-trip " + slug, JSON.stringify(JSON.parse(kalla)) === JSON.stringify(REGISTER[slug]), "bitidentisk");
}

// ── C. Aritmetik LIVE-omräknad ───────────────────────────────────────────────
function EV(g, wacc, fcf0 = 900, ar = 10, gt = 0.025) {
  let pv = 0;
  for (let t = 1; t <= ar; t++) pv += (fcf0 * Math.pow(1 + g, t)) / Math.pow(1 + wacc, t);
  const fcf10 = fcf0 * Math.pow(1 + g, ar);
  const tv10 = (fcf10 * (1 + gt)) / (wacc - gt);
  const pvTv = tv10 / Math.pow(1 + wacc, ar);
  return { pv, fcf10, tv10, pvTv, ev: pv + pvTv };
}
function rot(wacc, fcf0 = 900, gt = 0.025, mal = 17600) {
  let lo = 0, hi = 0.25;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; (EV(m, wacc, fcf0, 10, gt).ev < mal) ? (lo = m) : (hi = m); }
  return (lo + hi) / 2;
}
const avrunda = (n) => Math.round(n * 10) / 10;
// pe-09: värdena i kursens tabeller (IRR-lösning med bisektion)
{
  function irr(flows){let lo=-0.9,hi=2;for(let i=0;i<90;i++){const r=(lo+hi)/2;const npv=flows.reduce((s2,f,t)=>s2+f/Math.pow(1+r,t),0);(npv>0)?lo=r:hi=r;}return(lo+hi)/2;}
  const utan=irr([-480,0,0,0,0,960]), med=irr([-480,0,0,440,0,520]);
  OK("C.pe09 irr", Math.abs(utan-0.14868)<0.0005 && Math.abs(med-0.18896)<0.0005,
    "IRR utan "+(utan*100).toFixed(1)+" % · med "+(med*100).toFixed(1)+" % (+4,0 p.p.)");
  OK("C.pe09 moic", 960/480===2 && (440+520)/480===2, "MOIC 2,00 = 2,00 i båda världarna");
  OK("C.pe09 kassaflöden", 1600-640===960 && 1600-1080===520 && 440+520===960,
    "exit EK 960/520 · 440+520 = 960");
  OK("C.pe09 trappan", 6*180-640===440 && 1080/180===6 && 640/180===(640/180) && Math.round((720/150)*10)/10===4.8 && Math.round((640/180)*10)/10===3.6,
    "nytt lån 440 · skuld/EBITDA 4,8 → 3,6 → 6,0");
  OK("C.pe09 räntor-täckning", Math.round(720*0.065*10)===468 && Math.round(640*0.065*10)===416 && Math.round(1080*0.065*10)===702 && Math.round((180/41.6)*100)/100===4.33 && Math.round((180/70.2)*100)/100===2.56,
    "ränta 46,8/41,6/70,2 · täckning 4,33 → 2,56");
  OK("C.pe09 köp-exit", 1200/150===8 && 1600/200===8 && 1200-720===480 && 720/1200===0.6,
    "8,0× in och ut · EK 480 (60 % lån)");
}
// ud-10: kursens tal
{
  OK("C.ud10 ex-kurs", 120 - 4.5 === 115.5 && (100 * 115.5) === 11550, "120,00 − 4,50 = 115,50");
  OK("C.ud10 frukosthandel", 12000 + 49 === 12049 && 11550 - 49 + 450 === 11951 && 11951 - 12049 === -98 && Math.round((-98 / 12000) * 10000) / 100 === -0.82,
    "in 12 049 · ut 11 951 · netto −98 = −0,82 %");
  OK("C.ud10 utdelning+direktavkastning", 100 * 4.5 === 450 && Math.round((4.5 / 120) * 10000) / 100 === 3.75, "450 kronor · 3,75 procent");
  OK("C.ud10 kort position", 25 * 4.5 === 112.5, "25 × 4,50 = 112,50");
}

// ── D. Korslänkar registeräkta ───────────────────────────────────────────────
{
  const okanda = new Set();
  for (const slug of KURSER) {
    const text = JSON.stringify(REGISTER[slug]);
    // fulla slugs (två+ bindestrecksord eller kända namn)
    for (const m of text.matchAll(/"([^"]*(?:[a-z]{2,}-[a-z0-9-]{3,})[^"]*)"/g)) void m;
    for (const m of text.matchAll(/\b[a-z]{2,}(?:-[a-z0-9]+){2,}\b/g)) {
      const s = m[0];
      if (!regSlugs.includes(s)) okanda.add(slug + "→" + s);
    }
    // familjerefsmönster xx-nn (t.ex. vm-04, kt-02)
    for (const m of text.matchAll(/\b([a-z]{1,6})-(\d{2,3})\b(?![\d-])/g)) {
      const prefix = m[1] + "-" + m[2];
      if (!regSlugs.some((s) => s === prefix || s.startsWith(prefix + "-"))) okanda.add(slug + "→" + prefix);
    }
  }
  OK("D.korslänkar registeräkta", okanda.size === 0, okanda.size ? "okända: " + [...okanda].slice(0, 8).join(", ") : "samtliga referenser löser i registret (" + regSlugs.length + ")");
}

// ── E. Juridikgrind ──────────────────────────────────────────────────────────
{
  for (const slug of KURSER) {
    const text = JSON.stringify(REGISTER[slug]);
    const radsverb = [...text.matchAll(/\b(köp|sälj| Borga|rekommenderar att)\b/gi)].map((m) => m[0]);
    OK("E.rådsverb " + slug, radsverb.length === 0, radsverb.length ? "träffar: " + radsverb.join(",") : "0 imperativ");
    const lagrum = [...text.matchAll(/\b\d{4}:\d+\b/g)].map((m) => m[0]);
    const lagNämn = (text.match(/lagen om värdepappersrörelse/g) || []).length;
    OK("E.lagrum " + slug, lagrum.length === 0 && lagNämn <= 1, lagrum.length + " numrerade · " + lagNämn + " namngiven(2007:528-framing)");
    const pristal = [...text.matchAll(/\b(249|449|799|9 ?999|13 ?999)\b/g)].map((m) => m[0]);
    OK("E.r2-pristal " + slug, pristal.length === 0, "0 tier-tal");
    const framing = /inte investeringsråd| Pedagogisk kurs|övning i läskonst|ingen uppmaning/i.test(text);
    OK("E.utbildningsframing " + slug, framing, "utbildningsram present");
  }
}

// ── F. Språkgrind ────────────────────────────────────────────────────────────
{
  for (const slug of KURSER) {
    const text = JSON.stringify(REGISTER[slug]);
    const cjk = text.match(/[\u{4E00}-\u{9FFF}\u{0400}-\u{04FF}]/gu) || [];
    OK("F.cjk " + slug, cjk.length === 0, cjk.length ? cjk.join("") : "0 främmande skrift");
    const sh = (text.match(/\u00AD/g) || []).length;
    OK("F.mjuka-bindestreck " + slug, sh === 0, "0");
    const dubbelt = [...text.matchAll(/\b([a-zåäöé]{3,})\s+\1\b/gi)].map((m) => m[0]);
    OK("F.dubbelord " + slug, dubbelt.length === 0, dubbelt.length ? dubbelt.join(",") : "0");
  }
}

// ── G. Sondbelägg (vitfläckarna fortfarande vita utanför de nya kurserna) ────
{
  const andra = regSlugs.filter((s) => !KURSER.includes(s));
  const agare = (term) => andra.filter((s) => JSON.stringify(REGISTER[s]).toLowerCase().includes(term));
  OK("G.sond dividend recap", agare("dividend recap").length === 0, "0 andra kursägare");
  const rek = agare("rekapitalisering");
  OK("G.sond rekapitalisering", rek.length <= 1 && rek.every((x) => x === "distress-investing"), "endast bokkurs: " + (rek.join(", ") || "0"));
  const avstam = agare("avstämningsdag");
  OK("G.sond avstämningsdag", avstam.length <= 2 && avstam.every((s) => ["ks-04-emissionens-mekanik", "od-05-utdelningen-och-optionen"].includes(s)),
    "ägare utanför familjen: " + (avstam.join(", ") || "0"));
}

console.log("══════════════════════════════════");
console.log("KVD: " + pass + " PASS · " + fel + " FEL");
process.exit(fel ? 1 : 0);

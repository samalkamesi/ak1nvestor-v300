#!/usr/bin/env node
/**
 * AK1A — ÖVERSÄTT-POST (våg 86, agent V86-OVERSATT): översättnings-lifecykeln
 * för EN ny bloggpost, från data/blogg/<slug>.json till importklart paket.
 * Produktmål: STYRELSE-VAG84-PLAN.md §(c) — "översätt vid publicering"
 * (sv först, agent rondar). Detta är plock-rutinens lilla verktyg.
 *
 * ── HELA ARBETSGÅNGEN VID PUBLICERING AV NY POST ────────────────────────────
 *   1. SV PUBLICERAS: panelens "Publicera (skickar till agent)" skriver
 *      blogg_publicerad-eventet (src/lib/blogg-utkast.ts publiceraMedPaket —
 *      0-FEL-grinden passerad, disclaimer tillagd). Main-agenten droppar
 *      paketet som data/blogg/<slug>.json + commit → posten LIVE på svenska
 *      (speglarna visar svensk fallback tills MÖS-lagret färgs).
 *   2. KÄLLPAKET:    node verktyg/oversatt-post.mjs <slug>
 *      → data/oversattning-import/v86post-<slug>-kalla.json (källposter i
 *      MÖS-bloggform + instruktionsblock). Kontrollera antalKallposter > 0.
 *   3. AGENTÖVERSÄTT: översättningsagenten får källpaketet och levererar
 *      data/oversattning-import/v86post-<slug>-svar-all.json ({poster:
 *      [{nyckel, en, ar}]}) — ALLA nycklar i EN fil (-svar-all-konventionen,
 *      våg 80b: enskilda svar.json måste monteras till -svar-all).
 *   4. FÖRKONTROLL:   node verktyg/oversatt-post.mjs <slug> --kontroll v86post-<slug>-svar-all.json
 *      → RENT lokala kontroller (längdkvot + sifferintegritet + struktur-
 *      matchning mot källposterna) + Importpaket v86post-<slug>-import.json.
 *      OBS: detta är en FÖRkontroll — FULL kontroll (termbank 40p + siffror
 *      25p + struktur 20p + lateral 15p, tröskel 90) körs av pipelinen:
 *   5. IMPORT:        node verktyg/importera-oversattning.mjs v86post-<slug>-import.json
 *      → korKontroller per språk + upsert i Supabase (oversattningar).
 *      Hinner vågen ej: skriv system_events type="oversattning_skuld"
 *      (details=slug+fält) — nästa rond genereras ur STATUSKARTAN.
 *   6. DEPLOY: main-push → ISR färgar speglarna ≤ 1 h. Regenerera sok-index
 *      + speglar-slugar (verktyg/kor-sokindex.mjs, verktyg/kor-speglar-slugar
 *      .mjs) i samma steg som fil-droppen (våg 83-verktygen).
 *
 * ── IMD-VARNINGEN (våg 76-lärdomen — Läs innan varje kontroll) ──────────────
 *   "ALLA POSTER 100p" över 0 poster är en VAKANT kontroll. Kontrollen hoppar
 *   tyst nullade poster — kontrollera ALLTID att antal poster i kontrollen ==
 *   antal källposter FÖRE import (this tool: godkända/totalt + exit-kod).
 *   Vakant eller ofullständig kontroll ⇒ reparera/omimportera — ALDRIG lita
 *   på grön text över en tom mängd. Verktyget vägrar skriva Importpaket vid
 *   0 matchande poster och markerar partiella paket med "ofullstandig": true.
 *
 * ── NAMNGIVNING/KATALOGCONTRAKT ──────────────────────────────────────────────
 *   Allt lever i data/oversattning-import/ (importörens katalog):
 *     v86post-<slug>-kalla.json     källpaket (ARBETSFIL — har med flit INGA
 *                                   "kurs"/"poster"-fält: importera-oversatt-
 *                                   ning.mjs:s no-arg-läge ska inte kunna
 *                                   tolka den; städa bort när kedjan är klar)
 *     v86post-<slug>-svar-all.json  agentens leverans (ARBETSFIL — städa)
 *     v86post-<slug>-import.json    Importpaket ( Kurs + poster {nyckel,en,ar} )
 *                                   — importeras med EXPLICIT filnamn.
 *
 * Användning:
 *   node verktyg/oversatt-post.mjs <slug>                        # källpaket
 *   node verktyg/oversatt-post.mjs <slug> --kontroll <svarfil>   # förkontroll
 * Avslutskod: 0 = komplett + 0 FEL · 1 = FEL, vakant eller ofullständig.
 *
 * Rent lokalt: fs + crypto, INGET nätverk, inga Supabase-nycklar, inga
 * src-imports (kontrollkärnan är återimplementerad från src/lib/oversattning/
 * kontroller.ts — sifferlogiken ordagrant, strukturprofilen styckeanpassad).
 * Rör ALDRIG src/ eller befintliga verktyg.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOGG_KAT = path.join(REPO, "data", "blogg");
const IMPORT_KAT = path.join(REPO, "data", "oversattning-import");
const SLUG_RE = /^[a-z0-9-]+$/;
const LANGD_FEL = [0.5, 2.5]; // hårt tak — paritet med kontroller.ts lateralKolla
const LANGD_VARning = [0.6, 2.5]; // agentmålet i instruktionsblocket (strängare)
const MALSPRAK = ["en", "ar"];

// ── Källpostsextraktion — spegling av src/lib/oversattning/kalla.ts ──────────
// (lasBloggKallor + bloggStycken: EXAKT samma nycklar, styckedelning och
//  hopp-logik, annars matchar inte MÖS-lagret källorna vid import.)

/** Styckedelen av en body — /\n\n+/, tomma/vita block numreras ej (kalla.ts). */
function bloggStycken(body) {
  return body
    .split(/\n\n+/)
    .filter((s) => s.trim().length > 0);
}

/** SHA-256 av källtexten, förkortad till 12 hex (kalla.ts raknaHash). */
function raknaHash(text) {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);
}

/**
 * Läser data/blogg/<slug>.json → källposter i MÖS-bloggform.
 * Nycklar: "<intern-slug>:titel" | ":ingress" (=description) | ":p<n>"
 * (stycke n, 1-baserat). Intern slug (JSON-fältet) äger nycklarna — samma
 * som kalla.ts; skiljer den från filnamnet varnas det (importen skulle leta
 * efter fel nycklar annars).
 */
function lasKallposter(slug) {
  const fil = path.join(BLOGG_KAT, slug + ".json");
  if (!existsSync(fil)) {
    throw new Error('Hittar inte ' + fil + ' — publicera posten först (steg 1 i arbetsgången).');
  }
  let inlagg;
  try {
    inlagg = JSON.parse(readFileSync(fil, "utf8").replace(/^\uFEFF/, ""));
  } catch (e) {
    throw new Error("Ogiltig JSON i " + fil + ": " + (e instanceof Error ? e.message : String(e)));
  }
  const internSlug = typeof inlagg?.slug === "string" ? inlagg.slug : "";
  if (!internSlug) {
    throw new Error(fil + ' saknar "slug"-fältet — inte en bloggpost i BlogPost-formen.');
  }

  const poster = [];
  const push = (suffix, text) => {
    if (typeof text !== "string" || text.trim().length === 0) return; // kalla.ts: tomma är inga objekt
    poster.push({ nyckel: internSlug + ":" + suffix, sv: text, hash: raknaHash(text) });
  };
  push("titel", inlagg.title);
  push("ingress", inlagg.description);
  if (typeof inlagg.body === "string") {
    bloggStycken(inlagg.body).forEach((stycke, i) => push("p" + String(i + 1), stycke));
  }

  return {
    fil,
    internSlug,
    slugVarning: internSlug !== slug
      ? 'Filnamns-slug "' + slug + '" ≠ postens egna slug-fält "' + internSlug + '" — MÖS-nycklarna följer det INTERNA värdet (kalla.ts).'
      : null,
    poster,
  };
}

// ── Instruktionsblocket (agentkontraktet — våg 65-80:s standard) ─────────────

function instruktionsblock(slug) {
  return {
    uppdrag:
      "Översätt ALLA källposter (kallposter) nedan till professionell finansengelska (en) och modern standardarabiska (ar), " +
      "pedagogisk plattformston — inga rådsformuleringar. Behåll nycklarna OFÖRÄNDRADE och leverera ALLA poster i EN fil: " +
      "data/oversattning-import/v86post-" + slug + "-svar-all.json med formen {\"poster\":[{\"nyckel\":\"…\",\"en\":\"…\",\"ar\":\"…\"}]}.",
    termbankRegler: [
      "Termbanken (src/lib/oversattning/termbank.ts + data/termbank-tillagg.json) är sanningen: varje svensk termbanksterm som förekommer i källtexten SKALL ha bankens EXAKTA en-/ar-målterm i översättningen (kontrollen söker med includes()).",
      "Latinska förkortningar/varumärken behålls latinska i AR: ROE, EV/EBITDA, P/E, P/B, P/S, EBIT, EBITDA, ROIC, NCAV, NAV, DCF, SaaS, ARR, AKM1, AK1A, AK1TS m.fl.",
      "Okänd fackterm? Håll dig till banken — hitta inte på egna synonymer; samma begrepp ska heta samma sak genom hela sajten.",
    ],
    fullfrasKravEN: [
      "EN-måltermen måste ingå som HEL fras (ordgränser) — delträffar räcker inte: 'aktier'→'stocks' kräver själva ordet 'stocks', inte 'stockholm'.",
      "Sammansatta källtermer kan kräva FLERA målord: 'vinst per aktie' kräver både 'earnings per share' OCH 'stock' i texten (dubbelträff-fällan).",
      "Svenska ägarsuffix oversätt aldrig mekaniskt: 'AKM1:s poängskala' = 'the AKM1 scoring scale'.",
    ],
    bestandaFormerAR: [
      "Kontrollen kräver EXAKT substringsmatch ⇒ använd termbankens BESTÄMDA form (المحفظة، الإيرادات، نسبة الدين إلى حقوق الملكية …) även där obestämd form vore naturligare.",
      "Lam-assimilation GÖMMER kanonformen: للنسبة innehåller INTE النسبة — skriv om med مع/على/في/ب eller fristående bestämd form.",
      "Pluralformer av termer gäller inte som träff (الارتباطات ⊅ الارتباط) — använd den singulära bestämda formen.",
      "INGA å/ä/ö i arabisk text: avdiakritisera svenska bolagsnamn (Industrivärden→Industrivarden, Orrön→Orron).",
      "ألف maqsura-fällan: 'nivå'-termen kräver المستوى (ى), inte المستويات-former.",
    ],
    langdkvot: {
      mal: "0,6–2,5× källtextens längd per post och språk",
      hardt: "utanför 0,5–2,5 nekar pipelinen (lateralKolla, 15p)",
      notering: "kraftigt avvikande längd = avkapad (för kort) eller påhittad (för lång) text",
    },
    sifferintegritet: [
      "ALLA tal ska vara identiska multiset med källan — en felaktig siffra är ett FAKTAFEL, inte ett språkfel.",
      "Strängformen bevaras EXAKT: decimaltecken '12,5' förblir komma även i EN, '+33%' behåller tecknet, intervall '30-50%' intakta, tusentalsgrupp med mellanslag '172 426', punkter i '1.5x' där källan har det.",
      "AR får använda östra siffror (٠-٩) — de normaliseras före jämförelsen; västerländska 0-9 är dock sajtens convention.",
      "Se upp för extratoken-fällor: 'AKM1' ger token '1', 'V11' ger '11' (inte '1'+'1'), 'pre-2017' ger '-2017'.",
    ],
    struktur: [
      "Rad för rad: antal rader per post identiskt; markdown bevaras (## rubriker, **fetstil**, - listor, numrerade listor, tabellrader |, emoji).",
      "Länk-URL:er översätts ALDRIG — [text](/sokvag) håller sökvägen orörd, bara länktexten översätts.",
      "Inläggsdisclaimer-sista-raden översätts med samma negerade formulering ('inte investeringsråd').",
    ],
    svarformat: {
      fil: "data/oversattning-import/v86post-" + slug + "-svar-all.json",
      form: '{"poster": [{"nyckel": "<oförändrad källnyckel>", "en": "…", "ar": "…"}, …]}',
      krav: [
        "ALLA källposter, i samma ordning, i EN fil (-svar-all-konventionen).",
        "Tom sträng på ett språk = posten importeras bara för det andra — undantag ska motiveras i leveransen.",
        "Kör sedan: node verktyg/oversatt-post.mjs " + slug + " --kontroll v86post-" + slug + "-svar-all.json",
      ],
    },
    fullKontrollVidImport:
      "Dessa regler kontrolleras FULLT av importpipelinen (verktyg/importera-oversattning.mjs → src/lib/oversattning/kontroller.ts: termKonsistens 40p + sifferIntegritet 25p + strukturIntegritet 20p + lateralKolla 15p, tröskel 90) — följ dem vid skrivandet, inte vid rättandet.",
  };
}

// ── Läge 1: skriv källpaketet (AGENTPAKETET) ─────────────────────────────────

async function kallaLage(slug) {
  const kalla = lasKallposter(slug);
  if (kalla.poster.length === 0) {
    throw new Error("0 källposter — posten saknar title/description/body-text? (kalla.ts-logiken hittade inget textbärande fält)");
  }
  if (kalla.slugVarning) console.log("[VARNING] " + kalla.slugVarning);

  const paketFil = path.join(IMPORT_KAT, "v86post-" + slug + "-kalla.json");
  const paket = {
    _lasMig: "AGENTPAKET (våg 86) — arbetsfil, INTE importbar: saknar kurs/poster-fält med flit. Översätt enligt instruktioner och leverera " +
      "v86post-" + slug + "-svar-all.json; städa bort denna fil när kedjan är klar.",
    typ: "v86post-kalla",
    slug,
    skapad: new Date().toISOString().slice(0, 10),
    kallaFil: "data/blogg/" + slug + ".json",
    antalKallposter: kalla.poster.length,
    svarsFilForvantad: "v86post-" + slug + "-svar-all.json",
    instruktioner: instruktionsblock(kalla.internSlug),
    kallposter: kalla.poster,
  };
  mkdirSync(IMPORT_KAT, { recursive: true });
  writeFileSync(paketFil, JSON.stringify(paket, null, 2) + "\n", "utf8");

  const totalTecken = kalla.poster.reduce((s, p) => s + p.sv.length, 0);
  console.log("═══ ÖVERSÄTT-POST — källpaket (våg 86) ═══");
  console.log("Källa:      " + kalla.fil);
  console.log("Poster:     " + kalla.poster.length + " (titel + ingress + " + Math.max(0, kalla.poster.length - 2) + " body-stycken · " + totalTecken + " tecken källtext)");
  console.log("Paket:      " + path.relative(REPO, paketFil));
  console.log("");
  console.log("Nästa steg: händera paketet till översättningsagenten → den levererar");
  console.log("            " + paket.svarsFilForvantad + " i samma katalog (ALLA poster i EN fil).");
  console.log("Därefter:   node verktyg/oversatt-post.mjs " + slug + " --kontroll " + paket.svarsFilForvantad);
  return 0;
}

// ── Kontrollkärnan (RENT — återimplementerad ur kontroller.ts) ───────────────

/** Östra siffror/separatatorer → västerländska (kontroller.ts, ordagrant). */
const OSTRA_SIFFROR = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٫": ".", "٬": ",",
};
function normaliseraSiffror(text) {
  return text.replace(/[٠-٩۰-۹٫٬]/gu, (t) => OSTRA_SIFFROR[t] ?? t);
}

/** Talregex enligt kundspec: [-+]?\d+([.,]\d+)? — på normaliserad text. */
const TAL_RE = /[-+]?\d+(?:[.,]\d+)?/g;

/** Multiset av talen i en text: "12,5 12,5 8" → {"12,5": 2, "8": 1}. */
function talMultiset(text) {
  const m = new Map();
  for (const tal of normaliseraSiffror(text).match(TAL_RE) ?? []) {
    m.set(tal, (m.get(tal) ?? 0) + 1);
  }
  return m;
}

/** Radnivå-strukturprofil (strukturProfil anpassad för blogg-styckeposter:
 *  styckena är redan delade av kalla.ts — här jämförs raderna INOM posten). */
function radProfil(text) {
  const rader = text.split("\n");
  return {
    rader: rader.length,
    punktlistor: rader.filter((r) => /^\s*[-*+]\s/.test(r)).length,
    numreradeListor: rader.filter((r) => /^\s*\d+[.)]\s/.test(r)).length,
    rubriker: rader.filter((r) => /^\s*#{1,6}\s/.test(r)).length,
    tabellrader: rader.filter((r) => /^\s*\|/.test(r)).length,
  };
}

/**
 * Förkontroll av EN post på ETT språk. Returnerar fel[]/varningar[] —
 * längdkvot (hårt 0,5–2,5, agentmål 0,6–2,5), siffermultiset,
 * radstruktur, plus AR/EN-läckagetips (fulla kontrollerna sker i pipelinen).
 */
function kontrolleraPost(nyckel, kalltext, oversattning, sprak) {
  const fel = [];
  const varningar = [];

  // Längdkvot
  const kvot = kalltext.length > 0 ? oversattning.length / kalltext.length : 1;
  if (kvot < LANGD_FEL[0] || kvot > LANGD_FEL[1]) {
    fel.push("längdkvot " + kvot.toFixed(3) + " utanför [" + LANGD_FEL[0] + ";" + LANGD_FEL[1] + "] (pipeline nekar)");
  } else if (kvot < LANGD_VARning[0] || kvot > LANGD_VARning[1]) {
    varningar.push("längdkvot " + kvot.toFixed(3) + " utanför agentmålet [0,6; 2,5]");
  }

  // Sifferintegritet (multiset, AR-normaliserad)
  const km = talMultiset(kalltext);
  const om = talMultiset(oversattning);
  const saknas = [];
  const extra = [];
  for (const [tal, antal] of km) if ((om.get(tal) ?? 0) < antal) saknas.push(tal);
  for (const [tal, antal] of om) if ((km.get(tal) ?? 0) < antal) extra.push(tal);
  if (saknas.length || extra.length) {
    fel.push("siffror avviker — saknas: [" + saknas.slice(0, 6).join(", ") + "] extra: [" + extra.slice(0, 6).join(", ") + "]");
  }

  // Struktur (radnivå)
  const a = radProfil(kalltext);
  const b = radProfil(oversattning);
  const avvikelser = [];
  for (const nyckelFalt of Object.keys(a)) {
    if (a[nyckelFalt] !== b[nyckelFalt]) {
      avvikelser.push(nyckelFalt + ": källa " + a[nyckelFalt] + " ≠ översättning " + b[nyckelFalt]);
    }
  }
  if (avvikelser.length) fel.push("struktur avviker — " + avvikelser.join("; "));

  // Läckage-tips (full vitlista-medveten kontroll ägs av pipelinen)
  if (sprak === "ar" && /[åäöÅÄÖ]/.test(oversattning)) {
    varningar.push("åäö i arabisk text (pipeline: endast vitlistade termbankssträngar tillåts) — avdiakritisera bolagsnamn");
  }
  if (sprak === "en" && /[\u0600-\u06FF]/.test(oversattning)) {
    varningar.push("arabiska tecken i engelsk text");
  }

  return { fel, varningar, varden: { kvot: Math.round(kvot * 1000) / 1000, unikaTalKalla: km.size } };
}

// ── Läge 2: förkontroll + Importpaket ────────────────────────────────────────

function lasSvarfil(svarArg) {
  const kandidater = [
    path.isAbsolute(svarArg) ? svarArg : path.join(process.cwd(), svarArg),
    path.join(IMPORT_KAT, svarArg),
  ];
  for (const sokvag of kandidater) {
    if (existsSync(sokvag)) {
      let data;
      try {
        data = JSON.parse(readFileSync(sokvag, "utf8").replace(/^\uFEFF/, ""));
      } catch (e) {
        throw new Error("Ogiltig JSON i " + sokvag + ": " + (e instanceof Error ? e.message : String(e)));
      }
      if (!Array.isArray(data?.poster)) {
        throw new Error(sokvag + ' saknar "poster"-array — svarfilens form är {"poster":[{nyckel,en,ar},…]} (se källpaketets instruktioner.svarformat).');
      }
      return { sokvag, data };
    }
  }
  throw new Error("Hittar inte svarfilen '" + svarArg + "' (sökte " + kandidater.join(" ; ") + ").");
}

async function kontrollLage(slug, svarArg) {
  const kalla = lasKallposter(slug);
  const kallKarta = new Map(kalla.poster.map((p) => [p.nyckel, p]));
  const { sokvag: svarSokvag, data: svar } = lasSvarfil(svarArg);

  console.log("═══ ÖVERSÄTT-POST — förkontroll (våg 86) ═══");
  console.log("Källa:   " + kalla.fil + " (" + kalla.poster.length + " källposter)");
  console.log("Svar:    " + svarSokvag + " (" + svar.poster.length + " poster)");
  console.log("");

  // IMD-VAKANSVAKTEN (våg 76): tom/matchningslös leverans är VAKANT — ALDRIG grönt.
  if (svar.poster.length === 0) {
    console.log("[IMD-VARNING] VAKANT leverans: 0 poster i svarfilen.");
    console.log("  Åtgärd: reparera och omleverera — OMIMPORTERA aldrig ett tomt paket (våg 76-lärdomen).");
    return 1;
  }

  // Nyckelmatchning
  const felRader = [];
  const varningsRader = [];
  const okandaNycklar = [];
  const saknadeNycklar = [];
  const godkandaPoster = [];
  let kontrollerade = 0;

  for (const p of svar.poster) {
    const nyckel = typeof p?.nyckel === "string" ? p.nyckel.trim() : "";
    if (!nyckel || !kallKarta.has(nyckel)) {
      okandaNycklar.push(nyckel || "(tom nyckel)");
      continue;
    }
    const kallpost = kallKarta.get(nyckel);
    // Valfritt sv-fält: källregistret är sanningen — avvikelse är en varning.
    if (typeof p.sv === "string" && p.sv !== kallpost.sv) {
      varningsRader.push(nyckel + ": sv-fältet i svaret avviker från källtexten — källregistret gäller (skillnaden ignoreras)");
    }
    const post = { nyckel, en: "", ar: "" };
    let postFel = [];
    for (const sprak of MALSPRAK) {
      const text = typeof p?.[sprak] === "string" ? p[sprak] : "";
      if (text.trim().length === 0) {
        varningsRader.push(nyckel + ": saknar " + sprak + " (importeras bara för det andra språket)");
        continue;
      }
      const r = kontrolleraPost(nyckel, kallpost.sv, text, sprak);
      kontrollerade++;
      for (const f of r.fel) felRader.push(nyckel + " (" + sprak + "): " + f);
      for (const v of r.varningar) varningsRader.push(nyckel + " (" + sprak + "): " + v);
      postFel = postFel.concat(r.fel.map((f) => sprak + ": " + f));
      post[sprak] = text;
    }
    if (!postFel.length) godkandaPoster.push(post); // FEL-poster exkluderas ur paketet
  }
  for (const nyckel of kallKarta.keys()) {
    if (!svar.poster.some((p) => typeof p?.nyckel === "string" && p.nyckel.trim() === nyckel)) {
      saknadeNycklar.push(nyckel);
    }
  }

  // Rapport
  for (const n of okandaNycklar) console.log("  [FEL] okänd nyckel (finns ej bland källposterna): " + n);
  for (const n of saknadeNycklar.slice(0, 12)) console.log("  [FEL] saknad nyckel i svaret: " + n);
  if (saknadeNycklar.length > 12) console.log("  [FEL] … ytterligare " + (saknadeNycklar.length - 12) + " saknade nycklar");
  for (const v of varningsRader.slice(0, 20)) console.log("  [VARNING] " + v);
  if (varningsRader.length > 20) console.log("  [VARNING] … ytterligare " + (varningsRader.length - 20) + " varningar");
  for (const f of felRader.slice(0, 20)) console.log("  [FEL] " + f);
  if (felRader.length > 20) console.log("  [FEL] … ytterligare " + (felRader.length - 20) + " fel");

  console.log("");
  console.log("Förkontroll: " + kontrollerade + " språkposter kontrollerade · " + godkandaPoster.length + "/" + kalla.poster.length + " nycklar godkända" + (felRader.length ? " · " + felRader.length + " FEL" : "") + (varningsRader.length ? " · " + varningsRader.length + " varningar" : ""));

  // IMD-vakansvakt nr 2: 0 godkända poster = VAKANT — inget Importpaket.
  if (godkandaPoster.length === 0) {
    console.log("");
    console.log("[IMD-VARNING] VAKANT kontroll: 0 godkända poster — INGET Importpaket skrivs.");
    console.log("  '0 av 0 godkända' är ALDRIG grönt (våg 76-lärdomen). Reparera svaret och kör om.");
    return 1;
  }

  const komplett = godkandaPoster.length === kalla.poster.length && felRader.length === 0 && saknadeNycklar.length === 0 && okandaNycklar.length === 0;
  const importFil = path.join(IMPORT_KAT, "v86post-" + slug + "-import.json");
  const importPaket = {
    kurs: kalla.internSlug, // importörens kurs-fält ^[A-Za-z0-9][A-Za-z0-9-]*$ — blogg-slugen
    skapad: new Date().toISOString().slice(0, 10),
    beskrivning: "V86 översätt-post (verktyg/oversatt-post.mjs): förkontrollerad (längdkvot+siffror+struktur). FULL kontroll (termbank+siffror+struktur+lateral, tröskel 90p) körs av importera-oversattning.mjs.",
    sprak: MALSPRAK,
    ofullstandig: !komplett,
    kontroll: {
      kallposter: kalla.poster.length,
      godkanda: godkandaPoster.length,
      fel: felRader.length,
      varningar: varningsRader.length,
      saknadeNycklar: saknadeNycklar.length,
      okandaNycklar: okandaNycklar.length,
    },
    poster: godkandaPoster,
  };
  writeFileSync(importFil, JSON.stringify(importPaket, null, 2) + "\n", "utf8");

  console.log("Importpaket: " + path.relative(REPO, importFil) + " (" + godkandaPoster.length + " poster" + (komplett ? "" : ", OFULLSTÄNDIGT") + ")");
  console.log("");
  if (!komplett) {
    console.log("[IMD-VARNING] OFULLSTÄNDIGT: " + godkandaPoster.length + "/" + kalla.poster.length + " nycklar — paketet är PARTIELLT (ofullstandig: true).");
    console.log("  komplettera svaret med saknade nycklar + fixa FEL-poster och kör --kontroll igen.");
    console.log("  ett partiellt paket IMPORTERAS bara om partiell publicering verkligen avses (upsert per post).");
  }
  console.log("Nästa steg (FULL kontroll + import):");
  console.log("  node verktyg/importera-oversattning.mjs v86post-" + slug + "-import.json");
  console.log("  (därefter: main-push → ISR färgar speglarna ≤ 1 h; städa -kalla/-svar-all när kedjan är klar)");
  return komplett ? 0 : 1;
}

// ── main ─────────────────────────────────────────────────────────────────────

function anvandning() {
  console.log("Användning:");
  console.log("  node verktyg/oversatt-post.mjs <slug>                       # källpaket (kalla)");
  console.log("  node verktyg/oversatt-post.mjs <slug> --kontroll <svarfil>  # förkontroll + importpaket");
  console.log("Se filhuvudet för hela arbetsgången och IMD-varningen (våg 76).");
}

async function main() {
  const args = process.argv.slice(2);
  const kontrollIx = args.indexOf("--kontroll");
  const positionella = args.filter((a, i) => a !== "--kontroll" && !(kontrollIx >= 0 && i === kontrollIx + 1));
  const slug = positionella[0];
  const svarArg = kontrollIx >= 0 ? args[kontrollIx + 1] : null;

  if (!slug || !SLUG_RE.test(slug)) {
    console.log("[FEL] Slug krävs i formatet ^[a-z0-9-]+$ (filen data/blogg/<slug>.json).");
    anvandning();
    return 1;
  }
  if (kontrollIx >= 0 && (!svarArg || svarArg.startsWith("--"))) {
    console.log("[FEL] --kontroll kräver en svarfil som argument.");
    anvandning();
    return 1;
  }

  if (kontrollIx >= 0) return kontrollLage(slug, svarArg);
  return kallaLage(slug);
}

main()
  .then((kod) => process.exit(kod))
  .catch((e) => {
    console.error("[oversatt-post] FEL: " + (e instanceof Error ? e.message : String(e)));
    process.exit(1);
  });

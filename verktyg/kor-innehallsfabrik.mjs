#!/usr/bin/env node
/**
 * AK1A — INNEHÅLLSFABRIKEN (våg 66, m9-piloten): TRE evergreen-bloggposter
 * auto-genererade ur forskningsdatan — inget LLM-tecken i basen, inga nya
 * datainsamlingar, ingen besöksdata (P6).
 *
 * Byggplan: data/forskning/MARKNAD/m9-innehallsfabrik.md (LED 1 + LED 2-maskinen)
 * + MARKNADS-BESLUT §0 (P1–P7) — publicering VILLKORAD på kontrolleraText (0 FEL)
 * + MÄNSKLIG GRANSKNING per post (våg 4-regeln; granskningskön markeras
 * metadata.techReview = "auto" i varje utdatafil).
 *
 * PILOTENS TRE POSTER (m9 rek 2 — tre i stället för 20, Search Console-data först):
 *   (a) Branschmedianer {månad} — varje branschs AKM2-profil
 *       ur peer.ts:s median-logik (median av gruppens AKM2-kompositer,
 *       PEER_MIN_GRUPP = 5, referens-form "skapad · N-bolagsuniversum")
 *   (b) Forskningsläget {månad} — {N} gröna av 100
 *       ur forskningslaget.ts:s tal + regim (fasta trösklar, texterna ORDAGRAT)
 *   (c) Vågkartan {månad} — träffprocenten {X} %
 *       ur data/rapporter/vagvalidering-SENASTE.md (vågmotorns rullande kvitto)
 *
 * EVERGREEN-SLUG (m9 §2.4): EN kanonisk slug per serie som UPPDATERAS varje
 * månad (daterat avsnitt inuti) — ALDRIG "-2026-09"-kopior. Omnämnanden av
 * befintlig post bevarar publishedAt och sätter updatedAt; oförändrat
 * underlag ⇒ identiska bytes ⇒ filen skrivs om ej (determinism, m9 §3 —
 * deltat baseras ENBART på utgåvor vars statistik faktiskt skiljde sig,
 * se forraBas()). En mänskligt granskad post (metadata.granskadAv satt)
 * skrivs ALDRIG över utan --tvinga (LED 3: maskinen undergräver aldrig
 * granskningsparet).
 *
 * KÄLLOR (alla läs-only):
 *   - data/portfolj-system/korstabell-grund.json  (100 bolag, 10 branscher × 10,
 *     rader bär akm2; rot bär skapad + statusRegler — P4: reglerna citeras)
 *   - data/rapporter/vagvalidering-SENASTE.md     (vågvalideringens rapport)
 *   - data/varumarke.json                         (kontrolleraTexts datakälla)
 *
 * ÄRLIGHETSLINJER (m9 §0 + §3): tal ur data med datering; osatt = osatt
 * (grupp < 5 mätta ⇒ raden saknas, ALDRIG gissning); peer.ts:s median-kontrakt
 * (jämnt n ⇒ medel av de två mittersta); urvalsberoendet syns i referensen;
 * bolag nämns ENDAST deskriptivt i jämförelse-sammanhang — inga värderingsverb.
 * Determinism: datum ur data (skapad/domdatum), aldrig klockan; klockan används
 * ENDAST till 45-dagars färskhetsregeln (m9 §5: vägrar gammalt underlag).
 *
 * Användning:  node verktyg/kor-innehallsfabrik.mjs [--torr] [--tvinga]
 *              --torr   = generera + kontrollera, skriv ingenting
 *              --tvinga = tillåt omskrivning av mänskligt granskad post
 * Avslutskod:  0 om alla tre posterna är skrivna/oförändrade, 1 vid blockad.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIL_KORSTABELL = path.join(REPO, "data", "portfolj-system", "korstabell-grund.json");
const FIL_RAPPORT = path.join(REPO, "data", "rapporter", "vagvalidering-SENASTE.md");
const FIL_VARUMARKE = path.join(REPO, "data", "varumarke.json");
const BLOGG = path.join(REPO, "data", "blogg");

const TORR = process.argv.includes("--torr");
const TVINGA = process.argv.includes("--tvinga");

const FABRIK_VERSION = "innehallsfabrik-v1";
const MAX_ALDER_DAGAR = 45; // m9 §5: publicera endast om underlaget ≤ 45 dagar gammalt

// ── Hjälpare (mönstret kor-analysfabrik.mjs / kor-analysblogg.mjs) ───────────

function lasJson(fil) {
  return JSON.parse(readFileSync(fil, "utf8"));
}
function md5(data) {
  return createHash("md5").update(data).digest("hex");
}
function md5Fil(fil) {
  return md5(readFileSync(fil));
}
/** "56.5" → "56,5"; heltal utan decimaler. */
function tal(x, decimaler = 1) {
  const t = Number(x).toFixed(decimaler).replace(/\.?0+$/, "");
  return t.replace(".", ",");
}
/** Svensk procent: 0.07 → "7 %". */
function pct(x, decimaler = 1) {
  return tal(x * 100, decimaler) + " %";
}
const MANADER = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
/** "2026-09-03" → "september 2026". */
function manadArsNamn(datum) {
  const m = Number(datum.slice(5, 7));
  return `${MANADER[m - 1]} ${datum.slice(0, 4)}`;
}
/** "AB Industrivärden (publ)" → "Industrivärden"; välanvända bolagssuffix trimmas. */
function kortNamn(namn) {
  let n = String(namn)
    .replace(/\s*\(publ\)\s*$/i, "")
    .replace(/^\s*AB\s+/i, "")
    .replace(/\s+AB$/i, "")
    .trim();
  const suffix = /\s+(Inc\.|Corporation|A\/S|Abp|Oyj|ASA|NV|S\.A\.|PLC|LLC|Aktiengesellschaft|SE & Co\. KGaA)$/i;
  while (suffix.test(n)) n = n.replace(suffix, "").trim();
  return n;
}
/** Datafilens åäö-fria branschnycklar → svenska visningsnamn ("halso" → "hälsa"). */
function branschNamn(bransch) {
  return { halso: "hälsa", tillvaxt: "tillväxt" }[bransch] ?? bransch;
}
/** Median enligt peer.ts:s kontrakt: jämnt n ⇒ medel av de två mittersta. */
function median(varde) {
  const talen = varde.filter((x) => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b);
  if (talen.length === 0) return null;
  const mitt = Math.floor(talen.length / 2);
  return talen.length % 2 === 1 ? talen[mitt] : (talen[mitt - 1] + talen[mitt]) / 2;
}
/** Färskhetsregeln (m9 §5) — klockans ENDA användning: vakten, inte innehållet. */
function alderDagar(datum) {
  return Math.floor((Date.now() - Date.parse(datum + "T00:00:00Z")) / 86400000);
}
/** Signerad skillnad "61 → 63 (+2,0)" — deterministisk, svenska decimaler. */
function deltaText(forr, nu, decimaler = 1) {
  const d = nu - forr;
  const tecken = d > 0 ? `(+${tal(d, decimaler)})` : d < 0 ? `(${tal(d, decimaler)})` : "(±0)";
  return `${tal(forr, decimaler)} → ${tal(nu, decimaler)} ${tecken}`;
}
/**
 * Evergreen-deltats bas: FÖRRA UTGÅVANS statistik — men endast om den skiljer
 * sig från den nya (annars ärvs befintligt forraStatistik). Det gör omkörning
 * med oförändrat underlag bitidentisk (determinism, m9 §3): "första utgåvan"-
 * texten och oförändrade utgåvor skriver aldrig om filen i onödan.
 */
function forraBas(befintlig, statistik) {
  const f = befintlig?.fabrik;
  if (!f?.statistik) return f?.forraStatistik ?? null;
  if (JSON.stringify(f.statistik) !== JSON.stringify(statistik)) return f.statistik;
  return f.forraStatistik ?? null;
}

// ── kontrolleraText — spegel av src/lib/varumarke.ts ur SAMMA datakälla ──────
// Varumarke.ts (våg 2:s fil-domän) importerar data/varumarke.json utan import-
// attribut, vilket node:s type-stripping avvisar — fabriken läser därför samma
// data/varumarke.json (single source, ingen data-drift) och speglar den rena
// matcharloopen 1:1. Självtestet nedan (våg 2 AC2) vägrar publicera om spegeln
// inte beter sig som kärnan. Bloggen är ingen PRO-yta — proYta-filtret behövs ej.

const varumarke = lasJson(FIL_VARUMARKE);
const FORBJUDNA = varumarke.forbjudnaFraser.map((f) => ({
  fran: new RegExp(f.fran, "giu"),
  istallet: f.istallet,
  allvar: f.allvar === "FEL" ? "FEL" : "VARNING",
}));

function kontrolleraText(text) {
  const fel = [];
  const varningar = [];
  if (typeof text !== "string" || text.length === 0) return { fel, varningar };
  for (const { fran, istallet, allvar } of FORBJUDNA) {
    fran.lastIndex = 0; // globala regexar är stateful — börja om varje gång
    let m;
    while ((m = fran.exec(text)) !== null) {
      const traff = { fras: m[0], index: m.index, allvar, ersattning: istallet };
      if (allvar === "FEL") fel.push(traff);
      else varningar.push(traff);
    }
  }
  return { fel, varningar };
}

// Självtest (MARKNADS-BESLUT våg 2 AC2): spegeln måste ge FEL/VARNING/0-FEL rätt.
(function sjalvtest() {
  const felTest = kontrolleraText("garanterad avkastning").fel.length >= 1;
  const varnTest = kontrolleraText("SISTA CHANSEN att gå med gratis!").varningar.length >= 1;
  const negTest = kontrolleraText("Pedagogisk analys — inte investeringsråd").fel.length === 0;
  if (!(felTest && varnTest && negTest)) {
    console.error("KONTROLLERATEXT-SPEGELN FELKONFIGURERAD — fabriken publicerar inget. Avbryter.");
    process.exit(1);
  }
})();

// ── Kvalitetsgrinden (m9 LED 2): kontrolleraText på VARJE rad + struktur ─────

function grind(namn, { title, description, body }) {
  const rader = [title, description, ...body.split("\n").filter((l) => l.trim() !== "")];
  const fel = [];
  const varningar = [];
  for (const rad of rader) {
    const r = kontrolleraText(rad);
    for (const f of r.fel) fel.push({ rad, ...f });
    for (const v of r.varningar) varningar.push({ rad, ...v });
  }
  // Strukturvalidatorn (LED 2b): disclaimer-token, automatisk-markering,
  // datering, internlänkar (forskningsbiblioteket + kurser) — maskinkontrollerat.
  const struktur = [];
  if (!/(inte investeringsråd|aldrig investeringsrådgivning)/.test(body)) struktur.push("disclaimer-token saknas");
  if (!/automatiskt genererad/.test(body)) struktur.push("automatisk-markering saknas");
  if (!/\d{4}-\d{2}-\d{2}/.test(body)) struktur.push("datering saknas");
  if (!body.includes("](/forskningsbiblioteket)")) struktur.push("internlänk /forskningsbiblioteket saknas");
  if (!/]\(\/kurser\//.test(body)) struktur.push("internlänk /kurser/ saknas");
  return { namn, rader: rader.length, fel, varningar, struktur };
}

// ── Evergreen-mekaniken: läs ev. befintlig post (delta + lås) ────────────────

function lasBefintlig(slug) {
  const fil = path.join(BLOGG, `${slug}.json`);
  if (!existsSync(fil)) return { fil, befintlig: null, text: null };
  const text = readFileSync(fil, "utf8");
  let befintlig = null;
  try {
    befintlig = JSON.parse(text);
  } catch {
    befintlig = null; // ogiltig JSON behandlas som saknad — fabriken skriver om
  }
  return { fil, befintlig, text };
}

// ── Gemensamma byggdelar ──────────────────────────────────────────────────────

const DISCLAIMER_RAD =
  "_Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";

function metadataAuto(namn) {
  return {
    techReview: "auto",
    granskat: false,
    granskadAv: null,
    granskadDatum: null,
    notering:
      "m9-innehållsfabrikens granskningskö: automatiskt utkast — MÄNSKLIG GRANSKNING fordras enligt m9/MARKNADS-BESLUT våg 4 innan storskalig drift (max 20+1 poster/månad, granskadAv-tvång)",
    serie: namn,
  };
}

function lasningMinuter(body) {
  const ord = body.split(/\s+/).length;
  return Math.max(4, Math.min(8, Math.round(ord / 200)));
}

// ════════════════════════════════════════════════════════════════════════════
// POST (a) — Branschmedianer: varje branschs AKM2-profil (peer.ts:s medianer)
// ════════════════════════════════════════════════════════════════════════════

function raknaBranschstatistik(rader) {
  const grupper = new Map();
  for (const rad of rader) {
    const lista = grupper.get(rad.bransch) ?? [];
    lista.push(rad);
    grupper.set(rad.bransch, lista);
  }
  const perBransch = {};
  for (const [bransch, grupp] of grupper) {
    const medAkm2 = grupp
      .filter((r) => typeof r.akm2 === "number")
      .sort((a, b) => b.akm2 - a.akm2 || (a.ticker < b.ticker ? -1 : 1));
    perBransch[bransch] = {
      median: median(medAkm2.map((r) => r.akm2)),
      matta: medAkm2.length,
      iGruppen: grupp.length,
      min: medAkm2.length > 0 ? medAkm2[medAkm2.length - 1].akm2 : null,
      max: medAkm2.length > 0 ? medAkm2[0].akm2 : null,
      minBolag: medAkm2.length > 0 ? kortNamn(medAkm2[medAkm2.length - 1].namn) : null,
      maxBolag: medAkm2.length > 0 ? kortNamn(medAkm2[0].namn) : null,
    };
  }
  return perBransch;
}

function byggPostBranschmedianer(korstabell, befintlig) {
  const rader = korstabell.rader;
  const datum = korstabell.skapad;
  const manad = manadArsNamn(datum);
  const referens = `${datum} · ${rader.length}-bolagsuniversum`; // peer.ts:s form
  const perBransch = raknaBranschstatistik(rader);

  // Sortering: median fallande, ties på branschnamn (deterministiskt).
  const sorterade = Object.entries(perBransch).sort(
    (a, b) => (b[1].median ?? -Infinity) - (a[1].median ?? -Infinity) || a[0].localeCompare(b[0]),
  );
  const rapporterade = sorterade.filter(([, s]) => s.matta >= 5); // PEER_MIN_GRUPP
  const forFå = sorterade.filter(([, s]) => s.matta < 5);
  if (rapporterade.length === 0) {
    throw new Error("ingen branschgrupp nådde PEER_MIN_GRUPP=5 — fabriken publicerar inga gissningsmedianer");
  }

  const statistik = {
    universum: rader.length,
    referens,
    perBransch,
    rapporteradeGrupper: rapporterade.length,
    gransGrupp: 5,
  };
  const forra = forraBas(befintlig, statistik)?.perBransch ?? null;

  const rad = [];
  // 1. Rakt svar (GEO: svaret först — ingen inledningsanos)
  rad.push(
    `Medianen per bransch i korstabellens ${rader.length}-bolagsuniversum, underlag skapat ${datum}: ${rapporterade
      .map(([b, s]) => `**${branschNamn(b)} ${tal(s.median)}**`)
      .join(" · ")} (AKM2-poäng, median över gruppens mätta bolag). Högst median: ${branschNamn(rapporterade[0][0])} ${tal(rapporterade[0][1].median)}. Lägst: ${branschNamn(rapporterade[rapporterade.length - 1][0])} ${tal(rapporterade[rapporterade.length - 1][1].median)}.`,
  );
  rad.push(
    `Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt.`,
  );

  // 2. Vad AKM2 är + hur medianen räknas
  rad.push(`## Så räknas medianen`);
  rad.push(
    `AKM2 är AKM1:s 20 variabler omviktade enligt viktprofilen akm2-2026 med automatiska moduler ur modulregistret — samma komposit som korstabellens rader bär. Medianen följer peer-motorns kontrakt ordagrant: gruppen är korstabellens kanoniska branscher (10 bolag var), medianen räknas över gruppens mätta bolag, och jämnt antal ger medelvärdet av de två mittersta. Urvalsberoendet syns i referensen: ${referens}.`,
  );

  // 3. Per bransch: median, spridning, ytterligheter (deskriptivt, vid namn)
  rad.push(`## Varje bransch — median, spridning och ytterligheter`);
  rad.push(
    rapporterade
      .map(
        ([bransch, s]) =>
          `- **${branschNamn(bransch)}** — median **${tal(s.median)}** · ${s.matta} mätta av ${s.iGruppen} · spridning ${tal(s.min)}–${tal(s.max)} (lägst ${s.minBolag}, högst ${s.maxBolag})`,
      )
      .join("\n"),
  );

  // 4. Investmentbolagsnoten (P4: jämförbarheten är villkorad)
  const investmentbolag = rader.filter((r) => /industrivärden|investor ab/i.test(r.namn || ""));
  if (investmentbolag.length > 0) {
    rad.push(
      `En jämförbarhetsnot: ${investmentbolag.map((r) => `${kortNamn(r.namn)} (${branschNamn(r.bransch)})`).join(" och ")} är investmentbolag — deras nyckeltal speglar innehavens marknadsvärden (substans), inte en driftsrörelse, så gruppens median blandar två olika bolagsformer. Det är information, inte fel.`,
    );
  }

  // 5. Osatt-noten (peer.ts:s PEER_MIN_GRUPP — kanon)
  if (forFå.length > 0) {
    rad.push(`## Osatta branschgrupper`);
    rad.push(
      forFå
        .map(([bransch, s]) => `- ${branschNamn(bransch)}: för få mätta bolag (n=${s.matta}) — därför saknas raden. Osatt är osatt.`)
        .join("\n"),
    );
  } else {
    rad.push(`## Gränsregeln — och varför ingen rad saknas`);
    rad.push(
      `Peer-motorens gränsregel är kanon: en grupp under 5 mätta bolag redovisas aldrig ("för få mätta" — motorn gissar aldrig). I detta underlag har alla ${sorterade.length} branschgrupper ${rapporterade[0][1].matta} mätta bolag var, så ingen rad saknas.`,
    );
  }

  // 6. Ändringen sedan förra utgåvan (evergreen-färskhetssignalen — ärlig)
  rad.push(`## Ändringen sedan förra utgåvan`);
  if (!forra) {
    rad.push(
      `Detta är seriens första utgåva — ingen tidigare månad att jämföra med. Från nästa utgåva redovisas varje branschs förändring här; oförändrad median skrivs "oförändrat" (att inget rörde sig är också ett utfall).`,
    );
  } else {
    const flyttade = Object.keys(perBransch)
      .filter((b) => forra[b] && forra[b].median !== null && perBransch[b].median !== forra[b].median)
      .sort();
    if (flyttade.length === 0) {
      rad.push(`Ingen branschmedian rörde sig sedan förra utgåvan — oförändrat.`);
    } else {
      rad.push(
        flyttade
          .map((b) => `- **${branschNamn(b)}**: ${deltaText(forra[b].median, perBransch[b].median)} sedan förra utgåvan`)
          .join("\n"),
      );
      rad.push(`Övriga ${Object.keys(perBransch).length - flyttade.length} branscher oförändrade.`);
    }
  }

  // 7. Internlänkar (m9 §4: forskningsbiblioteket + kurserna)
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Forskningsbiblioteket](/forskningsbiblioteket) — varje kandidatbolags AKM2-profil, urvalsregel och utfall\n- [Kursen V07 bruttomarginal](/kurser/v07-bruttomarginal) — lönsamhetsvariabeln bakom kompositen\n- [Kursen V08 EBITDA-marginal](/kurser/v08-ebitda-marginal) — marginalmatrisen steg för steg\n- [Kursen V09 ROE](/kurser/v09-roe) — avkastning på eget kapital`,
  );

  // 8. Signatur + disclaimer
  rad.push(DISCLAIMER_RAD);

  const body = rad.join("\n\n");
  return {
    slug: "branschmedianer-akm2",
    title: `Branschmedianer ${manad} — varje branschs AKM2-profil`,
    description: `AKM2-medianen per bransch i 100-bolagsuniversum, underlag ${datum}: ${rapporterade
      .slice(0, 4)
      .map(([b, s]) => `${branschNamn(b)} ${tal(s.median)}`)
      .join(", ")} med flera — antal mätta, spridning och gränsregeln redovisas öppet.`,
    pillar: "AKM1",
    author: "Ak1 Apex Nexus",
    publishedAt: befintlig?.publishedAt ?? datum,
    updatedAt: befintlig && befintlig.publishedAt !== datum ? datum : undefined,
    readingMinutes: lasningMinuter(body),
    tags: ["AKM2", "branschjämförelse", "median", "peer", "portföljforskning"],
    body,
    metadata: metadataAuto("branschmedianer"),
    fabrik: {
      version: FABRIK_VERSION,
      genereradUr: "verktyg/kor-innehallsfabrik.mjs",
      manad: datum.slice(0, 7),
      kallor: [
        { fil: "data/portfolj-system/korstabell-grund.json", md5: md5Fil(FIL_KORSTABELL) },
        { fil: "data/varumarke.json", md5: md5Fil(FIL_VARUMARKE) },
      ],
      forraStatistik: forraBas(befintlig, statistik),
      statistik,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// POST (b) — Forskningsläget: N gröna av 100 (forskningslaget.ts:s tal + regim)
// ════════════════════════════════════════════════════════════════════════════

// Fasta trösklar + lägestexter ORDAGRAT ur src/lib/forskningslaget.ts (P4).
const TROSKEL_RIKT_ANDEL_GRONA = 0.1;
const TROSKEL_RIKT_ANDEL_RODA = 0.3;
const TROSKEL_MAGERT_ANDEL_GRONA = 0.08;
const TROSKEL_MAGERT_ANDEL_RODA = 0.35;

function raknaForskningslage(rader) {
  const antal = rader.length;
  const grona = rader.filter((r) => r.status === "gron").length;
  const gula = rader.filter((r) => r.status === "gul").length;
  const roda = rader.filter((r) => r.status === "rod").length;
  const osatta = rader.filter((r) => r.status === "osatt").length;
  const andelGrona = antal > 0 ? Math.round((grona / antal) * 10000) / 10000 : 0;
  const andelRoda = antal > 0 ? Math.round((roda / antal) * 10000) / 10000 : 0;

  let typ;
  let marknadslage;
  if (antal === 0) {
    typ = "osatt";
    marknadslage = "Forskningsunderlaget är ännu inte levererat — läget redovisas när korstabellens mätningar finns (motorn gissar aldrig).";
  } else if (andelGrona >= TROSKEL_RIKT_ANDEL_GRONA && andelRoda <= TROSKEL_RIKT_ANDEL_RODA) {
    typ = "rikt";
    marknadslage = `Forskningsläget är rikt — ${grona} av ${antal} bolag klarar de strikta kraven.`;
  } else if (andelGrona < TROSKEL_MAGERT_ANDEL_GRONA || andelRoda > TROSKEL_MAGERT_ANDEL_RODA) {
    typ = "magert";
    marknadslage = `Forskningsläget är magert — ${grona} av ${antal} bolag klarar de strikta kraven, selektion avgör.`;
  } else {
    typ = "balanserat";
    marknadslage = `Forskningsläget är i rörelse — ${grona} av ${antal} bolag klarar de strikta kraven och ${gula} rör sig i mellanskiktet.`;
  }

  // Topp-3 gröna: akm1Totalt fallande, ticker stigande (forskningslaget.ts:s sortering).
  const topp = rader
    .filter((r) => r.status === "gron")
    .sort((a, b) => b.akm1Totalt - a.akm1Totalt || (a.ticker < b.ticker ? -1 : 1))
    .slice(0, 3)
    .map((r) => ({
      ticker: r.ticker,
      namn: kortNamn(r.namn),
      bransch: branschNamn(r.bransch),
      akm1Totalt: r.akm1Totalt,
      akm1MaxMojligt: typeof r.akm1MaxMojligt === "number" ? r.akm1MaxMojligt : null,
      andelAvMax:
        typeof r.akm1MaxMojligt === "number" && r.akm1MaxMojligt > 0
          ? Math.round((r.akm1Totalt / r.akm1MaxMojligt) * 1000) / 1000
          : null,
    }));

  return { antal, grona, gula, roda, osatta, andelGrona, andelRoda, typ, marknadslage, topp };
}

function byggPostForskningslaget(korstabell, befintlig) {
  const rader = korstabell.rader;
  const datum = korstabell.skapad;
  const manad = manadArsNamn(datum);
  const lage = raknaForskningslage(rader);
  const regler = korstabell.statusRegler || {};
  const statistik = {
    universum: lage.antal,
    grona: lage.grona,
    gula: lage.gula,
    roda: lage.roda,
    osatta: lage.osatta,
    andelGrona: lage.andelGrona,
    andelRoda: lage.andelRoda,
    typ: lage.typ,
    marknadslage: lage.marknadslage,
    datum,
  };
  const forra = forraBas(befintlig, statistik);

  const rad = [];
  // 1. Rakt svar
  rad.push(
    `${lage.grona} av ${lage.antal} bolag i korstabellens universum är gröna just nu. Regimen är **${lage.typ}**: "${lage.marknadslage}" — lägestexten ordagrant ur forskningsläges-motorn, som räknar ur fasta trösklar, inte tycke. Fördelningen: ${lage.grona} gröna · ${lage.gula} gula · ${lage.roda} röda · ${lage.osatta} osatta. Underlag daterat ${datum}.`,
  );
  rad.push(
    `Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt.`,
  );

  // 2. Vad färgerna betyder — korstabellens regler ORDAGRAT (P4-äkthet)
  rad.push(`## Vad färgerna betyder`);
  rad.push(`Statusklassningen är korstabellens egen regelverk, citerat ordagrant ur underlaget (${datum}):`);
  const reglerRader = [];
  if (regler.gron) reglerRader.push(`- **grön:** ${regler.gron}`);
  if (regler.gul) reglerRader.push(`- **gul:** ${regler.gul}`);
  if (regler.rod) reglerRader.push(`- **röd:** ${regler.rod}`);
  if (reglerRader.length > 0) rad.push(reglerRader.join("\n"));

  // 3. Regimen + trösklarna (deterministiskt, dokumenterat)
  rad.push(`## Regimen och dess trösklar`);
  rad.push(
    `Regimen räknas ur fasta trösklar: rikt kräver andel gröna ≥ 10 % OCH andel röda ≤ 30 %; magert inträffar när andel gröna < 8 % ELLER andel röda > 35 %; däremellan är läget balanserat. I detta underlag: andel gröna ${pct(lage.andelGrona, 0)} och andel röda ${pct(lage.andelRoda, 0)} — utfallet blir ${lage.typ}. Samma underlag ger alltid samma text; trösklarna är skrivna före datan.`,
  );

  // 4. Topp-3 gröna (deskriptivt — poäng, aldrig omdömen)
  rad.push(`## De tre högt rankade gröna bolagen`);
  rad.push(
    `Bland de gröna bolagen har dessa tre högst AKM1-poäng i underlaget (poäng av max, daterat ${datum}) — en deskriptiv rankning ur data, inte en värdering:`,
  );
  rad.push(
    lage.topp
      .map(
        (t) =>
          `- **${t.namn}** (${t.ticker}, ${t.bransch}) — AKM1 ${tal(t.akm1Totalt)} av ${t.akm1MaxMojligt !== null ? tal(t.akm1MaxMojligt) : "?"} möjliga poäng${t.andelAvMax !== null ? ` (${pct(t.andelAvMax)})` : ""}`,
      )
      .join("\n"),
  );

  // 5. Urval + datering (urvalsberoendet skrivs ut — m9 §5)
  rad.push(
    `Urvalet är korstabellens ${lage.antal}-bolagsuniversum (10 branscher × 10 bolag) — talen är urvalsberoende och säger inget om bolag utanför universum. Dateringen kommer ur underlaget själv (skapad ${datum}), aldrig ur klockan.`,
  );

  // 6. Ändringen sedan förra utgåvan
  rad.push(`## Ändringen sedan förra utgåvan`);
  if (!forra) {
    rad.push(
      `Seriens första utgåva — ingen tidigare månad att jämföra med. Nästa utgåva redovisar hur många bolag som bytte status; oförändrat skrivs oförändrat.`,
    );
  } else {
    const delar = [];
    if (forra.grona !== lage.grona) delar.push(`gröna ${deltaText(forra.grona, lage.grona, 0)}`);
    if (forra.gula !== lage.gula) delar.push(`gula ${deltaText(forra.gula, lage.gula, 0)}`);
    if (forra.roda !== lage.roda) delar.push(`röda ${deltaText(forra.roda, lage.roda, 0)}`);
    if (forra.typ !== lage.typ) delar.push(`regimen ${forra.typ} → ${lage.typ}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Fördelningen oförändrad sedan förra utgåvan: ${lage.grona} gröna, ${lage.gula} gula, ${lage.roda} röda.`,
    );
  }

  // 7. Internlänkar
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Forskningsbiblioteket](/forskningsbiblioteket) — bolagen som klarade kandidatregeln, med urvalsregel och utfall\n- [Kursen V09 ROE](/kurser/v09-roe) — variabeln bakom lönsamhetspoängen\n- [Komplett guide till svensk aktieanalys](/blogg/komplett-guide-svenska-aktieanalys-2026) — metodiken från grunden`,
  );

  // 8. Signatur + disclaimer
  rad.push(DISCLAIMER_RAD);

  const body = rad.join("\n\n");
  return {
    slug: "forskningslaget-grona-av-100",
    title: `Forskningsläget ${manad} — ${lage.grona} gröna av ${lage.antal}`,
    description: `Forskningsläget i korstabellens ${lage.antal}-bolagsuniversum: ${lage.grona} gröna, ${lage.gula} gula, ${lage.roda} röda — regimen är ${lage.typ} enligt fasta trösklar. Underlag daterat ${datum}.`,
    pillar: "Institutionell metodik",
    author: "Ak1 Apex Nexus",
    publishedAt: befintlig?.publishedAt ?? datum,
    updatedAt: befintlig && befintlig.publishedAt !== datum ? datum : undefined,
    readingMinutes: lasningMinuter(body),
    tags: ["forskningsläget", "AKM1", "statusfördelning", "portföljforskning", "100-bolagsuniversum"],
    body,
    metadata: metadataAuto("forskningslaget"),
    fabrik: {
      version: FABRIK_VERSION,
      genereradUr: "verktyg/kor-innehallsfabrik.mjs",
      manad: datum.slice(0, 7),
      kallor: [
        { fil: "data/portfolj-system/korstabell-grund.json", md5: md5Fil(FIL_KORSTABELL) },
        { fil: "data/varumarke.json", md5: md5Fil(FIL_VARUMARKE) },
      ],
      forraStatistik: forra,
      statistik,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// POST (c) — Vågkartan: träffprocenten (vagvalidering-rapporten, rullande kvitto)
// ════════════════════════════════════════════════════════════════════════════

function lasVagvalidering() {
  const text = readFileSync(FIL_RAPPORT, "utf8");
  const genererad = text.match(/\*\*Genererad:\*\* ([^·]+)·/)?.[1]?.trim() ?? null;
  const protokoll = text.match(/\*\*Protokoll:\*\* ([^·]+)·/)?.[1]?.trim() ?? null;
  const domdatum = text.match(/\*\*Domdatum:\*\* (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const universum = Number(text.match(/\*\*Universum:\*\* (\d+) tickers/)?.[1] ?? 0);
  const sedan = text.match(/\*\*Rullande räknare sedan:\*\* (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  // Blockcitatet citeras ORDAGRAT (reglerna skrevs före första domen — P4):
  // "> **Dom-protokoll …:** text" → "**Dom-protokoll …:** text" (markdown bevaras).
  const protokollRad = text.match(/^> \*\*Dom-protokoll[^*]+:\*\*.+$/m)?.[0] ?? null;
  const protokollText = protokollRad !== null ? protokollRad.replace(/^>\s*/, "").trim() : null;

  const totalMatch = text.match(
    /\*\*Totalt:\*\* (?:(\d+) % träff|—) \(n=(\d+) dömda(?:, osatta (\d+) % av alla mätningar)?\)/,
  );
  const totalt =
    totalMatch !== null
      ? {
          traffProcent: totalMatch[1] !== undefined ? Number(totalMatch[1]) : null,
          domda: Number(totalMatch[2]),
          osattaAndel: totalMatch[3] !== undefined ? Number(totalMatch[3]) : null,
        }
      : null;

  // Tabellrader: "| mikro | 75 % (n=4) | — (n=0) | 63 % (n=8) | — (n=0) |"
  const perHorisont = {};
  for (const m of text.matchAll(/^\| (mikro|kort|medellång|lång|mega) \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|/gm)) {
    const cell = (raw) => raw.trim();
    perHorisont[m[1]] = {
      impulsvag: cell(m[2]),
      korrigering: cell(m[3]),
      basbygge: cell(m[4]),
      osattKlass: cell(m[5]),
    };
  }
  return { text, genererad, protokoll, domdatum, universum, sedan, protokollText, totalt, perHorisont };
}

function byggPostVagkartan(rapport, befintlig) {
  if (!rapport.domdatum || !rapport.totalt || rapport.totalt.traffProcent === null) {
    throw new Error("vagvalidering-rapporten saknar domdatum/träff-% — fabriken hittar aldrig på tal");
  }
  const datum = rapport.domdatum;
  const manad = manadArsNamn(datum);
  const t = rapport.totalt;
  const KLASS_NAMN = { impulsvag: "impulsvåg", korrigering: "korrigering", basbygge: "basbygge", osattKlass: "osatt klass" };
  const statistik = {
    traffProcent: t.traffProcent,
    domda: t.domda,
    osattaAndel: t.osattaAndel,
    universum: rapport.universum,
    protokoll: rapport.protokoll,
    sedan: rapport.sedan,
    domdatum: datum,
    perHorisont: rapport.perHorisont,
  };
  const forra = forraBas(befintlig, statistik);

  const rad = [];
  // 1. Rakt svar
  rad.push(
    `Vågmotorns rullande träffprocent är **${t.traffProcent} %** — ${t.domda} dömda mätningar${rapport.sedan ? ` sedan ${rapport.sedan}` : ""}${t.osattaAndel !== null ? `, ${t.osattaAndel} % av mätningarna är osatta och räknas aldrig som fel` : ""}. Universum: ${rapport.universum} tickers, fem horisonter. Domdatum ${datum}${rapport.protokoll ? `, protokoll ${rapport.protokoll}` : ""}.`,
  );
  rad.push(
    `Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt.`,
  );

  // 2. Protokollet — ordagrant (reglerna skrevs före första domen)
  if (rapport.protokollText) {
    rad.push(`## Så dömer protokollet`);
    rad.push(rapport.protokollText);
  }

  // 3. Per horisont (cellerna citeras ur rapporten — "75 % (n=4)")
  const horisonter = Object.keys(rapport.perHorisont);
  if (horisonter.length > 0) {
    rad.push(`## Träffprocenten per horisont och vågklass`);
    rad.push(`n = antal dömda mätningar (träff + miss); klasser utan dömda mätningar redovisas inte.`);
    rad.push(
      horisonter
        .map((hz) => {
          const r = rapport.perHorisont[hz];
          const klasser = Object.entries(KLASS_NAMN)
            .map(([nyckel, namn]) => ({ namn, cell: r[nyckel] }))
            .filter((k) => k.cell && !/^— \(n=0\)$/.test(k.cell));
          return klasser.length > 0
            ? `- **${hz}** — ${klasser.map((k) => `${k.namn} ${k.cell}`).join(" · ")}`
            : `- **${hz}** — inga dömda mätningar`;
        })
        .join("\n"),
    );
  }

  // 4. Vad siffran är — och inte är (ärlighetsrätningen, STYRELSE-vag-exakthet §4)
  rad.push(`## Vad siffran är — och inte är`);
  rad.push(
    `Träffprocenten är ett öppet kvitto om det förflutna — aldrig en garanti om framtiden. Motorn beskriver rytm och läge i fundamentalserier; "osatt" är information, inte fel, och därför räknas osatta mätningar i täckningsbråket men aldrig som fel. Enhetssiffran ${t.traffProcent} % säger inte vilken horisont eller klass som bär den — listan ovan gör det.`,
  );

  // 5. Ändringen sedan förra utgåvan
  rad.push(`## Ändringen sedan förra utgåvan`);
  if (!forra) {
    rad.push(
      `Seriens första utgåva — räknarna är unga (sedan ${rapport.sedan ?? "okänt datum"}) och varje ny rond väger tyngre än den förra. Nästa utgåva redovisar hur träffprocenten rörde sig; oförändrat skrivs oförändrat.`,
    );
  } else {
    const delar = [];
    if (forra.traffProcent !== t.traffProcent) delar.push(`träffprocent ${deltaText(forra.traffProcent, t.traffProcent, 0)}`);
    if (forra.domda !== t.domda) delar.push(`dömda mätningar ${deltaText(forra.domda, t.domda, 0)}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Träffprocenten oförändrad sedan förra utgåvan (${t.traffProcent} % på ${t.domda} dömda mätningar).`,
    );
  }

  // 6. Internlänkar
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Kursen AK1TS 25 cellers matris](/kurser/ts-10-ak1ts-25cellers-matris) — vågmatrisen bakom horisonterna\n- [Vågfundament — indikatorer är tidsserier](/blogg/vagfundament-indikatorer-ar-tidsserier) — varför motorn kräver serier, inte nivåer\n- [Forskningsbiblioteket](/forskningsbiblioteket) — bolagsanalyserna vågscannens universum hämtar ifrån`,
  );

  // 7. Signatur + disclaimer
  rad.push(
    `_Detta är en automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen tillverkas manuellt. Träffprocenten är ett öppet kvitto om det förflutna — aldrig en garanti om framtiden. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._`,
  );

  const body = rad.join("\n\n");
  return {
    slug: "vagkartan-traffprocent",
    title: `Vågkartan ${manad} — träffprocenten ${t.traffProcent} %`,
    description: `Vågmotorns rullande träffprocent: ${t.traffProcent} % på ${t.domda} dömda mätningar${t.osattaAndel !== null ? ` (osatta ${t.osattaAndel} % räknas aldrig som fel)` : ""} — ett öppet kvitto om det förflutna, aldrig en garanti om framtiden. Domdatum ${datum}.`,
    pillar: "Institutionell metodik",
    author: "Ak1 Apex Nexus",
    publishedAt: befintlig?.publishedAt ?? datum,
    updatedAt: befintlig && befintlig.publishedAt !== datum ? datum : undefined,
    readingMinutes: lasningMinuter(body),
    tags: ["vågvalidering", "vågkartan", "träffprocent", "AK1TS", "vågforskning"],
    body,
    metadata: metadataAuto("vagkartan"),
    fabrik: {
      version: FABRIK_VERSION,
      genereradUr: "verktyg/kor-innehallsfabrik.mjs",
      manad: datum.slice(0, 7),
      kallor: [
        { fil: "data/rapporter/vagvalidering-SENASTE.md", md5: md5Fil(FIL_RAPPORT) },
        { fil: "data/varumarke.json", md5: md5Fil(FIL_VARUMARKE) },
      ],
      forraStatistik: forra,
      statistik,
    },
  };
}

// ── Huvudflöde ────────────────────────────────────────────────────────────────

if (!existsSync(FIL_KORSTABELL)) {
  console.error("data/portfolj-system/korstabell-grund.json saknas — fabriken avbryter.");
  process.exit(1);
}
const korstabell = lasJson(FIL_KORSTABELL);
const rapport = lasVagvalidering();

// Färskhetsvakt (m9 §5): underlag äldre än 45 dagar publiceras ej.
for (const k of [
  { namn: "korstabell-grund.json", datum: korstabell.skapad },
  { namn: "vagvalidering-SENASTE.md", datum: rapport.domdatum },
].filter((k) => k.datum)) {
  const alder = alderDagar(k.datum);
  if (alder > MAX_ALDER_DAGAR) {
    console.error(`BLOCKERAD: ${k.namn} är ${alder} dagar gammalt (> ${MAX_ALDER_DAGAR}) — "publicera endast om underlag ≤ 45 dagar" (m9 §5).`);
    process.exit(1);
  }
}

const poster = [
  byggPostBranschmedianer(korstabell, lasBefintlig("branschmedianer-akm2").befintlig),
  byggPostForskningslaget(korstabell, lasBefintlig("forskningslaget-grona-av-100").befintlig),
  byggPostVagkartan(rapport, lasBefintlig("vagkartan-traffprocent").befintlig),
];

console.log(`INNEHÅLLSFABRIKEN ${FABRIK_VERSION} — pilot: 3 evergreen-poster (m9 rek 2)${TORR ? " [TORR]" : ""}`);
console.log(`Färskhet: korstabell ${korstabell.skapad} (${alderDagar(korstabell.skapad)} d) · vågvalidering ${rapport.domdatum} (${alderDagar(rapport.domdatum)} d) — gräns ${MAX_ALDER_DAGAR} d`);
console.log("");

let blockerad = false;
const resultat = [];
for (const post of poster) {
  const { fil, befintlig, text } = lasBefintlig(post.slug);
  const grunden = grind(post.slug, post);

  // LED 2a: kontrolleraText — FEL stoppar rad för rad
  if (grunden.fel.length > 0 || grunden.struktur.length > 0) {
    blockerad = true;
    resultat.push({ slug: post.slug, status: "BLOCKERAD" });
    console.error(`✗ ${post.slug} — BLOCKERAD av kvalitetsgrinden (publiceras ej):`);
    for (const f of grunden.fel) console.error(`    FEL "${f.fras}" i: ${String(f.rad).slice(0, 90)}`);
    for (const s of grunden.struktur) console.error(`    STRUKTUR: ${s}`);
    continue;
  }

  // LED 3-låset: mänskligt granskad post skrivs aldrig över av maskinen
  if (befintlig?.metadata?.granskadAv && !TVINGA) {
    resultat.push({ slug: post.slug, status: "LÅST (granskad)" });
    console.log(`- ${post.slug} — LÅST: metadata.granskadAv är satt (${befintlig.metadata.granskadAv}); maskinen skriver aldrig över en granskad post (--tvinga för att tvinga).`);
    continue;
  }

  const json = JSON.stringify(post, null, 2) + "\n";
  const md5Ny = md5(json);
  if (text === json) {
    resultat.push({ slug: post.slug, status: "OFÖRÄNDRAT" });
    console.log(`- ${post.slug} — oförändrat underlag ⇒ identiska bytes ⇒ skrivs ej (determinism) · md5 ${md5Ny}`);
    continue;
  }
  if (!TORR) writeFileSync(fil, json, "utf8");
  resultat.push({ slug: post.slug, status: befintlig ? "UPPDATERAD (evergreen)" : "SKRIVEN" });
  console.log(
    `${TORR ? "-" : "✓"} ${post.slug} — ${befintlig ? `evergreen-uppdatering (publicerad ${post.publishedAt})` : `skrevs (publicerad ${post.publishedAt})`} · ${post.readingMinutes} min · md5 ${md5Ny}`,
  );
  console.log(
    `    kontrolleraText: ${grunden.rader} rader (titel + beskrivning + kropp) — FEL 0${grunden.varningar.length > 0 ? `, VARNINGAR ${grunden.varningar.length} (manuell granskning: ${grunden.varningar.map((v) => v.fras).join(", ")})` : ", varningar 0"}`,
  );
}

console.log("");
console.log(
  `RESULTAT: ${resultat.filter((r) => r.status === "SKRIVEN").length} skrivna · ${resultat.filter((r) => r.status === "UPPDATERAD (evergreen)").length} uppdaterade · ${resultat.filter((r) => r.status === "OFÖRÄNDRAT").length} oförändrade · ${resultat.filter((r) => r.status === "BLOCKERAD").length} blockerade`,
);
console.log(
  `GRANSKNINGSKÖ: samtliga poster bär metadata.techReview="auto" — MÄNSKLIG GRANSKNING fordras (m9/MARKNADS-BESLUT våg 4) innan storskalig drift. Granskningsunderlag: fabrik.statistik + fabrik.kallor (fil+md5) i varje post.`,
);
if (blockerad) process.exit(1);
process.exit(0);

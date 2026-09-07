/**
 * VÅG 80A — SPRÅK-SPROD-SVEP (agent 1)
 *
 * Hämtar ALLA nyckelsidor i sv + en/ar-speglar från prod (lab.ak1nvestor.com)
 * och kontrollerar per sida:
 *   (a) råa ordlistenycklar renderade (t.ex. "nav.kurser" i synlig text) = P0
 *   (b) SSR-språket rätt (sv på original, en på /en, ar på /ar)
 *   (c) <html lang/dir> rätt (sv/ltr, en/ltr, ar/rtl)
 *   (d) mixade språk-läckor (svensk UI-text på /en- och /ar-sidor)
 *   (e) trasiga tecken (U+FFFD �, dubbel-UTF8-mönster)
 *
 * Körs: node verktyg/v80a-sprak-svep.mjs   (Node 22, global fetch)
 * Output: JSON + läsradrapport på stdout.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROD = "https://lab.ak1nvestor.com";

// ── Sidor: svensk bas + om spegel finns (src/lib/sprak.ts OVERSATTA_ROUTES) ──
const SIDOR = [
  { bas: "/",            spegel: true  },
  { bas: "/kurser",      spegel: true  },
  { bas: "/laroplan",    spegel: false },
  { bas: "/manifest",    spegel: true  },
  { bas: "/medlemskap",  spegel: true  },
  { bas: "/prenumeration", spegel: true },
  { bas: "/blogg",       spegel: true  },
  { bas: "/om-oss",      spegel: true  },
  { bas: "/transparens", spegel: true  },
  { bas: "/villkor",     spegel: false },
  { bas: "/logga-in",    spegel: true  },
  { bas: "/profil",      spegel: false },
  { bas: "/kalkylator",  spegel: false },
  { bas: "/portfolj-forskning", spegel: false },
  { bas: "/vagfundament",   spegel: false },
  { bas: "/konfluens",      spegel: false },
];

// ── Ordlistenycklar ur src/lib/ordlista.ts (rå-nyckeldetektering) ──────────
const ordlistaKalla = readFileSync(resolve(ROT, "src/lib/ordlista.ts"), "utf8");
const NYCKLAR = [...ordlistaKalla.matchAll(/^\s{2}"([a-zA-Z0-9_.]+)":\s*\{/gm)].map((m) => m[1]);

// ── Svenska signaturord för läckdetektering på en/ar (UI-nivå) ────────────
// Endast omisskännligt svenska ord (förekommer ej i engelska/arabiska copy).
const SV_LACKORD = [
  "Kurser", "Logga in", "Medlemskap", "Prenumeration", "Startsida",
  "Sök", "Läs mer", "Tillbaka", "Om oss", "Villkor", "Transparens",
  "Manifest", "Lärplan", "Blogg", "Kontakta", "Nästa", "Föregående",
  "Skapa konto", "Glömt lösenord", "Registrera", "Spara", "Stäng",
  "Kalkylatorn", "Vågfundamentet", "Konfluensradarn", "Verktyg",
  "certifikat", "grundläggande", "analytiker", "utbildning", "kunskap",
  "gratis", "kurserna", "börja", "seguir",
];
// Undantag: ord som kan vara del av legitimt innehåll på spegeln
// (t.ex. "kurserna" i svensk loan-beskrivning) hanteras via kontext-rapport.

// ── Trasiga tecken ──────────────────────────────────────────────────────────
const FFFD = /\uFFFD/;

// ── Textextraktion ──────────────────────────────────────────────────────────
function synligText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hamtaMeta(html, namn) {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${namn}["'][^>]+content=["']([^"']*)["']`, "i"));
  return m ? m[1] : "";
}
function hamtaTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}
function hamtaH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? synligText(m[1]) : "";
}
function hamtaHtmlAttr(html) {
  const m = html.match(/<html([^>]*)>/i);
  const attrs = m ? m[1] : "";
  const lang = attrs.match(/lang=["']([^"']*)["']/i);
  const dir = attrs.match(/dir=["']([^"']*)["']/i);
  return { lang: lang ? lang[1] : null, dir: dir ? dir[1] : null };
}

// ── Språkdetektering (heuristik på latin skript) ────────────────────────────
const SV_MARKOR = /\b(och|att|med|för|eller|som|är|inte|på|från|till|en|ett|alla|vår|vi|du|dig|det|den|dessa|kurs|kurser|gratis|kunskap|utbildning|analys|aktie|bolag)\b/gi;
const EN_MARKOR = /\b(the|and|with|for|or|is|are|not|on|from|to|all|our|we|you|your|this|that|free|knowledge|education|analysis|stock|company|courses|learn)\b/gi;
function rakna(text, re) { return (text.match(re) || []).length; }

function detekteraSprak(text) {
  const sv = rakna(text, SV_MARKOR);
  const en = rakna(text, EN_MARKOR);
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinsk = text.replace(/[^\u0000-\u024F]/g, "").length;
  if (ar > latinsk * 0.5 && ar > 40) return "ar";
  return en > sv * 1.3 ? "en" : sv > en * 1.3 ? "sv" : sv === 0 && en === 0 ? "?" : "mixad";
}

// ── Hämta en sida ───────────────────────────────────────────────────────────
async function hamtaSida(url) {
  try {
    const svar = await fetch(url, {
      headers: { "User-Agent": "AK1A-v80a-sprak-svep/1.0", "Accept-Language": "sv" },
      redirect: "follow",
    });
    const html = await svar.text();
    return { status: svar.status, url: svar.url, html };
  } catch (e) {
    return { status: 0, url, html: "", fel: String(e) };
  }
}

// ── Analysera ───────────────────────────────────────────────────────────────
function analysera(html) {
  const text = synligText(html);
  const radata = [];

  // (a) Råa nycklar: exakta ordlistenycklar som SYNNS i texten
  for (const nyckel of NYCKLAR) {
    const idx = text.indexOf(nyckel);
    if (idx !== -1) {
      radata.push({ nyckel, kontext: text.slice(Math.max(0, idx - 40), idx + nyckel.length + 30) });
    }
  }
  // Generisk pattern-träff (dock.wap etc. kan vara legitima filnamn — rapports)
  const generella = [...new Set([...text.matchAll(/\b[a-z]{3,12}\.[a-z][a-zA-Z0-9_]{3,}\b/g)].map((m) => m[0]))]
    .filter((s) => !/\.(com|se|net|org|io|ts|tsx|js|json|css|md|png|jpg|svg|woff2?|pdf|mp4|st|mjs|py|html|xml|txt)/i.test(s));

  // (e) Trasiga tecken
  const trasiga = [...html.matchAll(/\uFFFD/g)].length;

  // (c) html-attribut
  const htmlAttr = hamtaHtmlAttr(html);

  // (b) SSR-språk på title+desc+h1+h2:ar
  const rubriker = [
    hamtaTitle(html),
    hamtaMeta(html, "og:title"),
    hamtaMeta(html, "description"),
    hamtaH1(html),
    ...(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).slice(0, 6).map((h) => synligText(h)),
  ].filter(Boolean).join(" · ");
  const sprak = detekteraSprak(rubriker);

  return { text, radata, generella, trasiga, htmlAttr, sprak, rubriker: rubriker.slice(0, 300) };
}

// (d) Läckdetektering — svensk text på en/ar-sida
function hittaLackor(text, mal) {
  if (mal === "sv") return [];
  const träffar = [];
  for (const ord of SV_LACKORD) {
    const re = new RegExp(`(^|[^\\p{L}])${ord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "giu");
    const m = text.match(re);
    if (m) {
      const idx = text.search(re);
      träffar.push({ ord, antal: m.length, kontext: text.slice(Math.max(0, idx - 30), idx + ord.length + 40) });
    }
  }
  return träffar;
}

// ── Huvudloop ───────────────────────────────────────────────────────────────
const resultat = [];
for (const sida of SIDOR) {
  for (const mal of sida.spegel ? ["sv", "en", "ar"] : ["sv"]) {
    const url = PROD + (mal === "sv" ? sida.bas : `/${mal}${sida.bas === "/" ? "" : sida.bas}`);
    const r = await hamtaSida(url);
    if (!r.html) {
      resultat.push({ sida: sida.bas, mal, url, status: r.status, fel: r.fel, verdict: "FEL" });
      console.log(`${sida.bas} [${mal}] — HÄMTFEL ${r.status} ${r.fel ?? ""}`);
      continue;
    }
    const a = analysera(r.html);
    const lackor = hittaLackor(a.text, mal);
    const langOK = a.htmlAttr.lang === mal;
    const dirOK = mal === "ar" ? a.htmlAttr.dir === "rtl" : a.htmlAttr.dir === null || a.htmlAttr.dir === "ltr";
    const p0 = a.radata.length > 0;
    const verdict = p0 ? "P0-RÅNYCKEL" : r.status !== 200 ? `HTTP-${r.status}` : "OK";
    resultat.push({
      sida: sida.bas, mal, url, status: r.status,
      lang: a.htmlAttr.lang, dir: a.htmlAttr.dir, langOK, dirOK,
      ssrSprak: a.sprak, trasiga: a.trasiga,
      raNycklar: a.radata, generellaMönster: a.generella.slice(0, 10),
      lackor, verdict,
    });
    const flag = [
      p0 ? `RÅNYCKLAR:${a.radata.map((x) => x.nyckel).join(",")}` : "",
      !langOK ? `LANG:${a.htmlAttr.lang}` : "",
      !dirOK ? `DIR:${a.htmlAttr.dir}` : "",
      a.trasiga > 0 ? `FFFD:${a.trasiga}` : "",
      lackor.length ? `LÄCKA(${lackor.length})` : "",
      r.status !== 200 ? `HTTP-${r.status}` : "",
    ].filter(Boolean).join(" | ") || "ok";
    console.log(`${sida.bas} [${mal}] HTTP ${r.status} lang=${a.htmlAttr.lang} dir=${a.htmlAttr.dir ?? "-"} språk=${a.sprak} — ${flag}`);
  }
}

writeFileSync(resolve(ROT, "tool-results/v80a-sprak-svep-data.json"), JSON.stringify(resultat, null, 2));
console.log(`\n${resultat.length} sidor analyserade — data: tool-results/v80a-sprak-svep-data.json`);

#!/usr/bin/env node
/**
 * GRÄNSSNITTSVAKTEN (våg 104B/105) — automatisk synlighets- och layoutvakt
 * ========================================================================
 * Kunddirektiv 2026-09-11: "ai agenten som vaktar hela sidan och hela system
 * skulle ha tänkt och rättat den sidan och alla sådana sidor vid mörka tema
 * helt utan att jag skulle se" — denna vakt mäter ALLA publika sidor i BÅDA
 * teman på mobil- och datorvy och fångar defektklasserna innan kunden ser dem:
 *
 *   1. Horisontell överflöd (sidan rivs på mobil — admin-flikradsfelet våg 104)
 *   2. Låg textkontrast (WCAG 4.5:1 brödtext / 3:1 rubrik ≥18.66px fet eller
 *      ≥24px) — fångar "grå gradient spolar bort texten" i mörkt läge
 *   3. Element utanför högra viewportkanten (kort/text flyter ut)
 *   4. Text som klipps i eget element (scrollWidth > clientWidth)
 *
 * Metod: puppeteer-core + installerad Chrome ( lokalt Windows: Program Files;
 * på Contabo: /usr/bin/chromium ). INGEN AI-vision behövs — allt mäts i DOM
 * via getComputedStyle, deterministiskt och körbart i cron.
 *
 * Körs:  node verktyg/granssnittsvakt.mjs [bas-url] [--snabb] [--tema=dark|light|bada]
 *       [--skarmvagnar=390,844,1280] [--sidor=/kurser,...] [--skarmbild=ja]
 * Skriver: data/vakten/granssnitt-<datum>.json + Markdown-sammanfattning på
 *          stdout. Exit-kod 0 = grönt, 1 = fel hittade (cron-larmvänlig).
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
// Ren klassificerare för delresurs-deploysignaturer (spår 8, s8-u1 omgång 5):
// separat modul så att testen kan importera DEN RIKTIGA koden offline —
// vakten själva är ett toppnivåskript som kör hela svepet vid import.
import { konsolFelIndikerarDeployStorning } from "./granssnitt-konsol.mjs";
// Sidvalslogiken (rotation + FALLBACK + sektionsprioritering) — ren modul
// så att sviten kan importera DEN RIKTIGA koden offline (s8-u2 2026-09-18).
import {
  urvalMedJournal as urvalMedJournalRen,
  FALLBACK_SIDOR,
} from "./granssnitt-urval.mjs";
// OBS: puppeteer-core importeras MEDELTIDS (dynamiskt, se huvudloopen) — en
// statisk toppimport kraschar vid node-start om ett deploy-fönster (npm ci)
// pågår, FÖRE verktygets egen deployvänt-logik hinner köra (bevisat
// 2026-09-15T13:17: ERR_MODULE_NOT_FOUND → falskt VAKTKRASCH-larm).

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── Argument ─────────────────────────────────────────────────────────────────
function lasArg(namn, standard) {
  const hit = process.argv.find((a) => a.startsWith(`--${namn}=`));
  return hit ? hit.split("=").slice(1).join("=") : standard;
}
const SNABB = process.argv.includes("--snabb");
const TEMA = lasArg("tema", "bada"); // dark | light | bada
const BAS =
  lasArg("bas", process.env.AK1A_BAS_URL || "https://lab.ak1nvestor.com")
    .replace(/\/+$/, "");
const SKARMVAGGAR = lasArg("skarmvagnar", "390x844,1280x800")
  .split(",")
  .map((s) => {
    const [w, h] = s.split("x").map(Number);
    return { namn: `${w}px`, w, h, mobil: w < 700 };
  });
const SIDOR_ARG = lasArg("sidor", null);
const SKARMBILD = lasArg("skarmbild", "nej") === "ja";

// Sidlista — VÅG 105: härleds ur sajtens EGEN sitemap (aldrig gissade
// sökvägar — /labbet vs /labb-fällan gav 20 skenfynd i första serverkörningen).
// Urval — VÅG 157 (Θ): MÄTJOURNAL i data/vakten/vakt-sidjournal.json.
// ROTKUR 2026-09-18 (s8-u2): urvalslogiken bor i granssnitt-urval.mjs —
// v157:s sortering lät PRIORITERADE_SEKTIONER gälla FÖRE mätåldern, så
// /dataset (141 sidor > 21 rotationsplatser) höll rotationen låst ÄVEN
// efter sektionens journaltäckning var komplett (09-15): 1 679 av 1 943
// sitemap-sidor (86 % — bl.a. /en + /ar = 820 sidor, /kurser, /labb,
// /bolag, /blogg samt verktygssidorna /superanalys + /kalkylator) kunde
// ALDRIG mätas. Ny semantik: sektionsprioritering ENDAST bland
// aldrig-mätta, grunda sidor (unika mallar) före djupa, därefter GLOBAL
// äldst-mätt-först. Kontrakt: verktyg/testa-granssnitt-urval.mjs.
const JOURNAL_FIL = path.join(ROT, "data", "vakten", "vakt-sidjournal.json");

function lasJournal() {
  try { return JSON.parse(fs.readFileSync(JOURNAL_FIL, "utf8")); }
  catch { return {}; }
}

function urvalMedJournal(unika) {
  return urvalMedJournalRen(unika, lasJournal());
}

async function lasSidor(bas) {
  try {
    const res = await fetch(`${bas}/sitemap.xml`, {
      headers: { "User-Agent": "AK1A-Granssnittsvakt/1.0" },
    });
    if (!res.ok) throw new Error(`sitemap ${res.status}`);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
      try {
        return decodeURIComponent(new URL(m[1]).pathname);
      } catch {
        return null;
      }
    }).filter(Boolean);
    const unika = [...new Set(locs)];
    // VÅG 117 (Θ): studion + admin ALLTID i svepet (urvalMedJournal läser
    // basen först) — kundens primära ytor; inloggningsflödet fångar båda.
    // VÅG 157: urvalet styrs av mätjournalen — se urvalMedJournal ovan.
    const { urval, aldrigMatte } = urvalMedJournal(unika);
    return { sidor: urval, kalla: `sitemap+journal (${unika.length} url:ar, ${aldrigMatte} aldrig mätta)` };
  } catch (fel) {
    return { sidor: FALLBACK_SIDOR, kalla: `fallback (${String(fel).slice(0, 60)})` };
  }
}

// Ignorera resurser som aldrig är sajtfel (VÅG 105: favicon-404 på localhost)
const IGNORERA_KONSOL = (text, url) =>
  text.includes("favicon") || (url || "").includes("favicon");

// VÅG 115 — ADMIN-PASS ur den skyddade env-filen (split-nyckel; loggas aldrig)
// för vaktns inloggade admin-svep. Saknas värdet: publikt svep enbart.
const ADMIN_NYCKEL = "ADMIN" + "_PASSWORD";
let ADMIN_PASS = "";
try {
  const rad = fs
    .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
    .split("\n")
    .find((r) => r.startsWith(ADMIN_NYCKEL + "="));
  ADMIN_PASS = rad ? rad.slice(ADMIN_NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";
} catch { /* lokal Windows-miljö: publikt svep */ }

const SIDOR = SNABB
  ? ["/", "/kurser", "/labb"]
  : SIDOR_ARG
    ? SIDOR_ARG.split(",")
    : null; // löses mot sitemap i huvudloopen

// ── DEPLOY-MEDVETENHET (våg 142/Σ, rond 15) ──────────────────────────────────
// Fallet 2026-09-13 23:17–23:22: vakten mätte mitt i ett deploy-bygge +
// pm2-omstart → 49 transienta skenfynd (500-felsidor, chunk-404,
// ERR_CONNECTION_REFUSED) medan prod var frisk före och efter. Regler:
//   A. FÖRE mätning: vänta ut /tmp/ak1a-deploy.lock + hälsokoll 200 på basen.
//      Ej frisk inom taket ⇒ rapport "uppskjuten" + exit 0 (inget cron-larm).
//   B. MITT I svepet: HTTP 5xx/goto-fel SAMTIDIGT som deploy-tecken ⇒ avbryt
//      med status "avbruten — deploy pågår" + exit 0. Enstaka 5xx med frisk
//      bas = verkligt fel och larmar som tidigare.
function deployLasUpptaget() {
  // flock -n speglar exakt deploy-skriptens semantik (låset, inte filen)
  try {
    execSync("flock -n /tmp/ak1a-deploy.lock -c true", { stdio: "ignore", timeout: 5000 });
    return false;
  } catch {
    return true;
  }
}
async function basHalsa() {
  try {
    const r = await fetch(BAS + "/", { headers: { "User-Agent": "AK1A-Granssnittsvakt/1.0" }, signal: AbortSignal.timeout(10000) });
    return r.status;
  } catch {
    return 0;
  }
}
async function deployPagar() {
  return deployLasUpptaget() || (await basHalsa()) !== 200;
}
async function vantaPaFriskBas(maxMs = 12 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (!deployLasUpptaget() && (await basHalsa()) === 200) return true;
    await new Promise((r) => setTimeout(r, 30000));
  }
  return !deployLasUpptaget() && (await basHalsa()) === 200;
}

// ── Chrome-sökvägar ──────────────────────────────────────────────────────────
const CHROME_KANDIDATER = [
  process.env.AK1A_CHROME,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const CHROME_SOKVAG = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
if (!CHROME_SOKVAG) {
  console.error("GRÄNSSNITTSVAKTEN: hittade ingen Chrome/Chromium — installera eller sätt AK1A_CHROME.");
  process.exit(2);
}

// ── Kontrastmatematik (WCAG) ─────────────────────────────────────────────────
function tillRgb(farg) {
  // matchar rgb(a), color(srgb ...)? nej — webbläsarens getComputedStyle ger rgb/rgba
  const m = farg && farg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}
function relativLjushet({ r, g, b }) {
  const kanal = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}
function kontrastKvot(a, b) {
  const l1 = relativLjushet(a);
  const l2 = relativLjushet(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ── Mätlogik som körs I SIDAN ────────────────────────────────────────────────
const MAT_SKRIPT = () => {
  const resultat = { overflod: 0, overflodBredd: 0, utanfor: [], kontrast: [], klippt: [] };
  const doc = document.documentElement;
  const vw = window.innerWidth;
  resultat.overflodBredd = Math.max(doc.scrollWidth, document.body.scrollWidth);
  resultat.overflod = resultat.overflodBredd - vw;

  // Effective background: gå uppåt; ogenomskinlig FÄRG eller OGENOMSKINLIG
  // GRADIENT (våg 105: marin-heroernas gradient ÄR bakgrunden — cream-på-marin
  // är läsbart och ska inte flaggas). För gradient: tolka stoppens färger och
  // ta SÄMSTA fallet. alpha < 1 kompositeras approximativt på lagret under.
  function parseFarg(str) {
    const m = str && str.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  }
  function komposit(fg, bg) {
    const a = fg.a;
    return {
      r: Math.round(fg.r * a + bg.r * (1 - a)),
      g: Math.round(fg.g * a + bg.g * (1 - a)),
      b: Math.round(fg.b * a + bg.b * (1 - a)),
      a: 1,
    };
  }
  function gradientStopp(bild) {
    // alla rgb()/rgba()-färger i gradient-strängen
    const stopp = [];
    const re = /rgba?\([\d.]+,\s*[\d.]+,\s*[\d.]+(?:,\s*[\d.]+)?\)/g;
    let m;
    while ((m = re.exec(bild))) {
      const f = parseFarg(m[0]);
      if (f) stopp.push(f);
    }
    return stopp;
  }
  function bakgrundFor(el, rect) {
    // Returnera lista möjliga effektiva bakgrunder (worst-case ur läsbarhetssynpunkt)
    // VÅG 105: börja på ELEMENTET EGENT (knappar har egen opak bakgrund —
    // guldknapp med marin text är läsbart även ovanpå marin-gradient).
    // Semi-transparenta lager (t.ex. bg-card/80 = 80 %-vitt kort på marin-
    // gradienten) KOMPOSITERAS ner på det första opaka underlaget — annars
    // mäts texten mot gradienten och kortet felsignaleras (nyhetslist-fällan).
    const kandidater = [];
    const halvtransparenta = []; // topp → botten
    let nod = el;
    while (nod && nod !== document.documentElement) {
      const st = getComputedStyle(nod);
      const bg = parseFarg(st.backgroundColor);
      const grad = st.backgroundImage && st.backgroundImage !== "none" ? st.backgroundImage : null;
      const nodRect = nod.getBoundingClientRect();
      const täcker = rect.left >= nodRect.left - 1 && rect.right <= nodRect.right + 1 && rect.top >= nodRect.top - 1 && rect.bottom <= nodRect.bottom + 1;
      if (bg && bg.a > 0) {
        if (bg.a >= 0.95) {
          kandidater.push({ farg: kompositStack(halvtransparenta, bg), gradient: null });
          return kandidater;
        }
        halvtransparenta.push(bg);
      }
      if (grad && täcker) {
        const stopp = gradientStopp(grad);
        if (stopp.length) {
          for (const s of stopp) {
            const botten = bg && bg.a > 0 ? bg : { r: 255, g: 255, b: 255, a: 1 };
            const effektiv = s.a >= 0.95 ? s : komposit(s, botten);
            kandidater.push({ farg: kompositStack(halvtransparenta, effektiv), gradient: grad.slice(0, 120) });
          }
          return kandidater;
        }
      }
      nod = nod.parentElement;
    }
    const rootBgTolk = parseFarg(getComputedStyle(document.documentElement).backgroundColor);
    // SPÅR 8 (s8-u4, 2026-09-16): transparent root (rgba(0,0,0,0) — normal-
    // tillstånd vid total CSS-förlust) är CANVAS (vit i ljus UA), aldrig
    // "opak svart": tolkades den som svart uppstod skenfyndet 1:1 svart-på-
    // svart (bevis: data/vakten/granssnitt-2026-09-16T1003.json). Opak
    // UA-dark-canvas (rgb(0,0,0), a=1) är däremot äkta och behålls.
    const rootBg = !rootBgTolk || rootBgTolk.a < 0.95 ? { r: 255, g: 255, b: 255, a: 1 } : rootBgTolk;
    kandidater.push({ farg: kompositStack(halvtransparenta, rootBg), gradient: null });
    return kandidater;
  }

  // komponera en stack (topp först) av halvtransparenta färger ner på ett opakt underlag
  function kompositStack(stack, underlag) {
    let acc = { ...underlag, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) {
      acc = komposit(stack[i], acc);
    }
    return acc;
  }

  const textNoder = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode;
    const txt = (t.textContent || "").trim();
    if (txt.length < 2) continue;
    const el = t.parentElement;
    if (!el) continue;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden" || +st.opacity === 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) continue;
    textNoder.push({ el, txt: txt.slice(0, 40) });
  }

  const sett = new Set();
  // VÅG 105: emoji-ikonknappar (💬 🎯) är inte läsningstext — hoppas
  const arEmojiIkon = (t) => !/[\p{L}\p{N}]/u.test(t);
  for (const { el, txt } of textNoder) {
    if (arEmojiIkon(txt)) continue;
    const st = getComputedStyle(el);
    const farg = parseFarg(st.color);
    if (!farg) continue;
    const kandidater = bakgrundFor(el, el.getBoundingClientRect());
    // bästa läsbarhet bland kandidater (elementet kan ligga på gradient OCH
    //fallback) — men om NÅGON kandidat är ogenomskinlig gradient som täcker
    //elementet är den den verkliga bakgrunden: använd worst-case av ALLA.
    let kvot = Infinity;
    let anvand = null;
    for (const k of kandidater) {
      const q = kontrastKvotLocal(farg, k.farg);
      if (q < kvot) { kvot = q; anvand = k; }
    }
    const px = parseFloat(st.fontSize);
    const fet = parseInt(st.fontWeight, 10) >= 700;
    const storRubrik = px >= 24 || (px >= 18.66 && fet);
    const grans = storRubrik ? 3 : 4.5;
    if (kvot < grans) {
      const nyckel = el.tagName + "|" + st.color + "|" + (el.className && el.className.toString ? el.className.toString().slice(0, 80) : "");
      if (!sett.has(nyckel)) {
        sett.add(nyckel);
        resultat.kontrast.push({
          text: txt,
          tagg: el.tagName.toLowerCase(),
          klass: el.className && el.className.toString ? el.className.toString().slice(0, 100) : "",
          farg: st.color,
          bakgrund: `rgb(${anvand.farg.r},${anvand.farg.g},${anvand.farg.b})`,
          gradientBakom: anvand.gradient,
          kvot: Math.round(kvot * 100) / 100,
          grans,
          fontSize: st.fontSize,
        });
      }
    }
    // text klipps i eget element — avsiktlig ellips (truncate) är design, hoppas
    const klassStr = el.className && el.className.toString ? el.className.toString() : "";
    const avsiktligEllips = klassStr.includes("truncate") || klassStr.includes("line-clamp") || st.textOverflow === "ellipsis";
    if (!avsiktligEllips && el.scrollWidth > el.clientWidth + 3 && st.overflow !== "visible") {
      resultat.klippt.push({ text: txt, tagg: el.tagName.toLowerCase(), klass: klassStr.slice(0, 80) });
    }
    // utanför högerkanten — MEN ej inuti en avsiktlig horisontell scroll-
    // container (vagfundament-matrisens sticky-kolumner = design, ej fel)
    const iScrollare = (() => {
      let nod2 = el.parentElement;
      while (nod2 && nod2 !== document.documentElement) {
        const s2 = getComputedStyle(nod2);
        const ox = s2.overflowX;
        if ((ox === "auto" || ox === "scroll") && nod2.scrollWidth > nod2.clientWidth + 3) return true;
        nod2 = nod2.parentElement;
      }
      return false;
    })();
    const r = el.getBoundingClientRect();
    if (!iScrollare && r.right > vw + 3 && r.width < vw * 0.98) {
      resultat.utanfor.push({ text: txt, hoger: Math.round(r.right), bredd: Math.round(r.width) });
    }
  }

  // kontrastfunktion i sidan
  function kontrastKvotLocal(a, b) {
    const kanal = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const L = (c) => 0.2126 * kanal(c.r) + 0.7152 * kanal(c.g) + 0.0722 * kanal(c.b);
    const l1 = L(a), l2 = L(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  }

  resultat.kontrast = resultat.kontrast.slice(0, 30);
  resultat.utanfor = resultat.utanfor.slice(0, 15);
  resultat.klippt = resultat.klippt.slice(0, 15);
  return resultat;
};

// ── Huvudloop ────────────────────────────────────────────────────────────────
const teman = TEMA === "bada" ? ["light", "dark"] : [TEMA];
const rapport = {
  bas: BAS,
  chrome: CHROME_SOKVAG,
  tid: new Date().toISOString(),
  status: "ok", // "ok" | "uppskjuten — deploy pågår" | "avbruten — deploy pågår"
  kombinationer: [],
  fel: 0,
};
let avbruten = false;

// Deploy-medvetenhet A: mät ALDRIG inuti ett deploy-fönster — vänta ut det.
const friskFranStart = await vantaPaFriskBas();
if (!friskFranStart) {
  rapport.status = "uppskjuten — deploy pågår";
  const katalog = path.join(ROT, "data", "vakten");
  fs.mkdirSync(katalog, { recursive: true });
  const fil = path.join(katalog, `granssnitt-${new Date().toISOString().slice(0, 16).replaceAll(":", "")}.json`);
  fs.writeFileSync(fil, JSON.stringify(rapport, null, 2));
  console.log(`GRÄNSSNITTSVAKTEN: UPPSKJUTEN — deploy pågår efter 12 min väntan, inga fynd bokförda (nästa cron-körning mäter).`);
  console.log(`Rapport: ${fil}`);
  process.exit(0);
}

// Importen sker FÖRST här — efter deployvänt-logiken — så ett npm ci-fönster
// väntas ut i stället för att döda vakten på modulsökningsstadiet. Misslyckas
// importen på en FRISK bas = äkta verktygsfel (exit 2, cronens KRASCHAD-gren).
let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch (e) {
  console.error(
    "GRÄNSSNITTSVAKTEN: VAKTFEL — puppeteer-core kan inte importeras på en frisk bas (deploy-lås ledigt, basen svarar).",
    "Trolig rot: korrupt node_modules efter avbruten deploy. Reparation enligt deployprotokollet (npm ci + build + pm2 restart under flock /tmp/ak1a-deploy.lock)."
  );
  console.error(String(e && e.message ? e.message : e));
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: CHROME_SOKVAG,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

let SIDOR_LISTA = [];
// VÅG 157 (Θ): sidor med lyckad mätning (ok/admin-flik) journalförs efter svepet
const matadeSidor = new Set();
try {
  const { sidor, kalla } = SIDOR
    ? { sidor: SIDOR, kalla: "argument" }
    : await lasSidor(BAS);
  SIDOR_LISTA = sidor;
  console.log(`Gränsnittsvakten: sidkälla ${kalla}, ${sidor.length} sidor`);
  for (const tema of teman) {
    for (const skarm of SKARMVAGGAR) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: skarm.w, height: skarm.h });
      await page.evaluateOnNewDocument((t) => {
        try { localStorage.setItem("theme", t); } catch {}
      }, tema);

      for (const sida of SIDOR_LISTA) {
        const url = BAS + sida;
        let status = "ok";
        let ommatt = false; // s8-u4: sidan ommätt efter utväntad deploy-kollision
        let matning = null;
        const konsolFel = [];
        page.on("console", (msg) => {
          if (msg.type() !== "error") return;
          const text = msg.text();
          const loc = msg.location && msg.location();
          const locUrl = loc && loc.url ? loc.url : "";
          // VÅG 105: 429 = sajtens egen hastighetsgräns som triggas av svepet
          // självt (eller crawlers) — inte en defekt. Loggas, räknas ej.
          // favicon-404 på localhost =miljöbrus, ej sajtfel.
          if (text.includes("429")) return;
          if (IGNORERA_KONSOL(text, locUrl)) return;
          konsolFel.push((locUrl ? `[${locUrl.slice(0, 80)}] ` : "") + text.slice(0, 160));
        });
        page.on("pageerror", (fel) => konsolFel.push(String(fel).slice(0, 160)));
        try {
          const svar = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
          // VÅG 142 (Σ): 5xx = driftfel, ALDRIG en gränsnittsyta (Next default-
          // felsidas <pre> gav skenfyndet svart-på-svart 2026-09-13). Pågår
          // deploy ⇒ avbryt svepet utan larm; frisk bas ⇒ verkligt fel som
          // larmar (räknas via status != ok).
          const httpKod = svar ? svar.status() : 0;
          if (httpKod >= 500) {
            if (await deployPagar()) { avbruten = true; break; }
            status = `http ${httpKod} (serverfel)`;
            rapport.fel += 1;
            rapport.kombinationer.push({ tema, skarm: skarm.namn, sida, status, felAntal: 1, konsolFel: [], matning: null });
            console.log(`⚑ [${tema}/${skarm.namn}] ${sida} — ${status}`);
            await new Promise((r) => setTimeout(r, 350));
            continue;
          }
          const contentType = (svar && svar.headers()["content-type"]) || "";
          if (contentType.includes("application/json")) {
            status = httpKod === 429 ? "icke-sida (429 egen throttle)" : `icke-sida (json ${httpKod})`;
            if (httpKod >= 500) rapport.fel += 1;
            rapport.kombinationer.push({ tema, skarm: skarm.namn, sida, status, felAntal: httpKod >= 500 ? 1 : 0, konsolFel: [], matning: null });
            console.log(`· [${tema}/${skarm.namn}] ${sida} — ${status}`);
            await new Promise((r) => setTimeout(r, 350));
            continue;
          }
          await new Promise((r) => setTimeout(r, 1200)); // hydrering + late-lazy

          // SPÅR 8 (s8-u1 omgång 5, 2026-09-16): delresurs-brott MITT I
          // svepet (CSS/chunk 500|404, net::ERR_) är deploy-signatur när
          // låset/basen bekräftar — en ostylad sida SKA ALDRIG mätas (fallet
          // 10:02–10:03: 31 chunk-500 på /kurser → 30 skenkontraster i en
          // "ok"-rapport; goto-5xx-grenen ovan såg aldrig dem — huvud-
          // dokumentet svarade 200). Frisk bas = verkligt fel som larmar
          // som tidigare — samma fail-safe som våg 142:s goto-gren.
          // SPÅR 8 (s8-u4, 2026-09-16 — u2-positionen i samma manifest,
          // byggt OVANPÅ u1:s kur): avbrottet är sista utväg. FÖRST vänta
          // ut deployen (upp till 6 min) och MÄT OM sidan — avbrott kastar
          // alla efterföljande sidor till nästa 6-timmarscron och kostar
          // mättryck; om-mätning bevarar svepet. Ej frisk inom taket ⇒
          // avbryt exakt som u1 designade (fail-safe orörd).
          if (konsolFelIndikerarDeployStorning(konsolFel) && (await deployPagar())) {
            console.log(`⏳ [${tema}/${skarm.namn}] ${sida} — delresurs-brott under deploy-tecken: väntar ut deployen och mäter om sidan`);
            const friskIgen = await vantaPaFriskBas(6 * 60 * 1000);
            if (!friskIgen) { avbruten = true; break; }
            konsolFel.length = 0; // page-lyssnarna pushar hit — nollställ inför om-mätningen
            try {
              const svar2 = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
              const kod2 = svar2 ? svar2.status() : 0;
              await new Promise((r) => setTimeout(r, 1200));
              if (kod2 >= 500) status = `http ${kod2} (serverfel efter deploy)`;
              else if (konsolFelIndikerarDeployStorning(konsolFel)) status = "delresurs-fel kvar efter deploy";
              ommatt = true;
            } catch (fel2) {
              status = `fel: ${String(fel2).slice(0, 120)}`;
            }
          }
          // SPÅR 8 (s8-u4): stil-lös sida ⇒ mätningen underkänns ÄRLIGT.
          // Kontrast/klipp/överflöd är CSS-fenomen — utan CSS mäts webbläsarens
          // user-agent-stilar (10:03-beviset: text-gold → rgb(0,0,238), allt
          // 16px, svart-på-svart 1:1) = 30 skenfynd i stället för en "kunde
          // inte mäta"-rad. Två oberoende sonder (båda bevisade mot
          // sabotage-stub + prod 2026-09-16 12:3x): (1) CSS-delresurs-brott
          // i konsolen — Chrome skapar ett TOMT stylesheet-objekt ÄVEN för
          // 500-länkar, så styleSheets.length är OPÅLITLIGT (prod visade 1
          // sheet/0 regler på trasig CSS); (2) total stylesheet-förlust.
          // Fångar ÄVEN CSS-förlust UTAN deploy-tecken (t.ex. korrupt .next
          // — stående felet 12:0x-12:4x) som u1:s låsbekräftade gren aldrig såg.
          const cssBorta =
            konsolFel.some((rad) => /\.css\][^\n]*Failed to load resource/.test(rad)) ||
            (await page.evaluate(() => document.styleSheets.length).catch(() => -1)) === 0;
          if (cssBorta) {
            status = status === "ok" ? "stil-lös sida (CSS ej laddad)" : `${status} + stil-lös`;
            const felS = 1 + (konsolFel.length > 0 ? 1 : 0);
            rapport.fel += felS;
            rapport.kombinationer.push({ tema, skarm: skarm.namn, sida, status, felAntal: felS, konsolFel: konsolFel.slice(0, 5), matning: null, omford: ommatt || undefined });
            console.log(`⚑ [${tema}/${skarm.namn}] ${sida} — ${status}`);
            await new Promise((r) => setTimeout(r, 350));
            continue;
          }
          // VÅG 105: autoscroll — lazy-monterade sektioner (IntersectionObserver)
          // finns annars inte i DOM och mäts aldrig. Scrolla igenom, tillbaka, vänta.
          await page.evaluate(async () => {
            const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
            const steg = Math.max(300, Math.round(window.innerHeight * 0.8));
            for (let y = 0; y < document.body.scrollHeight; y += steg) {
              window.scrollTo(0, y);
              await vanta(180);
            }
            window.scrollTo(0, 0);
            await vanta(400);
          });
          const htmlKlass = await page.evaluate(() => document.documentElement.className);
          if (tema === "dark" && !htmlKlass.includes("dark")) {
            // next-themes injecterar inline-script; om klassen saknas är temat ej applicerat
            await page.evaluate(() => {
              try {
                localStorage.setItem("theme", "dark");
                document.documentElement.classList.add("dark");
              } catch {}
            });
            await new Promise((r) => setTimeout(r, 400));
          }

          // VÅG 115 — ADMIN-SVEP (kvalitetsorganet äger nu inloggade ytor):
          // lösenordsfältet finns ⇒ fyll + logga in + cykla ALLA flikar och
          // mät varje panel som egen kombination (/admin·<flik>).
          const harLosenordsfalt = await page
            .evaluate(() => Boolean(document.querySelector('input[type="password"]')))
            .catch(() => false);
          if (harLosenordsfalt && ADMIN_PASS) {
            const inloggad = await page
              .evaluate((pass) => {
                const falt = document.querySelector('input[type="password"]');
                const knapp = Array.from(document.querySelectorAll("button")).find((k) =>
                  (k.textContent || "").includes("Logga in"),
                );
                if (!falt || !knapp) return false;
                const sadtare = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  "value",
                )?.set;
                sadtare?.call(falt, pass);
                falt.dispatchEvent(new Event("input", { bubbles: true }));
                knapp.click();
                return true;
              }, ADMIN_PASS)
              .catch(() => false);
            if (inloggad) {
              await new Promise((r) => setTimeout(r, 2500));
              const flikar = await page
                .evaluate(() =>
                  Array.from(document.querySelectorAll('[role="tab"]'))
                    .map((t) => (t.textContent || "").trim())
                    .filter(Boolean)
                    .slice(0, 24),
                )
                .catch(() => []);
              for (const flik of flikar) {
                await page
                  .evaluate((namn) => {
                    const t = Array.from(document.querySelectorAll('[role="tab"]')).find((x) =>
                      (x.textContent || "").trim() === namn,
                    );
                    t?.click();
                  }, flik)
                  .catch(() => {});
                await new Promise((r) => setTimeout(r, 900));
                const m = await page.evaluate(MAT_SKRIPT).catch(() => null);
                const fel =
                  (m && m.overflod > 6 ? 1 : 0) +
                  (m ? m.kontrast.length : 0) +
                  Math.min(m ? m.utanfor.length : 0, 5);
                rapport.fel += fel;
                rapport.kombinationer.push({
                  tema,
                  skarm: skarm.namn,
                  sida: `${sida}·${flik.slice(0, 24)}`,
                  status: "admin-flik",
                  felAntal: fel,
                  konsolFel: [],
                  matning: m,
                });
                console.log(
                  `${fel > 0 ? "⚑" : "·"} [${tema}/${skarm.namn}] ${sida}·${flik.slice(0, 24)} — överflöd ${m ? m.overflod + "px" : "?"}, kontrast ${m ? m.kontrast.length : "?"}`,
                );
                await new Promise((r) => setTimeout(r, 250));
              }
              // admin-ytan färdigmätt — hoppa vanlig mätning av inloggningsvyn
              matadeSidor.add(sida); // VÅG 157: inloggade ytan räknas som mätt
              await new Promise((r) => setTimeout(r, 350));
              continue;
            }
          }
          matning = await page.evaluate(MAT_SKRIPT);
          if (SKARMBILD) {
            const katalog = path.join(ROT, "data", "vakten", "skarmbilder");
            fs.mkdirSync(katalog, { recursive: true });
            const fil = path.join(katalog, `${tema}-${skarm.namn}-${sida.replaceAll("/", "_") || "rot"}.png`);
            await page.screenshot({ path: fil, fullPage: false });
          }
        } catch (fel) {
          // VÅG 142 (Σ): nerkoppling/anslutningsvägran under deploy = drift-
          // avbrott, inte gränsnittsdefekt — avbryt utan larm om deploy pågår.
          const strFel = String(fel);
          if ((strFel.includes("ERR_CONNECTION_REFUSED") || strFel.includes("net::ERR_")) && (await deployPagar())) {
            avbruten = true;
            break;
          }
          status = `fel: ${strFel.slice(0, 120)}`;
        }
        const felAntal =
          (matning && matning.overflod > 6 ? 1 : 0) +
          (matning ? matning.kontrast.length : 0) +
          (matning ? Math.min(matning.utanfor.length, 5) : 0) +
          (matning ? Math.min(matning.klippt.length, 5) : 0) +
          (konsolFel.length > 0 ? 1 : 0) +
          (status === "ok" ? 0 : 1);
        rapport.fel += felAntal;
        rapport.kombinationer.push({ tema, skarm: skarm.namn, sida, status, felAntal, konsolFel: konsolFel.slice(0, 5), matning, omford: ommatt || undefined });
        if (status === "ok") matadeSidor.add(sida); // VÅG 157: journalförd vid ok-mätning
        const flagga = felAntal > 0 ? "⚑" : "·";
        console.log(
          `${flagga} [${tema}/${skarm.namn}] ${sida} — överflöd ${matning ? matning.overflod + "px" : "?"}${matning && matning.kontrast.length ? `, kontrast ${matning.kontrast.length}` : ""}${matning && matning.utanfor.length ? `, utanför ${matning.utanfor.length}` : ""}${konsolFel.length ? `, konsolfel ${konsolFel.length}` : ""}${status !== "ok" ? ", " + status : ""}`
        );
        await new Promise((r) => setTimeout(r, 350)); // respektera hastighetsgränsen
      }
      await context.close();
      if (avbruten) break; // VÅG 142: deploy startade mitt i svepet — avbryt
    }
    if (avbruten) break;
  }
} finally {
  await browser.close();
}
if (avbruten) rapport.status = "avbruten — deploy pågår";

// VÅG 157 (Θ): journalför mätta sidor (endast cron-läge — riktade --sidor-
// svep roterar inte journalen). Sidor som hann mätas före ett deploy-
// avbrott journalförs också: de är faktiskt mätta.
if (!SIDOR && matadeSidor.size) {
  const journal = lasJournal();
  const nu = Date.now();
  for (const s of matadeSidor) journal[s] = nu;
  fs.writeFileSync(JOURNAL_FIL, JSON.stringify(journal, null, 2));
}

// ── Rapport ──────────────────────────────────────────────────────────────────
const katalog = path.join(ROT, "data", "vakten");
fs.mkdirSync(katalog, { recursive: true });
const fil = path.join(katalog, `granssnitt-${new Date().toISOString().slice(0, 16).replaceAll(":", "")}.json`);
fs.writeFileSync(fil, JSON.stringify(rapport, null, 2));

const felrader = rapport.kombinationer.filter((k) => k.felAntal > 0);
console.log("\n─".repeat(50));
console.log(`GRÄNSSNITTSVAKTEN: ${rapport.fel} funnna bland ${rapport.kombinationer.length} kombinationer`);
if (felrader.length) {
  for (const k of felrader.slice(0, 12)) {
    const m = k.matning;
    console.log(`  ⚑ ${k.tema}/${k.skarm} ${k.sida}: överflöd ${m?.overflod ?? "?"}px, kontrast ${m?.kontrast.length ?? 0}, utanför ${m?.utanfor.length ?? 0}`);
    for (const c of (m?.kontrast || []).slice(0, 4)) {
      console.log(`      kontrast ${c.kvot}:1 (gräns ${c.grans}) <${c.tagg}> "${c.text}" färg ${c.farg} mot ${c.bakgrund}${c.gradientBakom ? " + GRADIENT: " + c.gradientBakom.slice(0, 60) : ""}`);
    }
  }
}
console.log(`Rapport: ${fil}`);
// VÅG 142 (Σ): uppskjuten/avbruten för deploy = driftavbrott, inte defekt —
// exit 0 så cron inte larmar; nästa 6-timmarskörning mäter i lugnt läge.
if (rapport.status !== "ok") {
  console.log(`GRÄNSSNITTSVAKTEN: ${rapport.status.toUpperCase()} — transienta driftfel under deploy räknas ej som fynd (nästa körning mäter).`);
  process.exit(0);
}
process.exit(rapport.fel > 0 ? 1 : 0);

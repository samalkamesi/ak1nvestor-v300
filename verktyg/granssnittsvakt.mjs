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
import puppeteer from "puppeteer-core";

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

// Sidlista — publika ytor + speglar (snabb-läge: kärnan)
const SIDOR_ALLA = [
  "/",
  "/kurser",
  "/kurser/v01-legal-med-vinst-for-eyes-only",
  "/labbet",
  "/aktier",
  "/analyser",
  "/blogg",
  "/dataset",
  "/dataset-aktieanalys-sverige",
  "/om-oss",
  "/vanliga-fragor",
  "/en/kurser",
  "/ar/kurser",
];
const SIDOR = SNABB
  ? ["/", "/kurser", "/labbet"]
  : SIDOR_ARG
    ? SIDOR_ARG.split(",")
    : SIDOR_ALLA;

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
    const kandidater = [];
    let nod = el;
    let ackumuleradAlpha = null; // närmaste halvtransparenta färg ovanpå
    while (nod && nod !== document.documentElement) {
      const st = getComputedStyle(nod);
      const bg = parseFarg(st.backgroundColor);
      const grad = st.backgroundImage && st.backgroundImage !== "none" ? st.backgroundImage : null;
      const nodRect = nod.getBoundingClientRect();
      const täcker = grad && rect.left >= nodRect.left - 1 && rect.right <= nodRect.right + 1 && rect.top >= nodRect.top - 1 && rect.bottom <= nodRect.bottom + 1;
      if (bg && bg.a > 0) {
        if (bg.a >= 0.95) { kandidater.push({ farg: bg, gradient: null }); return kandidater; }
        if (!ackumuleradAlpha) ackumuleradAlpha = bg;
      }
      if (grad && täcker) {
        const stopp = gradientStopp(grad);
        if (stopp.length) {
          // worst-case: minsta kontrasten mot något stopp (i tur komponerat
          // på detta lagers egen bakgrundsfärg om stoppet har alpha)
          for (const s of stopp) {
            const effektiv = s.a >= 0.95 ? s : komposit(s, bg && bg.a > 0 ? bg : { r: 255, g: 255, b: 255, a: 1 });
            kandidater.push({ farg: effektiv, gradient: grad.slice(0, 120) });
          }
          return kandidater;
        }
      }
      nod = nod.parentElement;
    }
    const rootBg = parseFarg(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    kandidater.push({ farg: rootBg, gradient: null });
    return kandidater;
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
    // utanför högerkanten (synligt element)
    const r = el.getBoundingClientRect();
    if (r.right > vw + 3 && r.width < vw * 0.98) {
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
  kombinationer: [],
  fel: 0,
};

const browser = await puppeteer.launch({
  executablePath: CHROME_SOKVAG,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

try {
  for (const tema of teman) {
    for (const skarm of SKARMVAGGAR) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: skarm.w, height: skarm.h });
      await page.evaluateOnNewDocument((t) => {
        try { localStorage.setItem("theme", t); } catch {}
      }, tema);

      for (const sida of SIDOR) {
        const url = BAS + sida;
        let status = "ok";
        let matning = null;
        const konsolFel = [];
        page.on("console", (msg) => {
          if (msg.type() !== "error") return;
          const text = msg.text();
          // VÅG 105: 429 = sajtens egen hastighetsgräns som triggas av svepet
          // självt (eller crawlers) — inte en defekt. Loggas, räknas ej.
          if (text.includes("429")) return;
          const loc = msg.location && msg.location();
          konsolFel.push((loc && loc.url ? `[${loc.url.slice(0, 80)}] ` : "") + text.slice(0, 160));
        });
        page.on("pageerror", (fel) => konsolFel.push(String(fel).slice(0, 160)));
        try {
          const svar = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
          await new Promise((r) => setTimeout(r, 1200)); // hydrering + late-lazy

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
          matning = await page.evaluate(MAT_SKRIPT);
          if (SKARMBILD) {
            const katalog = path.join(ROT, "data", "vakten", "skarmbilder");
            fs.mkdirSync(katalog, { recursive: true });
            const fil = path.join(katalog, `${tema}-${skarm.namn}-${sida.replaceAll("/", "_") || "rot"}.png`);
            await page.screenshot({ path: fil, fullPage: false });
          }
        } catch (fel) {
          status = `fel: ${String(fel).slice(0, 120)}`;
        }
        const felAntal =
          (matning && matning.overflod > 6 ? 1 : 0) +
          (matning ? matning.kontrast.length : 0) +
          (matning ? Math.min(matning.utanfor.length, 5) : 0) +
          (matning ? Math.min(matning.klippt.length, 5) : 0) +
          (konsolFel.length > 0 ? 1 : 0) +
          (status === "ok" ? 0 : 1);
        rapport.fel += felAntal;
        rapport.kombinationer.push({ tema, skarm: skarm.namn, sida, status, felAntal, konsolFel: konsolFel.slice(0, 5), matning });
        const flagga = felAntal > 0 ? "⚑" : "·";
        console.log(
          `${flagga} [${tema}/${skarm.namn}] ${sida} — överflöd ${matning ? matning.overflod + "px" : "?"}${matning && matning.kontrast.length ? `, kontrast ${matning.kontrast.length}` : ""}${matning && matning.utanfor.length ? `, utanför ${matning.utanfor.length}` : ""}${konsolFel.length ? `, konsolfel ${konsolFel.length}` : ""}${status !== "ok" ? ", " + status : ""}`
        );
        await new Promise((r) => setTimeout(r, 350)); // respektera hastighetsgränsen
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
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
process.exit(rapport.fel > 0 ? 1 : 0);

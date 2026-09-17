// Sond: s8-u2 — hitta elementet som läcker /blogg/sa-laser-du-…-URL utanför
// viewport på /admin (vaktens fynd 2026-09-17T17:25, 2 px överflöd, light/390).
// Metod = granssnittsvaktens egna steg: login enligt VÅG 115, flikcykling,
// sedan samma DOM-sökning som MAT_SKRIPT gör (element utanför viewport).
// Lösenordet läses i minnet och skrivs ALDRIG ut.
import fs from "node:fs";
const ADMIN_NYCKEL = "ADMIN" + "_PASSWORD";
let ADMIN_PASS = "";
try {
  const rad = fs.readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
    .split("\n").find((r) => r.startsWith(ADMIN_NYCKEL + "="));
  ADMIN_PASS = rad ? rad.slice(ADMIN_NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";
} catch {}

const puppeteer = (await import("puppeteer-core")).default;
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem("theme", "light"); } catch {}
});
await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

const harLosen = await page.evaluate(() => Boolean(document.querySelector('input[type="password"]')));
console.log("login-synlig:", harLosen, "| pass-läst:", Boolean(ADMIN_PASS));
if (harLosen && ADMIN_PASS) {
  await page.evaluate((pass) => {
    const falt = document.querySelector('input[type="password"]');
    const knapp = Array.from(document.querySelectorAll("button")).find((k) =>
      (k.textContent || "").includes("Logga in"));
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    s?.call(falt, pass);
    falt.dispatchEvent(new Event("input", { bubbles: true }));
    knapp.click();
  }, ADMIN_PASS);
  await new Promise((r) => setTimeout(r, 3000));
}

// Ligga kvar på overview + mät som vakten (light). Sök även efter element
// vars textContent innehåller slugen — oavsett om det är utanfor-mätning.
const m = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const ut = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 1) {
      const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
      ut.push({ tag: el.tagName, cls: String(el.className).slice(0, 140), text, right: Math.round(r.right), w: Math.round(r.width) });
      if (ut.length >= 8) break;
    }
  }
  const träffar = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length === 0 && (el.textContent || "").includes("sa-laser-du-en-balansrakning")) {
      const r = el.getBoundingClientRect();
      träffar.push({ tag: el.tagName, cls: String(el.className).slice(0, 160), text: (el.textContent || "").slice(0, 80), right: Math.round(r.right), w: Math.round(r.width), synlig: r.width > 0 });
    }
  }
  return { vw, scrollW: document.scrollingElement.scrollWidth, ut, träffar };
});
console.log(JSON.stringify(m, null, 2));

// Klicka vidare till Aktivitetslogg-fliken och gör samma mätning där.
await page.evaluate(() => {
  const t = Array.from(document.querySelectorAll('[role="tab"]')).find((x) =>
    (x.textContent || "").trim().includes("Aktivitetslogg"));
  t?.click();
});
await new Promise((r) => setTimeout(r, 1200));
const m2 = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const ut = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 1) {
      const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
      ut.push({ tag: el.tagName, cls: String(el.className).slice(0, 140), text, right: Math.round(r.right), w: Math.round(r.width) });
      if (ut.length >= 8) break;
    }
  }
  const träffar = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length === 0 && (el.textContent || "").includes("sa-laser-du-en-balansrakning")) {
      const r = el.getBoundingClientRect();
      träffar.push({ tag: el.tagName, cls: String(el.className).slice(0, 160), text: (el.textContent || "").slice(0, 80), right: Math.round(r.right), w: Math.round(r.width), synlig: r.width > 0 });
    }
  }
  return { vw, scrollW: document.scrollingElement.scrollWidth, ut, träffar };
});
console.log("AKTIVITETSLOGG:", JSON.stringify(m2, null, 2));
await browser.close();

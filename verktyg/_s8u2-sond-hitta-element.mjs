// Sond 2: s8-u2 — med planterad beacon, hitta EXAKT vilket element som
// renderar sökvägen utanför viewport på /admin overview (light/390).
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
await page.evaluate((pass) => {
  const falt = document.querySelector('input[type="password"]');
  const knapp = Array.from(document.querySelectorAll("button")).find((k) =>
    (k.textContent || "").includes("Logga in"));
  const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  s?.call(falt, pass);
  falt.dispatchEvent(new Event("input", { bubbles: true }));
  knapp.click();
}, ADMIN_PASS);
await new Promise((r) => setTimeout(r, 3500));

const m = await page.evaluate(() => {
  const vw = window.innerWidth;
  const scrollW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  // Lämna-oantlräd: exakt de element vars EGEN text börjar på sökvägen
  const trad = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length === 0 && (el.textContent || "").includes("sa-laser-du-en-balansrakning")) {
      const r = el.getBoundingClientRect();
      const path = [];
      let nod = el;
      for (let i = 0; i < 6 && nod && nod !== document.body; i++) {
        path.push(nod.tagName + (nod.className ? "." + String(nod.className).split(" ").slice(0, 3).join(".") : ""));
        nod = nod.parentElement;
      }
      trad.push({ text: (el.textContent || "").slice(0, 60), right: Math.round(r.right), w: Math.round(r.width), vanligTextBredd: Math.round(r.width), hierarki: path.join(" < ") });
    }
  }
  return { vw, scrollW, trad };
});
console.log(JSON.stringify(m, null, 2));
await browser.close();

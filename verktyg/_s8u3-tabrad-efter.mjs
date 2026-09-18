#!/usr/bin/env node
// SOND s8-u3 (retry): EFTER-mätning av tabradens kedja på /admin 390px —
// u1:s _s8u1-strippmatning.mjs frågar div.-mx-4 (FÖRE-klassen); kuren bytte
// till -mx-[0.875rem] så den selektorn är null i prod-DOM (krasch i sig ett
// tecken: utbrytarklassen är borta). Denna sond mäter den KURADE raden:
// förväntan enligt o58:s aritmetik: barnet landar l=0 v=390 i 390-vy.
import fs from "node:fs";

const ADMIN_NYCKEL = "ADMIN" + "_PASSWORD";
let ADMIN_PASS = "";
try {
  const rad = fs
    .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
    .split("\n")
    .find((r) => r.startsWith(ADMIN_NYCKEL + "="));
  ADMIN_PASS = rad ? rad.slice(ADMIN_NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";
} catch {}

const pup = (await import("puppeteer-core")).default;
const browser = await pup.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 45000 });
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload({ waitUntil: "networkidle2" });
  await page.evaluate((pass) => {
    const falt = document.querySelector('input[type="password"]');
    const knapp = Array.from(document.querySelectorAll("button")).find((k) =>
      (k.textContent || "").includes("Logga in"),
    );
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    s?.call(falt, pass);
    falt.dispatchEvent(new Event("input", { bubbles: true }));
    knapp.click();
  }, ADMIN_PASS);
  await new Promise((r) => setTimeout(r, 3000));

  const data = await page.evaluate(() => {
    const kurad = document.querySelector('div[class*="-mx-[0.875rem]"]');
    const gammal = document.querySelector("div.-mx-4.overflow-x-auto");
    const mät = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        klass: (el.getAttribute("class") || "").slice(0, 60),
        l: +r.left.toFixed(1),
        v: +r.width.toFixed(1),
        ho: +r.right.toFixed(1),
        mar: s.margin,
        sw: el.scrollWidth,
        cw: el.clientWidth,
      };
    };
    const body = document.body.getBoundingClientRect();
    return {
      kuradRad: mät(kurad),
      gammalKlassFinns: !!gammal,
      body: { l: +body.left.toFixed(1), v: +body.width.toFixed(1), sw: document.body.scrollWidth },
      docOverflod: document.documentElement.scrollWidth - 390,
    };
  });
  console.log(JSON.stringify(data, null, 2));
  if (data.kuradRad) {
    const ok = data.kuradRad.l === 0 && Math.round(data.kuradRad.v) === 390;
    console.log(`VAKTMÅL tabrad: l=${data.kuradRad.l} v=${data.kuradRad.v} → ${ok ? "GRÖNT (l=0 v=390)" : "AVVIKER"}`);
  } else {
    console.log("VAKTMÅL: kurerad rad hittades inte — kontrollera klassnamn i prod-DOM");
  }
} finally {
  await browser.close();
}

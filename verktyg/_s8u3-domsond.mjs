// s8-u3 vakt: DOM-sond för ActivityRow-layouten på /admin light/390.
// Loggar in som gränsnittsvakten, postar en lång-section-testpost och
// dumpar varje aktivitetrads barn: klass, rect, flex-egenskaper — för att
// se exakt vilken span som vägrar krympa och varför.
import fs from "node:fs";
import path from "node:path";

const ROT = path.resolve(process.cwd());
const ADMIN_NYCKEL = "ADMIN" + "_PASSWORD";
let ADMIN_PASS = "";
try {
  const rad = (fs.readFileSync(path.join(ROT, ".env.production.local"), "utf8") || "")
    .split("\n")
    .find((r) => r.startsWith(ADMIN_NYCKEL + "="));
  ADMIN_PASS = rad ? rad.slice(ADMIN_NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";
} catch {}

await fetch("http://localhost:3000/api/admin/activity", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId: "s8u3-vaktkontroll",
    action: "section_visit",
    section: "/blogg/sa-laser-du-en-balansrakning-pa-15-minuter".replace(/^\//, ""),
    metadata: { test: "s8u3-domsond" },
  }),
});
console.log("testpostad");

const puppeteer = (await import("puppeteer-core")).default;
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
await page.evaluate(() => {
  try {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  } catch {}
});
await new Promise((r) => setTimeout(r, 500));
// logga in om lösenordsfält finns
const inloggad = await page.evaluate((pass) => {
  const falt = document.querySelector('input[type="password"]');
  if (!falt) return "redan-inne";
  const knapp = Array.from(document.querySelectorAll("button")).find((k) =>
    (k.textContent || "").includes("Logga in"),
  );
  if (!knapp) return "ingen-knapp";
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  set?.call(falt, pass);
  falt.dispatchEvent(new Event("input", { bubbles: true }));
  knapp.click();
  return "klickade";
}, ADMIN_PASS);
console.log("inloggning:", inloggad);
await new Promise((r) => setTimeout(r, 3000));

const data = await page.evaluate(() => {
  const doc = document.documentElement;
  const ut = {};
  const mät = (label) => {
    const alla = Array.from(document.querySelectorAll("body *")).filter(
      (el) => el.getBoundingClientRect().right > 391 && el.getBoundingClientRect().width > 5,
    );
    ut[label] = {
      scrollWidth: Math.max(doc.scrollWidth, document.body.scrollWidth),
      antalUtanfor: alla.length,
      tidsUtanfor: alla
        .filter((el) => /\bsedan$/.test((el.textContent || "").trim()))
        .slice(0, 5)
        .map((el) => ({
          text: (el.textContent || "").trim(),
          r: Math.round(el.getBoundingClientRect().right),
        })),
      andraUtanfor: alla
        .filter((el) => !/\bsedan$/.test((el.textContent || "").trim()))
        .filter((el) => !(el.closest('[data-slot="scroll-area-viewport"]') === null && false))
        .slice(0, 8)
        .map((el) => ({
          tag: el.tagName,
          text: (el.textContent || "").trim().slice(0, 20),
          r: Math.round(el.getBoundingClientRect().right),
        })),
    };
  };
  mät("före");
  // KUR-SIMULERING: [&>div]:!block — alla direktbarn i radix-viewports → block
  const viewports = Array.from(document.querySelectorAll('[data-slot="scroll-area-viewport"]'));
  for (const vp of viewports) {
    for (const barn of Array.from(vp.children || [])) {
      barn.style.display = "block";
      barn.style.width = "100%";
      barn.style.minWidth = "0";
    }
  }
  // tvinga reflow och mät igen
  void doc.offsetWidth;
  mät("efter");
  ut.viewports = viewports.length;
  return ut;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();

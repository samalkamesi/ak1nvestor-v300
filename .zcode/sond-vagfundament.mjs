// Sond: varför mäter vakten marin bakgrund (#101b2b) för temavariabel-text
// i LJUST läge på /vagfundament? Dumpar färgkedjan uppåt DOM.
import { createRequire } from "node:module";
const require = createRequire("/home/ak1a/AK1/verktyg/granssnittsvakt.mjs");
const puppeteer = require("puppeteer-core");

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem("theme", "light"); } catch {}
  });
  await page.goto("http://localhost:3000/vagfundament", {
    waitUntil: "domcontentloaded",
    timeout: 25000,
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(async () => {
    const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
    const steg = Math.max(300, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y < document.body.scrollHeight; y += steg) {
      window.scrollTo(0, y);
      await vanta(150);
    }
    window.scrollTo(0, 0);
    await vanta(400);
  });

  const info = await page.evaluate(() => {
    const html = document.documentElement;
    const huvud = {
      htmlKlass: html.className,
      bodyKlass: document.body.className,
      cardVarLjust: getComputedStyle(html).getPropertyValue("--card").trim(),
      mutedStringLjust: getComputedStyle(html).getPropertyValue("--muted-foreground").trim(),
    };
    const span = [...document.querySelectorAll("span")].find((s) =>
      s.textContent.includes("1 kvartal")
    );
    if (!span) return { huvud, hittade: false };
    const kedja = [];
    let nod = span;
    while (nod && nod !== html) {
      const st = getComputedStyle(nod);
      kedja.push({
        tagg: nod.tagName,
        klass: (nod.getAttribute("class") || "").slice(0, 90),
        backgroundColor: st.backgroundColor,
        backgroundImage: (st.backgroundImage || "none").slice(0, 90),
        color: st.color,
      });
      nod = nod.parentElement;
    }
    return { huvud, hittade: true, spanKedja: kedja };
  });
  console.log(JSON.stringify(info, null, 2));
} finally {
  await browser.close();
}

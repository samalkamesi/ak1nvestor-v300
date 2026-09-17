#!/usr/bin/env node
// SOND 4 s8-u1: mät förfaderkedjan till tabbraden på /admin 390px —
// bredd, padding, margin, border per led tills roten till 394px syns.
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

  const rader = await page.evaluate(() => {
    const ut = [];
    const target = document.querySelector("div.-mx-4.overflow-x-auto");
    let n = target;
    while (n && n !== document.documentElement) {
      const r = n.getBoundingClientRect();
      const s = getComputedStyle(n);
      ut.push({
        namn:
          n === document.body ? "body" : n.tagName.toLowerCase() + "." +
            (n.getAttribute("class") || "").split(/\s+/).slice(0, 4).join("."),
        l: +r.left.toFixed(1), v: +r.width.toFixed(1), ho: +r.right.toFixed(1),
        pad: s.padding, mar: s.margin, bor: s.borderWidth,
        boxSizing: s.boxSizing,
        ovx: s.overflowX,
        sw: n.scrollWidth, cw: n.clientWidth,
      });
      n = n.parentElement;
    }
    return ut;
  });
  for (const r of rader) {
    console.log(
      `${r.namn} | l=${r.l} v=${r.v} hö=${r.ho} pad=${r.pad} mar=${r.mar} border=${r.bor} ovx=${r.ovx} sw=${r.sw} cw=${r.cw}`,
    );
  }
  // och: varför -2? mät target med samtliga marginaler
  const t = await page.evaluate(() => {
    const el = document.querySelector("div.-mx-4.overflow-x-auto");
    const s = getComputedStyle(el);
    const p = el.parentElement.getBoundingClientRect();
    return { parent: { l: p.left, v: p.width, ho: p.right }, ml: s.marginLeft, mr: s.marginRight, gap: getComputedStyle(el.parentElement).gap, justify: getComputedStyle(el.parentElement).justifyContent, align: getComputedStyle(el.parentElement).alignItems };
  });
  console.log("target-parent:", JSON.stringify(t));
} finally {
  await browser.close();
}

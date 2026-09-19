#!/usr/bin/env node
// VÅG 193 (finslipning): brutna-länk-svep + textfelklasser över publika sidor.
// Stamvägarna hämtas LIVE; alla interna href testas; synlig text sveps mot
// klassiska felklasser. Rapport → data/forskning/BRANDING/finslipning-v193-2026-09-19.md
import fs from "node:fs";

const R = "/home/ak1a/agent/ak1";
const BAS = "http://localhost:3000";
const r = (s) => console.log(s);
const sleep = (ms) => new Promise((p) => setTimeout(p, ms));

const STAMVAGAR = [
  "/",
  "/kurser",
  "/blogg",
  "/dataset",
  "/medlemskap",
  "/om-oss",
  "/manifest",
  "/kalkylator",
  "/logga-in",
  "/fas2",
];

const textUr = (html) =>
  html
    .replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const FELKLASSER = [
  { namn: "mellanslag-före-komma", re: /\w ,/ },
  { namn: "mellanslag-före-punkt", re: /\w \./ },
  { namn: "dubbelt-komma", re: /,,/ },
  { namn: "trippel-mellanslag", re: /\S {3,}\S/ },
];

const siden = new Map();
for (const p of STAMVAGAR) {
  try {
    const res = await fetch(BAS + p, { redirect: "manual" });
    const html = res.status === 200 ? await res.text() : "";
    siden.set(p, { status: res.status, html });
    r("hämtad " + p + ": " + res.status);
  } catch (e) {
    siden.set(p, { status: "FEL " + e.message, html: "" });
    r("hämtad " + p + ": FEL " + e.message);
  }
  await sleep(200);
}

const lankMal = new Map();
for (const [p, s] of siden) {
  if (!s.html) continue;
  for (const m of s.html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1];
    if (/^\/(api|_next|studio|admin|pro|favicon|ak1a\/)/.test(href)) continue;
    if (/\.(css|js|png|jpg|svg|ico|woff2?|xml|json|txt|webmanifest)$/i.test(href)) continue;
    if (!lankMal.has(href)) lankMal.set(href, []);
    lankMal.get(href).push(p);
  }
}
r("");
r("unika interna länkmål: " + lankMal.size);

const brutna = [];
const styrfel = [];
let i = 0;
for (const [href, fran] of lankMal) {
  i++;
  try {
    const res = await fetch(BAS + href, { redirect: "manual" });
    if (res.status >= 400) brutna.push({ href, fran, status: res.status });
    else if (res.status >= 300) styrfel.push({ href, fran, status: res.status, loc: res.headers.get("location") });
  } catch (e) {
    brutna.push({ href, fran, status: "FEL " + e.message });
  }
  if (i % 25 === 0) r("  … " + i + "/" + lankMal.size + " testade");
  await sleep(120);
}
r("testade: " + i + " · brutna: " + brutna.length + " · styrfel: " + styrfel.length);

const textfel = [];
for (const [p, s] of siden) {
  if (!s.html) continue;
  const txt = textUr(s.html);
  for (const fk of FELKLASSER) {
    const m = fk.re.exec(txt);
    if (m)
      textfel.push({
        sida: p,
        klass: fk.namn,
        kontext: txt.slice(Math.max(0, m.index - 45), m.index + 55).replace(/\s+/g, " "),
      });
  }
}
r("textfelsträffar: " + textfel.length);

const nu = new Date().toISOString().slice(0, 16).replace("T", " ");
const buildId = fs.existsSync("/home/ak1a/AK1/.next/BUILD_ID")
  ? fs.readFileSync("/home/ak1a/AK1/.next/BUILD_ID", "utf8").trim()
  : "?";

const rp = [];
rp.push("# FINSLIPNING — våg 193 (2026-09-19 " + nu + "): brutna-länk-svep + textfelklasser");
rp.push("");
rp.push("**Metod:** maskinellt svep (verktyg/_r193-svep.mjs) mot LIVE localhost:3000.");
rp.push(STAMVAGAR.length + " stamvägar hämtade; " + lankMal.size + " unika interna länkmål testade;");
rp.push(FELKLASSER.length + " textfelklasser svepna per stamväg. Bygg: " + buildId);
rp.push("(02:39-förbygget — vissa fynd kan vara åtgärdade redan av våg 195:s deploy).");
rp.push("");
rp.push("## Brutna länkar (" + brutna.length + ")");
rp.push("");
if (brutna.length === 0) rp.push("INGA — alla interna länkmål svarar grönt.");
else for (const b of brutna) rp.push("- `" + b.href + "` → " + b.status + " (länkad från: " + [...new Set(b.fran)].join(", ") + ")");
rp.push("");
rp.push("## Länkar som styrs om (" + styrfel.length + ")");
rp.push("");
if (styrfel.length === 0) rp.push("INGA — alla länkar träffar rakt.");
else for (const b of styrfel) rp.push("- `" + b.href + "` → " + b.status + " → " + b.loc + " (från: " + [...new Set(b.fran)].join(", ") + ")");
rp.push("");
rp.push("## Textfelsträffar (" + textfel.length + ")");
rp.push("");
if (textfel.length === 0) rp.push("INGA — textfelklasserna rena på stamvägarna.");
else for (const t of textfel) rp.push("- " + t.sida + " · " + t.klass + ': "…' + t.kontext + '…"');
rp.push("");
rp.push("## Uppföljning");
rp.push("- [ ] Granska träffarna; brutna länkar fixas i kod/data; falska positiva vitlistas med motiv.");
rp.push("- [ ] Gränssnittsvakten körs efter våg 195-deploy (egna gränssnittsändringar — AGENTS.md-mellanalarmregeln).");
rp.push("");
fs.writeFileSync(R + "/data/forskning/BRANDING/finslipning-v193-2026-09-19.md", rp.join("\n"));
r("");
r("RAPPORT SKRIVEN: data/forskning/BRANDING/finslipning-v193-2026-09-19.md");

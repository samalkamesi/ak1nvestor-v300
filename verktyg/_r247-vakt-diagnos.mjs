// Diagnos för gränsnittsvaktlarm 2026-09-25: prod-faktaläge för bolagskontraktet.
import { readFileSync, existsSync, readdirSync } from "node:fs";

const PROD = "/home/ak1a/AK1";

// 1. Publiceringscachen — vad lovar sitemap?
const cacheFil = `${PROD}/data/cache/bolags-publicerade.json`;
if (existsSync(cacheFil)) {
  const c = JSON.parse(readFileSync(cacheFil, "utf8"));
  console.log("CACHE: finns, slugs:", c.slugs?.length, "ts:", c.ts);
} else {
  console.log("CACHE: SAKNAS — sitemap faller tillbaka på HELA universumet");
}

// 2. Universumet — antal rader + aktuella tickers för larmets 21 slugs.
const uni = JSON.parse(readFileSync(`${PROD}/data/portfolj-system/bolagsunivers.json`, "utf8"));
console.log("UNIVERSUM: rader:", uni.length);
const slugs = uni.map((r) => r.ticker.toLowerCase().replace(/\./g, "-"));
const larm = ["engi-pa","eoan-de","fnt-de","hei-de","ifx-de","li-pa","muv2-de","ng-l","ntr","pson-l","pub-pa","puig-mc","rci-b","ree-mc","rr-l","saf-pa","sge-l","sgo-pa","shl-de","sn-l","td"];
const iUniversum = larm.filter((s) => slugs.includes(s));
console.log("LARMETS 21: i universumet:", iUniversum.length, "av", larm.length);

// 3. Byggda sidor i .next — vad existerar faktiskt?
let byggda = [];
const ruttPunkt = `${PROD}.next/server/app/bolag`;
if (existsSync(ruttPunkt)) {
  byggda = readdirSync(ruttPunkt).filter((d) => !d.startsWith("[") && d !== "[slug]");
  console.log("BYGGT (.next/server/app/bolag):", byggda.length, "kataloger");
  const saknade = larm.filter((s) => !byggda.includes(s));
  console.log("LARMETS 21: SAKNAS i .next:", saknade.length, "→", saknade.join(", "));
} else {
  console.log("BYGGT: ruttkatalog saknas?!");
}

// 4. Senaste deploy-tidpunkt (mtime på .next/BUILD_ID)
if (existsSync(`${PROD}/.next/BUILD_ID`)) {
  const st = (await import("node:fs")).statSync(`${PROD}/.next/BUILD_ID`);
  console.log("BUILD_ID mtime:", st.mtime.toISOString());
}

// 5. Skillnad cache vs universum (döda löften om cachen är äldre)
if (existsSync(cacheFil)) {
  const c = JSON.parse(readFileSync(cacheFil, "utf8"));
  const set = new Set(c.slugs);
  const sistaSkillnad = slugs.filter((s) => !set.has(s));
  console.log("universum-minus-cache (obyggda löften):", sistaSkillnad.length);
}

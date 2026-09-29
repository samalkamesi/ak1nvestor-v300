// ROND 344-sond — r336 (ISR-meta-beteende på framtids-slug) + r341 (systemkoll)
// Läs-endast: drabbar inget träd, inget lås, ingen pm2.
import { execFileSync } from "node:child_process";

const BLOBB = [];

async function sond(url, namn) {
  const start = Date.now();
  try {
    const sv = await fetch(url, { redirect: "manual" });
    const headers = {};
    for (const [k, v] of sv.headers) headers[k.toLowerCase()] = v;
    BLOBB.push({
      namn,
      url,
      status: sv.status,
      ms: Date.now() - start,
      "cache-control": headers["cache-control"] ?? null,
      "server-timing": headers["server-timing"] ?? null,
      "x-ak1a-klass": headers["x-ak1a-klass"] ?? null,
      "x-robots-tag": headers["x-robots-tag"] ?? null,
      "x-nextjs-prerender": headers["x-nextjs-prerender"] ?? null,
      "s-maxage-vekt": (headers["cache-control"] ?? "").includes("s-maxage"),
    });
  } catch (fel) {
    BLOBB.push({ namn, url, FEL: String(fel), ms: Date.now() - start });
  }
}

// 1) r336: framtids-slug (L1 .meta vs L3 proxy-signatur) — 3+ h efter 17:36Z-deployen
await sond("https://lab.ak1nvestor.com/blogg/sa-laser-du-ericsson-q3-2026", "framtids-slug");
// 2) kontrollposter
await sond("https://lab.ak1nvestor.com/", "hem");
await sond("https://lab.ak1nvestor.com/blogg", "blogg");
await sond("https://lab.ak1nvestor.com/integritetspolicy", "integritetspolicy");

// 3) r341-systemkoll: finns gränssnittsvaktens cron-rad? (ENDAST LÄST)
try {
  const crontab = execFileSync("crontab", ["-l"], { encoding: "utf8", timeout: 10_000 });
  const vaktrader = crontab
    .split("\n")
    .filter((rad) => rad.includes("granssnittsvakt") || rad.includes("granssnitt"))
    .map((rad) => rad.trim());
  BLOBB.push({ namn: "crontab-granssnittsvakt", rader: vaktrader, antal: vaktrader.length });
} catch (fel) {
  BLOBB.push({ namn: "crontab-granssnittsvakt", FEL: String(fel) });
}

// 4) L1-läget i prod-trädet: bär .meta fortfarande 404-märkning? (ISRN suddar den?)
try {
  const metaSokvag =
    "/home/ak1a/AK1/.next/server/app/blogg/sa-laser-du-ericsson-q3-2026.meta";
  let metaRad = "(fil saknas)";
  try {
    const txt = (await import("node:fs")).readFileSync(metaSokvag, "utf8");
    metaRad = txt.trim().slice(0, 300);
  } catch {
    // fil saknas = on-demand/omrenderad väg
  }
  BLOBB.push({ namn: "prod-meta-L1", sokvag: metaSokvag, innehall: metaRad });
} catch (fel) {
  BLOBB.push({ namn: "prod-meta-L1", FEL: String(fel) });
}

const UT = "/home/ak1a/agent/ak1/data/vakten/_r344-sond.json";
(await import("node:fs")).writeFileSync(UT, JSON.stringify(BLOBB, null, 2));
console.log(JSON.stringify(BLOBB, null, 2));
console.log("SKREV: " + UT);

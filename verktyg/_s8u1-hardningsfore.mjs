#!/usr/bin/env node
/**
 * _s8u1-hardningsfore.mjs — FÖRE-sond för o64 (styrelsens härdningspost:
 * hastighetstak + avvisad-audit på godkännanderutterna).
 *
 * Bevisar FÖRE-läget i levande prod: authade POST:er mot
 * /api/studio/godkannande/publicera med en sokvag som ALDRIG står i
 * FLYTTKLAR-listan besvaras med 404 hur snabbt sviten än körs — inget
 * tak, inga "publicera-avvisad"-rader i audit-loggen. Sokvagen når
 * väntelistsvakten (vakt 2) som returnerar INNAN fil-läsning/skrivning:
 * sonden kan aldrig publicera något (data/blogg/ förblir orörd).
 *
 * AUTH: ADMIN_PASSWORD ur .env (etablerat sondmönster, u1/o58) — värdet
 * lämnar ALDRIG processen (P6: loggas ej, skrivs ej till fil).
 *
 * Anrop: node verktyg/_s8u1-hardningsfore.mjs [--bas=http://localhost:3000]
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const BAS = process.argv.find((a) => a.startsWith("--bas="))?.slice(6) || "http://localhost:3000";
const RUTT = "/api/studio/godkannande/publicera";

// ── auth ur .env (värden skrivs aldrig ut) ──────────────────────────────
let losen = null;
try {
  const env = readFileSync(path.join(process.cwd(), ".env"), "utf8");
  const m = env.match(/^ADMIN_PASSWORD=(.*)$/m);
  if (m) losen = m[1].trim().replace(/^["']|["']$/g, "");
} catch {
  /* ingen .env = sonden kör endast 401-grenen */
}

const resultat = { bas: BAS, rutt: RUTT, ts: new Date().toISOString() };

// ── 1) utan auth ⇒ 401 (requireAdmin består — E26:s lager orört) ────────
const utanAuth = [];
for (let i = 0; i < 3; i += 1) {
  const r = await fetch(BAS + RUTT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sokvag: "data/blogg-utkast/_sond-finns-ej.md" }),
  });
  utanAuth.push(r.status);
}
resultat.utanAuth = utanAuth;

// ── 2) GET ×8 ⇒ 200:a (läs-ytan är och förblir takfri) ─────────────────
const getStatus = [];
for (let i = 0; i < 8; i += 1) {
  const r = await fetch(BAS + "/api/studio/godkannande", {
    headers: losen ? { "x-admin-password": losen } : {},
  });
  getStatus.push(r.status);
}
resultat.getStatus = getStatus;

// ── 3) authade POST:er i maskinhastighet (ogiltig sokvag ⇒ vakt 2) ─────
if (losen) {
  const postStatus = [];
  for (let i = 0; i < 10; i += 1) {
    const r = await fetch(BAS + RUTT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-password": losen },
      body: JSON.stringify({ sokvag: `data/blogg-utkast/_sond-finns-ej-${i}.md` }),
    });
    postStatus.push(r.status);
  }
  resultat.postStatus = postStatus;
  resultat.post429 = postStatus.filter((s) => s === 429).length;
} else {
  resultat.postStatus = "HOPPAR — ADMIN_PASSWORD ej läsbar";
}

// ── 4) audit-loggen: "publicera-avvisad" ska vara 0 i FÖRE-läget ───────
try {
  const rader = readFileSync(path.join(process.cwd(), "data", "vakten", "audit-logg.jsonl"), "utf8")
    .split("\n")
    .filter((r) => r.trim() !== "");
  let avvisade = 0;
  let lyckadePublicera = 0;
  for (const rad of rader.slice(-500)) {
    try {
      const j = JSON.parse(rad);
      if (j.atgard === "publicera-avvisad") avvisade += 1;
      if (j.aktor === "kund" && j.atgard === "publicera") lyckadePublicera += 1;
    } catch {
      /* halv rad — räkna ej */
    }
  }
  resultat.auditSista500 = { publiceraAvvisad: avvisade, publiceraLyckad: lyckadePublicera };
} catch {
  resultat.auditSista500 = "audit-loggen kunde ej läsas";
}

// ── 5) prodens BUILD_ID (referens för EFTER-mätningen vid deploy) ───────
try {
  resultat.buildId = readFileSync(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8").trim();
} catch {
  resultat.buildId = "(kunde ej läsas)";
}

console.log(JSON.stringify(resultat, null, 2));

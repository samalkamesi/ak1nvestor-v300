#!/usr/bin/env node
/**
 * VÅG 85 F4+F5 — E2E PÅ PROD (körs på Contabo, localhost:3000):
 *   F4: prompt (Write av tmp/v85-e2e-kodvy.txt) → SSE klart → GET
 *       /api/studio/andringar → filändring med PUNKTER (v4-patch-hunkar
 *       med radnummer — bevisar v4-flödet live i prod: subscribe →
 *       revisionsspårning → rowsRange → fileChanges).
 *   F5: GET /api/studio/filer?sokvag=tmp/v85-e2e-kodvy.txt → text-
 *       förhandsgranskning (kodvyns källa) → POST /api/studio/filer
 *       (redigera + spara) → verifiera PÅ DISK att filen ändrats →
 *       inneslutningsvakt (../ → 400, .env → 403, binärändelse → 400).
 * Lösenordet läses ur .env.production.local och loggas ALDRIG.
 *
 * Hemvist (våg 178 full-scan 2026-09-16): flyttad hit från tool-results/
 * (gitignorad körningsdata — ett återanvändbart e2e-verktyg hör hemma i
 * versionshanteringen, inte bland bash-utdata). `bas` är fast loopback-
 * literal: mimosa-paritet v1.4 klassar den SSRF_LOOPBACK-info.
 */
import { readFileSync } from "node:fs";

const bas = "http://localhost:3000";
const env = readFileSync("/home/ak1a/AK1/.env.production.local", "utf8");
const losen = (env.match(/^ADMIN_PASSWORD=(.+)$/m) ?? [])[1]?.trim();
if (!losen) {
  console.log("E2E-FEL: ADMIN_PASSWORD saknas");
  process.exit(1);
}

const resultat = [];
const kontroll = (namn, ok, detalj = "") => {
  resultat.push({ namn, ok, detalj });
  console.log(`${ok ? "PASS" : "FAIL"}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
};

// 1) Login → cookie
const login = await fetch(`${bas}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ losenord: losen }),
});
const kaka = (login.headers.get("set-cookie") ?? "").split(";")[0];
kontroll("login (sessions-cookie)", login.ok && kaka.startsWith("ak1a_admin="), `HTTP ${login.status}`);
const A = { Cookie: kaka };

// 2) F4+F5: turn med Write → vänta på SSE-klart (max 4 min).
// Prod-sessionen kräver PERMISSION per Write (protokollkartan §3) — E2E:n
// svarar allow_once som en klickande kund (POST /api/studio/interaktion),
// annars dör verktyget på 30 s-eskaleringen (bevisat i diagnosen ovan).
const FIL = "tmp/v85-e2e-kodvy.txt";
const prompt = `Skapa filen ${FIL} med exakt fyra rader via Write-verktyget: "rad A", "rad B", "rad C", "rad D". Använd inga andra verktyg. Svara KLAR.`;
const sse = await fetch(`${bas}/api/studio/stream`, {
  method: "POST",
  headers: { ...A, "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});
kontroll("stream POST accepterad", sse.ok, `HTTP ${sse.status}`);
let sågÄndringar = false;
let klart = false;
let permissioner = 0;
const besvarade = new Set();
if (sse.ok) {
  const lasare = sse.body.getReader();
  const avkodare = new TextDecoder();
  let buff = "";
  const tak = Date.now() + 240_000;
  while (Date.now() < tak) {
    const { done, value } = await lasare.read();
    if (done) break;
    buff += avkodare.decode(value, { stream: true });
    let nl = buff.indexOf("\n");
    while (nl >= 0) {
      const rad = buff.slice(0, nl).trim();
      buff = buff.slice(nl + 1);
      nl = buff.indexOf("\n");
      if (!rad.startsWith("data:")) continue;
      try {
        const e = JSON.parse(rad.slice(5).trim());
        if (e.typ === "ändringar" && Array.isArray(e.filer) && e.filer.length > 0) sågÄndringar = true;
        if (e.typ === "klart") klart = true;
        if (e.typ === "fel") console.log("  [sse-fel]", String(e.meddelande ?? "").slice(0, 120));
        if (e.typ === "interaktion" && e.interaktion?.typ === "permission" && !besvarade.has(e.interaktion.requestId)) {
          besvarade.add(e.interaktion.requestId);
          permissioner += 1;
          // Svara SOM UI:T (allow_once) — verktyget fortsätter direkt.
          fetch(`${bas}/api/studio/interaktion`, {
            method: "POST",
            headers: { ...A, "Content-Type": "application/json" },
            body: JSON.stringify({ typ: "permission", requestId: e.interaktion.requestId, alternativ: "allow_once" }),
          }).catch(() => {});
        }
      } catch {}
    }
    if (klart) break;
  }
  try { await lasare.cancel(); } catch {}
}
kontroll("agentturn klar (SSE klart)", klart, `permissioner besvarade: ${permissioner}${sågÄndringar ? " · ändringar-event i strömmen" : ""}`);

// 3) F4: GET /api/studio/andringar → punkter (v4-diffens radnummer)
const andr = await fetch(`${bas}/api/studio/andringar`, { headers: A });
const andrJson = andr.ok ? await andr.json() : {};
const filer = Array.isArray(andrJson.filer) ? andrJson.filer : [];
const v4Fil = filer.find((f) => f.sokvag.includes("v85-e2e-kodvy"));
kontroll(
  "F4: andringar listar e2e-filen",
  Boolean(v4Fil),
  `${filer.length} filer: ${filer.map((f) => `${f.sokvag.split("/").pop()} +${f.plus}/−${f.minus}`).join(", ").slice(0, 120)}`,
);
kontroll(
  "F4: v4-punkter med RADNUMMER (fileChanges-patches)",
  Boolean(v4Fil?.punkter?.length) && typeof v4Fil.punkter[0].newStart === "number",
  v4Fil?.punkter?.[0]
    ? `hunk: oldStart=${v4Fil.punkter[0].oldStart} newStart=${v4Fil.punkter[0].newStart} newLines=${v4Fil.punkter[0].newLines} rader=${JSON.stringify(v4Fil.punkter[0].rader).slice(0, 80)}`
    : "PUNKTER SAKNAS — transporten föll på Write/Edit-motorn",
);

// 4) F5: kodvyns källa — GET filer?sokvag → text-förhandsgranskning
const filRes = await fetch(`${bas}/api/studio/filer?sokvag=${encodeURIComponent(FIL)}`, { headers: A });
const filJson = filRes.ok ? await filRes.json() : {};
const innehåll = filJson.forhandsgranskning?.innehåll ?? "";
kontroll(
  "F5: kodvy läser filen (text-förhandsgranskning)",
  filRes.ok && filJson.forhandsgranskning?.slag === "text" && innehåll.includes("rad A"),
  `slag=${filJson.forhandsgranskning?.slag} · ${innehåll.split("\n").length} rader`,
);

// 5) F5: REDIGERA + SPARA via POST (kodvyns Spara-knapp) → filen ÄNDRADES
const nyInnehåll = innehåll.replace("rad B", "rad B — REDIGERAD AV KUNDEN I STUDION");
const spar = await fetch(`${bas}/api/studio/filer`, {
  method: "POST",
  headers: { ...A, "Content-Type": "application/json" },
  body: JSON.stringify({ sokvag: FIL, innehall: nyInnehåll }),
});
const sparJson = spar.ok ? await spar.json() : {};
kontroll("F5: POST sparar filen", spar.ok && sparJson.spara === "sparad", `HTTP ${spar.status} · storlek=${sparJson.storlek}`);
// Arbetsytan ur trädet (sanningen för disksökvägen)
const tradRes = await fetch(`${bas}/api/studio/filer`, { headers: A });
const tradJson = tradRes.ok ? await tradRes.json() : {};
const rot = typeof tradJson.arbetsyta === "string" ? tradJson.arbetsyta : "/home/ak1a/agent/ak1";
let paDisk = "";
try {
  paDisk = readFileSync(`${rot}/${FIL}`, "utf8");
} catch (e) {
  paDisk = `(läsfel: ${e.message.slice(0, 80)})`;
}
kontroll(
  "F5: filen ÄNDRAD PÅ DISK (nästa agent-turn ser den)",
  paDisk.includes("REDIGERAD AV KUNDEN I STUDION"),
  `rot=${rot} · disk: ${paDisk.split("\n").length} rader, rad B-redigering ${paDisk.includes("REDIGERAD") ? "PÅ PLATS" : "SAKNAS"}`,
);

// 5b) F5: NY FIL via POST (tillatNy-vägen — kunden skapar utan terminal)
const NY = "tmp/v85-e2e-nyfil.md";
const sparNy = await fetch(`${bas}/api/studio/filer`, {
  method: "POST",
  headers: { ...A, "Content-Type": "application/json" },
  body: JSON.stringify({ sokvag: NY, innehall: "# Ny fil från studion\n" }),
});
const sparNyJson = sparNy.ok ? await sparNy.json() : {};
let nyPaDisk = "";
try {
  nyPaDisk = readFileSync(`${rot}/${NY}`, "utf8");
} catch {}
kontroll(
  "F5: NY FIL skapad via POST",
  sparNy.ok && sparNyJson.spara === "sparad" && nyPaDisk.includes("Ny fil från studion"),
  `HTTP ${sparNy.status}`,
);

// 6) Inneslutningsvakten på POST
const n1 = await fetch(`${bas}/api/studio/filer`, {
  method: "POST",
  headers: { ...A, "Content-Type": "application/json" },
  body: JSON.stringify({ sokvag: "../AK1/package.json", innehall: "x" }),
});
kontroll("vakt: ../ avvisas", n1.status === 400, `HTTP ${n1.status}`);
const n2 = await fetch(`${bas}/api/studio/filer`, {
  method: "POST",
  headers: { ...A, "Content-Type": "application/json" },
  body: JSON.stringify({ sokvag: ".env.production.local", innehall: "x" }),
});
kontroll("vakt: känslig fil avvisas", n2.status === 403 || n2.status === 400, `HTTP ${n2.status}`);
const n3 = await fetch(`${bas}/api/studio/filer`, {
  method: "POST",
  headers: { ...A, "Content-Type": "application/json" },
  body: JSON.stringify({ sokvag: "tmp/farlig.exe", innehall: "x" }),
});
kontroll("vakt: icke-text-ändelse avvisas", n3.status === 400, `HTTP ${n3.status}`);

// Sammanfattning
const antalOk = resultat.filter((r) => r.ok).length;
console.log(`\nVÅG 85 F4+F5 E2E: ${antalOk}/${resultat.length} PASS`);
process.exit(antalOk === resultat.length ? 0 : 1);

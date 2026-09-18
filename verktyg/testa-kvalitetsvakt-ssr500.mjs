#!/usr/bin/env node
// testa-kvalitetsvakt-ssr500.mjs — svit för SSR-livssonden (kvalitetsvakten
// sektion 12, o64, 2026-09-18). Sektionen lever i verktyg/ssr-livssond.mjs
// (importerbar modul) — sviten anropar den DIREKT med env-injektion mot en
// lokal fixture-server på ephemer port: den kan aldrig mäta riktiga prod och
// aldrig skriva i repot. Den verifierar SEKTIONSKONTRAKTET:
//   1  grundfall        — alla sentineller 2xx ⇒ PASS (0 fel, 0 manuella)
//   2  o47-klass        — 5xx på SSR-rot med / frisk ⇒ FEL med rutt + status
//   3  server nere      — nätfel överallt ⇒ MANUELL (omätning), 0 fel
//   4  4xx-sentinell    ⇒ MANUELL med rutten namngiven
//   5  timeout          ⇒ MANUELL (omätbar, aldrig fel)
//   6  låsgrind         — deploylås ÄGS (fuser) ⇒ MANUELL FÖRE prob, OMÄTT
//   7  bygggrind        — främmande process med HELT mönster ⇒ MANUELL
//   8  släktexkludering — mönster som matchar EGEN processkedjan ⇒ INGEN
//                          grind (o55 F2-klassen hos observatören, död 2026-09-18)
//   9  ruttlista env    — exakt de angivna rutterna provas (träffräkning)
//                          + 3xx räknas levande med notis
//
// Körning: node verktyg/testa-kvalitetsvakt-ssr500.mjs  (från repots rot)
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { sektionSsrLivssond } from "./ssr-livssond.mjs";

let pass = 0;
let fail = 0;
function rapport(nr, namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log(`PASS ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  } else {
    fail++;
    console.log(`FAIL ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  }
}

// Fixture-server: router (sökväg → {status} | {hang:true}) + träffräkning.
function startaServer(router) {
  const trafik = new Map(); // sökväg → antal träffar
  const sockets = new Set();
  return new Promise((losa) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, "http://x");
      trafik.set(u.pathname, (trafik.get(u.pathname) || 0) + 1);
      const svar = router ? router(u.pathname) : undefined;
      if (svar?.hang) return; // aldrig svar — provokerar timeoutgrenen
      res.writeHead(svar?.status || 404, { "content-type": "text/html" });
      res.end(`<html><body>${u.pathname}</body></html>`);
    });
    server.on("connection", (s) => {
      sockets.add(s);
      s.on("close", () => sockets.delete(s));
    });
    server.listen(0, "127.0.0.1", () => losa({ server, port: server.address().port, trafik, sockets }));
  });
}
function stang(fixture) {
  for (const s of fixture.sockets) s.destroy();
  return new Promise((losa) => fixture.server.close(() => losa()));
}

const ENV_NYCKLOR = ["AK1A_SSR_SOND_BAS", "AK1A_SSR_SOND_RUTTER", "AK1A_SSR_SOND_TIDSGRANS_MS", "AK1A_DEPLOY_LAS", "AK1A_BYGG_MONSTER"];
function medEnv(values, fn) {
  const sparade = {};
  for (const n of ENV_NYCKLOR) {
    sparade[n] = process.env[n];
    if (values[n] === undefined) delete process.env[n];
    else process.env[n] = values[n];
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const n of ENV_NYCKLOR) {
        if (sparade[n] === undefined) delete process.env[n];
        else process.env[n] = sparade[n];
      }
    });
}

const DOD_PORT = "http://127.0.0.1:1"; // port 1 = inget lyssnar (connection refused)

// ── 1: grundfall — alla levande ⇒ PASS ──────────────────────────────────────
{
  const fx = await startaServer(() => ({ status: 200 }));
  const s = await medEnv({ AK1A_SSR_SOND_BAS: `http://127.0.0.1:${fx.port}`, AK1A_SSR_SOND_RUTTER: "/,/kurser,/analyser,/blogg,/labb,/en,/ar" }, () => sektionSsrLivssond());
  rapport("1a", "alla sentineller 2xx ⇒ 0 fel", (s.fel ?? []).length === 0, `fel=${JSON.stringify(s.fel)}`);
  rapport("1b", "alla sentineller 2xx ⇒ 0 manuella", (s.manuella ?? []).length === 0, `manuella=${JSON.stringify(s.manuella)}`);
  rapport("1c", "info räknar levande", (s.info ?? []).some((i) => i.includes("7/7 sentineller levande")), JSON.stringify(s.info.filter((i) => i.includes("levande"))));
  await stang(fx);
}

// ── 2: o47-klassen — SSR-rot 500 med / frisk ⇒ FEL med rutt + status ──────
{
  const fx = await startaServer((p) => (p === "/kurser" || p === "/blogg" ? { status: 500 } : { status: 200 }));
  const s = await medEnv({ AK1A_SSR_SOND_BAS: `http://127.0.0.1:${fx.port}`, AK1A_SSR_SOND_RUTTER: "/,/kurser,/blogg" }, () => sektionSsrLivssond());
  const detaljer = (s.fel ?? []).map((f) => `${f.fil}|${f.detalj}`);
  rapport("2a", "5xx ⇒ sektions-FEL (exakt 2)", (s.fel ?? []).length === 2, JSON.stringify(detaljer));
  rapport("2b", "FEL namnger /kurser + HTTP 500", detaljer.some((d) => d.startsWith("SSR /kurser|") && d.includes("HTTP 500")), JSON.stringify(detaljer));
  rapport("2c", "frisk / provas men felas ej", !(s.fel ?? []).some((f) => f.fil.includes("SSR /|") || f.fil === "SSR /"), "-");
  rapport("2d", "o47-klassens tolkning i detalj", detaljer.some((d) => d.includes("o47-klassen")), "-");
  await stang(fx);
}

// ── 3: server nere — nätfel ⇒ MANUELL omätning, ALDRIG fel ────────────────
{
  const s = await medEnv({ AK1A_SSR_SOND_BAS: DOD_PORT, AK1A_SSR_SOND_RUTTER: "/,/kurser" }, () => sektionSsrLivssond());
  rapport("3a", "server nere ⇒ 0 fel (ej artefakt)", (s.fel ?? []).length === 0, JSON.stringify(s.fel));
  rapport("3b", "server nere ⇒ MANUELL per rutt", (s.manuella ?? []).length === 2, JSON.stringify(s.manuella));
  rapport("3c", "MANUELL säger omätning", (s.manuella ?? []).every((m) => m.ord === "natfel" && m.kontext.includes("kunde inte provas")), "-");
  await Promise.resolve();
}

// ── 4: 4xx-sentinell ⇒ MANUELL med rutten namngiven ────────────────────────
{
  const fx = await startaServer((p) => (p === "/en" ? { status: 404 } : { status: 200 }));
  const s = await medEnv({ AK1A_SSR_SOND_BAS: `http://127.0.0.1:${fx.port}`, AK1A_SSR_SOND_RUTTER: "/,/en" }, () => sektionSsrLivssond());
  rapport("4a", "4xx ⇒ 0 fel", (s.fel ?? []).length === 0, JSON.stringify(s.fel));
  rapport("4b", "4xx ⇒ MANUELL med /en + flytt-tips", (s.manuella ?? []).length === 1 && s.manuella[0].fil.includes("/en") && s.manuella[0].kontext.includes("vaktkonstanten"), JSON.stringify(s.manuella));
  await stang(fx);
}

// ── 5: timeout ⇒ MANUELL (omätbar), aldrig fel ─────────────────────────────
{
  const fx = await startaServer((p) => (p === "/labb" ? { hang: true } : { status: 200 }));
  const s = await medEnv({ AK1A_SSR_SOND_BAS: `http://127.0.0.1:${fx.port}`, AK1A_SSR_SOND_RUTTER: "/,/labb", AK1A_SSR_SOND_TIDSGRANS_MS: "250" }, () => sektionSsrLivssond());
  rapport("5a", "timeout ⇒ 0 fel", (s.fel ?? []).length === 0, JSON.stringify(s.fel));
  rapport("5b", "timeout ⇒ MANUELL typ timeout på /labb", (s.manuella ?? []).some((m) => m.ord === "timeout" && m.fil.includes("/labb")), JSON.stringify(s.manuella));
  rapport("5c", "/frisk rutt opåverkad (levande 1/2)", (s.info ?? []).some((i) => i.includes("1/2 sentineller levande")), "-");
  await stang(fx);
}

// ── 6: låsgrind — låset ÄGS (öppen fd) ⇒ MANUELL FÖRE prob, OMÄTT ─────────
{
  const arbete = fs.mkdtempSync(path.join(os.tmpdir(), "ssrsond6-"));
  const lasFil = path.join(arbete, "deploy.lock");
  fs.writeFileSync(lasFil, "");
  const fd = fs.openSync(lasFil, "r+"); // håll fd öppen = ÄGARE (fuser ser oss)
  const s = await medEnv({ AK1A_SSR_SOND_BAS: DOD_PORT, AK1A_SSR_SOND_RUTTER: "/,/kurser", AK1A_DEPLOY_LAS: lasFil }, () => sektionSsrLivssond());
  rapport("6a", "lås med ägare ⇒ MANUELL deployfönster", (s.manuella ?? []).length === 1 && s.manuella[0].ord === "deployfönster", JSON.stringify(s.manuella));
  rapport("6b", "grinden FÖRE mätvärde (ingen prob)", !(s.info ?? []).some((i) => i.includes("sentinellrutter mot")) && (s.info ?? []).some((i) => i.includes("OMÄTT")), JSON.stringify(s.info));
  rapport("6c", "lås-ÄGANDE = fuser, inte existens (PID namnges)", (s.manuella ?? [])[0]?.kontext.includes(String(process.pid)), `väntade PID ${process.pid} i kontexten`);
  fs.closeSync(fd);
  // och när fd släpps: samma fil, ingen ägare ⇒ grinden öppnar (existens räcker ej)
  const s2 = await medEnv({ AK1A_SSR_SOND_BAS: DOD_PORT, AK1A_SSR_SOND_RUTTER: "/kurser", AK1A_DEPLOY_LAS: lasFil }, () => sektionSsrLivssond());
  rapport("6d", "fil utan ägare ⇒ grinden öppnar (nätfel, ej låsstop)", (s2.manuella ?? []).some((m) => m.ord === "natfel") && !(s2.manuella ?? []).some((m) => m.ord === "deployfönster"), JSON.stringify(s2.manuella));
  fs.rmSync(arbete, { recursive: true, force: true });
}

// ── 7: bygggrind — FRÄMMANDE process med HELT mönster ⇒ MANUELL ────────────
{
  const markor = `ssrsond7-${process.pid}-${Date.now()}`;
  // node-barn (ALDRIG "bash -c 'sleep …'": bash exec-ersätter sig själv med
  // enkla kommandon ⇒ markören försvinner ur cmdlinen — metodfynd i sviten)
  const barn = spawn(process.execPath, ["-e", `console.log("${markor}"); setTimeout(() => {}, 8000)`]);
  await new Promise((losa) => setTimeout(losa, 250)); // låt barnet födas
  const s = await medEnv({ AK1A_SSR_SOND_BAS: DOD_PORT, AK1A_SSR_SOND_RUTTER: "/kurser", AK1A_BYGG_MONSTER: markor }, () => sektionSsrLivssond());
  rapport("7a", "främmande mönsterprocess ⇒ MANUELL byggfönster", (s.manuella ?? []).length === 1 && s.manuella[0].ord === "byggfönster", JSON.stringify(s.manuella));
  rapport("7b", "grinden FÖRE mätvärde (OMÄTT)", (s.info ?? []).some((i) => i.includes("OMÄTT")) && !(s.info ?? []).some((i) => i.includes("sentinellrutter mot")), JSON.stringify(s.info));
  barn.kill("SIGKILL");
}

// ── 8: släktexkludering — mönster som matchar EGNA kedjan ⇒ INGEN grind ────
// (live-beviset 2026-09-18: en sondpipeline bar själva mönstertexten i sitt
// argv och fick SIG SJÄLV som "byggprocess" — o55 F2 hos observatören)
{
  const fx = await startaServer(() => ({ status: 200 }));
  // "testa-kvalitetsvakt-ssr500" finns i DENNA svits egna argv + föräldrars
  const s = await medEnv({ AK1A_SSR_SOND_BAS: `http://127.0.0.1:${fx.port}`, AK1A_SSR_SOND_RUTTER: "/kurser", AK1A_BYGG_MONSTER: "testa-kvalitetsvakt-ssr500" }, () => sektionSsrLivssond());
  rapport("8a", "egnmönster ⇒ INTE byggfönster", !(s.manuella ?? []).some((m) => m.ord === "byggfönster"), JSON.stringify(s.manuella));
  rapport("8b", "egnmönster ⇒ prob genomförd och PASS", (s.fel ?? []).length === 0 && (s.manuella ?? []).length === 0 && (s.info ?? []).some((i) => i.includes("1/1 sentineller levande")), JSON.stringify(s.info));
  await stang(fx);
}

// ── 9: ruttlista env + 3xx räknas levande med notis ────────────────────────
{
  const fx = await startaServer((p) => (p === "/x" ? { status: 200 } : p === "/y" ? { status: 301 } : { status: 404 }));
  const s = await medEnv({ AK1A_SSR_SOND_BAS: `http://127.0.0.1:${fx.port}`, AK1A_SSR_SOND_RUTTER: "/x,/y" }, () => sektionSsrLivssond());
  rapport("9a", "exakt angivna rutter provas", fx.trafik.get("/x") === 1 && fx.trafik.get("/y") === 1 && fx.trafik.size === 2, JSON.stringify([...fx.trafik]));
  rapport("9b", "3xx ⇒ levande med omdirigeringsnotis", (s.info ?? []).some((i) => i.includes("/y → 301") && i.includes("omdirigering")) && (s.fel ?? []).length === 0, JSON.stringify(s.info));
  await stang(fx);
}

console.log(`\nSVIT: ${pass} PASS, ${fail} FAIL, 0 SKIP`);
process.exit(fail === 0 ? 0 : 1);

#!/usr/bin/env node
// ROND 111 — bokföring: worklog-rad + beslutsminne-rad, atomärt.
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const nu = new Date().toISOString();

const worklogRad = `
## ROND 111 [organ:Φ] — 2026-09-20 ~07:1x lokal: F2-ROTKUR LEVERERAD I PROD (d0c13a6d, prod c621815e) — ort-portvakten i kraschvakten + dev-fönstrens F2-svep; incidenten 06:10–06:37 mekaniskt omöjliggjord
FELJÄGARFALL F2 (pm2 ak1a = errored): ROT BEVISAD ur prod-synk.log + pm2-loggen — deploy-omstarten 06:10:41 lokal (prod-synk "DEPLOYAD automatiskt: 8 commits" 04:10:49Z) orphanade pm2:s gamla app-träd ("sh -c next start -p 3000" → next-server, PPid 1) som BEHÖLL port 3000 ⇒ pm2 errored i EADDRINUSE-slinga i 27 min medan ORTEN svarade 200: prod-synkens HTTPS-kontroll OCH kraschvaktens okNu mätte grönt mot FEL process (falsk trygghet — en omstart/OOM hade tyst dödat sajten), "mål-återarmning FEL 502" 04:22+04:31Z avslöjade strulet, räddningsbygget hade varit VERKNINGSLÖST (pm2 restart ⇒ EADDRINUSE igen). Manuell kur 06:37 lokal (_f2-kur.mjs: SIGTERM ort-trädet → port fri → pm2 restart) verifierad: pm2 online, port ägs av pm2-ättling, prod 200, 04:51-deployen helgrön. KUR 1 — ORT-PORTVAKTEN (kraschvakt.mjs): portägaren på 3000 MÅSTE vara ättling till pm2:s ak1a-pid (arAttling via /proc-PPid-kedja, process-trad.mjs) annars PORT-RECLAIM: döda ort-trädet (cmdline-verifierat — pid-återanvändning kan aldrig döda fel process) + pm2 restart, billigt ALDRIG bygg (artefakten orörd); körs FÖRE kooldown (ort-läget = egen faroklass; 120-min kooldown efter orelaterat bygg får aldrig blinda) och respekterar deploy-låset (vantad-deploy-doktrinen). KUR 2 — DEV-FÖNSTERN (kor-alla-tester.mjs + testa-styrelse.mjs): den läckta "next dev -p 3000 -p 3117" (PPid 1, 5 h; npm-run-dev arityade package.json:s -p 3000 till DUBBELA portflaggor) var TVÅ fel — portkollision + tyst mätning mot GAMLAL kod när svarande fönster återanvänds; nu F2-svep före start/återanvändning (next-process med ort-rot PPid 1 dödas, levande främling ⇒ ärligt avstått fönster), DIREKT spawn mot next-binären med ENKEL -p + loopback, städning gruppdödar + hela delträdet. BEVIS: testa-kraschvakt.mjs 38/38 PASS (12 nya F2-krav: beslutstabellens utfall, arAttling-kedjor med injicerad PPid-läsare, strukturkontrakt döda-ort-FÖRE-restart/state-FÖRE-åtgärd/ort-vakt-FÖRE-kooldown); kraschvakten live-körd mot friska systemet = tyst pass; dev-läckan dödad med pid-verifiering (_f2-doda-devort.mjs, port 3117 fri, prod 200 orörd); slutverifiering: ORTVAKT+process-trad+F2-svep LIVER I PROD-TRÄDET (cron kör ny kod nästa tick), pm2 online pid 3429093, port 3000 = pm2-ättling, prod 200. PUSH-CYKELN: prod hade ny kod (fabrikens s10 + patch-kö) → fetch+merge; andra avvisningen = prod-trädets legitima färska motorervalidering 05:02 (107/0/0) ocommittad → prod-sida committad (342d02c3, fabrikens mönster — ALDRIG kasta äkta arbete) → merge → PUSH GRÖN c621815e med d0c13a6d som anfäder. Medföljde: K7-mötets två protokoll i STYRELSE-BESLUT.md (v214-E2E 03:5x; de spärrade arbetsytan-synken sedan 02:41 — nu committade). VÄNTAR: E2E av dev-fönstret (RAM 807 MB < 900-taket — oärligt rött att köra nu; nästa svep täcker). v213b HELT KLAR 10/10 (fabrikens status: slutad 04:33Z, u10 17/17 PASS). Nästa i kön: fullsvep i klassordning med de nya kontraktssviterna, E2E dev-fönster vid RAM>900, evighetskatalogens spår.
`;

const minneRad = JSON.stringify({
  ts: nu,
  rond: 111,
  beslut: "F2-rotkur levererad: ort-portvakten (kraschvakten reclaimar port 3000 när ägaren inte är pm2-ättling — döda ort + restart, aldrig bygg, före kooldown, lås-respekt) + dev-fönstrens F2-svep (läckt next-dev med ort-rot dödas före start/återanvändning; enkel -p; delträds-städning) — incidenten 06:10–06:37 mekaniskt omöjlig; E2E dev-fönster väntar RAM",
  landat: "c621815e",
}) + "\n";

fs.appendFileSync(`${ROT}/worklog.md`, worklogRad);
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, minneRad);
console.log("BOKFÖRD worklog + beslutsminne", nu);

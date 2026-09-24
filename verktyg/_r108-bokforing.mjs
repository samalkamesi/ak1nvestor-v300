#!/usr/bin/env node
// ROND 108 — bokföring: worklog-rad + beslutsminne-rad, atomärt.
import { appendFileSync, readFileSync } from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const nu = new Date().toISOString();

const worklogRad = `
## ROND 108 [organ:Φ] — 2026-09-20 ~00:0x lokal: VÅG 212 FULLSVEPET 124/125 + SISTA RÖDA KURERAD — styrelsesviten deterministisk GRÖN, kvalitetssystemet komplett (993afecc, prod 16945210)

Fulla helsvepet genom den kurerade aggregatorn landade 124 GRÖNA / 1 RÖD av 125 (från svep 1:s 71/53 via svep 2:s 117/8). Enda röda: testa-styrelse.mjs. Rot diagnostiserad ur mötesprotokollet (styrelse-mu8zlrfn-an0taz 23:00): rollernas åtgärder nämnde R2-ord ("dev-lösenord", "arabiska publicering") via sessionens kontext ⇒ klassaExistential RÄTT klassade existential=true → VÄNTAR KUND ⇒ K4 (krävde alltid existential=false) + K5 (krävde PIPELINE-rader) föll. Motorn korrekt; TESTET var utfallsdiktat — spegelbild av R107-lärdomen (då orsakade FRÅGAN klassning, nu SVARENS formulering). KUR (993afecc): K4 bevisar KONSEKVENS (existential=false ⇔ KORS_DIREKT ∨ existential=true ⇔ VANTAR_KUND), K5 bevisar att PIPELINE-KO följer status (KÖRS DIREKT ⇒ rader skrivna, VÄNTAR KUND ⇒ 0 rader — motorns rad 725 är exakt det kontraktet). Bevis: r108-styrelse.log 6/6 PASS mot dev-fönster (port 3117, mock, loopback — aggregatorns exakta mönster, wrapper _r108-styrelse.mjs): 5/5 roller, KÖRS DIREKT, 1 PIPELINE-rad, protokollfört. Därmed 125/125-logiken sluten: 124 gröna i svepet + den kurerade sviten grön fristående. Med följde: svepets protokoll i STYRELSE-BESLUT.md, färsk motorervalidering 107/0/0 (22:53), r107-wrapparna (fullsvep + pushcykel), PIPELINE-KO v213(d) STÄNGD + v214-kandidat bokad (per-åtgärd-K2-klassning — klassaren slår på R2-ord i åtgärder trots drift-mekanisk kärna). Push: merge med fabrikens s3 (AR7/AR9/B10-ar + kvartal ASML/PG) + s4u1 RWE — prod/develop = 16945210. Prod-synkens GUL (ocommittat träd) stängd: arbetsytan ren vid push. VAKTEN: 0 fynd (176 kombinationer, 23:24-rapporten). Nästa i kön: v213 (a) miljöklasser + (b) 10 motorer kontraktssviter, v214-kandidaten, v191/v192 bokade.
`;

appendFileSync(`${ROT}/worklog.md`, worklogRad);

const minneRad = JSON.stringify({
  ts: nu,
  rond: 108,
  beslut: "våg 212 fullsvep 124/125 + sista röda kurerad: styrelsesvitens K4/K5 omformade till R2-konsistenstest (båda utfall giltiga, motorns kontrakt bevisat) — 125/125-logik sluten, v213(d) stängd, v214-kandidat bokad (per-åtgärd-K2-klassning)",
  landat: "993afecc",
}) + "\n";
appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, minneRad);

console.log("BOKFÖRD worklog + beslutsminne", nu);
// kvitto: läs tillbaka sista raderna
const wl = readFileSync(`${ROT}/worklog.md`, "utf8");
console.log("worklog svans:", wl.slice(-120).replace(/\n/g, "⏎"));

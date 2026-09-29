#!/usr/bin/env node
// DESK-STRÖMMÄTAREN (U15 §7.1, född r314 [organ:Φ]) — 2026-09-29
//
// U15:strålfartsmätningen kunde inte mäta AKTIV ström (ingen kund inne
// passivt). Detta verktyg fyller mätgläppet: ropas periodvis (cron/pumpa —
// INSTALLATION bokas av bokföringsrond); tyst kod 0 när ingen klient är
// uppkopplad, och vid riktigt kundbesök loggas rx-Mbit/s per 10 s-fönster
// för ALLA nätverksgränssnitt med trafik (lo = nginx→websockify-ledet,
// yttre iface = telefon↔nginx, krypterat) till data/vakten/desk-strommatare.jsonl.
//
// Metod enligt U15 §1: /proc/net/dev rx-räknare (rx = unika byte; lo
// dubbelräknar rx/tx i samma räknare — se U15 metodavvikelse 1).
// Aktivitetsvittne: ss -tn established på port 6080 (websockify) / 5910 (Xvnc).
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/desk-strommatare.jsonl';
const FONSTER_S = 10;
const ANTAL_FONSTER = 3;

function lasRxRaknare() {
  const ut = {};
  for (const rad of fs.readFileSync('/proc/net/dev', 'utf8').split('\n').slice(2)) {
    const m = rad.match(/^\s*([\w.-]+):\s+(\d+)/);
    if (m) ut[m[1]] = Number(m[2]);
  }
  return ut;
}

function klientUppkopplad() {
  try {
    const ut = execSync(
      "ss -tn state established '( sport = :6080 or sport = :5910 or dport = :6080 or dport = :5910 )'",
      { encoding: 'utf8', timeout: 5_000 },
    ).trim();
    return ut.split('\n').filter((r) => r.includes(':')).length > 0;
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!klientUppkopplad()) {
    console.log('desk-strömmätare: ingen klient på :6080/:5910 — tyst avslut (kod 0)');
    process.exit(0);
  }
  console.log('desk-strömmätare: klient uppkopplad — mäter ' + ANTAL_FONSTER + ' fönster à ' + FONSTER_S + ' s');
  for (let f = 1; f <= ANTAL_FONSTER; f++) {
    const fore = lasRxRaknare();
    await sleep(FONSTER_S * 1000);
    const efter = lasRxRaknare();
    const trafik = [];
    for (const [iface, rx] of Object.entries(efter)) {
      const delta = rx - (fore[iface] ?? rx);
      if (delta > 0) trafik.push({ iface, rxByte: delta, mbit: Number(((delta * 8) / (FONSTER_S * 1e6)).toFixed(3)) });
    }
    const rad = { ts: new Date().toISOString(), fonster: f, sekunder: FONSTER_S, trafik, forvantat: 'lo=enstaka Mbit/s, yttre iface≈2×lo (TLS-påslag)' };
    fs.appendFileSync(LOGG, JSON.stringify(rad) + '\n');
    console.log('fonster ' + f + ': ' + (trafik.map((t) => t.iface + ' ' + t.mbit + ' Mbit/s').join(', ') || 'ingen rx-trafik'));
  }
  console.log('desk-strömmätare: ' + ANTAL_FONSTER + ' rader loggade till ' + LOGG);
}

main().catch((e) => { console.error('desk-strömmätare FEL: ' + (e.stack || e.message)); process.exit(1); });

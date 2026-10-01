#!/usr/bin/env node
// _s8u3o572-hundvakt-sond.mjs — levande FÖRE/EFTER-bevis för o572 K1.
// =====================================================================================
// Läser den SKARPA daemonlogg-svansen (samma 64 KiB-fönster som hundvakten)
// och jämför två parsersvar:
//   FÖRE  = v192-logik (endast prefixlös "HH:MM:SS " — den ^-ankrade regexen)
//   EFTER = o572-parsern (beraknaSenasteRadTs ur pumpor-hundvakt.mjs — tolkar
//           även pm2-prefix "YYYY-MM-DDTHH:MM:SS:")
// Utdata: en JSON-rad på stdout + data/vakten/_s8u3o572-sond-resultat.json.
// Read-only mot loggen; startar/aldrig röra pm2 eller processer.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beraknaSenasteRadTs, lasDaemonloggsRader } from "./pumpor-hundvakt.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGG = process.env.AK1A_PUMPOR_LOGG ?? "/home/ak1a/.pm2/logs/ak1a-pumpor-out.log";

const rader = await lasDaemonloggsRader(LOGG);
const nu = new Date();

// FÖRE: v192-parsern, replikerad ordagrant (endast prefixlös form)
const GAMMAL_RE = /^(\d{2}):(\d{2}):(\d{2}) /;
let fore = null;
for (const rad of rader) {
  const m = GAMMAL_RE.exec(rad);
  if (!m) continue;
  const [, h, mi, s] = m;
  if (+h > 23 || +mi > 59 || +s > 59) continue;
  let ts = new Date(nu);
  ts.setUTCHours(+h, +mi, +s, 0);
  if (ts.getTime() - nu.getTime() > 120_000) ts = new Date(ts.getTime() - 86_400_000);
  if (!fore || ts.getTime() > fore.getTime()) fore = ts;
}

// EFTER: o572-parsern (exporterad ur kurad modul — inte en kopia)
const efter = beraknaSenasteRadTs(rader, nu);

const antalPrefixlos = rader.filter((l) => GAMMAL_RE.test(l)).length;
const antalPm2 = rader.filter((l) => /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}):/.test(l)).length;

const resultat = {
  protokoll: "o572",
  sond: "_s8u3o572-hundvakt-sond.mjs",
  ts: nu.toISOString(),
  loggFil: LOGG,
  raderILasfonstret: rader.length,
  raderPrefixlosa: antalPrefixlos,
  raderPm2Prefixerade: antalPm2,
  fore: { senasteRadTs: fore ? fore.toISOString() : null, tystnadMs: fore ? nu.getTime() - fore.getTime() : null },
  efter: { senasteRadTs: efter ? efter.toISOString() : null, tystnadMs: efter ? nu.getTime() - efter.getTime() : null },
  dom: null,
};
resultat.dom =
  fore === null && efter !== null
    ? "BEVISAT: v192-parsern BLIND (null) på den skarpa loggen; o572-parsern hittar pulsen — utan kuren ingen omstart vid framtida frysning"
    : fore !== null && efter !== null
      ? "båda hittar puls (loggen bär prefixlösa rader) — o572 tillför robusthet för prefixfloden"
      : "INGEN parser hittade puls — undersök loggen manuellt";

const utfil = path.join(ROT, "data", "vakten", "_s8u3o572-sond-resultat.json");
fs.writeFileSync(utfil, JSON.stringify(resultat, null, 2) + "\n");
console.log(JSON.stringify(resultat, null, 2));
console.error(`skrev ${utfil}`);

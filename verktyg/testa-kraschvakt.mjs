#!/usr/bin/env node
// TEST: kraschvaktens beslutstabell (s8-u2-kuren 2026-09-16) — ren logik,
// ingen IO: varje scenario mappas mot ett bevisat fall ur kraschvakt.log
// 2026-09-14→15 (7 feltriggrade räddningsbygg, alla omstarter +0).
// Körs: node verktyg/testa-kraschvakt.mjs → "PASS n/n" och exit 0.
import { planeraAtguard, tolkaPm2, kooldownAktiv } from "./kraschvakt.mjs";

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

// ── Friskt läge: tyst pass (våg 137:s huvudspår, oförändrat) ────────────
krav(
  "1 frisk: svarar+online+oknad0 → pass",
  planeraAtguard({ okNu: true, status: "online", oknad: 0, lasUpptagen: false }).typ === "pass"
);

// ── Omstartssnurr (våg 137:s kärna): ≥4 nya omstarter → bygg, även om
//    appen råkar svara just nu (758-omstarts-loopen 2026-09-13) ─────────
krav(
  "2 omstartssnurr: oknad 4 → omstartssnurr",
  planeraAtguard({ okNu: true, status: "online", oknad: 4, lasUpptagen: false }).typ === "omstartssnurr"
);

// ── Död app (våg 137:s kärna): errored + svarar ej → bygg.
//    Loggens 11:34/11:44 (status=errored) = de ENDA legitima byggobjekten.
krav(
  "3 död app: errored → dod-app",
  planeraAtguard({ okNu: false, status: "errored", oknad: 0, lasUpptagen: false }).typ === "dod-app"
);
krav(
  "4 död app: stopped → dod-app",
  planeraAtguard({ okNu: false, status: "stopped", oknad: 0, lasUpptagen: false }).typ === "dod-app"
);

// ── KUR (1) deploy-lås-medvetenhet: loggens 01:24-trigg mitt i prod-
//    synkens byggfönster (deploy klar 01:29:50) stoppade en online-app
//    och köade ett andra fullbygge. Nu: vika, oavsett status ──────────
krav(
  "5 deploy pågår + online + svarar ej → vantad-deploy (INTE bygg)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: true }).typ === "vantad-deploy"
);
krav(
  "6 deploy pågår + errored → vantad-deploy (deployn startar appen)",
  planeraAtguard({ okNu: false, status: "errored", oknad: 0, lasUpptagen: true }).typ === "vantad-deploy"
);
krav(
  "7 deploy väger tyngst även vid omstartssnurr? — NEJ: snurr är appens fel, bygg",
  planeraAtguard({ okNu: false, status: "online", oknad: 5, lasUpptagen: true }).typ === "omstartssnurr"
);

// ── KUR (2) designs-anpassat villkor för online+svarar=false (6 av 7
//    feltriggar i loggen): först omkolla … ──────────────────────────────
krav(
  "8 online+svarar ej (1:a koll) → transient-koll (mät igen, INTE bygg)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: false }).typ === "transient-koll"
);
// … 2:a kollen grön = last (typiska byggfönster-falskarna) → pass …
krav(
  "9 omkoll grön → transient (ingen åtgärd)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: false, omkollaSvarar: true }).typ === "transient"
);
// … 2:a kollen röd men processen LEVER → billig pm2-restart före bygge
krav(
  "10 omkoll röd + online → restart (bygge ej första val)",
  planeraAtguard({ okNu: false, status: "online", oknad: 0, lasUpptagen: false, omkollaSvarar: false }).typ === "restart"
);

// ── KUR: pm2-timeout särskiljs från saknas (04:04:41-radens falska
//    "ak1a finns inte i pm2" vid 59 MB RAM) ────────────────────────────
const pm2Lista = [
  { name: "ak1a-test", restart_time: 3, pm2_env: { status: "online" } },
  { name: "ak1a", restart_time: 7, pm2_env: { status: "online" } },
];
krav(
  "11 tolkaPm2 hittar ak1a bland flera processer (restarts 7, online)",
  JSON.stringify(tolkaPm2(pm2Lista)) === JSON.stringify({ restarts: 7, status: "online" })
);
krav(
  "12 tolkaPm2 utan ak1a → saknas",
  tolkaPm2([{ name: "pulsvakt" }]).saknas === true
);
krav(
  "13 tolkaPm2 tål null/empty → saknas",
  tolkaPm2([]).saknas === true && tolkaPm2(null).saknas === true
);

// ── KUR (4) nyanserad kooldown: 14:24-fallet lämnade appen död i 2 h
//    efter "RÄDDNING KLAR: svarar=false" ───────────────────────────────
const nu = Date.now();
krav(
  "14 kooldown 120 aktiv vid 119 min",
  kooldownAktiv({ senasteRaddning: nu - 119 * 60_000, kooldownMin: 120 }, nu) === true
);
krav(
  "15 kooldown 120 utlöpt vid 121 min",
  kooldownAktiv({ senasteRaddning: nu - 121 * 60_000, kooldownMin: 120 }, nu) === false
);
krav(
  "16 kort kooldown 20 utlöpt vid 25 min (vantad-deploy/restart-läkning)",
  kooldownAktiv({ senasteRaddning: nu - 25 * 60_000, kooldownMin: 20 }, nu) === false
);
krav(
  "17 kort kooldown 20 fortfarande aktiv vid 15 min",
  kooldownAktiv({ senasteRaddning: nu - 15 * 60_000, kooldownMin: 20 }, nu) === true
);
krav(
  "18 default 120 när kooldownMin saknas (våg 137-kompatibel state)",
  kooldownAktiv({ senasteRaddning: nu - 100 * 60_000 }, nu) === true
);
krav(
  "19 ingen senasteRaddning → ingen kooldown",
  kooldownAktiv({}, nu) === false
);

// ── Sammanfattning ─────────────────────────────────────────────────────
if (fel.length) {
  console.error(`FALL ${fel.length} av ${fel.length + pass}:\n  - ${fel.join("\n  - ")}`);
  process.exit(1);
}
console.log(`PASS ${pass}/${pass} — kraschvaktens beslutstabell grön (7 feltriggar i loggen kan inte återkomma)`);

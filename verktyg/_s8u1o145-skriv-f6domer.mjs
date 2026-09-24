#!/usr/bin/env node
// _s8u1o145-skriv-f6domer.mjs — ENGÅNGSDRIV (o145 §4): domna de 7 öppna
// F6-drift-fynden via skrivgrinden feljakt-skriv-dom.mjs (dogfooding).
// Evidens: f6-ram-stang --torr (rond 127:s fyra-källors regel) + egna
// loggcitationer ur prod-synk.log. Alla anrop i execFileSync-arrayform.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GRIND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "feljakt-skriv-dom.mjs");
const prot = "o145 §4 + rond 127 evidensregel (f6-ram-stang --torr 2026-09-21 16:2xZ: klass V+F)";

const RAM = (ts, mb) => [
  "--fynd", `${ts}|F6-drift|RAM ${mb} MB`,
  "--dom", "transient-design",
  "--rotorsaka", `Känd designad last (rond 127-klassen): fyndet ${ts} träffar prod-synkens VÄNTAR-RAM-fönster med ATTRIBUTION (chrome-cron +1024 MB och/eller fabrikens zcode-barn) samtidigt som fabriksfönster pågick — f6-ram-stang --torr dömde klass V+F (två oberoende källor: synkens egen RAM-grind + agentfabrik/logg.jsonl), MEDEL-regeln ≥1 träff uppfylld med marginal`,
  "--kur", "Skyddet verkade och verkar: VÄNTAR-RAM-grinden höll synkbygget under hela fönstret (HEAD orört-rader i prod-synk.log) + fabrikens RAM-vakt 1500 MB + V235-sekvensering (zcode-reserven 850 MB/barn, rond 133) håller tunga klasser åtskilda",
  "--bevis", `f6-ram-stang --torr 2026-09-21 (maskinell fyra-källorsgravning, STÄNGS klass V+F) · prod-synk.log VÄNTAR-RAM-serien 11:17–13:47Z 2026-09-21 med attribution, t.ex. 12:37:25Z "754 MB tillgängligt (< 3224 … chrome-cron levande (+1024))" och 12:47:25Z "694 MB … chrome-cron levande (+1024)" för fönstret kring 12:43-fyndet; grinden loggade "bygger när minnet frigjorts; HEAD orört" = bygget hölls · inget HÖG-läge (inget fynd under 300 MB)`,
  "--protokoll", prot,
];

const domer = [
  RAM("2026-09-20T23:58:18.513Z", 340),
  RAM("2026-09-21T09:28:36.216Z", 487),
  RAM("2026-09-21T10:28:50.321Z", 314),
  RAM("2026-09-21T10:43:33.068Z", 638),
  RAM("2026-09-21T12:43:50.264Z", 710),
  RAM("2026-09-21T13:44:39.447Z", 780),
  [
    "--fynd", "2026-09-21T05:28:20.226Z|F6-drift|prod osvarar",
    "--dom", "transient-design",
    "--rotorsaka", "Krashvaktens räddningsbygg (nattens OOM-serie 02:2x–05:28Z, samma krönika som 09-21 05:28-fyndet 'ak1a = errored' domnat transient-design 09:43Z): sonden träffade räddningsbyggets flock-fönster — fyndraden själv bär orsaken 'deploybygg pågår — väntat fönster: /tmp/ak1a-deploy.lock hålls'",
    "--kur", "Räddningsbygget SLUTFÖRDES: 05:24:17Z⇒05:31:04Z RÄDDNING KLAR (BUILD_ID saMxYAzL); prod 200 ×6 ×3 ×2 enligt s7-u3:s slutkvitto; V235-sekvenseringen (rond 133) förebygger klassen",
    "--bevis", "kraschvakt.log 05:24:17.536Z KRASCHLOOP-MISSTANKE → 05:31:04Z RÄDDNING KLAR · sista bedömningen på syskonfyndet 09-21T05:28:19.389Z (domdTs 09:43:34.452Z): 'processen stabil sedan 05:31 · prod-synk.log VÄNTAR-RAM-rader = sekvenseringen vakar' · färskprod är 200 (o141-u2 2026-09-21)",
    "--protokoll", "o145 §4 + rond 141-domens syskonfynd",
  ],
];

for (const args of domer) {
  const ut = execFileSync("node", [GRIND, ...args], { encoding: "utf8" });
  console.log(ut.trim());
}

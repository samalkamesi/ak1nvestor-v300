#!/usr/bin/env node
/** R121-bokning: worklog + beslutsminne + commit [organ:Φ] + push-försök. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const ROT = "/home/ak1a/agent/ak1";
const AR = (f) => execFileSync("git", ["-C", ROT, ...f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const nu = new Date().toISOString().slice(0, 16).replace("T", " ") + "Z";
fs.appendFileSync(`${ROT}/worklog.md`, `\n**${nu} — ROND 121 (V234 DR-färskhetsprov) [organ:Φ]: DOM GRÖN — alla backupspår färskare än 24 h.** Egenmätt med ls-mtime: offsite-arkiv ak1a-offsite-2026-09-20.tar.gz 567 MB kl 14:52 i dag (kadens tre dagar i rad) · db-snapshot.sqlite 1,6 GB kl 14:52 · nattlig serverbackup (repo-tar + git-bundle + pm2/crontab/nginx) 03:20–03:21 · DR-övning GRÖN samma dag (s10-spåret: RTO 20,4 s, prediktion 10/10). Kända gap förblir s10:s kö (app-DB crontab-dump saknas ⇒ RPO ~2 100 r/dygn; retention bevakas 09-21 02:30). ISR-värmaren: söndagsdesignpaus (vardagscron), senaste 09-18. DRIFTSBOKEN V234-sektion tillagd. PUSH-SITUATION r120-commits (55eb4273 + f24683db): prod-mottagningskakan nekade medan fabriksbarn håller spårfiler smutsiga — s6-u2:s harmonisering LANSADE dock 15:09:59 (commit 826fb55f, 46 sviter + tvångsmekanik, manifest auto-s6 klar 0 underkända); kvarvarande blocker = s7-agentens pågående o120-prestandadokument (levande barns yta — helig). Tålmodig push-väntare (_r120-push.mjs) jagar fönstret var 60:e s; committer lever lokalt och förloras aldrig. TUNG-jakten (pid 3764362) väntar fortfarande fabriksljugt fönster (korrekt beteende).\n`);
console.log("worklog: 1 rad");

fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 68,
  beslut: "V234 [organ:Φ] DR-färskhetsprov GRÖN (offsite 14:52 + db-snapshot + nattlig serverbackup + DR-övning samma dag; RPO-gap förblir s10-kö) + r120-push jagas av väntare (s7-barnets yta helig)",
  landat: "nej",
}) + "\n");
console.log("beslutsminne: 1 rad");

fs.writeFileSync("/tmp/r121-msg.txt", "studio: rond 121 [organ:Φ] — V234 DR-FÄRSKHETSPROV GRÖN (offsite 567 MB 14:52 + db-snapshot + serverbackup 03:21 + DR-övning RTO 20,4 s samma dag; ISR söndagsdesignpaus) — DRIFTSBOKEN V234-sektion + r121-wrapper");
AR(["add", "data/DRIFTSBOKEN.md", "verktyg/_r120b-commit.mjs"]);
AR(["commit", "-F", "/tmp/r121-msg.txt"]);
console.log("commit:", AR(["log", "-1", "--format=%h"]).trim());
fs.rmSync("/tmp/r121-msg.txt", { force: true });

try { AR(["push", "prod", "develop"]); console.log("PUSH GRÖN direkt"); }
catch { console.log("push väntar fortfarande — väntaren (30 försök) bär HEAD inkl denna commit"); }

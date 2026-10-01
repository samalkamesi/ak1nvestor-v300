#!/usr/bin/env node
// testa-dr-kedja2-ssdnodes.mjs — svit för dr-kedja2-ssdnodes.mjs rena kärnor
// (spår 10, 2026-10-01). Mönstret från testa-dr-ovning-ssdnodes.mjs: inga
// nätverk/PG — bara valbara/kirurgiska/parserfunktioner + import-säkerhet
// (main-guard får ALDRIG ha sidoeffekter vid import).
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  valSenasteArkiv, valDdlKalla, kirurgDDL, tolkaVerktygsUtdata,
  protokollNamn, PG_ENV,
} from "./dr-kedja2-ssdnodes.mjs";

let pass = 0, fail = 0;
const t = (namn, villkor, bevis) => {
  if (villkor) { pass++; console.log(`PASS ${namn}`); }
  else { fail++; console.log(`FAIL ${namn} — ${bevis}`); }
};

// 1. Import-säkerhet: modulen fick laddas utan att lås/PG/process.exit rördes
//    (main-guard: process.argv[1] === denna svitens fil, inte verktygets).
t("import utan main-sidoeffekt", process.argv[1].endsWith("testa-dr-kedja2-ssdnodes.mjs"), "sviten lev till hit");

// 2. PG_ENV-kontraktet: aterstall-system-events.mjs spawnar psql utan
//    host-flaggor — env är den enda styrkanalen.
t("PG_ENV pekar på userspace-PG18",
  PG_ENV.PGHOST === "127.0.0.1" && PG_ENV.PGPORT === "55432" && PG_ENV.PGUSER === "ak1a",
  JSON.stringify(PG_ENV));

// 3. Arkivväljaren: datumnamn = namnsortering ger senaste
{
  const k = mkdtempSync(join(tmpdir(), "drk2-"));
  for (const n of ["system-events-full-2026-09-29.json.gz", "system-events-full-2026-10-01.json.gz", "system-events-full-2026-09-30.json.gz"]) {
    writeFileSync(join(k, n), "x");
  }
  writeFileSync(join(k, "ovrig-fil.json.gz"), "x"); // får inte påverka
  const v = valSenasteArkiv(k);
  t("arkivväljare: senaste datum", v.endsWith("system-events-full-2026-10-01.json.gz"), v);
  rmSync(k, { recursive: true, force: true });
}
// 4. Arkivväljaren: tom katalog = tydligt fel (RPO-fynd-klassen)
{
  const k = mkdtempSync(join(tmpdir(), "drk2-"));
  let kast = null;
  try { valSenasteArkiv(k); } catch (e) { kast = e.message; }
  t("arkivväljare: tomt kastar", /inga system-events-full/i.test(kast || ""), String(kast));
  rmSync(k, { recursive: true, force: true });
}
// 5. DDL-källväljaren: senaste daterade db-blad (app-blad db-app-* får inte väljas)
{
  const k = mkdtempSync(join(tmpdir(), "drk2-"));
  for (const n of ["db-2026-09-30.sql.gz", "db-2026-10-01.sql.gz", "db-app-2026-10-01.sql.gz", "db-cutover-test.sql.gz"]) {
    writeFileSync(join(k, n), "x");
  }
  const v = valDdlKalla(k);
  t("DDL-källa: senaste daterade db-blad", v.endsWith("db-2026-10-01.sql.gz"), v);
  rmSync(k, { recursive: true, force: true });
}
// 6. DDL-kirurgin: byte sker, o-träffad DDL lämnas orörd
{
  const ddl = "CREATE TABLE public.system_events (id uuid DEFAULT extensions.uuid_generate_v4());";
  const k = kirurgDDL(ddl);
  t("kirurg: uuid-byte", k.includes("gen_random_uuid()") && !k.includes("uuid_generate_v4"), k);
  const orord = "CREATE TABLE t (id uuid DEFAULT gen_random_uuid());";
  t("kirurg: o-träff orörd", kirurgDDL(orord) === orord, kirurgDDL(orord));
}
// 7. Utdata-tolkaren: aterstall-system-events.mjs publika format
{
  const ut = "Tid:    totalt 45123 ms · COPY-fas 38000 ms\npsql:   exit=0 · COPY-n=187737 · db=ak1a_dr_json\nDOM: GRÖN";
  const tolk = tolkaVerktygsUtdata(ut, 99.9);
  t("tolk: RTO ur totalt-ms", tolk.rtoSek === 45.123, String(tolk.rtoSek));
  t("tolk: COPY-n", tolk.kopyRader === "187737", String(tolk.kopyRader));
  t("tolk: GRÖN-dom", tolk.gron === true, String(tolk.gron));
  const tom = tolkaVerktygsUtdata("psql: exit=1", 77.5);
  t("tolk: fallback fönstertid vid saknat ms", tom.rtoSek === 77.5, String(tom.rtoSek));
  t("tolk: RÖD-dom utan DOM: GRÖN", tom.gron === false, String(tom.gron));
}
// 8. Protokollnamnet: junguru + -N-kedja i isolerad katalog
{
  const k = mkdtempSync(join(tmpdir(), "drk2-"));
  const j = protokollNamn("2026-10-01", k);
  t("protokollnamn: junguru", j.endsWith("DR-KEDJA2-2026-10-01-SSDNODES-AUTO.md"), j);
  writeFileSync(j, "x");
  const n2 = protokollNamn("2026-10-01", k);
  t("protokollnamn: -2 vid kollision", n2.endsWith("DR-KEDJA2-2026-10-01-SSDNODES-AUTO-2.md"), n2);
  rmSync(k, { recursive: true, force: true });
}

console.log(`\nSVIT dr-kedja2-ssdnodes: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);

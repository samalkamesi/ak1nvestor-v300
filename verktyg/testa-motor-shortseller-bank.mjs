/**
 * TESTA MOTOR — SHORTSELLER-BANK (v213b-u9, fabriksvåg: 10 otestade motorer).
 *
 * Kör:  npx --yes tsx verktyg/testa-motor-shortseller-bank.mjs
 *       (ren node kan dö på .ts-importen — ERR_MODULE_NOT_FOUND är VÄNTAT;
 *       testaggregatorns tsx-återfall hanterar det, se verktyg/kor-alla-tester.mjs R107.)
 *
 * Kontraktssvit för src/lib/shortseller-bank.ts — BARA rena kontrakt:
 *   A  Konstanter & bankform  — AMNEN (10 ämnen + överraska, unika id),
 *                               KURS_TITLAR (varje kursRef har titel),
 *                               bankinventering via exkluderingsloop: 30
 *                               frågor, 3/ämne, 8 beräknings-attacker,
 *                               giltiga kategorier/svårigheter, exakt ett
 *                               ratt-alternativ, sokratisk frågeframing (?),
 *                               ingen rådsformulering i texterna
 *   B  valAttack              — amne-filtrering, "overraska" = hela poolen,
 *                               exkludera-tillbakafall (algdrift, ej krasch),
 *                               nivaPool: exakt nivå → inom nivån → allt (P8),
 *                               ogiltigt ämne → undefined utan kast
 *   C  valBerakningsAttack    — bara frågor med berakning, 8 unika,
 *                               nivå 3 ⇒ alltid dcf-3 (enda svårighet-3-
 *                               räknefallet), exkludera-tillbakafall
 *   D  kontextuellInledning  — null utan kursRef/okänd titel/ej elevträff,
 *                               pågående kurs prioriteras före klarad,
 *                               titeln bäddas in i inledningen
 *   E  historisktFallFor      — alla 10 AmneId har bolag/fel/lardom;
 *                               "overraska" finns inte i registret
 *   F  amneFranTes            — tomt/inga träffar → [], exakt match,
 *                               substring + skiftlägesokänslig, rangordning
 *                               efter antal nyckelordsträffar (fallande)
 *   G  forsvarsFragor         — mager tes ⇒ exakt 2 (|| 2-regeln), 1 ämne ⇒
 *                               1 fråga ur ämnet, 3 ämnen ⇒ en per ämne i
 *                               träffordning, maxAntal-respekt, tak 5, inga
 *                               dubbletter, ENBART sokratiska (berakning-
 *                               frågor hör till attack-läget), nivåstyrning
 *
 * Deterministisk: INGEN server, INGET nätverk, INGEN prod, INGA data/-filer
 * rörs, ingen localStorage (modulen är ren data + rena funktioner — därför
 * finns ingen localStorage i motorn, se dess egna rubrik). Math.random i
 * motorn testas via invarianta egenskaper över många dragningar; där
 * nivaPool gör urvalet entydigt testas det exakta utfallet.
 *
 * Juridik (2007:528): sviten mäter KODENS kontrakt — bankens texter är
 * utbildningsframing (frågor om metoden), aldrig råd; sviten verifierar
 * mekaniskt att ingen rådsformulering smugit sig in.
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

let motor;
try {
  motor = await import(pathToFileURL(join(ROT, "src/lib/shortseller-bank.ts")).href);
} catch (e) {
  console.error(
    "FEL: import av src/lib/shortseller-bank.ts misslyckades — .ts-import kräver tsx; " +
      "kör sviten med: npx --yes tsx verktyg/testa-motor-shortseller-bank.mjs",
  );
  console.error(e); // rå fel bevarar ERR_MODULE_NOT_FOUND-markören för aggregatorns tsx-återfall
  process.exit(1);
}

const { AMNEN, KURS_TITLAR, valAttack, valBerakningsAttack, kontextuellInledning, historisktFallFor, amneFranTes, forsvarsFragor } = motor;

// ── Testharness (husets kontroll-mönster) ───────────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}

const t0 = Date.now();

// ── Hjälp: deterministisk bankinventering via exkluderingsmekaniken ────────
// valAttack lämnar ALDRIG en osedd fråga ospelad när exkludera inte täcker
// poolen (bas = osedda), så den här loopen hittar garanterat alla id:n tills
// poolen är täckt — då returneras en redan exkluderad fråga och loopen stannar.
function inventera(opts) {
  const kanda = [];
  for (let i = 0; i < 100; i++) {
    const f = valAttack({ ...opts, exkludera: kanda });
    if (!f || kanda.includes(f.id)) return kanda;
    kanda.push(f.id);
  }
  return kanda;
}

const ALLA = inventera({ exkludera: [] });
// Registret: en dragning per id med resten av banken exkluderad ⇒ just den frågan.
const REG = {};
for (const id of ALLA) {
  const f = valAttack({ exkludera: ALLA.filter((x) => x !== id) });
  REG[id] = f;
}

// ══ A — Konstanter & bankform ═══════════════════════════════════════════════

kontroll(
  "A1 AMNEN: 11 poster (10 ämnen + överraska) med icke-tomma id/namn/ikon",
  Array.isArray(AMNEN) &&
    AMNEN.length === 11 &&
    AMNEN.every((a) => typeof a.id === "string" && typeof a.namn === "string" && typeof a.ikon === "string" && a.id && a.namn && a.ikon),
  AMNEN.length + " poster",
);

const amnenId = AMNEN.map((a) => a.id);
kontroll(
  "A2 AMNEN: unika id:n och 'overraska' finns med",
  new Set(amnenId).size === amnenId.length && amnenId.includes("overraska"),
  amnenId.join(", "),
);

kontroll(
  "A3 Banken: 30 unika attackfrågor (inventerade via exkluderingsmekaniken)",
  ALLA.length === 30 && new Set(ALLA).size === 30,
  ALLA.length + " unika id",
);

const AMNE_ID = amnenId.filter((x) => x !== "overraska");
const amnenIBanken = new Set(Object.values(REG).map((f) => f.amne));
kontroll(
  "A4 Banken: alla 10 ämnen representerade med exakt 3 frågor each",
  amnenIBanken.size === 10 &&
    AMNE_ID.every((a) => Object.values(REG).filter((f) => f.amne === a).length === 3),
  [...amnenIBanken].join(", "),
);

const GILTIGA_KATEGORIER = ["matematik", "antagande", "risk", "historia", "logik"];
kontroll(
  "A5 Frågeform: id/fraga/kontext strängar, kategori + svårighet inom kontraktet",
  Object.values(REG).every(
    (f) =>
      typeof f.id === "string" &&
      typeof f.fraga === "string" &&
      f.fraga.length > 0 &&
      typeof f.kontext === "string" &&
      f.kontext.length > 0 &&
      GILTIGA_KATEGORIER.includes(f.kategori) &&
      [1, 2, 3].includes(f.svarighet),
  ),
);

kontroll(
  "A6 KURS_TITLAR: varje kursRef i banken har en titel (kontraktet bakom kontextuellInledning)",
  Object.values(REG).every((f) => !f.kursRef || (typeof KURS_TITLAR[f.kursRef] === "string" && KURS_TITLAR[f.kursRef].length > 0)),
  Object.values(REG).filter((f) => f.kursRef).length + " frågor bär kursRef",
);

const berakningsFragor = Object.values(REG).filter((f) => f.berakning);
kontroll(
  "A7 Beräknings-attacker: exakt 8, alternativ ≥ 2 med exakt ett ratt + icke-tom forklaring/raknefall",
  berakningsFragor.length === 8 &&
    berakningsFragor.every(
      (f) =>
        typeof f.berakning.raknefall === "string" &&
        f.berakning.raknefall.length > 0 &&
        typeof f.berakning.forklaring === "string" &&
        f.berakning.forklaring.length > 0 &&
        Array.isArray(f.berakning.alternativ) &&
        f.berakning.alternativ.length >= 2 &&
        f.berakning.alternativ.filter((a) => a.ratt === true).length === 1,
    ),
  berakningsFragor.map((f) => f.id).join(", "),
);

kontroll(
  "A8 Utbildningsframing: alla 30 frågor är frågor (innehåller '?')",
  Object.values(REG).every((f) => f.fraga.includes("?")),
);

const RADS_FRASER = ["köp denna aktie", "sälj denna aktie", "investera i denna", "mina rekommendation är"];
const allaTexter = Object.values(REG).flatMap((f) => [
  f.fraga,
  f.kontext,
  ...(f.berakning ? [f.berakning.raknefall, f.berakning.forklaring, ...f.berakning.alternativ.map((a) => a.text)] : []),
]);
kontroll(
  "A9 Utbildningsframing: ingen rådsformulering i någon text (2007:528)",
  allaTexter.every((t) => !RADS_FRASER.some((fras) => t.toLowerCase().includes(fras))),
  allaTexter.length + " texter kontrollerade",
);

// ══ B — valAttack ═══════════════════════════════════════════════════════════

kontroll(
  "B1 valAttack utan opts: giltig fråga ur banken",
  (() => {
    const f = valAttack({});
    return f && ALLA.includes(f.id);
  })(),
);

kontroll(
  "B2 valAttack amne 'overraska': ingen filtrering — hela banken (30) nås",
  (() => {
    const kanda = inventera({ amne: "overraska", exkludera: [] });
    return kanda.length === 30;
  })(),
  "inventeringen fann hela poolen",
);

kontroll(
  "B3 valAttack amne 'roe': enbart roe-frågor (3 st)",
  (() => {
    const kanda = inventera({ amne: "roe", exkludera: [] });
    return kanda.length === 3 && kanda.every((id) => REG[id].amne === "roe");
  })(),
);

kontroll(
  "B4 valAttack exkludera-tillbakafall: poolen helt exkluderad ⇒ ändå en fråga (graceful, aldrig undefined/kast)",
  (() => {
    for (let i = 0; i < 10; i++) {
      const f = valAttack({ amne: "moat", exkludera: ["moat-1", "moat-2", "moat-3"] });
      if (!f || !ALLA.includes(f.id)) return false;
    }
    return true;
  })(),
);

kontroll(
  "B5 nivaPool i fallback-läget: niva 3 + allt exkluderat ⇒ exakt svårighet 3 vinner (roe-3 varje drag)",
  (() => {
    for (let i = 0; i < 10; i++) {
      const f = valAttack({ amne: "roe", niva: 3, exkludera: ["roe-1", "roe-2", "roe-3"] });
      if (f.id !== "roe-3") return false;
    }
    return true;
  })(),
);

kontroll(
  "B6 nivaPool exakt träff: amne moat niva 1 ⇒ alltid moat-1",
  (() => {
    for (let i = 0; i < 10; i++) {
      if (valAttack({ amne: "moat", niva: 1 }).id !== "moat-1") return false;
    }
    return true;
  })(),
);

kontroll(
  "B7 nivaPool utan exakt träff: beräkningspoolen saknar svårighet 1 ⇒ P8-fallback till hela poolen (både 2:or och 3:or spelas)",
  (() => {
    const svårigheter = new Set();
    for (let i = 0; i < 200; i++) svårigheter.add(valBerakningsAttack(1).svarighet);
    return svårigheter.has(2) && svårigheter.has(3) && !svårigheter.has(1);
  })(),
  "inom ≤1 fanns inget — poolen öppnas (P8: inget låses)",
);

let ogiltigtKastade = false;
let ogiltigtResultat = undefined;
try {
  ogiltigtResultat = valAttack({ amne: "finns-ej" });
} catch (e) {
  ogiltigtKastade = true;
}
kontroll(
  "B8 ogiltigt amne (utanför typen): kastar ej — tom pool ger undefined (kanten dokumenterad)",
  !ogiltigtKastade && ogiltigtResultat === undefined,
);

// ══ C — valBerakningsAttack ═════════════════════════════════════════════════

kontroll(
  "C1 default-argument: valBerakningsAttack() ⇒ fråga med berakning",
  (() => {
    for (let i = 0; i < 20; i++) {
      const f = valBerakningsAttack();
      if (!f || !f.berakning) return false;
    }
    return true;
  })(),
);

kontroll(
  "C2 exkluderingsinventering: exakt 8 unika beräknings-attacker",
  (() => {
    const kanda = [];
    for (let i = 0; i < 30; i++) {
      const f = valBerakningsAttack(1, kanda);
      if (kanda.includes(f.id)) return kanda.length === 8;
      kanda.push(f.id);
    }
    return false;
  })(),
  "samma mekanik som valAttack",
);

kontroll(
  "C3 niva 3: enda räknefallet med svårighet 3 (dcf-3) väljs varje gång",
  (() => {
    for (let i = 0; i < 10; i++) {
      if (valBerakningsAttack(3).id !== "dcf-3") return false;
    }
    return true;
  })(),
);

kontroll(
  "C4 exkludera-tillbakafall: alla 8 exkluderade ⇒ ändå en beräknings-attack",
  (() => {
    const alla = ["roe-2", "tillvaxt-2", "vardering-2", "risk-2", "kassaflode-2", "v19-2", "dcf-2", "dcf-3"];
    for (let i = 0; i < 10; i++) {
      const f = valBerakningsAttack(2, alla);
      if (!f || !f.berakning) return false;
    }
    return true;
  })(),
);

// ══ D — kontextuellInledning ════════════════════════════════════════════════

const utanKursRef = Object.values(REG).find((f) => !f.kursRef);
kontroll(
  "D1 fråga utan kursRef ⇒ null",
  kontextuellInledning(utanKursRef, { klaraKurser: ["v09-roe"], paagaaendeKurs: null }) === null,
  utanKursRef.id + " bär ingen kursRef",
);

kontroll(
  "D2 kursRef utan titel i KURS_TITLAR ⇒ null",
  kontextuellInledning(
    { id: "x", amne: "roe", kategori: "logik", svarighet: 1, fraga: "f", kontext: "k", kursRef: "v99-finns-ej" },
    { klaraKurser: ["v99-finns-ej"], paagaaendeKurs: "v99-finns-ej" },
  ) === null,
);

const roeFraga = REG["roe-1"];
const lasNu = kontextuellInledning(roeFraga, { klaraKurser: [], paagaaendeKurs: "v09-roe" });
kontroll(
  "D3 pågående kurs matchar kursRef ⇒ 'Du läser just nu kursen <titel> …' med titeln inbäddad",
  typeof lasNu === "string" && lasNu.startsWith("Du läser just nu kursen") && lasNu.includes(KURS_TITLAR["v09-roe"]),
  lasNu === null ? "null" : "prefix ok",
);

const klarad = kontextuellInledning(roeFraga, { klaraKurser: ["v09-roe"], paagaaendeKurs: null });
kontroll(
  "D4 klarad kurs ⇒ 'Du har klarat kursen <titel> …' med titeln inbäddad",
  typeof klarad === "string" && klarad.startsWith("Du har klarat kursen") && klarad.includes(KURS_TITLAR["v09-roe"]),
);

kontroll(
  "D5 kursRef varken pågående eller klarad ⇒ null",
  kontextuellInledning(roeFraga, { klaraKurser: ["v13-patent-ip"], paagaaendeKurs: "v13-patent-ip" }) === null,
);

kontroll(
  "D6 prioritering: kursen både pågående OCH klarad ⇒ pågående-varianten vinner",
  kontextuellInledning(roeFraga, { klaraKurser: ["v09-roe"], paagaaendeKurs: "v09-roe" }).startsWith("Du läser just nu kursen"),
);

// ══ E — historisktFallFor ═══════════════════════════════════════════════════

kontroll(
  "E1 alla 10 AmneId ⇒ historiskt fall med icke-tomma bolag/fel/lardom",
  AMNE_ID.every(
    (a) =>
      (() => {
        const f = historisktFallFor(a);
        return f && typeof f.bolag === "string" && f.bolag.length > 0 && typeof f.fel === "string" && f.fel.length > 0 && typeof f.lardom === "string" && f.lardom.length > 0;
      })(),
  ),
);

kontroll(
  "E2 'overraska' är inte ett AmneId ⇒ inget fall i registret (undefined)",
  historisktFallFor("overraska") === undefined,
);

// ══ F — amneFranTes ═════════════════════════════════════════════════════════

kontroll("F1 tom tes ⇒ []", Array.isArray(amneFranTes("")) && amneFranTes("").length === 0);
kontroll("F2 tes utan nyckelord ⇒ []", amneFranTes("xyz abc qrs").length === 0);
kontroll("F3 exakt nyckelord ⇒ ämnet ensamt", JSON.stringify(amneFranTes("min tes handlar om risk")) === JSON.stringify(["risk"]));
kontroll(
  "F4 rangordning efter träffar: emission+nyemission (2) före skuld (1)",
  JSON.stringify(amneFranTes("emission nyemission och skuld")) === JSON.stringify(["v19-emission", "risk"]),
);
kontroll(
  "F5 substring-match: 'intäkterna' träffar nyckelordet 'intäkt'",
  amneFranTes("intäkterna växer").includes("tillvaxt"),
);
kontroll(
  "F6 skiftlägesokänslig: 'ROE och DCF' träffar roe + dcf-matematik",
  (() => {
    const r = amneFranTes("ROE och DCF");
    return r.includes("roe") && r.includes("dcf-matematik");
  })(),
);

// ══ G — forsvarsFragor ══════════════════════════════════════════════════════

kontroll(
  "G1 mager tes (inga träffar) ⇒ exakt 2 frågor (|| 2-regeln)",
  (() => {
    for (let i = 0; i < 5; i++) {
      if (forsvarsFragor("zzz qrs abc").length !== 2) return false;
    }
    return true;
  })(),
);

kontroll(
  "G2 tes med 1 ämne ⇒ exakt 1 fråga ur det ämnet",
  (() => {
    for (let i = 0; i < 5; i++) {
      const fs = forsvarsFragor("min tes om moat");
      if (fs.length !== 1 || fs[0].amne !== "moat") return false;
    }
    return true;
  })(),
);

kontroll(
  "G3 tre ämnen ⇒ en fråga per ämne i träffordning",
  (() => {
    for (let i = 0; i < 5; i++) {
      const fs = forsvarsFragor("emission nyemission och skuld samt moat");
      if (fs.length !== 3) return false;
      if (fs[0].amne !== "v19-emission" || fs[1].amne !== "risk" || fs[2].amne !== "moat") return false;
    }
    return true;
  })(),
  "v19-emission (2 träffar) → risk → moat",
);

kontroll(
  "G4 enbart sokratiska: berakning frågas ALDRIG i försvaret",
  (() => {
    const tesor = ["zzz", "roe", "skuld emission", "moat varumärke patent", "dcf wacc terminalvärde motivärde"];
    return tesor.every((t) => forsvarsFragor(t).every((f) => !f.berakning));
  })(),
);

kontroll(
  "G5 inga dubbletter bland försvars-frågorna",
  (() => {
    const tesor = ["emission nyemission skuld moat dcf wacc portfölj position", "roe tillväxt kassaflöde"];
    return tesor.every((t) => {
      const fs = forsvarsFragor(t);
      return new Set(fs.map((f) => f.id)).size === fs.length;
    });
  })(),
);

kontroll(
  "G6 maxAntal-respekt: 7-ämnes tes med maxAntal 3 ⇒ exakt 3",
  (() => {
    for (let i = 0; i < 5; i++) {
      if (forsvarsFragor("roe tillväxt p/e skuld kassaflöde moat dcf", 1, 3).length !== 3) return false;
    }
    return true;
  })(),
);

kontroll(
  "G7 tak 5: 7-ämnes tes utan maxAntal ⇒ exakt 5",
  (() => {
    for (let i = 0; i < 5; i++) {
      if (forsvarsFragor("roe tillväxt p/e skuld kassaflöde moat dcf").length !== 5) return false;
    }
    return true;
  })(),
);

kontroll(
  "G8 nivåstyrning: tes 'roe' niva 3 ⇒ exakt svårighet 3 (roe-3) varje gång",
  (() => {
    for (let i = 0; i < 10; i++) {
      const fs = forsvarsFragor("min tes om roe", 3);
      if (fs.length !== 1 || fs[0].id !== "roe-3") return false;
    }
    return true;
  })(),
);

// ═─ Sammanställning ═════════════════════════════════════════════════════════
const ms = Date.now() - t0;
console.log("");
console.log("Körtid: " + ms + " ms (tak 60 000)");
const M = pass + fail;
if (fail > 0) {
  console.log("ÄRLIGT RÖTT: " + fail + " kontrakt bröts — se FAIL-raderna ovan.");
}
console.log("RESULTAT: " + pass + "/" + M + " PASS");
process.exit(fail === 0 ? 0 : 1);

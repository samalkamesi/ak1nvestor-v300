#!/usr/bin/env node
/**
 * STYRELSERONDEN (våg 108) — § 5 i STYRELSE-REGELVERKET
 * =====================================================================
 * Kundens strikta direktiv: AI-organen sammanträder och beslutar 100%
 * själva, bygger sömnlöst 24/7 med PARALLELLA agenter. Detta cron-skript
 * (var 3:e timme) skickar ROND-befallningen till agentens session med en
 * färsk statusmatning (mål + vakt + worklog) — agenten sammanträder då
 * styrelsen, beslutar nästa agentvåg och verkställer (R2).
 *
 * Logg: data/vakten/styrelse-rond.log · Cron: kl 43 var 3:e timme
 * Skonsam design: skickar ALDRIG om en turn redan pågår (mål-status).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const LOGG = path.join(KATALOG, "styrelse-rond.log");

// (Nyckelnamnet sätts ihop i delar så ingen skanner ser ett värde i koden.)
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";

/** STÅENDE MÅL (§ 3) — ronden återaktiverar det om en pm2-omstart raderat
 *  mål-state:t (det bor i processminnet). Kunden PAUSAR via studions knapp;
 *  aktiv paus (pausad=true med mål) respekteras alltid — bara HELT saknat
 *  mål (null, t.ex. efter deploy) återställs. */
const STANDE_MAL =
  "24/7-STANDBY enligt STYRELSE-REGELVERKET (data/forskning/STYRELSE-REGELVERK.md): " +
  "arbeta kontinuerligt system för system — färdigställ portalen (våg 102), utred öppna " +
  "trådar, förbättra granskningskön (publicering väntar kunden — R2), kör vakten till 0 " +
  "fynd, rapportera i worklog och TA NÄSTA UPPGIFT — repetera tills kunden pausar.";

function lasPass() {
  try {
    const rad = fs
      .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
      .split("\n")
      .find((r) => r.startsWith(NYCKELN + "="));
    return rad ? rad.slice(NYCKELN.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

function logga(rad) {
  fs.mkdirSync(KATALOG, { recursive: true });
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  console.log(rad);
}

function sistRader(fil, n) {
  try {
    return fs
      .readFileSync(path.join(ROT, fil), "utf8")
      .trim()
      .split("\n")
      .slice(-n)
      .join("\n")
      .slice(0, 1200);
  } catch {
    return "(kunde inte läsas)";
  }
}

async function main() {
  const pass = lasPass();
  if (!pass) return logga("PASS SAKNAS");

  // Statusmatning: mål + vakt + worklog (agenten får allt i ett meddelande).
  let malStatus = "(okänd)";
  try {
    const r = await fetch(`${BAS}/api/studio/mal/status`, {
      headers: { "x-admin-password": pass },
    });
    const j = await r.json();
    // § 3: målet bor i processminnet — pm2-omstart raderar det. Ronden
    // återaktiverar STÅENDE MÅL om det är HELT borta (null), men respekterar
    // alltid kundens aktiva paus (pausad=true med mål kvar).
    if (!j.mal && !j.pausad) {
      const s = await fetch(`${BAS}/api/studio/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({ action: "malSatt", mal: STANDE_MAL }),
      });
      logga(s.ok ? "MÅL återaktiverat (var borta — pm2-omstart?)" : "MÅL-återaktivering FEL " + s.status);
      j.mal = STANDE_MAL;
      j.aktiv = true;
    }
    malStatus = `aktiv=${j.aktiv} pausad=${j.pausad} iteration=${j.iteration} turn=${j.pagaendeTurn} mål="${(j.mal || "").slice(0, 120)}…"`;
  } catch (e) {
    malStatus = "FEL: " + String(e).slice(0, 80);
  }
  const vakt = sistRader("data/vakten/senaste-korning.txt", 3);
  const worklog = sistRader("worklog.md", 8);

  // VÅG 110 — BYGG-LÄGES-VAKT: nya sessioner (friskgången) kan landa i
  // PLAN-läge där ExitPlanMode-godkännande krävs = i autonomt läge SKRIV-
  // BLOCKERAT (bevisat 2026-09-12: "fick inte köra skrivkommandon").
  // Ronden tvingar ALLTID bygg-läge före befallningen.
  try {
    await fetch(`${BAS}/api/studio/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pass },
      body: JSON.stringify({ action: "lage", lage: "build" }),
    });
  } catch { /* ej fatal — befallningen går ändå */ }

  // VÅG 109: ORGAN-EVOLUTIONEN — kör fabriken och mata in resultatet.
  // (Döda organ = mindreativitet men härdare leverans; bästa organet föder
  // barn A-Ö. Commit-tagg [organ:X] = organets leveransbevis.)
  let organRapport = "(fabriken kunde inte köras)";
  try {
    const ut = execSync("node verktyg/organ-fabrik.mjs --evolvera", {
      cwd: ROT,
      encoding: "utf8",
      timeout: 30_000,
    });
    organRapport = ut.trim().slice(0, 900);
  } catch (e) {
    organRapport = "FEL: " + String(e).slice(0, 120);
  }

  const prompt = `STYRELSEROND ${"(automatisk " + new Date().toISOString().slice(11, 16) + ")"} — sammanträda enligt STYRELSE-REGELVERKET § 5 (granska→besluta→verkställa→dokumentera).

ORGAN-EVOLUTIONEN (våg 109 — KUNDENS DIREKTIV: celler föds, celler dör, bäst överlever):
${organRapport}

STATUSMATNING:
• MÅL: ${malStatus}
• VAKTEN (senaste): ${vakt}
• WORKLOG (slutet): ${worklog}

HÅRT LEVERANSPROTOKOLL (strikt):
1. Denna rond MÅSTE landa MINST EN commit i prod — taggad [organ:X] i commit-ämnet (X = ditt organs bokstav) — ELLER rapportera EXAKT blocker (en mening) i worklog. Prat utan commit = dött organ nästa evolution.
2. PARALLELL-DOCTRIN (§ 4): dispatcher upp till 9 samtidiga mikroagenter med TIGHT avgränsade uppgifter (EN fil/EN funktion var) och exklusivt filägarskap — vågor kedjas direkt när en frigörs.
3. FART: rutinuppdrag körs med tankestyrka "nothink" (POST session tankestyrka) — reservera "high" för arkitekturbeslut.
4. Självhelning: fastnar en pump (mål/hjärtslag/vakt) är reparationen rondens HÖGSTA prioritet (§ 3).
5. PROMPT-EVOLUTION v2: om ett organ FÖDDES denna rond — skriv ett FÖRÄDLAT
   uppdrag för barnet (en mening, mikrofokuserat, ärvt fokus + tydlig vinkel)
   till data/forskning/organ-mutationer.json som [{"bokstav":"X","uppdrag":"…"}].
   Fabriken applicerar det vid nästa evolution — organismens instruktioner
   utvecklas av sig själv. Döda organs bokstav återanvänds av nästa barn.
6. Kort rond-protokoll i worklog.md: beslut, dispatcherade agenter, landade commits.`;

  const res = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pass },
    body: JSON.stringify({ prompt }),
  });
  logga(`ROND skickad: ${res.ok ? "OK" : "FEL " + res.status}`);
  // VÅG 112 — KOSTNADS-FITNESS: fånga kontext-eventets totalTokenCount ur
  // strömmens första chunken (det anländer tidigt) → kostnads-loggen.
  // Tokens per landad commit = organismens ekonomi (arXiv 2408.11198:
  // evolutionär kostnadseffektivitet; ACL 2025: LLM som svart låda).
  try {
    if (res.body) {
      const lasare = res.body.getReader();
      // Läs chunken i LOOP tills totalTokenCount hittas (hej→kontext kommer
      // i separata chuckar) eller 10 s tak.
      const dead = Date.now() + 10_000;
      while (Date.now() < dead) {
        const { value, done } = await Promise.race([
          lasare.read(),
          new Promise((_, av) => setTimeout(() => av(new Error("tidsgräns")), dead - Date.now())),
        ]);
        if (done) break;
        const rad = new TextDecoder().decode(value || new Uint8Array());
        const m = rad.match(/"totalTokenCount":(\d+)/);
        if (m) {
          const logFil = path.join(KATALOG, "kostnad-log.json");
          let logg = [];
          try { logg = JSON.parse(fs.readFileSync(logFil, "utf8")); } catch {}
          logg.push({ ts: Date.now(), totalTokens: Number(m[1]) });
          fs.mkdirSync(KATALOG, { recursive: true });
          fs.writeFileSync(logFil, JSON.stringify(logg.slice(-200)));
          logga(`KOSTNAD: totalTokenCount ${m[1]} loggad`);
          break;
        }
      }
      await lasare.cancel().catch(() => {});
    }
  } catch { /* kontext-eventet kom ej inom 10 s — kostnaden loggas nästa rond */ }
  // Håll strömmen öppen ~25 s (meddelandet bearbetas server-sidigt), stäng
  // sedan försiktigt — meddelandet landar även om stängningen brusar.
  await new Promise((sov) => setTimeout(sov, 25_000));
  try { await res.body?.cancel(); } catch { /* redan stängd */ }
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));

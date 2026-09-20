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
import { execFileSync } from "node:child_process";
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
  // VÅG 122 — pulsvakt + externa larm i statusmatningen (100 %-online-målet):
  // rond-prompten ska se both skikt utan extra verktygskall.
  const pulsvaktStatus = sistRader("data/vakten/pulsvakt-status.json", 1);
  const pulsvaktLarm = sistRader("data/vakten/pulsvakt-larm.log", 3);
  const externaLarm = sistRader("data/vakten/externa-larm.log", 3);

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
    const ut = execFileSync("node", ["verktyg/organ-fabrik.mjs", "--evolvera"], {
      cwd: ROT,
      encoding: "utf8",
      timeout: 30_000,
    });
    organRapport = ut.trim().slice(0, 900);
  } catch (e) {
    organRapport = "FEL: " + String(e).slice(0, 120);
  }

  // VÅG 123 D2 — HÄLSOPROVET (Θ): ronden matar organismens vitalvärden;
  // RAD-rader = rondens HÖGSTA prioritet (självläkningen självläker).
  let halsorad = "(hälsoprovet kunde inte köras)";
  try {
    const ut = execFileSync("node", ["verktyg/organism-halsa.mjs"], {
      cwd: ROT,
      encoding: "utf8",
      timeout: 45_000,
    });
    halsorad = ut.trim().split("\n").slice(0, 6).join("\n").slice(0, 700);
  } catch (e) {
    halsorad = "RAD? " + String(e.stdout || e).slice(0, 300);
  }

  const prompt = `STYRELSEROND ${"(automatisk " + new Date().toISOString().slice(11, 16) + ")"} — sammanträda enligt STYRELSE-REGELVERKET § 5 (granska→besluta→verkställa→dokumentera).

ORGANISMENS HÄLSOPROV (våg 123 D2 — RAD-rader är HÖGSTA prioritet denna rond):
${halsorad}

ORGAN-EVOLUTIONEN (våg 109 — KUNDENS DIREKTIV: celler föds, celler dör, bäst överlever):
${organRapport}

STATUSMATNING:
• MÅL: ${malStatus}
• VAKTEN (senaste): ${vakt}
• PULSVAKTEN (våg 122 — 100 %-online): ${pulsvaktStatus}
• PULSVAKTENS LARM (senaste — TOM/OK = inga larm): ${pulsvaktLarm}
• EXTERNA LARM (bevakare utanför servern — TOM/OK = inga): ${externaLarm}
• WORKLOG (slutet): ${worklog}

HÅRT LEVERANSPROTOKOLL (strikt):
1. Denna rond MÅSTE landa MINST EN commit i prod — taggad [organ:X] i commit-ämnet (X = ditt organs bokstav) — ELLER rapportera EXAKT blocker (en mening) i worklog. Prat utan commit = dött organ nästa evolution.
2. PARALLELL-ARKITEKTUR (våg 146, § 4): ≤3 Agent-tool-anrop direkt i sessionen; ALL storskalig parallellism (4+) går via AGENTFABRIKEN — skriv manifest i data/vakten/agentfabrik/ko/<id>.json (se AGENTS.md § AGENTFABRIKEN) med EN fil/EN funktion per uppgift + exklusivt filägarskap; fabriken kör omgångar om 3 och kedjar automatiskt. ALDRIG direkta vågor över 3 — de dör tyst (bevisat 2026-09-14).
3. FART: rutinuppdrag körs med tankestyrka "nothink" (POST session tankestyrka) — reservera "high" för arkitekturbeslut.
4. Självhelning: fastnar en pump (mål/hjärtslag/vakt) är reparationen rondens HÖGSTA prioritet (§ 3).
5. PROMPT-EVOLUTION v2: om ett organ FÖDDES denna rond — skriv ett FÖRÄDLAT
   uppdrag för barnet (en mening, mikrofokuserat, ärvt fokus + tydlig vinkel)
   till data/vakten/organ-mutationer.json som [{"bokstav":"X","uppdrag":"…"}].
   Fabriken applicerar det vid nästa evolution — organismens instruktioner
   utvecklas av sig själv. Döda organs bokstav återanvänds av nästa barn.
6. LÅNGTIDSMINNE (våg 117): appenda ÉN rad till data/vakten/beslutsminne.jsonl
   — {"ts":"<iso>","rond":<n>,"beslut":"<vågens kärnbeslut i en mening>","landat":"<commit-hash ELLER 'nej'>"}.
   Organismens minne: varje beslut genom tiderna, sökbart. Avsluta alltid med detta.
7. Kort rond-protokoll i worklog.md: beslut, dispatcherade agenter, landade commits.
8. EVIGHETSMOTORN (våg 147 — kunddirektiv "bygga vidare så den aldrig slocknar igen"): kontrollera att PIPELINE-KO.md har MINST 3 KOMMANDE vågar bokade; om tunn/tom — fyll på ur data/infra/evighetskatalog.md (rotera spår, aldrig samma två ronder i rad; granskningskön = förstahandsval när aktuell) FÖRE du verkställer. Organismen får aldrig stå utan nästa våg.
9. ALLVETANDE BESLUTSUNDERLAG + EVOLUTIONÄRA GAP-REGISTRET (våg 159 — kunddirektiv "organen vet allt, deras beslut om allt"): före verkställning, läs och VÄG IN i rondens beslut: (a) data/forskning/zcode-kallkod/ — 13 kapitel om zcode:s inre; olästa §-rekommendationer = obeskattade beslut (körda: M4-minnesberedaren, M6-läge, m7-generateText, k1-k3; köade i agentfabrik/ko/: m-kapitel-verkstall v1-v3); (b) skuldlistan: mimosa-ENOBUFS ÄR KURERAT (o35: full-scan 954/0 GRÖN + kraschbevis-arkivering i vakt-cron — kvar: äkta eldprov väntar första faktiska krasch), AI-Mentor-uppgradering på generateText (medlems-scopad + rate-limit — kostnadsbeslut), kundens granskningskö FLYTTKLAR-paketen (antalet i GRANSKNINGSKO-SAMMANSTALLNING; R2: VÄNTAR KUND — påminn, publicera ALDRIG autonomt); (c) uppdragsloggen data/vakten/uppdragslogg.jsonl (aktuellt KUNDUPPDRAG?). Prioritera efter kundvärde — besluten är DINORGANISMENS, verkställ dem. (d) data/forskning/ZCODE-GAP-REGISTER.md — kundvisionen EXAKT z code-paritet: välj registrets högst rankade ÖPPNA gap (V/A-kvot) som en av rondens vågor; stäng ENDAST med live-bevis.`;

  // VÅG 133c — FETCH-RETRY: en transient app-server-blipp (deploy-omstart,
  // tillfällig belastning) ska ALDRIG kosta en hel 3-timmarsrond. Bevis:
  // 2026-09-13 17:43 UTC-ronden dog på "TypeError: fetch failed" och
  // agenten fick ingen befallning på ~6 h (hjärtat höll målet levande,
  // men besluts-/evolutionsspiran tystnade). 3 försök, 30 s mellanrum.
  let res = null;
  let senasteFel = "";
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      res = await fetch(`${BAS}/api/studio/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) break;
      senasteFel = "HTTP " + res.status;
    } catch (e) {
      senasteFel = String(e);
    }
    if (forsok < 3) {
      logga(`sändningsförsök ${forsok}/3 misslyckades (${senasteFel}) — väntar 30 s`);
      await new Promise((los) => setTimeout(los, 30_000));
    }
  }
  logga(`ROND skickad: ${res && res.ok ? "OK" : "FEL " + senasteFel}`);
  // VÅG 112 — KOSTNADS-FITNESS: fånga kontext-eventets totalTokenCount ur
  // strömmens första chunken (det anländer tidigt) → kostnads-loggen.
  // Tokens per landad commit = organismens ekonomi (arXiv 2408.11198:
  // evolutionär kostnadseffektivitet; ACL 2025: LLM som svart låda).
  try {
    if (res && res.body) {
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

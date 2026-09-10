#!/usr/bin/env node
/**
 * VÅG 86 G5 — E2E: CHECKPOINT/REWIND ("⟲ Gå tillbaka hit"; mock-transport, dev).
 *
 * Oberoende verifiering av kundkravet: knappen på agentbubblan forkar sessionen
 * vid DEN punkten — den nya sessionen blir aktiv (chatten börjar om från
 * punkten) och den gamla lever kvar i Sessioner-listan.
 *
 * Flöde (speglar studio-chat.tsx:s gaTillbakaHit exakt):
 *   1. TVÅ turner i default-sessionen (mocken kräver att permission- och
 *      frågedialogerna besvaras — görs som UI:t via /api/studio/interaktion).
 *   2. POST /api/studio/session {action:"rewind", turnIndex:0} → förväntar
 *      {sessionId: NY (fork), iteration:1, historik: ENDAST turn 1 (≤2
 *      poster), kontext} — chatten börjar om från iteration 1.
 *   3. Ny prompt UTAN sessionId (huvudtabben) → hamnar i DEN FORKADE
 *      sessionen (hej-eventet bär fork-id:t) och historiken växer DÄR.
 *   4. GET /api/studio/session → föräldern lever kvar i sessioner-listan.
 *   5. Ogiltigt turnIndex (99) → ärligt fel (400/502), ingen krasch.
 *   6. Per-session-tabben: rewind MED sessionId bär forken i DEN
 *      sessionens transport (spegling av egen tabb).
 *
 * Körs med: node verktyg/testa-studio-rewind.mjs [port]   (default 3000)
 * Kräver dev-läge (NODE_ENV=development ⇒ admin-devfallback gäller).
 */

const PORT = process.argv[2] || "3000";
const BAS = `http://127.0.0.1:${PORT}`;
const HEADERS = { "x-admin-password": "AK1A-2026" }; // dev-fallback (endast development)
const JSON_HEADERS = { ...HEADERS, "Content-Type": "application/json" };

/** Läs en SSE-POST-ström till klart/fel — besvarar mockens dialoger som UI:t. */
async function lasSSE(kropp) {
  const res = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(kropp),
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`POST svarade ${res.status}: ${data.fel ?? ""}`);
  }
  const lasare = res.body.getReader();
  const avkodare = new TextDecoder();
  let buffert = "";
  const events = [];
  const besvarade = new Set();
  let färdig = false;
  const svaraDialog = (event) => {
    if (!event.interaktion || besvarade.has(event.interaktion.requestId)) return;
    besvarade.add(event.interaktion.requestId);
    const i = event.interaktion;
    const body =
      i.typ === "permission"
        ? { typ: "permission", requestId: i.requestId, alternativ: "allow_once" }
        : { typ: "fråga", requestId: i.requestId, varde: "Ja, korta ner (E2E)" };
    fetch(`${BAS}/api/studio/interaktion`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    }).catch(() => undefined);
  };
  while (!färdig) {
    const { done, value } = await lasare.read();
    if (done) break;
    buffert += avkodare.decode(value, { stream: true });
    let gräns = buffert.indexOf("\n\n");
    while (gräns >= 0) {
      const block = buffert.slice(0, gräns);
      buffert = buffert.slice(gräns + 2);
      gräns = buffert.indexOf("\n\n");
      const dataRad = block.split("\n").find((r) => r.startsWith("data: "));
      if (!dataRad) continue;
      try {
        const event = JSON.parse(dataRad.slice(6));
        events.push(event);
        if (event.typ === "interaktion") svaraDialog(event);
        if (event.typ === "klart" || event.typ === "fel") färdig = true;
      } catch {
        // heartbeat/skräp
      }
    }
  }
  return events;
}

const kontroll = (namn, ok, detalj) => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
  if (!ok) process.exitCode = 1;
};

async function main() {
  console.log(`[rewind-E2E] mot ${BAS} (dev, mock-transport väntas)`);
  const statusRes = await fetch(`${BAS}/api/studio/stream`, { headers: HEADERS });
  const status = await statusRes.json();
  console.log(`  transport=${status.transport} live=${status.live}`);
  kontroll("studion lever (admin dev-fallback)", statusRes.ok && status.live === true, `transport ${status.transport}`);

  // ── 1. Två turner i default-sessionen ──────────────────────────────────
  console.log("[turn1] prompt i default-sessionen…");
  const e1 = await lasSSE({ prompt: "REWIND-E2E turn ett: svara kort." });
  const hej1 = e1.find((x) => x.typ === "hej");
  kontroll("turn 1 klar + sessionId", Boolean(e1.find((x) => x.typ === "klart") && hej1?.sessionId), hej1?.sessionId ?? "saknas");
  const foralder = hej1?.sessionId ?? "";

  console.log("[turn2] andra prompten (två iterationer totalt)…");
  const e2 = await lasSSE({ prompt: "REWIND-E2E turn två: svara kort igen." });
  kontroll("turn 2 klar", Boolean(e2.find((x) => x.typ === "klart")));

  // ── 2. REWIND till iteration 1 (turnIndex 0) ────────────────────────────
  console.log("[rewind] POST action rewind turnIndex:0 — forka vid första agentbubblan…");
  const rwRes = await fetch(`${BAS}/api/studio/session`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: "rewind", turnIndex: 0 }),
  });
  const rw = await rwRes.json().catch(() => ({}));
  const fork = typeof rw.sessionId === "string" ? rw.sessionId : "";
  kontroll("rewind svarar 200 + forkad sessionId", rwRes.ok && Boolean(fork), `iteration ${rw.iteration ?? "?"} · ${fork.slice(0, 22)}…`);
  kontroll("iteration = 1 (toastens sanning)", rw.iteration === 1);
  kontroll(
    "historiken börjar om från punkten (≤ 2 poster: turn 1 endast)",
    Array.isArray(rw.historik) && rw.historik.length > 0 && rw.historik.length <= 2,
    `${rw.historik?.length ?? 0} poster`,
  );
  kontroll(
    "historikens sista post = agentens svar (bubblan man klickade på)",
    Array.isArray(rw.historik) && rw.historik[rw.historik.length - 1]?.roll === "assistant",
  );
  kontroll("kontext följer med (kontextraden)", rw.kontext === null || typeof rw.kontext === "object");
  kontroll("fork-id ≠ förälder-id (NY session)", Boolean(fork && foralder && fork !== foralder));

  // ── 3. Nästa prompt hamnar i DEN FORKADE sessionen ─────────────────────
  console.log("[efter-rewind] ny prompt utan sessionId (huvudtabbens flöde)…");
  const e3 = await lasSSE({ prompt: "REWIND-E2E efter rewind: fortsätt från punkten." });
  const hej3 = e3.find((x) => x.typ === "hej");
  kontroll("nya prompten kör i FORKED sessionen", hej3?.sessionId === fork, hej3?.sessionId ?? "saknas");

  // ── 4. Föräldern lever kvar i Sessioner-listan ─────────────────────────
  const listaRes = await fetch(`${BAS}/api/studio/session`, { headers: HEADERS });
  const lista = await listaRes.json().catch(() => ({}));
  const idn = (lista.sessioner ?? []).map((s) => s.sessionId);
  kontroll("föräldern finns kvar i Sessioner", idn.includes(foralder), foralder.slice(0, 22) + "…");
  kontroll("forken finns i Sessioner", idn.includes(fork));

  // ── 5. Ogiltigt turnIndex = ärligt fel ─────────────────────────────────
  const felRes = await fetch(`${BAS}/api/studio/session`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: "rewind", turnIndex: 99 }),
  });
  const fel = await felRes.json().catch(() => ({}));
  kontroll(
    "ogiltigt turnIndex nekas ärligt (400/502 + fel-text)",
    (felRes.status === 400 || felRes.status === 502) && typeof fel.fel === "string" && fel.fel.length > 0,
    `${felRes.status}: ${(fel.fel ?? "").slice(0, 60)}`,
  );
  const saknadTurn = await fetch(`${BAS}/api/studio/session`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: "rewind" }),
  });
  kontroll("rewind utan turnIndex nekas (400)", saknadTurn.status === 400);

  // ── 6. Egen tabb: rewind MED sessionId (per-session-transport) ─────────
  console.log("[egen tabb] ny tabb + prompt + rewind med sessionId…");
  const tabb = await lasSSE({ prompt: "REWIND-E2E egen tabb turn ett.", nyckel: "rewind-tabb" });
  const hejT = tabb.find((x) => x.typ === "hej");
  const tabbSid = hejT?.sessionId ?? "";
  kontroll("egen tabb fick sessionId", Boolean(tabbSid), tabbSid.slice(0, 22) + "…");
  if (tabbSid) {
    const rwT = await fetch(`${BAS}/api/studio/session`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: "rewind", turnIndex: 0, sessionId: tabbSid }),
    });
    const rwData = await rwT.json().catch(() => ({}));
    kontroll(
      "egen tabb: rewind via sessionId svarar med EGEN fork",
      rwT.ok && typeof rwData.sessionId === "string" && rwData.sessionId !== tabbSid,
      `iteration ${rwData.iteration ?? "?"}`,
    );
  }

  console.log(
    process.exitCode ? "[rewind-E2E] FEL — se ovan" : "[rewind-E2E] KLART — samtliga kontroller gröna",
  );
}

main().catch((fel) => {
  console.error("[rewind-E2E] krash:", fel?.message ?? fel);
  process.exit(1);
});

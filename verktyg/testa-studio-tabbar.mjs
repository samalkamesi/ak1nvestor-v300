#!/usr/bin/env node
/**
 * VÅG 84 BLOCK B — E2E: MULTI-SESSION-TABBAR (mock-transport, dev).
 *
 * Oberoende verifiering av kundkravet "2 tabbar, prompt i tab 1 medan
 * tab 2 får ett svar — oberoende verifierat" + RAM-bevakningen
 * ("3 tabbar × prompt parallellt utan OOM — dokumentera mätning").
 *
 * Flöde (speglar studio-chat.tsx:s tabb-logik exakt):
 *   TABB 1 (huvudtabb): POST {prompt}           → default-transporten.
 *   TABB 2 (ny tabb):    POST {prompt, nyckel}  → frisk per-session-
 *                        transport; "hej" bär sessionId → nästa prompt
 *                        bär {sessionId} (resume-vägen provas också).
 *   PARALLELLITET: tab 1 strömmar fortfarande när tab 2 startar och
 *   får sitt svar — separata transportinstanser, ingen -32010-kollision.
 *   SESSIONSKARTA: GET /api/studio/stream listar sessionId →
 *   {senasteAktivitet, historik, aktiv} för båda sessionerna.
 *   RESUME: GET ?sessionId=<tab2:s session> returnerar historiken —
 *   "resume TIDLIGARE sessioner i nya tabbar".
 *   RAM: Node-processens RSS mäts före / under / efter 3 parallella
 *   strömmar (mock = ingen zcode-barnprocess; mätningen dokumenterar
 *   Next-processens vidd per ström — prod-taket 8 GB gäller N
 *   zcode-barnprocesser enligt STYRELSE-ADMIN-MEGA våg 84 B).
 *
 * Körs med: node verktyg/testa-studio-tabbar.mjs [port]   (default 3000)
 * Kräver dev-läge (NODE_ENV=development ⇒ admin-devfallback gäller).
 */

const PORT = process.argv[2] || "3000";
const BAS = `http://127.0.0.1:${PORT}`;
const HEADERS = { "x-admin-password": "AK1A-2026" }; // dev-fallback (endast development)
const JSON_HEADERS = { ...HEADERS, "Content-Type": "application/json" };

/**
 * Läs en SSE-POST-ström till "klart"/"fel" — returnerar alla events.
 * Mockens permission-/frågedialoger besvaras som UI:t gör (POST
 * /api/studio/interaktion) — bevisar ÄVEN att en dialog från en EGEN
 * tabb (per-session-transport) når rätt transport via requestId-slagningen.
 */
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
    })
      .then((r) => r.json())
      .then((s) => events.push({ typ: "e2e-dialog-svar", requestId: i.requestId, ok: s.ok }))
      .catch(() => undefined);
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
  const ikon = ok ? "PASS" : "FAIL";
  console.log(`  ${ikon}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
  if (!ok) process.exitCode = 1;
};

async function main() {
  console.log(`[tabbar-E2E] mot ${BAS} (dev, mock-transport väntas)`);

  // ── Förutsättning: studion lever ──────────────────────────────────────
  const statusRes = await fetch(`${BAS}/api/studio/stream`, { headers: HEADERS });
  const status = await statusRes.json();
  console.log(`  transport=${status.transport} live=${status.live}`);
  kontroll(
    "GET /api/studio/stream svarar (admin dev-fallback)",
    statusRes.ok && status.live === true,
    `transport ${status.transport}`,
  );

  // ── TABB 1: huvudtabbens prompt (default-transporten) ────────────────
  console.log("[tabb1] skickar prompt (default-flödet, ingen sessionId)…");
  const tabb1Start = Date.now();
  const tabb1Ström = lasSSE({ prompt: "Hej tabb 1 — visa status i projektet just nu?" });

  // Låt tabb 1 komma igång (den SKA fortfarande strömma när tabb 2 startar).
  await new Promise((r) => setTimeout(r, 150));

  // ── TABB 2: ny tabb (nyckel-vägen — frisk per-session-transport) ─────
  console.log("[tabb2] skickar prompt MEDAN tabb 1 strömmar (nyckel=tabb2)…");
  const tabb2Ström = lasSSE({ prompt: "Sammanfatta senaste worklog kort", nyckel: "tabb2" });

  const [e1, e2] = await Promise.all([tabb1Ström, tabb2Ström]);
  const tid1 = Date.now() - tabb1Start;

  const hej1 = e1.find((x) => x.typ === "hej");
  const hej2 = e2.find((x) => x.typ === "hej");
  const klart1 = e1.find((x) => x.typ === "klart");
  const klart2 = e2.find((x) => x.typ === "klart");

  kontroll("tabb 1: hej + sessionId", Boolean(hej1?.sessionId), hej1?.sessionId ?? "saknas");
  kontroll("tabb 2: hej + EGEN sessionId", Boolean(hej2?.sessionId), hej2?.sessionId ?? "saknas");
  kontroll(
    "tabb 1 och tabb 2 har SKILDA sessioner",
    Boolean(hej1?.sessionId && hej2?.sessionId && hej1.sessionId !== hej2.sessionId),
    `${hej1?.sessionId} ≠ ${hej2?.sessionId}`,
  );
  kontroll(
    "tabb 1: klart medan tabb 2 OCKSÅ blev klar (parallellt)",
    Boolean(klart1 && klart2),
    `tabb1 svar=${(klart1?.svar ?? "").slice(0, 40).replace(/\n/g, " ")}… · tabb2 svar=${(klart2?.svar ?? "").slice(0, 40).replace(/\n/g, " ")}…`,
  );
  kontroll(
    "tabb 1:s svar ECHOAR tabb 1:s prompt (oberoende buffertar)",
    (klart1?.svar ?? "").includes("tabb 1"),
    "svaret bär tab 1:s prompttext",
  );
  kontroll(
    "tabb 2:s svar ECHOAR tabb 2:s prompt (oberoende buffertar)",
    (klart2?.svar ?? "").includes("worklog"),
    "svaret bär tab 2:s prompttext",
  );
  const dialogSvar2 = e2.filter((x) => x.typ === "e2e-dialog-svar");
  kontroll(
    "tabb 2:s dialoger besvarade via DELAD rutt (requestId → rätt transport)",
    dialogSvar2.length >= 2 && dialogSvar2.every((d) => d.ok === true),
    `${dialogSvar2.length} dialoger (${dialogSvar2.map((d) => (d.ok ? "ok" : "FEL")).join(", ")})`,
  );
  console.log(`  (tabb 1:s helrunda tog ${tid1} ms — mockens pauser inkluderade)`);

  // ── SESSIONSKARTAN: GET listar båda sessionerna ───────────────────────
  const kartaRes = await fetch(`${BAS}/api/studio/stream`, { headers: HEADERS });
  const kartaSvar = await kartaRes.json();
  const karta = kartaSvar.sessionskarta ?? {};
  const s1 = karta[hej1.sessionId];
  const s2 = karta[hej2.sessionId];
  kontroll(
    "sessionskartan listar TABB 1:s session (senasteAktivitet + historik)",
    Boolean(s1 && typeof s1.senasteAktivitet === "number" && Array.isArray(s1.historik) && s1.historik.length >= 2),
    `${s1 ? `historik ${s1.historik.length} poster · aktiv=${s1.aktiv}` : "saknas"}`,
  );
  kontroll(
    "sessionskartan listar TABB 2:s session",
    Boolean(s2 && Array.isArray(s2.historik) && s2.historik.length >= 2),
    `${s2 ? `historik ${s2.historik.length} poster · aktiv=${s2.aktiv}` : "saknas"}`,
  );
  kontroll(
    "kartan: ingen session markerad aktiv efter klart",
    s1?.aktiv === false && s2?.aktiv === false,
    `aktiv1=${s1?.aktiv} aktiv2=${s2?.aktiv}`,
  );

  // ── RESUME I NY TABB: GET ?sessionId= + prompt på sessionId-vägen ─────
  const resumeRes = await fetch(
    `${BAS}/api/studio/stream?sessionId=${encodeURIComponent(hej2.sessionId)}`,
    { headers: HEADERS },
  );
  const resumeSvar = await resumeRes.json();
  const resumeHistorikText = (resumeSvar.historik ?? []).map((h) => h.text).join("\n");
  kontroll(
    "GET ?sessionId= (resume i ny tabb) returnerar historiken",
    resumeRes.ok && resumeHistorikText.includes("worklog"),
    `${resumeSvar.historik?.length ?? 0} meddelanden`,
  );

  // Andra prompten i tabb 2 = {prompt, sessionId}-vägen (samma transport).
  const e2b = await lasSSE({ prompt: "Follow-up: nämn worklog igen", sessionId: hej2.sessionId });
  const hej2b = e2b.find((x) => x.typ === "hej");
  kontroll(
    "andra prompten i tabb 2 bär sessionId (samma session lever)",
    hej2b?.sessionId === hej2.sessionId && e2b.some((x) => x.typ === "klart"),
    `sessionId stabilt: ${hej2b?.sessionId}`,
  );

  // ── FELVÄG: ogiltigt sessions-id nekas ärligt ────────────────────────
  const felRes = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ prompt: "test", sessionId: "sess_fel_finns_inte_123" }),
  });
  const felSvar = await felRes.json().catch(() => ({}));
  kontroll(
    "borta session ⇒ ärligt fel (ALDRIG tyst ny session)",
    felRes.status === 502 && typeof felSvar.fel === "string" && felSvar.fel.length > 0,
    (felSvar.fel ?? "").slice(0, 60),
  );

  // ── RAM-BEVAKNING: 3 parallella strömmar + RSS-mätning ────────────────
  console.log("[ram] 3 parallella prompter (huvud + 2 egna tabbar) + RSS-mätning…");
  const rssFör = await hamtaRss();
  const strömmar = [
    lasSSE({ prompt: "RAM-mätning A: kort status" }),
    lasSSE({ prompt: "RAM-mätning B: kort status", nyckel: "ram-b" }),
    lasSSE({ prompt: "RAM-mätning C: kort status", nyckel: "ram-c" }),
  ];
  await new Promise((r) => setTimeout(r, 700)); // mitt i strömmarna
  const rssUnder = await hamtaRss();
  const resultat = await Promise.all(strömmar);
  const rssEfter = await hamtaRss();
  kontroll(
    "3 parallella tabbar × prompt KLARA samtidigt (ingen OOM/kollision)",
    resultat.every((events) => events.some((x) => x.typ === "klart")),
    `3/3 strömmar klara`,
  );
  console.log(
    `  RAM-MÄTNING (Node dev-process, mock-läge): RSS före=${mb(rssFör)} · under 3 strömmar=${mb(rssUnder)} · efter=${mb(rssEfter)} · höjning=${mb(rssEfter - rssFör)}`,
  );

  console.log(process.exitCode ? "[tabbar-E2E] MINST EN KONTROLL MISSLYCKADES" : "[tabbar-E2E] ALLA KONTROLLER GRÖNA");
}

/** RSS (byte) för processen som lyssnar på PORT (win: netstat+tasklist). */
async function hamtaRss() {
  try {
    const { execSync } = await import("node:child_process");
    if (process.platform === "win32") {
      const netstat = execSync("netstat -ano", { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
      const rad = netstat
        .split("\n")
        .map((r) => r.trim())
        .find((r) => r.toUpperCase().startsWith("TCP") && r.includes(`:${PORT}`) && /LISTENING/i.test(r));
      if (!rad) return -1;
      const pid = rad.split(/\s+/).pop();
      const ut = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: "utf8" });
      // "node.exe","13920","Console","1","484 596 K" — tusentalsavgränsaren
      // är plattformsberoende (mellansrag/decimalkomma/UE+201A) → strimla
      // ALLT utom siffror ur minnesfältet (kolumn 5).
      const kolumn = ut.split('","')[4] ?? "";
      const siffror = kolumn.replace(/[^\d]/g, "");
      return siffror ? Math.round(parseInt(siffror, 10) * 1024) : -1;
    }
    const ut = execSync('ps -eo rss,args | grep -E "next|node" | grep -v grep | head -1', {
      encoding: "utf8",
    });
    const m = /^\s*(\d+)/.exec(ut);
    return m ? Number(m[1]) * 1024 : -1;
  } catch {
    return -1;
  }
}

const mb = (b) => (b < 0 ? "?" : `${(b / 1024 / 1024).toFixed(1)} MB`);

main().catch((fel) => {
  console.error("[tabbar-E2E] FEL:", fel.message);
  process.exit(1);
});

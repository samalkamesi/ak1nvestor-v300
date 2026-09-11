#!/usr/bin/env node
/**
 * VÅG 95 — TTFB-MÄTNING FÖR STUDION (kundproblemet "sega", källa 3:
 * SSE-strömningens tid-till-första-tecken; STYRELSE-ADMIN-MEGA våg 95).
 *
 * Mäter mot /api/studio/stream (POST {prompt} → SSE), per iteration:
 *   · headers   — POST → svarshuvuden (första byte-nivån; Next/route-hit)
 *   · hej       — POST → "hej"-eventet (transport + sessionId löst = den
 *                 punkt där strömmen ÖPPNATS; på prod inkluderar detta ev.
 *                 resume/create-kostnaden — våg 95:s friskgångsregel)
 *   · TTFB      — POST → FÖRSTA text-delta (kanal "text") = kundens
 *                 upplevda "första tecken"-latens
 *   · total     — POST → "klart"/"fel" (hela rundan)
 *
 * Verktygsdialoger (mockens permission-/frågekort) besvaras OMEDELBART
 * (allow_once) — samma mönster som verktyg/testa-studio-tabbar.mjs — så
 * mätningen speglar strömningen, inte 30 s-dialogvakter.
 *
 * Körs med: node verktyg/testa-studio-ttfb.mjs [port] [antal]
 *   port  default 3000 · antal iterationer default 5
 *   Kräver dev-läge (NODE_ENV=development ⇒ admin-devfallback gäller) med
 *   mock-transport (win32-default) — DEV-BASLINJE. PROD-BASLINJE mäts EFTER
 *   deploy av main: samma kommando mot lab.ak1nvestor.com med riktigt
 *   x-admin-password (STUDIO_TRANSPORT=appserver där — hej/TTFB bär då
 *   barnprocess-kostnaden; jämför före/efter våg 95:s varmförhållning).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

const PORT = process.argv[2] || "3000";
const ANTAL = Math.max(1, Math.min(20, Number(process.argv[3]) || 5));
const BAS = `http://127.0.0.1:${PORT}`;
const HEADERS = { "x-admin-password": "AK1A-2026" }; // dev-fallback (endast development)
const JSON_HEADERS = { ...HEADERS, "Content-Type": "application/json" };

/**
 * EN mät-runda: POST en kort kundprompt, läs SSE:t och stämpla tider.
 * Returnerar { headers, hej, ttfb, total, events, fel } (ms; null när
 * punkten ej nåddes — t.ex. fel-event före första delta).
 */
async function mätRunda(nummer) {
  const prompt = `TTFB-mätning våg 95 — runda ${nummer}. Svara kort.`;
  const t0 = Date.now();
  const res = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ prompt }),
  });
  const headers = Date.now() - t0;
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    return { headers, hej: null, ttfb: null, total: Date.now() - t0, events: 0, fel: data.fel ?? `HTTP ${res.status}` };
  }
  const lasare = res.body.getReader();
  const avkodare = new TextDecoder();
  let buffert = "";
  let hej = null;
  let ttfb = null;
  let events = 0;
  let fel = null;
  const besvarade = new Set();
  const svaraDialog = (event) => {
    // Mockens dialoger besvaras på en gång — mät skall mäta STRÖMNING.
    if (!event.interaktion || besvarade.has(event.interaktion.requestId)) return;
    besvarade.add(event.interaktion.requestId);
    const i = event.interaktion;
    const body =
      i.typ === "permission"
        ? { typ: "permission", requestId: i.requestId, alternativ: "allow_once" }
        : { typ: "fråga", requestId: i.requestId, varde: "Ja, kort svar (TTFB-mätning)" };
    fetch(`${BAS}/api/studio/interaktion`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    }).catch(() => undefined);
  };
  let färdig = false;
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
      if (!dataRad) continue; // ": ping"-heartbeat m.m.
      let event;
      try {
        event = JSON.parse(dataRad.slice(6));
      } catch {
        continue;
      }
      events += 1;
      if (hej === null && event.typ === "hej") hej = Date.now() - t0;
      if (ttfb === null && event.typ === "delta" && event.kanal === "text") ttfb = Date.now() - t0;
      if (event.typ === "interaktion") svaraDialog(event);
      if (event.typ === "klart" || event.typ === "fel") {
        if (event.typ === "fel") fel = event.meddelande ?? "okänt fel";
        färdig = true;
      }
    }
  }
  await lasare.cancel().catch(() => undefined);
  return { headers, hej, ttfb, total: Date.now() - t0, events, fel };
}

const median = (värden) => {
  const tal = värden.filter((v) => typeof v === "number").sort((a, b) => a - b);
  if (tal.length === 0) return null;
  const mittpunkt = Math.floor(tal.length / 2);
  return tal.length % 2 ? tal[mittpunkt] : Math.round((tal[mittpunkt - 1] + tal[mittpunkt]) / 2);
};

async function main() {
  console.log(`[studio-TTFB] mot ${BAS} · ${ANTAL} iterationer · mock förväntas i dev`);

  // Förutsättning: studion lever (GET värmer OCKSÅ transporten — notera
  // transport-namnet; på prod skiljer sig rung 1 (kall) från senare (varm)).
  const statusRes = await fetch(`${BAS}/api/studio/stream`, { headers: HEADERS });
  const status = await statusRes.json().catch(() => ({}));
  console.log(`  transport=${status.transport} live=${status.live}`);
  if (!statusRes.ok) {
    console.error("FAIL  GET /api/studio/stream svarade ej — är dev-servern uppe?");
    process.exit(1);
  }

  const runder = [];
  for (let i = 1; i <= ANTAL; i += 1) {
    const r = await mätRunda(i);
    runder.push(r);
    console.log(
      `  runda ${String(i).padStart(2)}: headers=${r.headers} ms · hej=${r.hej ?? "—"} ms · ` +
        `TTFB=${r.ttfb ?? "—"} ms · total=${r.total} ms · ${r.events} events${r.fel ? ` · FEL: ${r.fel}` : ""}`,
    );
  }

  const sammanfatta = (fält) => {
    const tal = runder.map((r) => r[fält]).filter((v) => typeof v === "number");
    if (tal.length === 0) return "—";
    return `min=${Math.min(...tal)} · median=${median(tal)} · max=${Math.max(...tal)} ms (n=${tal.length})`;
  };
  console.log("\n[studio-TTFB] SAMMANFATTNING");
  console.log(`  POST → svarshuvuden : ${sammanfatta("headers")}`);
  console.log(`  POST → hej-event    : ${sammanfatta("hej")}`);
  console.log(`  POST → första delta : ${sammanfatta("ttfb")}`);
  console.log(`  POST → klart        : ${sammanfatta("total")}`);
  const felRunder = runder.filter((r) => r.fel);
  if (felRunder.length > 0) {
    console.error(`FAIL  ${felRunder.length}/${ANTAL} rundor felade`);
    process.exit(1);
  }
  console.log(
    `\n[studio-TTFB] BASLINJE (dev-mock, ${new Date().toISOString()}) — ` +
      `prod mäts efter deploy av main med riktigt lösenord mot samma endpoint.`,
  );
}

main().catch((fel) => {
  console.error(`FAIL  ${fel instanceof Error ? fel.message : String(fel)}`);
  process.exit(1);
});

/**
 * VBOUT-ADAPTER — skickar leads till kundens Vbout-automation via dess
 * incoming webhook (vbt.ak1nvestor.com/Webhook/{guid}/ → ssl.vbt.io).
 *
 * Kundens webhook-URL innehåller två hemliga GUID:er → den läses ENDAST ur
 * env VBOUT_WEBHOOK_URL (lokal .env.local + Vercel env). ALDRIG i kod,
 * exempel eller loggar (credentials only from env).
 *
 * Payload: Vbout-automationer mappar JSON-fält i sitt gränssnitt — vi
 * skickar {email, namn, kalla, notering, sida, tid}. Justera mappningen i
 * Vbout-editorn (fält som saknas ignoreras där).
 *
 * Säkerhet (samma mönster som src/lib/zai.ts): valideraEndpoint() tvingar
 * https + host-vitlista + publika IP:er (DNS-rebinding-skydd) och returnerar
 * ett URL-OBJEKT som är det enda som fetch:as; redirect avslås; 10 s timeout;
 * funktionen kastar ALDRIG — lead-flödena får aldrig bromsas.
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const VBOUT_VARDAR = new Set(["vbt.ak1nvestor.com", "ssl.vbt.io"]);

export type VboutLead = {
  email: string;
  namn?: string;
  /** Var leadet föddes: "medlem" | "fas2-ansok" | "prenumeration" | "nyhetsbrev" | "manuell" */
  kalla: string;
  /** Fri text: ev. nivå/intresse/meddelande */
  notering?: string;
};

export type VboutResultat = { ok: boolean; status?: number; fel?: string };

/** Läsbar felrapport för loggar/admin (t.ex. "HTTP 404" eller felmeddelande). */
export function vboutStatusText(r: VboutResultat): string {
  if (r.ok) return "levererad";
  return r.fel ?? (r.status ? `HTTP ${r.status}` : "okänt fel");
}

export function vboutKonfigurerad(): boolean {
  const u = process.env.VBOUT_WEBHOOK_URL;
  return typeof u === "string" && u.startsWith("https://");
}

/** IP får aldrig vara loopback/privat/link-local/CGNAT/ULA/molnmetadata. */
function ipArPrivat(ip: string): boolean {
  const v = ip.split(".").map(Number);
  if (v.length === 4 && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = v;
    if (a === 0 || a === 10 || a === 127) return true;               // this/privat/loopback
    if (a === 169 && b === 254) return true;                          // link-local + metadata
    if (a === 172 && b >= 16 && b <= 31) return true;                 // privat
    if (a === 192 && b === 168) return true;                          // privat
    if (a === 100 && b >= 64 && b <= 127) return true;                // CGNAT
    return false;
  }
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  if (v6.startsWith("fe80:") || v6.startsWith("fc") || v6.startsWith("fd")) return true;
  return false;
}

/**
 * Validera webhook-endpoint enligt säkerhetspolicy (zai.ts-mönstret):
 * endast https, allow-listad host, och hostens DNS-lagda IP:er måste vara
 * publika (stoppar DNS-rebinding mot inre nät). Returnerar URL-objektet —
 * det är ENBART detta objekt som fetch:as.
 */
async function valideraEndpoint(): Promise<URL> {
  const bas = process.env.VBOUT_WEBHOOK_URL;
  if (!bas) throw new Error("VBOUT_WEBHOOK_URL saknas");
  const u = new URL(bas);
  if (u.protocol !== "https:") throw new Error("Ogiltigt protokoll");
  if (!VBOUT_VARDAR.has(u.hostname)) throw new Error("Host ej tillåten");
  const poster = await lookup(u.hostname, { all: true });
  for (const p of poster) {
    if (isIP(p.address) === 0 || ipArPrivat(p.address)) {
      throw new Error("Hostens IP är ej publik");
    }
  }
  return u;
}

/** Skicka lead till Vbout — fire-and-forget-vänlig (returnerar status, kastar aldrig). */
export async function skickaVboutLead(lead: VboutLead): Promise<VboutResultat> {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) {
    return { ok: false, fel: "ogiltig e-post" };
  }

  let url: URL;
  try {
    url = await valideraEndpoint();
  } catch (e) {
    return { ok: false, fel: "endpoint underkänd: " + String((e as Error)?.message ?? e).slice(0, 80) };
  }

  const brodtext = JSON.stringify({
    email: lead.email,
    namn: (lead.namn ?? "").slice(0, 120),
    kalla: lead.kalla.slice(0, 60),
    notering: (lead.notering ?? "").slice(0, 300),
    sida: "lab.ak1nvestor.com",
    tid: new Date().toISOString(),
  });

  const kontroll = new AbortController();
  const stoppa = setTimeout(() => kontroll.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: brodtext,
      redirect: "error",
      signal: kontroll.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, fel: String((e as Error)?.message ?? e).slice(0, 120) };
  } finally {
    clearTimeout(stoppa);
  }
}

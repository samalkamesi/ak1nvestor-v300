import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { publiceraSignal } from "@/lib/signal-bus";

/**
 * VBT-WEBHOOK — mottagare för händelser från vbt.ak1nvestor.com (CNAME →
 * ssl.vbt.io). Kunden konfigurerade webhook-URL:en 2026-09-04; leverantörens
 * exakta payload/signaturformat är ännu inte dokumenterat — därför:
 *
 *  - POST accepteras och loggas SANERAT (typ/event-namn + storlek, aldrig
 *    rå body — kan innehålla personuppgifter vi inte ska lagra blint).
 *  - Om VBT_WEBHOOK_SECRET är satt krävs matchning i x-vbt-secret eller
 *    Authorization: Bearer (timing-safe). Utan secret: händelsen loggas
 *    med flaggan overifierad=true.
 *  - Kunden pekar om leverantörens webhook till:
 *      https://lab.ak1nvestor.com/api/webhook/vbt
 *    och sätter samma hemlighet hos leverantören + i Vercel env.
 *
 * När leverantörsdokumentation finns: bygg exakt signaturvalidering
 * (HMAC enligt deras spec) + riktig event-mappning (betalning bekräftad →
 * notis + aktivering).
 *
 * Säkerhetsnotering: inga nätverksanrop styrs av request-data — publicera-
 * funktionerna anropar fasta, env-konfigurerade destinations-URL:er.
 */

const MAX_BODY = 64 * 1024;
const RATE_FONSTER = 60_000;
const RATE_MAX = 60;
const rateKarta = new Map<string, { n: number; start: number }>();

/** Rate-nyckel: enbart hex-tecken (middleware:s ip-hash) eller "okand" —
 *  används ALDRIG som destinations-data, bara som Map-uppslagningsnyckel. */
function rateNyckelFran(req: NextRequest): string {
  const rå = req.headers.get("x-ak1a-ip-hash") ?? "";
  return /^[a-f0-9]{1,24}$/.test(rå) ? rå : "okand";
}

function rateBegransad(nyckel: string): boolean {
  const nu = Date.now();
  const r = rateKarta.get(nyckel);
  if (!r || nu - r.start > RATE_FONSTER) {
    rateKarta.set(nyckel, { n: 1, start: nu });
    return false;
  }
  r.n += 1;
  return r.n > RATE_MAX;
}

function hemlighetOk(req: NextRequest): boolean {
  const secret = process.env.VBT_WEBHOOK_SECRET;
  if (!secret) return true; // ingen secret konfigurerad → overifierat läge
  const framtagen =
    req.headers.get("x-vbt-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  const a = Buffer.from(framtagen);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (rateBegransad(rateNyckelFran(req))) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const harSecret = Boolean(process.env.VBT_WEBHOOK_SECRET);
  if (!hemlighetOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let typ = "okand";
  let eventNamn: string | null = null;
  let bytes = 0;
  try {
    const raw = await req.text();
    bytes = Buffer.byteLength(raw, "utf8");
    if (bytes > MAX_BODY) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }
    if (raw) {
      const j = JSON.parse(raw) as Record<string, unknown>;
      // Vanliga webhook-konventioner — lagra endast identifierare, aldrig innehåll
      typ =
        typeof j.type === "string"
          ? j.type.slice(0, 60)
          : typeof j.event === "string"
            ? j.event.slice(0, 60)
            : typ;
      eventNamn =
        typeof j.eventType === "string"
          ? j.eventType.slice(0, 60)
          : typeof j.action === "string"
            ? (j.action as string).slice(0, 60)
            : null;
    }
  } catch {
    // ogiltig JSON — loggas som sådan; 200 så leverantören inte spammar om
    typ = "ogiltig-json";
  }

  await publiceraOrganEvent({
    source: "webhook/vbt",
    verb: "rapport",
    matt: { typ, event: eventNamn ?? typ, bytes, overifierad: !harSecret ? 1 : 0 },
  }).catch(() => undefined);

  // Hittills okänd leverantör — synliggör för admin tills mappning finns
  await publiceraSignal({
    kalla: "webhook/vbt",
    typ: "beslut",
    rubrik: `VBT-webhook: ${typ}`,
    text: `Händelse mottagen (${bytes} B${harSecret ? ", verifierad" : ", OVERIFIERAD — sätt VBT_WEBHOOK_SECRET"}).`,
    ikon: "🔗",
    mottagare: "admin",
    lank: "/admin",
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      info: "VBT-webhook-mottagare. POSTa händelser hit. Sätt VBT_WEBHOOK_SECRET för verifiering.",
    },
    { status: 200 },
  );
}

/**
 * E-POST-SÄNDARE — leverantörsadapter för AK1A:s mejl (VÅG 50: "bygg klart
 * det som saknas — kunder ska kunna få mejl-utskick!").
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  SÅ SÄTTER KUNDEN UPP FAKTISKT UTSKICK (gå igenom med kunden):          │
 * │                                                                         │
 * │  1. Skapa konto hos Resend (https://resend.com) ELLER SendGrid          │
 * │     (https://sendgrid.com) och verifiera avsändardomänen               │
 * │     (ak1nvestor.com — eller den domän breven ska komma från).          │
 * │  2. Skapa en API-nyckel i leverantörens dashboard.                     │
 * │  3. Sätt miljövariablerna i Vercel (Settings → Environment Variables)   │
 * │     och lokalt i .env.local:                                            │
 * │                                                                         │
 * │     EMAIL_LEVERANTOR=resend        # eller: sendgrid                   │
 * │     EMAIL_API_KEY=re_xxx...        # leverantörens API-nyckel          │
 * │     EMAIL_FROM="AK1A Research Lab <info@ak1nvestor.com>"  # VALFRITT — │
 * │                                    # måste vara verifierad hos leverantören │
 * │                                                                         │
 * │   Bakåtkompatibelt: sätts INTE EMAIL_LEVERANTOR tolas äldre             │
 * │   RESEND_API_KEY → resend respektive SENDGRID_API_KEY → sendgrid.       │
 * │                                                                         │
 * │  4. Utan dessa variabler händer EXAKT samma sak som idag: breven        │
 * │     köas i system_events (type=email_kö) och svaret säger               │
 * │     "köad (leverantör saknas)". När variablerna sätts börjar           │
 * │     utskicken fungera utan någon kodändring — kön töms av cron 06:30    │
 * │     och direktskick sker via /api/email.                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Säkerhet:
 *  - API-nyckeln läses ENDAST server-side (route handlers, runtime=nodejs).
 *  - Härdkodad HOST-ALLOWLIST: adaptern hämtar enbart från api.resend.com
 *    eller api.sendgrid.com — destinations-URL kan aldrig styras utifrån.
 *  - Alla anrop är tidsbegränsade (10 s) och kastar ALDRIG — resultatet
 *    bärs av returvärdet, så kön är sanningen även vid leverantörsfel.
 *
 * Pedagogisk analys — inte investeringsråd.
 */

export type MejlLeverantor = "resend" | "sendgrid" | null;

/** Leverantörernas API-endpoints — allowlist, aldrig miljöstyrd. */
const ENDPOINTS = {
  resend: "https://api.resend.com/emails",
  sendgrid: "https://api.sendgrid.com/v3/mail/send",
} as const;

/** Default-avsändare — byts ut med EMAIL_FROM (måste vara verifierad). */
const STANDARD_AVSANDARE = "AK1A Research Lab <info@ak1nvestor.com>";

export type LeverantorStatus = {
  leverantor: MejlLeverantor;
  /** true när både leverantör och API-nyckel är satta. */
  konfigurerad: boolean;
  avsandare: string;
};

/**
 * Läser av miljön: explicit EMAIL_LEVERANTOR vinner; annars tolas äldre
 * RESEND_API_KEY/SENDGRID_API_KEY (bakåtkompatibelt med cron/email:s
 * tidigare leverantorKonfigurerad-flagga). EMAIL_API_KEY gäller båda.
 */
export function lasLeverantor(): LeverantorStatus {
  const explicit = (process.env.EMAIL_LEVERANTOR || "").trim().toLowerCase();
  const generellNyckel = (process.env.EMAIL_API_KEY || "").trim();

  let leverantor: MejlLeverantor = null;
  if (explicit === "resend" || explicit === "sendgrid") {
    leverantor = explicit;
  } else if (process.env.RESEND_API_KEY?.trim()) {
    leverantor = "resend";
  } else if (process.env.SENDGRID_API_KEY?.trim()) {
    leverantor = "sendgrid";
  }

  const nyckelFinns =
    Boolean(generellNyckel) ||
    (leverantor === "resend" && Boolean(process.env.RESEND_API_KEY?.trim())) ||
    (leverantor === "sendgrid" && Boolean(process.env.SENDGRID_API_KEY?.trim()));

  // Explicit leverantör utan nyckel = ej konfigurerad (ägaren menar inget utskick ännu).
  if (leverantor && !nyckelFinns) leverantor = null;

  return {
    leverantor,
    konfigurerad: leverantor !== null && nyckelFinns,
    avsandare: (process.env.EMAIL_FROM || "").trim() || STANDARD_AVSANDARE,
  };
}

function nyckelFor(leverantor: Exclude<MejlLeverantor, null>): string {
  return (
    process.env.EMAIL_API_KEY?.trim() ||
    (leverantor === "resend" ? process.env.RESEND_API_KEY?.trim() : process.env.SENDGRID_API_KEY?.trim()) ||
    ""
  );
}

export type SkickaResultat = {
  skickad: boolean;
  leverantor: MejlLeverantor;
  /** Maskinläsbar människostatus — samma sträng som API:et svarar med. */
  status: string;
  /** Leverantörens meddelande-id när skickat (för spårning). */
  id?: string;
  fel?: string;
};

/**
 * Skicka ETT färdigmallat brev via konfigurerad leverantör. Kastar aldrig.
 * Utan konfigurerad leverantör returneras status "köad (leverantör saknas)".
 */
export async function skickaMejl(arg: {
  till: string;
  amne: string;
  html: string;
}): Promise<SkickaResultat> {
  const { leverantor, konfigurerad, avsandare } = lasLeverantor();
  if (!leverantor || !konfigurerad) {
    return { skickad: false, leverantor: null, status: "köad (leverantör saknas)" };
  }

  const url = ENDPOINTS[leverantor];
  const nyckel = nyckelFor(leverantor);

  // Referensbegäran per leverantör — body byggs internt, ingen URL/data från klienten.
  let res: Response;
  try {
    if (leverantor === "resend") {
      res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nyckel}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: avsandare, to: [arg.till], subject: arg.amne, html: arg.html }),
        signal: AbortSignal.timeout(10_000),
      });
    } else {
      res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nyckel}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: arg.till }] }],
          from: { email: avsandare.replace(/^[^<]*<|>$/g, "").trim() || avsandare },
          subject: arg.amne,
          content: [{ type: "text/html; charset=utf-8", value: arg.html }],
        }),
        signal: AbortSignal.timeout(10_000),
      });
    }
  } catch (e) {
    // Nätverksfel/timeout — brevet stannar i kön, ärlig status tillbaka.
    const orsak = e instanceof Error ? e.name : "okänt fel";
    return {
      skickad: false,
      leverantor,
      status: `köad (leverantörfel: ${orsak})`,
      fel: orsak,
    };
  }

  if (!res.ok) {
    // SendGrid svarar 202 vid framgång; Resend 200. Felkoden följer med kort.
    return {
      skickad: false,
      leverantor,
      status: `köad (leverantörfel: HTTP ${res.status})`,
      fel: `HTTP ${res.status}`,
    };
  }

  let id: string | undefined;
  try {
    const body = (await res.json()) as { id?: string; message_id?: string };
    id = body.id ?? body.message_id;
  } catch {
    // SendGrid svarar utan body — id får vara tomt.
  }

  return { skickad: true, leverantor, status: `skickad via ${leverantor}`, id };
}

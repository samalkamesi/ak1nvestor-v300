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
 * │     och lokalt i .env.local:                                           │
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
 * │     köas i system_events (type=email_kö) och svaret säger              │
 * │     "köad (leverantör saknas)". När variablerna sätts börjar           │
 * │     utskicken fungera utan någon kodändring — kön töms av cron 06:30    │
 * │     och direktskick sker via /api/email.                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ARBETSSTATION 2, 2026-10-02 — BREVO-LEDEN + SÄNDKEDJAN (failover):
 *   Strategibeslut (kundorder "full automation", journalförd): primärkanal
 *   = BREVO (kundens gamla Sendinblue-konto, gratis 300/dag, transaktionellt
 *   REST-API) med AUTOMATISK fallback till resend → sendgrid. VBOUT (se
 *   src/lib/vbout-api.ts) är EGEN modul med EGEN nyckeltolkning (EMAIL_API_KEY)
 *   — BREVO läser ENDAST BREVO_API_KEY för att nycklarna aldrig ska kollidera.
 *   Kedjan ägs av VÅR mejlkö: dör en leverantör/konkar ett bolag faller
 *   brevet automatiskt till nästa — kundens oberoendekrav (2026-10-02).
 *
 * Säkerhet:
 *  - API-nyckeln läses ENDAST server-side (route handlers, runtime=nodejs).
 *  - Härdkodad HOST-ALLOWLIST: adaptern hämtar enbart från api.brevo.com,
 *    api.resend.com eller api.sendgrid.com — destinations-URL kan aldrig
 *    styras utifrån (Mimosa-regeln: fasta https-konstanter).
 *  - Alla anrop är tidsbegränsade (10 s) och kastar ALDRIG — resultatet
 *    bärs av returvärdet, så kön är sanningen även vid leverantörsfel.
 *
 * Pedagogisk analys — inte investeringsråd.
 */

export type MejlLeverantor = "brevo" | "resend" | "sendgrid" | null;

/** Leverantörernas API-endpoints — allowlist, aldrig miljöstyrd. */
const ENDPOINTS = {
  brevo: "https://api.brevo.com/v3/smtp/email",
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
 * BREVO ingår EJ här (den läser ENDAST BREVO_API_KEY — se kedjan nedan).
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
  if (leverantor === "brevo") return process.env.BREVO_API_KEY?.trim() || "";
  return (
    process.env.EMAIL_API_KEY?.trim() ||
    (leverantor === "resend" ? process.env.RESEND_API_KEY?.trim() : process.env.SENDGRID_API_KEY?.trim()) ||
    ""
  );
}

/** Brevo konfigurerat? (ENDAST BREVO_API_KEY — kollisionsskydd mot VBOUT:s EMAIL_API_KEY.) */
export function brevoKonfigurerad(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

/**
 * Dela avsändarsträngen "Namn <epost>" i Brevo:s sender-objekt. Ren funktion —
 * hermetiskt testbar; okända format ger e-posten hela vägen (Brevo validerar
 * själv och en ev. felkod returneras ärligt till kön).
 */
export function delaAvsandare(avsandare: string): { name: string; email: string } {
  const m = avsandare.trim().match(/^([^<]*)<([^>]+)>$/);
  if (!m || m.length < 3) return { name: "AK1A Research Lab", email: avsandare.trim() };
  return { name: (m[1] || "").trim() || "AK1A Research Lab", email: (m[2] || "").trim() };
}

/** Brevo:s begäran-kropp som ren byggare — hermetiskt testbar, inget nät. */
export function brevoKropp(arg: { till: string; amne: string; html: string; avsandare: string }): {
  sender: { name: string; email: string };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
  textContent: string;
} {
  const sender = delaAvsandare(arg.avsandare);
  const text = arg.html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
  return {
    sender,
    to: [{ email: arg.till }],
    subject: arg.amne,
    htmlContent: arg.html,
    textContent: text || arg.amne,
  };
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
 * Prioritering (strategin 2026-10-02): brevo → resend/sendgrid enligt env.
 */
export async function skickaMejl(arg: {
  till: string;
  amne: string;
  html: string;
}): Promise<SkickaResultat> {
  const brevo = brevoKonfigurerad();
  const { leverantor, konfigurerad, avsandare } = lasLeverantor();
  if (!brevo && (!leverantor || !konfigurerad)) {
    return { skickad: false, leverantor: null, status: "köad (leverantör saknas)" };
  }

  const vald: Exclude<MejlLeverantor, null> = brevo ? "brevo" : (leverantor as Exclude<MejlLeverantor, null>);
  const url = ENDPOINTS[vald];
  const nyckel = nyckelFor(vald);

  // Referensbegäran per leverantör — body byggs internt, ingen URL/data från klienten.
  let res: Response;
  try {
    if (vald === "brevo") {
      res = await fetch(url, {
        method: "POST",
        headers: { "api-key": nyckel, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(brevoKropp({ ...arg, avsandare })),
        signal: AbortSignal.timeout(10_000),
      });
    } else if (vald === "resend") {
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
      leverantor: vald,
      status: `köad (leverantörfel: ${orsak})`,
      fel: orsak,
    };
  }

  if (!res.ok) {
    // SendGrid svarar 202 vid framgång; Resend 200; Brevo 201. Felkoden följer med kort.
    return {
      skickad: false,
      leverantor: vald,
      status: `köad (leverantörfel: HTTP ${res.status})`,
      fel: `HTTP ${res.status}`,
    };
  }

  let id: string | undefined;
  try {
    const body = (await res.json()) as { id?: string; message_id?: string; messageId?: string };
    id = body.id ?? body.message_id ?? body.messageId;
  } catch {
    // SendGrid svarar utan body — id får vara tomt.
  }

  return { skickad: true, leverantor: vald, status: `skickad via ${vald}`, id };
}

// ── SÄNDKEDJAN (arbetsstation 2, 2026-10-02) ─────────────────────────────────

export type KedjeResultat = SkickaResultat & {
  /** Vilka led som prövades, i ordning — varje misslyckat led bär sin felorsak. */
  provade: { leverantor: Exclude<MejlLeverantor, null>; fel?: string }[];
};

/**
 * Ren kedjeplanering — hermetiskt testbar utan nät: vilka led kommer att
 * prövas, i vilken ordning, givet en env-ögonblicksbild? Brevo först (strategin),
 * därefter resend/sendgrid enligt gällande tolkning.
 */
export function kedjePlan(env: {
  BREVO_API_KEY?: string;
  EMAIL_LEVERANTOR?: string;
  EMAIL_API_KEY?: string;
  RESEND_API_KEY?: string;
  SENDGRID_API_KEY?: string;
}): Exclude<MejlLeverantor, null>[] {
  const led: Exclude<MejlLeverantor, null>[] = [];
  if (env.BREVO_API_KEY?.trim()) led.push("brevo");
  const explicit = (env.EMAIL_LEVERANTOR || "").trim().toLowerCase();
  const generell = Boolean(env.EMAIL_API_KEY?.trim());
  let resten: Exclude<MejlLeverantor, null> | null = null;
  if (explicit === "resend" || explicit === "sendgrid") {
    resten = explicit;
  } else if (env.RESEND_API_KEY?.trim()) {
    resten = "resend";
  } else if (env.SENDGRID_API_KEY?.trim()) {
    resten = "sendgrid";
  }
  const restenNyckel =
    generell ||
    (resten === "resend" && Boolean(env.RESEND_API_KEY?.trim())) ||
    (resten === "sendgrid" && Boolean(env.SENDGRID_API_KEY?.trim()));
  if (resten && restenNyckel && !led.includes(resten)) led.push(resten);
  return led;
}

/**
 * Skicka via SÄNDKEDJAN: brevo → resend → sendgrid. Vid fel/limit/död
 * leverantör faller brevet automatiskt till nästa led; kön förblir sanningen.
 * Kastar ALDRIG. Utan konfigurerat led: "köad (leverantör saknas)".
 * Env pinnas led för led och återställs GARANTERAT (finally) — kedjan får
 * aldrig läcka sina pinningar till övriga flöden.
 */
export async function skickaMejlKedja(arg: {
  till: string;
  amne: string;
  html: string;
}): Promise<KedjeResultat> {
  const original = {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    EMAIL_LEVERANTOR: process.env.EMAIL_LEVERANTOR,
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  };
  const plan = kedjePlan(original);
  const provade: KedjeResultat["provade"] = [];
  if (plan.length === 0) {
    return { skickad: false, leverantor: null, status: "köad (leverantör saknas)", provade };
  }
  try {
    for (const led of plan) {
      process.env.BREVO_API_KEY = led === "brevo" ? original.BREVO_API_KEY : "";
      process.env.EMAIL_LEVERANTOR = led === "brevo" ? "" : led;
      const r = await skickaMejl(arg);
      if (r.skickad) {
        return { ...r, provade };
      }
      provade.push({ leverantor: (r.leverantor ?? led) as Exclude<MejlLeverantor, null>, fel: r.fel });
    }
    return {
      skickad: false,
      leverantor: null,
      status: "köad (alla led misslyckades)",
      fel: "kedja-tom",
      provade,
    };
  } finally {
    process.env.BREVO_API_KEY = original.BREVO_API_KEY;
    process.env.EMAIL_LEVERANTOR = original.EMAIL_LEVERANTOR;
    process.env.EMAIL_API_KEY = original.EMAIL_API_KEY;
    process.env.RESEND_API_KEY = original.RESEND_API_KEY;
    process.env.SENDGRID_API_KEY = original.SENDGRID_API_KEY;
  }
}

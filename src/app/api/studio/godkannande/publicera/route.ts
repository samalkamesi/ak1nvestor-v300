/**
 * /api/studio/godkannande/publicera — KUNDENS PUBLICERINGSKNAPP (mega g1,
 * styrelsens beslut punkt 1). DETTA ÄR R2-YTAN: rutten existerar ENBART för
 * kundens tryck på den STORA Publicera-knappen i studions godkännandeyta —
 * den verkställer flytten utkast → data/blogg/ och loggar varje tryck till
 * audit-loggen (data/vakten/audit-logg.jsonl, aktor "kund").
 *
 * POST {sokvag}
 *   → {publicerad:true, slug, liveSokvag, meddelande}
 *
 * SKYDDSLAGER (i ordning):
 *   1. requireAdmin — kundens admin-session (samma som övriga studio-ytor).
 *   1b. HÄRDNINGSTAK (o64) — 6 authade försök/minut (sitter efter authen så
 *       anonym trafik aldrig kan förbruka fönstret); 429 med Retry-After.
 *   2. Väntelistsvakt — sokvag MÅSTE stå i den aktuella FLYTTKLAR-listan
 *      (lasGodkannandePoster): granskingsledens verdict är inpassbiljetten;
 *      vilken som helst sökväg går inte att publicera.
 *   3. Engångsvakt — slug får INTE redan finnas i data/blogg/ (409).
 *   4. VÅG 66-GRINDEN — kontrolleraText 0 FEL krävs på exakt det innehåll
 *      som publiceras (samma grind som admin-panelens exportväg).
 *   Samtliga avvisningar (2–4 + taket) lämnar en append-only audit-rad
 *   "publicera-avvisad" — kundens knapptryckningar är fullt spårbara även
 *   när en vakt nekar (o64).
 *
 * TVÅ UTKASTFORMER:
 *   · BlogPost-form (SEO-guiderna, redan exakt content.ts-form) → grinden +
 *     BYTE-IDENTISK kopia ("drop-in-publicerbar" enligt SEO-specen).
 *   · m9-köform (titel/ingress/bodyMarkdown) → konvertering via
 *     exporteraKlarPost (0-FEL-grinden där): kvitto-avsnittet
 *     "## Granskningsunderlag — maskinens kvitto" stryks, "(utkast)"-suffixet
 *     i titeln stryks, disclaimer sista rad säkerställs, pillar/author enligt
 *     exportkontraktet.
 *
 * EFTER TRYCKET: filen ligger i data/blogg/ på disk — agenten committar den
 * (prod-synk) och den syns på sajten vid nästa driftsättning (bloggroutern
 * är force-static). Rutten rör ALDRIG git (byggen/commits ägs av
 * prod-synken under deploylåset) och ALDRIG databasen.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { BloggValideringsFel, exporteraKlarPost, kontrolleratextRad } from "@/lib/blogg-utkast";
import { skrivAudit } from "@/lib/studio/audit-logg";
import { lasGodkannandePoster, skrivGodkannandeVal } from "@/lib/studio/godkannande";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders },
  });
}

/**
 * HÄRDNING (styrelsens KÖRS DIREKT-post "härdning av godkännandeytans
 * rutter", o64): in-memory tak på AUTHADE publiceringsförsök — 6/minut.
 * Kunden publicerar handmanövrerat, ett tryck i taget med UI-bekräftelse;
 * 6/min stoppar maskinella sviter utan att röra mänskligt bruk. Taket sitter
 * MEDVETET EFTER requireAdmin: anonym trafik får aldrig kunna förbruka
 * fönstret och låsa kundens R2-knapp. Mönstret är admin-auth:s
 * tidsfönster-array (pm2 fork = en process); 429 pushar ALDRIG — fönstret
 * återhämtar sig när stormen tystnar.
 */
const publiceraTider: number[] = [];
const MAX_PUBLICERA_PER_MIN = 6;

function takUppnaatt(): boolean {
  const nu = Date.now();
  while (publiceraTider.length && nu - publiceraTider[0] > 60_000) publiceraTider.shift();
  return publiceraTider.length >= MAX_PUBLICERA_PER_MIN;
}

/**
 * Append-only spår för autentiserade men AVVISADE publiceringsförsök (o64):
 * R2-knappen ska lämna kvitto även när en vakt nekar — samma audit-logg som
 * de lyckade trycken, åtgärd "publicera-avvisad". Ogiltiga JSON-kroppar /
 * saknad sokvag spåras INTE (formulärskräp utan artefakt; taket stoppar
 * ändå sådana sviter vid sjunde försöket).
 */
function avvisad(sokvag: string, detalj: string): void {
  skrivAudit("kund", "publicera-avvisad", sokvag, detalj);
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  if (takUppnaatt()) {
    avvisad("(tak)", "429 — taket (6 försök/minut) nått; kundens session avvisad med Retry-After 60.");
    return jsonSvar({ fel: "För många publiceringsförsök — vänta en minut." }, 429, { "Retry-After": "60" });
  }
  publiceraTider.push(Date.now());

  let kropp: { sokvag?: unknown };
  try {
    kropp = (await req.json()) as { sokvag?: unknown };
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  const sokvag = typeof kropp.sokvag === "string" ? kropp.sokvag.trim() : "";
  if (!sokvag) return jsonSvar({ fel: "Parameter sokvag krävs." }, 400);

  // ── Vakt 2: väntelistan (FLYTTKLAR är inpassbiljetten) ──
  let post: ReturnType<typeof lasGodkannandePoster>["poster"][number] | null = null;
  try {
    post = lasGodkannandePoster().poster.find((p) => p.sokvag === sokvag) ?? null;
  } catch {
    return jsonSvar({ fel: "Väntelistan kunde ej läsas — försök igen." }, 500);
  }
  if (!post) {
    avvisad(sokvag, "404 — står ej i FLYTTKLAR-väntelistan (kan vara publicerad eller ogranskad).");
    return jsonSvar(
      {
        fel:
          "Posten står inte i väntelistan (FLYTTKLAR) — publicering nekas. Den kan vara redan publicerad eller sakna granskningens FLYTTKLAR-bedömning.",
      },
      404,
    );
  }

  // ── Vakt 3: engångsoperation ──
  const liveSokvag = `data/blogg/${post.slug}.json`;
  const helLive = path.join(process.cwd(), liveSokvag);
  if (existsSync(helLive)) {
    avvisad(sokvag, `409 — slugen "${post.slug}" står redan i data/blogg/ (engångsvakten).`);
    return jsonSvar({ fel: `Slugen "${post.slug}" är redan publicerad i data/blogg/.` }, 409);
  }

  let bytes: Buffer;
  let j: Record<string, unknown>;
  try {
    bytes = readFileSync(path.join(process.cwd(), sokvag));
    j = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
  } catch {
    return jsonSvar({ fel: "Utkastet kunde ej läsas (ogiltig JSON eller saknad fil)." }, 400);
  }
  const md5 = createHash("md5").update(bytes).digest("hex");

  // ── Vakt 4 + former: 0-FEL-grinden, konvertering, atomär skrivning ──
  let utBuffer: Buffer;
  let detalj: string;
  try {
    if (typeof j.titel === "string" && typeof j.bodyMarkdown === "string") {
      // m9-köform → BlogPost via exportmotorn (grinden bor i lib:en).
      const titel = j.titel.replace(/\s*\(utkast\)\s*$/i, "").trim();
      const rensadBody = j.bodyMarkdown
        .replace(/^##\s+Granskningsunderlag[^]*$/m, "")
        .trimEnd();
      const ingress = typeof j.ingress === "string" ? j.ingress : "";
      const { paket } = exporteraKlarPost({
        slug: post.slug,
        titel,
        ingress,
        bodyMarkdown: rensadBody,
      });
      utBuffer = Buffer.from(`${JSON.stringify(paket, null, 2)}\n`, "utf8");
      detalj = "m9-utkast konverterat till BlogPost (kvitto-avsnitt och (utkast)-suffix strukna)";
    } else if (typeof j.title === "string" && typeof j.body === "string") {
      // BlogPost-form — grinden + byte-identisk kopia (drop-in enligt spec).
      // VÅG 168 (integration-audit p4): den mekaniska juridikgrindens
      // larmfil läses som SISTA kontroll — pub nekas om grindens senaste
      // dom ej är GRÖN (oavsett våg 66-textgrinden nedan).
      try {
        const larmFil = JSON.parse(
          readFileSync(path.join(process.cwd(), "data", "vakten", "juridik-larm.json"), "utf8"),
        ) as { senasteKorning?: { status?: string; ts?: string } };
        const grindStatus = larmFil?.senasteKorning?.status;
        if (grindStatus && grindStatus !== "GRÖN") {
          avvisad(sokvag, `400 — juridikgrindens senaste dom är ${grindStatus} (våg 168-pubbromsen).`);
          return jsonSvar(
            {
              fel: `Publicering nekas — juridikgrindens senaste dom är ${grindStatus} (körd ${(larmFil.senasteKorning?.ts || "?").slice(0, 16)}). Grinden kör varje timme :37 — försök igen efter nästa gröna dom.`,
            },
            400,
          );
        }
      } catch {
        /* larmfilen får saknas = ingen dom ännu = pub-rutten förlitar sig på våg 66-grinden */
      }
      const rapport = kontrolleratextRad(
        j.title,
        typeof j.description === "string" ? j.description : "",
        j.body,
      );
      if (rapport.fel.length > 0 || rapport.strukturFel.length > 0) {
        const alla = [
          ...rapport.fel.map((f) => `"${f.fras}" → ${f.ersattning}`),
          ...rapport.strukturFel.map((s) => s.meddelande),
        ];
        avvisad(sokvag, `400 — våg 66-grinden nekade (0 FEL krävs): ${alla.join("; ").slice(0, 300)}`);
        return jsonSvar({ fel: `Publicering nekas — 0 FEL krävs (våg 66-grinden): ${alla.join("; ")}`.slice(0, 500) }, 400);
      }
      utBuffer = bytes;
      detalj = "utkastet kopierat byte-identiskt (drop-in-publicerbar)";
    } else {
      avvisad(sokvag, "400 — okänd utkastform (varken BlogPost title/body eller m9-kö titel/bodyMarkdown).");
      return jsonSvar(
        { fel: "Okänd utkastform — varken BlogPost (title/body) eller m9-köutkast (titel/bodyMarkdown)." },
        400,
      );
    }
  } catch (fel) {
    if (fel instanceof BloggValideringsFel) {
      return jsonSvar({ fel: fel.message.slice(0, 500) }, 400);
    }
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Konverteringen misslyckades." },
      500,
    );
  }

  try {
    mkdirSync(path.dirname(helLive), { recursive: true });
    const temp = `${helLive}.tmp-${Date.now()}`;
    writeFileSync(temp, utBuffer);
    renameSync(temp, helLive);
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Filen kunde ej skrivas till data/blogg/." },
      500,
    );
  }

  skrivGodkannandeVal(sokvag, {
    val: "publicerad",
    ts: new Date().toISOString(),
    slug: post.slug,
    liveSokvag,
  });
  skrivAudit(
    "kund",
    "publicera",
    liveSokvag,
    `R2: kundens tryck i studions godkännandeyta — flytt från ${sokvag} (md5 ${md5}); ${detalj}. Syns på sajten efter nästa driftsättning.`,
  );

  return jsonSvar({
    publicerad: true,
    slug: post.slug,
    liveSokvag,
    meddelande:
      "Publicerad! Filen ligger nu i data/blogg/ — agenten committar den och texten syns på sajten efter nästa driftsättning.",
  });
}

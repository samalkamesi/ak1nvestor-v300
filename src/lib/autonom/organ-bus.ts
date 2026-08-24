/**
 * OrganBus — organsystemets kommunikationsprotokoll (F1 i MEGASYSTEM-planen).
 *
 * Makro-organet (styrelsen) orkestrerar mikro-organ via meddelanden i
 * system_events (type=organ_msg). HELT BOUNDED:
 * - KÖRNING skriver max ~15 meddelanden per rond (en per organ + beslut)
 * - Retention-organet städar (500-raderstak/30d) — tusen organ kan inte svämma
 * Transporten är Supabase REST via validerad helper (endast https *.supabase.co).
 */
import { getSupabaseRest } from "@/lib/supabase-rest";

export type OrganMeddelande = {
  fran: string;
  till: string;
  typ: "fragor" | "rapport" | "beslut" | "delegation";
  innehall: Record<string, unknown>;
};

export async function skicka(m: OrganMeddelande): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest) return false;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "organ_msg",
        severity: "info",
        message: `[${m.fran}→${m.till}:${m.typ}] ${JSON.stringify(m.innehall).slice(0, 300)}`,
        details: m,
        source: "organ-bus",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function lasSenaste(limit = 40): Promise<OrganMeddelande[]> {
  const rest = getSupabaseRest();
  if (!rest) return [];
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.organ_msg&select=details,created_at&order=created_at.desc&limit=${limit}`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const rader = (await res.json()) || [];
    return rader
      .map((r: any) => r.details as OrganMeddelande)
      .filter((d: any) => d && d.fran && d.till);
  } catch {
    return [];
  }
}

// ── Mikro-organ: varje rapporterar MÄTTA värden (deterministiskt) ──────────

export type OrganRapport = {
  organ: string;
  status: "ok" | "varning" | "atgardar";
  matt: Record<string, number | string>;
  forslag: string[];
};

export function mikroRapporter(io: {
  kurser: number;
  bloggAntal: number;
  bloggDagarSedan: number;
  analyser: number;
  besokare7d: number;
  konvertering: number;
  medlemmar: number;
}): OrganRapport[] {
  const ut: OrganRapport[] = [];

  ut.push({
    organ: "Kurs-organet",
    status: "ok",
    matt: { kurser: io.kurser, mal: 226 },
    forslag: io.kurser >= 226 ? ["Kursbiblioteket komplett — nästa: övningsuppgifter per kurs"] : [`Fyll på: ${226 - io.kurser} kurser kvar`],
  });

  ut.push({
    organ: "Blogg-organet",
    status: io.bloggDagarSedan > 3 ? "atgardar" : "ok",
    matt: { inlagg: io.bloggAntal, dagarSedanSenaste: io.bloggDagarSedan, malCadence: "3-4/vecka" },
    forslag:
      io.bloggDagarSedan > 3
        ? [`Publicera idag: nästa i serien (V-variabel eller marknadskommentar) — färskhet ${io.bloggDagarSedan} dagar`]
        : ["Cadence hållen — planera nästa 2 ämnen"],
  });

  ut.push({
    organ: "Analys-organet",
    status: io.analyser < 5 ? "atgardar" : "ok",
    matt: { analyser: io.analyser, malMinst: 5, motorKallor: "Yahoo+MarketStack+Stooq" },
    forslag:
      io.analyser < 5
        ? [`${5 - io.analyser} nya bolag till mål — motor redo (E2E-verifierad)`]
        : ["Underhåll: uppdatera befintliga vid kvartalsrapporter"],
  });

  ut.push({
    organ: "Marknad-organet",
    status: io.besokare7d < 10 ? "atgardar" : "ok",
    matt: { besokare7d: io.besokare7d, konverteringProcent: io.konvertering, malKonvertering: 8 },
    forslag: [
      ...(io.konvertering < 8 ? ["Stärk CTA: visa 'Bli medlem gratis' efter 2 kurssidor (mätt A/B)"] : []),
      "Registrera sitemap i Search Console (grundare)",
    ],
  });

  ut.push({
    organ: "Retention-organet",
    status: "varning",
    matt: { medlemmar: io.medlemmar, notering: "kvarhållning börjar mätas vid >10 medlemmar" },
    forslag: ["Fortsättnings-lista per medlem ('fortsätt där du slutade') — F2"],
  });

  return ut;
}

// ── Makro-organet: koordineringsrunda ─────────────────────────────────────

export type RondResultat = {
  timestamp: string;
  makroFråga: string;
  rapporter: OrganRapport[];
  beslut: Array<{ titel: string; alignatMed: string; score: number }>;
  delegationsKo: string[];
};

export async function korRunda(signal: Parameters<typeof mikroRapporter>[0]): Promise<RondResultat> {
  const rapporter = mikroRapporter(signal);

  // Makro→mikro: frågan
  await skicka({
    fran: "MAKRO-styrelsen",
    till: "ALLA",
    typ: "fragor",
    innehall: { fraga: "Rapportera mätt status + ett förslag för 10x-optimering", kadens: "triggad" },
  });

  // Mikro→makro: rapporterna
  for (const r of rapporter) {
    await skicka({ fran: r.organ, till: "MAKRO-styrelsen", typ: "rapport", innehall: { status: r.status, matt: r.matt } });
  }

  // Makro beslutar (deterministisk prioritering: atgardar > varning > ok)
  const poang = (r: OrganRapport) => (r.status === "atgardar" ? 3 : r.status === "varning" ? 2 : 1);
  const beslut = [...rapporter]
    .sort((a, b) => poang(b) - poang(a))
    .slice(0, 3)
    .map((r) => ({
      titel: r.forslag[0] || `${r.organ}: fortsatt drift`,
      alignatMed: r.organ,
      score: poang(r) * 10,
    }));

  await skicka({
    fran: "MAKRO-styrelsen",
    till: "BYGGAGENT",
    typ: "delegation",
    innehall: { ko: beslut.map((b) => b.titel) },
  });

  return {
    timestamp: new Date().toISOString(),
    makroFråga: "Rapportera mätt status + ett förslag för 10x-optimering",
    rapporter,
    beslut,
    delegationsKo: beslut.map((b) => b.titel),
  };
}

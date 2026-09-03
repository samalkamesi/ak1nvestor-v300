import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { getAnalyses } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Holding = {
  id: string;
  ticker: string;
  company: string | null;
  sector: string | null;
  shares: number | null;
  avg_cost: number | null;
  current_price: number | null;
  weight: number | null;
  wave_micro?: string | null;
  wave_short?: string | null;
  wave_medium?: string | null;
  wave_long?: string | null;
  wave_mega?: string | null;
};

type BerikatHolding = Holding & {
  varde: number;
  vikt: number; // 0-1
  analys: {
    hittad: boolean;
    akm1?: number;
    tier?: string;
    rekommendation?: string;
    overallBias?: string;
    bull?: string;
    bear?: string;
    lank: string;
  };
};

function matcherAnalys(ticker: string) {
  const norm = (t: string) => t.trim().toUpperCase().replace(/\./g, "").replace(/-/g, "");
  for (const a of getAnalyses()) {
    if (norm(a.ticker) === norm(ticker) || norm(a.company || "").includes(norm(ticker))) {
      const akm1 = a.akm1 as { score?: number; tier?: string; recommendation?: string } | undefined;
      const wave = (a.waveSummary ?? {}) as { overallBias?: string };
      const scen = (a.scenarios ?? {}) as {
        bull?: { target?: string };
        bear?: { target?: string };
      };
      const rec = a.recommendation as { main?: string } | undefined;
      return {
        hittad: true,
        akm1: akm1?.score,
        tier: akm1?.tier,
        rekommendation: rec?.main,
        overallBias: wave.overallBias,
        bull: scen.bull?.target,
        bear: scen.bear?.target,
        lank: `/analyser/${encodeURIComponent(a.ticker)}`,
      };
    }
  }
  return { hittad: false as const, lank: "/analyser" };
}

/** GET /api/member/portfolio/analys?portfolioId=xxx — portföljens AKM1-rapport. */
export async function GET(req: NextRequest) {
  try {
    const portfolioId = new URL(req.url).searchParams.get("portfolioId");
    if (!portfolioId) {
      return NextResponse.json({ error: "portfolioId krävs" }, { status: 400 });
    }
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }

    const [pRes, hRes] = await Promise.all([
      fetch(`${rest.origin}/rest/v1/client_portfolios?id=eq.${encodeURIComponent(portfolioId)}&select=*`, {
        headers: rest.headers,
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${rest.origin}/rest/v1/client_holdings?portfolio_id=eq.${encodeURIComponent(portfolioId)}&select=*&order=created_at.asc`, {
        headers: rest.headers,
        signal: AbortSignal.timeout(10000),
      }),
    ]);
    const portfolj = (await pRes.json())?.[0];
    const holdings: Holding[] = (await hRes.json()) || [];
    if (!portfolj) {
      return NextResponse.json({ error: "Portföljen hittades inte" }, { status: 404 });
    }

    // Värde per innehav (aktuell kurs, annars snittkurs, annars likavikt)
    const radata = holdings.map((h) => {
      const pris = h.current_price ?? h.avg_cost ?? 0;
      return { h, varde: pris * (h.shares || 0) };
    });
    const summaVarden = radata.reduce((s, r) => s + r.varde, 0);
    const kassa = portfolj.cash_position || 0;
    const total = summaVarden + kassa;

    const berikade: BerikatHolding[] = radata.map(({ h, varde }) => ({
      ...h,
      varde,
      vikt: total > 0 ? varde / total : 0,
      analys: matcherAnalys(h.ticker || h.company || ""),
    }));

    // AKM1 viktat (där analys finns)
    const medAnalys = berikade.filter((b) => b.analys.hittad && b.analys.akm1 != null);
    const viktatAkm1 =
      medAnalys.length > 0
        ? Math.round(
            medAnalys.reduce((s, b) => s + (b.analys.akm1 || 0) * b.vikt, 0) /
              Math.max(1e-9, medAnalys.reduce((s, b) => s + b.vikt, 0))
          )
        : null;
    const analysTackning = berikade.length > 0 ? medAnalys.length / berikade.length : 0;

    // Sektorspridning
    const sektorer = new Map<string, number>();
    for (const b of berikade) {
      const sekt = b.sector || "Okänd sektor";
      sektorer.set(sekt, (sektorer.get(sekt) || 0) + b.varde);
    }
    const sektorList = [...sektorer.entries()]
      .map(([sektor, varde]) => ({ sektor, vikt: total > 0 ? varde / total : 0 }))
      .sort((a, b) => b.vikt - a.vikt);

    // Vågprofil per horisont (medlemmens egna skattningar, viktade)
    const horisonter: Array<{ namn: string; key: "wave_micro" | "wave_short" | "wave_medium" | "wave_long" }> = [
      { namn: "Mikro (veckor)", key: "wave_micro" },
      { namn: "Kort (1–3 mån)", key: "wave_short" },
      { namn: "Medel (3–12 mån)", key: "wave_medium" },
      { namn: "Lång (1 år+)", key: "wave_long" },
    ];
    const vagprofil = horisonter.map(({ namn, key }) => {
      const raknare = { impulsvåg: 0, korrigering: 0, basbygge: 0, osatt: 0 };
      for (const b of berikade) {
        const v = (b[key] || "").toLowerCase();
        if (v.includes("impuls")) raknare.impulsvåg += b.vikt;
        else if (v.includes("korri") || v.includes("bear")) raknare.korrigering += b.vikt;
        else if (v.includes("bas")) raknare.basbygge += b.vikt;
        else raknare.osatt += b.vikt;
      }
      return { horisont: namn, ...raknare };
    });

    // Riskmått: koncentration (största innehavets vikt) + antal innehav
    const storsta = berikade.reduce((m, b) => (b.vikt > (m?.vikt || 0) ? b : m), berikade[0]);
    const koncentration = storsta ? storsta.vikt : 0;

    // Tips — regelbaserade från portföljens faktiska siffror
    const tips: string[] = [];
    if (koncentration > 0.3 && storsta) {
      tips.push(
        `Största innehavet ${storsta.company || storsta.ticker} är ${Math.round(koncentration * 100)} % av portföljen — över 30 %-regeln. Överväg att trappa ner eller övriga positioner.`
      );
    }
    if (berikade.length > 0 && berikade.length < 5) {
      tips.push(`Endast ${berikade.length} innehav — under 5 blir enskilda bolagsrisker tyngre. Fler bolag jämnar ut.`);
    }
    if (sektorList.length && sektorList[0].vikt > 0.6) {
      tips.push(`${sektorList[0].sektor} utgör ${Math.round(sektorList[0].vikt * 100)} % av värdet — sektorspridning dämpar branschrisken.`);
    }
    if (analysTackning < 0.8) {
      tips.push(
        `${berikade.length - medAnalys.length} innehav saknar AKM1-analys — basera inte beslut på okontrollerade bolag (principen: endast analyserat kapital).`
      );
    }
    if (kassa / Math.max(1, total) > 0.5) {
      tips.push("Över hälften av portföljen är kassa — perfekt ammunition när en ny analys når köpläge.");
    }
    if (tips.length === 0) {
      tips.push("Portföljen ser balanserad ut på måtten: spridning, koncentration och täckning inom ramarna. Fortsätt följa vågerna.");
    }

    // Narrativ — harmonisk sammanfattning
    const narrativ = [
      total > 0
        ? `Din portfölj värderas till ${Math.round(total).toLocaleString("sv-SE")} enheter fördelat på ${berikade.length} innehav${kassa > 0 ? ` plus ${Math.round((kassa / total) * 100)} % kassa` : ""}.`
        : "Lägg till innehav för att få din portföljanalys.",
      viktatAkm1 != null
        ? `Viktat AKM1-poäng för analyserade delar: ${viktatAkm1}/100 (${medAnalys.length} av ${berikade.length} innehav har officiell analys).`
        : "Inga innehav har officiell AKM1-analys ännu — komplettera med vågskattningar per innehav.",
      koncentration > 0.3
        ? "Portföljen är koncentrerad — det förstärker både upp- och nedgångar."
        : "Koncentrationen är hanterbar — inget enskilt bolag dominerar.",
      `Vågbilden: ${vagprofil[2].impulsvåg > vagprofil[2].korrigering ? "medellång horisont lutar åt impulsvåg (positivt)" : vagprofil[2].korrigering > vagprofil[2].impulsvåg ? "medellång horisont lutar åt korrigering (försiktighet)" : "medellång vågbild är osatt — gör skattningar per innehav"}.`,
    ].join(" ");

    return NextResponse.json({
      portfolj: { id: portfolj.id, namn: portfolj.name, kassa, total, riskTolerance: portfolj.risk_tolerance },
      innehav: berikade.map((b) => ({
        id: b.id,
        ticker: b.ticker,
        bolag: b.company,
        sektor: b.sector,
        antal: b.shares,
        pris: b.current_price ?? b.avg_cost,
        varde: Math.round(b.varde),
        vikt: Math.round(b.vikt * 1000) / 10,
        vager: { mikro: b.wave_micro, kort: b.wave_short, medel: b.wave_medium, lang: b.wave_long },
        analys: b.analys,
      })),
      aggregat: {
        viktatAkm1,
        analysTackning: Math.round(analysTackning * 100),
        koncentration: Math.round(koncentration * 100),
        sektorer: sektorList.map((s) => ({ ...s, vikt: Math.round(s.vikt * 100) })),
        vagprofil: vagprofil.map((v) => ({
          ...v,
          impulsvåg: Math.round(v.impulsvåg * 100),
          korrigering: Math.round(v.korrigering * 100),
          basbygge: Math.round(v.basbygge * 100),
          osatt: Math.round(v.osatt * 100),
        })),
      },
      tips,
      narrativ,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

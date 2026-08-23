"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type Var = { id: string; name: string; category: string; slug: string; weight: string };

const VARIABLER: Var[] = [
  { id: "V01", name: "Försäljningstillväxt", category: "Tillväxt", slug: "v01-forsaljningstillvaxt", weight: "KRITISK" },
  { id: "V02", name: "ARR-tillväxt", category: "Tillväxt", slug: "v02-arr-tillvaxt", weight: "8%" },
  { id: "V03", name: "Intäktsdiversifiering", category: "Tillväxt", slug: "v03-intaktsdiversifiering", weight: "6%" },
  { id: "V04", name: "P/S", category: "Värdering", slug: "v04-ps", weight: "8%" },
  { id: "V05", name: "P/B", category: "Värdering", slug: "v05-pb", weight: "6%" },
  { id: "V06", name: "EV/EBITDA", category: "Värdering", slug: "v06-ev-ebitda", weight: "8%" },
  { id: "V07", name: "Bruttomarginal", category: "Lönsamhet", slug: "v07-bruttomarginal", weight: "KRITISK" },
  { id: "V08", name: "EBITDA-marginal", category: "Lönsamhet", slug: "v08-ebitda-marginal", weight: "8%" },
  { id: "V09", name: "ROE", category: "Lönsamhet", slug: "v09-roe", weight: "8%" },
  { id: "V10", name: "Skuldsättningsgrad", category: "Kapitalstruktur", slug: "v10-skuldsattningsgrad", weight: "6%" },
  { id: "V11", name: "Likviditet", category: "Stabilitet", slug: "v11-likviditet", weight: "6%" },
  { id: "V12", name: "Intäktsstabilitet", category: "Stabilitet", slug: "v12-intaktsstabilitet", weight: "6%" },
  { id: "V13", name: "Patent & IP", category: "Moat", slug: "v13-patent-ip", weight: "6%" },
  { id: "V14", name: "Varumärke", category: "Moat", slug: "v14-varumarke", weight: "6%" },
  { id: "V15", name: "Nätverkseffekter", category: "Moat", slug: "v15-natverkseffekter", weight: "6%" },
  { id: "V16", name: "Produktlanseringar", category: "Katalysator", slug: "v16-produktlanseringar", weight: "6%" },
  { id: "V17", name: "Avtal & Partnerskap", category: "Katalysator", slug: "v17-avtal-partnerskap", weight: "6%" },
  { id: "V18", name: "Regulatoriska", category: "Katalysator", slug: "v18-regulatoriska", weight: "6%" },
  { id: "V19", name: "Kapitalförbränning", category: "Risk", slug: "v19-kapitalforbranning", weight: "KRITISK" },
  { id: "V20", name: "Återköp", category: "Kapitalstruktur", slug: "v20-aterekop-egna-aktier", weight: "6%" },
];

const KATEGORIER = ["Tillväxt", "Värdering", "Lönsamhet", "Kapitalstruktur", "Stabilitet", "Moat", "Katalysator", "Risk"];

/** Poängsättning från riktiga AK1A-analyser (pedagogiskt exempel). */
const EXEMPEL: Record<string, { label: string; poang: Record<string, number>; not: string }> = {
  prec: {
    label: "Precise Biometrics",
    poang: { V01: 2, V02: 3, V03: 3, V04: 3, V05: 2, V06: 2, V07: 5, V08: 2, V09: 1, V10: 5, V11: 4, V12: 2, V13: 4, V14: 3, V15: 3, V16: 4, V17: 4, V18: 4, V19: 3, V20: 1 },
    not: "Förenklat — den officiella analysen ger 38/100 (osäkerhet kring fusionen vägs in där)",
  },
  volcar: {
    label: "Volvo Cars",
    poang: { V01: 3, V02: 3, V03: 5, V04: 5, V05: 2, V06: 3, V07: 3, V08: 3, V09: 2, V10: 2, V11: 3, V12: 2, V13: 4, V14: 5, V15: 2, V16: 3, V17: 4, V18: 3, V19: 3, V20: 2 },
    not: "Förenklat — den officiella analysen ger 62/100",
  },
};

function bedom(total: number) {
  if (total >= 80) return { rec: "STARKT KÖP", tier: "STARK", farg: "text-green-700" };
  if (total >= 60) return { rec: "KÖP", tier: "MEDL-STARK", farg: "text-green-700" };
  if (total >= 40) return { rec: "FÖRSIKTIGT KÖP", tier: "MEDEL", farg: "text-gold" };
  if (total >= 25) return { rec: "MINSKA", tier: "SVAG-MEDL", farg: "text-orange-700" };
  return { rec: "SÄLJ", tier: "SVAG", farg: "text-red-700" };
}

/** AKM1-kalkylator: dra 20 variabler 0–5 och se rekommendationen uppdateras live. */
export function Akm1Calculator() {
  const [poang, setPoang] = useState<Record<string, number>>(
    Object.fromEntries(VARIABLER.map((v) => [v.id, 3]))
  );
  const [not, setNot] = useState<string | null>(null);

  const total = useMemo(
    () => VARIABLER.reduce((s, v) => s + (poang[v.id] ?? 0), 0),
    [poang]
  );
  const { rec, tier, farg } = bedom(total);

  const katMedel = useMemo(() => {
    const ut: Record<string, number> = {};
    for (const k of KATEGORIER) {
      const vars = VARIABLER.filter((v) => v.category === k);
      ut[k] = vars.reduce((s, v) => s + (poang[v.id] ?? 0), 0) / vars.length;
    }
    return ut;
  }, [poang]);

  const laddaExempel = (nyckel: string) => {
    const ex = EXEMPEL[nyckel];
    setPoang({ ...ex.poang });
    setNot(ex.not);
  };

  const aterstall = () => {
    setPoang(Object.fromEntries(VARIABLER.map((v) => [v.id, 3])));
    setNot(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Variabler */}
      <div className="space-y-8">
        {KATEGORIER.map((kat) => (
          <section key={kat}>
            <h2 className="flex items-baseline gap-2 border-b border-gold/30 pb-1 font-serif text-lg font-bold">
              {kat}
              <span className="text-xs font-normal text-muted-foreground">
                snitt {katMedel[kat].toFixed(1)} / 5
              </span>
            </h2>
            <div className="mt-3 space-y-4">
              {VARIABLER.filter((v) => v.category === kat).map((v) => (
                <div key={v.id} className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/kurser/${v.slug}`}
                      className="text-sm font-medium hover:text-gold"
                      title={`Läs kursen om ${v.name}`}
                    >
                      {v.id} · {v.name}
                      {v.weight === "KRITISK" && (
                        <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gold">
                          kritisk
                        </span>
                      )}
                    </Link>
                  </div>
                  <Slider
                    value={[poang[v.id] ?? 0]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={([n]) => setPoang((p) => ({ ...p, [v.id]: n }))}
                    className="w-32 shrink-0"
                  />
                  <span className="w-8 shrink-0 text-right font-mono text-sm font-bold">
                    {poang[v.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Resultatpanel */}
      <aside className="lg:sticky lg:top-6 h-fit space-y-4 rounded-xl border border-gold/30 bg-card p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">AKM1-poäng</p>
          <p className="font-serif text-5xl font-bold text-gold">
            {total}
            <span className="text-lg text-muted-foreground"> / 100</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Nivå: {tier}</p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-paper p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Rekommendation</p>
          <p className={`mt-1 font-serif text-2xl font-bold ${farg}`}>{rec}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prova på riktiga analyser
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => laddaExempel("prec")}>
              Precise Biometrics
            </Button>
            <Button variant="outline" size="sm" onClick={() => laddaExempel("volcar")}>
              Volvo Cars
            </Button>
            <Button variant="ghost" size="sm" onClick={aterstall}>
              Återställ
            </Button>
          </div>
          {not && <p className="text-xs italic text-muted-foreground">{not}</p>}
        </div>
        <p className="border-t border-gold/20 pt-3 text-xs leading-relaxed text-muted-foreground">
          Poängsättning 0–5 per variabel, summa max 100. Detta är en förenklad pedagogisk
          modell — AK1A:s officiella analyser väger in fler faktorer (vågtyp, osäkerhet,
          konfluens). Läs metodiken i{" "}
          <Link href="/blogg/komplett-guide-svensk-aktieanalys-2026" className="underline hover:text-foreground">
            komplett guiden
          </Link>
          . Pedagogisk finansanalys — inte investeringsråd.
        </p>
      </aside>
    </div>
  );
}

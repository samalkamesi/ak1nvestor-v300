"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Plus, Trash2 } from "lucide-react";

type Medlem = { id: string; email: string; name: string | null; member_type: string };
type Portfolj = { id: string; name: string; total_value: number; cash_position: number; holdings: any[] };
type Rad = { ticker: string; bolag: string; antal: string; pris: string; sektor: string };
type Rapport = {
  portfolj: { id: string; namn: string; kassa: number; total: number };
  innehav: Array<{
    id: string; ticker: string; bolag: string | null; sektor: string | null;
    antal: number | null; pris: number | null; varde: number; vikt: number;
    vager: { mikro: string | null; kort: string | null; medel: string | null; lang: string | null };
    analys: { hittad: boolean; akm1?: number; tier?: string; rekommendation?: string; overallBias?: string; bull?: string; bear?: string; lank: string };
  }>;
  aggregat: {
    viktatAkm1: number | null; analysTackning: number; koncentration: number;
    sektorer: { sektor: string; vikt: number }[];
    vagprofil: { horisont: string; impulsvåg: number; korrigering: number; basbygge: number; osatt: number }[];
  };
  tips: string[];
  narrativ: string;
};

const VAGALTERNATIV = ["impulsvåg", "korrigering", "basbygge"];

/** Medlemssida: bygg portfölj, få AKM1-analys, vågprofil, risk och tips. */
export function PortfolioSystem() {
  const [email, setEmail] = useState("");
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [portfoljer, setPortfoljer] = useState<Portfolj[]>([]);
  const [aktiv, setAktiv] = useState<Portfolj | null>(null);
  const [rader, setRader] = useState<Rad[]>([{ ticker: "", bolag: "", antal: "", pris: "", sektor: "" }]);
  const [portfoljNamn, setPortfoljNamn] = useState("Min portfölj");
  const [kassa, setKassa] = useState("");
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [meddelande, setMeddelande] = useState("");
  const [busy, setBusy] = useState(false);
  const [fraga, setFraga] = useState("");

  const hittaMedlem = async () => {
    setMeddelande("");
    try {
      const res = await fetch(`/api/member/register?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.member) {
        setMedlem(data.member);
        laddaPortfoljer(data.member.id);
      } else {
        setMeddelande("Ingen medlem med den e-posten — registrera dig först på startsidan (portalen), så kommer du tillbaka.");
      }
    } catch {
      setMeddelande("Nätverksfel");
    }
  };

  const laddaPortfoljer = useCallback(async (memberId: string) => {
    const res = await fetch(`/api/member/portfolio?memberId=${memberId}`);
    const data = await res.json();
    const list = data.portfolios || [];
    setPortfoljer(list);
    setAktiv(list[0] || null);
    if (list[0]) hamtaRapport(list[0].id);
  }, []);

  useEffect(() => {
    if (!aktiv) setRapport(null);
  }, [aktiv]);

  const hamtaRapport = async (portfolioId: string) => {
    setRapport(null);
    try {
      const res = await fetch(`/api/member/portfolio/analys?portfolioId=${portfolioId}`);
      if (res.ok) setRapport(await res.json());
    } catch {}
  };

  const sparaPortfolj = async () => {
    if (!medlem) return;
    setBusy(true);
    setMeddelande("");
    try {
      const holdings = rader
        .filter((r) => r.ticker.trim() || r.bolag.trim())
        .map((r) => ({
          ticker: r.ticker.trim() || r.bolag.trim(),
          company: r.bolag.trim() || null,
          sector: r.sektor.trim() || null,
          shares: Number(r.antal.replace(",", ".")) || 0,
          currentPrice: Number(r.pris.replace(",", ".")) || null,
        }));
      const res = await fetch("/api/member/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: medlem.id,
          name: portfoljNamn,
          cashPosition: Number(kassa.replace(",", ".")) || 0,
          holdings,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMeddelande("Portfölj sparad! Rapporten genereras nedan.");
        await laddaPortfoljer(medlem.id);
        setRader([{ ticker: "", bolag: "", antal: "", pris: "", sektor: "" }]);
      } else {
        setMeddelande(data.error || "Kunde inte spara");
      }
    } finally {
      setBusy(false);
    }
  };

  // ── "Fråga portföljen" — deterministiska svar från rapportens data ──
  const svara = useMemo(() => {
    if (!rapport) return "";
    const q = fraga.toLowerCase();
    const a = rapport.aggregat;
    if (!q.trim()) return "";
    if (q.includes("risk") || q.includes("farlig")) {
      return `Koncentration: största innehavet är ${a.koncentration} % av portföljen. Analys-täckning: ${a.analysTackning} %. ${rapport.tips.find((t) => t.includes("%")) || ""}`;
    }
    if (q.includes("våg") || q.includes("vag") || q.includes("trend")) {
      const m = a.vagprofil[2];
      return `Vågbilden per horisont (viktad): Mikro: ${a.vagprofil[0].impulsvåg}% impuls / ${a.vagprofil[0].korrigering}% korrigering. Medel: ${m.impulsvåg}% impuls / ${m.korrigering}% korrigering. Lång: ${a.vagprofil[3].impulsvåg}% impuls. Sätt vågor per innehav för bättre träffsäkerhet.`;
    }
    if (q.includes("akm") || q.includes("poäng") || q.includes("kvalitet")) {
      return a.viktatAkm1 != null
        ? `Viktat AKM1: ${a.viktatAkm1}/100 baserat på de ${a.analysTackning} % av portföljen som har officiell analys. Se varje innehav nedan för detaljer.`
        : "Inga av dina innehav har officiell AKM1-analys ännu — läs analyserna på analyssidan och komplettera.";
    }
    if (q.includes("sprid") || q.includes("sektor")) {
      return `Sektorsfördelning: ${a.sektorer.map((s) => `${s.sektor} ${s.vikt}%`).join(", ") || "okänd"}. ${a.sektorer[0]?.vikt > 60 ? "En sektor dominerar — se spridningstipset." : "Spridningen ser hanterbar ut."}`;
    }
    if (q.includes("köpa") || q.includes("sälja") || q.includes("tycka")) {
      return "Vi ger metod, inte råd: kolla varje innehavs AKM1-poäng och rekommendation i listan nedan, sätt vågor per horisont, och läs tipsen. Pedagogisk analys — besluten är dina.";
    }
    return "Fråga om: risk, vågor, AKM1, spridning — eller kolla rapporten nedan. Exakt vilka siffror som helts visas med källor.";
  }, [fraga, rapport]);

  // ── Inloggning/steg 1 ──
  if (!medlem) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-gold/30 bg-card p-6">
          <h2 className="font-serif text-xl font-bold">Din portfölj — hämta med e-post</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Samma e-post som du registrerade dig med i portalen.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              onKeyDown={(e) => e.key === "Enter" && hittaMedlem()}
            />
            <Button className="bg-gold text-background hover:bg-gold/90" onClick={hittaMedlem}>
              Öppna
            </Button>
          </div>
          {meddelande && <p className="mt-3 text-xs text-muted-foreground">{meddelande}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Steg 2: bygg portfölj */}
      <section className="rounded-xl border border-gold/30 bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold">Bygg din portfölj</h2>
          <span className="text-xs text-muted-foreground">
            Inloggad: {medlem.email}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input value={portfoljNamn} onChange={(e) => setPortfoljNamn(e.target.value)} placeholder="Portföljns namn" />
          <Input value={kassa} onChange={(e) => setKassa(e.target.value)} inputMode="decimal" placeholder="Kassa (valfri, samma enhet)" />
          <Button className="bg-gold text-background hover:bg-gold/90" onClick={sparaPortfolj} disabled={busy}>
            {busy ? "Sparar…" : "Spara & analysera"}
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {rader.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <Input className="col-span-3" placeholder="Ticker (t.ex. PREC.ST)" value={r.ticker} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, ticker: e.target.value } : x)))} />
              <Input className="col-span-3" placeholder="Bolag" value={r.bolag} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, bolag: e.target.value } : x)))} />
              <Input className="col-span-2" placeholder="Antal aktier" inputMode="decimal" value={r.antal} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, antal: e.target.value } : x)))} />
              <Input className="col-span-2" placeholder="Kurs/aktie" inputMode="decimal" value={r.pris} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, pris: e.target.value } : x)))} />
              <Input className="col-span-1" placeholder="Sektor" value={r.sektor} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, sektor: e.target.value } : x)))} />
              <Button variant="ghost" size="icon" className="col-span-1" onClick={() => setRader((p) => p.filter((_, j) => j !== i))} aria-label="Ta bort rad">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setRader((p) => [...p, { ticker: "", bolag: "", antal: "", pris: "", sektor: "" }])}>
            <Plus className="mr-1 h-3 w-3" /> Lägg till rad
          </Button>
        </div>
        {meddelande && <p className="mt-3 text-xs text-gold">{meddelande}</p>}
        {portfoljer.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Dina portföljer:</span>
            {portfoljer.map((p) => (
              <Button key={p.id} variant={aktiv?.id === p.id ? "default" : "outline"} size="sm" className={aktiv?.id === p.id ? "bg-gold text-background" : ""} onClick={() => { setAktiv(p); hamtaRapport(p.id); }}>
                {p.name}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Steg 3: rapporten */}
      {rapport && (
        <>
          <section className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Portföljvärde</p>
              <p className="font-serif text-2xl font-bold text-gold">{Math.round(rapport.portfolj.total).toLocaleString("sv-SE")}</p>
            </div>
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Viktat AKM1</p>
              <p className="font-serif text-2xl font-bold text-gold">{rapport.aggregat.viktatAkm1 ?? "—"}</p>
              <p className="text-[11px] text-muted-foreground">{rapport.aggregat.analysTackning} % officiellt analyserade</p>
            </div>
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Största innehav</p>
              <p className="font-serif text-2xl font-bold text-gold">{rapport.aggregat.koncentration} %</p>
            </div>
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Antal innehav</p>
              <p className="font-serif text-2xl font-bold text-gold">{rapport.innehav.length}</p>
            </div>
          </section>

          {/* Narrativ */}
          <section className="rounded-xl border border-gold/40 bg-paper p-5">
            <p className="text-sm leading-relaxed">{rapport.narrativ}</p>
          </section>

          {/* Innehav med analys + vågor */}
          <section>
            <h3 className="font-serif text-xl font-bold">Innehav — analys per aktie</h3>
            <div className="mt-3 space-y-3">
              {rapport.innehav.map((h) => (
                <div key={h.id} className="rounded-xl border border-gold/20 bg-card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-serif font-bold">{h.bolag || h.ticker}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{h.ticker} · {Math.round(h.vikt * 10) / 10} % av portföljen</span>
                    </div>
                    {h.analys.hittad ? (
                      <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold text-gold">
                        AKM1 {h.analys.akm1}/100 · {h.analys.rekommendation || h.analys.tier}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">Analys på väg</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {h.antal ?? "?"} aktier · värde {h.varde.toLocaleString("sv-SE")}
                    {h.analys.hittad && h.analys.overallBias ? ` · vågbias: ${h.analys.overallBias}` : ""}
                  </p>
                  {h.analys.hittad && (
                    <p className="mt-1 text-xs">
                      <Link href={h.analys.lank} className="underline hover:text-gold">
                        Läs hela analysen →
                      </Link>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Vågprofil */}
          <section className="rounded-xl border border-gold/20 bg-card p-5">
            <h3 className="font-serif text-xl font-bold">Vågprofil per horisont</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Portföljens samlade vågbild (viktad per innehav). Sätt vågor per innehav i kurserna V16+ — idag visas portföljnivå.
            </p>
            <div className="mt-4 space-y-3">
              {rapport.aggregat.vagprofil.map((v) => (
                <div key={v.horisont}>
                  <p className="text-xs font-semibold">{v.horisont}</p>
                  <div className="mt-1 flex h-4 overflow-hidden rounded-full bg-muted text-[9px] leading-4">
                    {v.impulsvåg > 0 && <div className="bg-green-600 text-white" style={{ width: `${v.impulsvåg}%` }} title={`Impulsvåg ${v.impulsvåg}%`} />}
                    {v.basbygge > 0 && <div className="bg-gold text-white" style={{ width: `${v.basbygge}%` }} title={`Bas ${v.basbygge}%`} />}
                    {v.korrigering > 0 && <div className="bg-orange-600 text-white" style={{ width: `${v.korrigering}%` }} title={`Korrigering ${v.korrigering}%`} />}
                    {v.osatt > 0 && <div className="bg-muted-foreground/40" style={{ width: `${v.osatt}%` }} title={`Osatt ${v.osatt}%`} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
              <span>🟩 impulsvåg</span><span>🟨 basbygge</span><span>🧧 korrigering</span><span>⬜ osatt</span>
            </div>
          </section>

          {/* Tips */}
          <section className="rounded-xl border border-gold/40 bg-paper p-5">
            <h3 className="font-serif text-xl font-bold">Tips & tankar</h3>
            <ul className="mt-3 space-y-2">
              {rapport.tips.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-gold">◆</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Fråga portföljen */}
          <section className="rounded-xl border border-gold/20 bg-card p-5">
            <h3 className="font-serif text-xl font-bold">Fråga portföljen</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Regelbaserad analys från DINA siffror — svarar på risk, vågor, AKM1, spridning.
            </p>
            <div className="mt-3 flex gap-2">
              <Input value={fraga} onChange={(e) => setFraga(e.target.value)} placeholder="t.ex. hur stor är risken?" />
              <Button variant="outline">Fråga</Button>
            </div>
            {svara && (
              <p className="mt-3 rounded-lg border border-gold/20 bg-paper p-3 text-sm leading-relaxed">{svara}</p>
            )}
          </section>
        </>
      )}

      {!rapport && aktiv && (
        <p className="text-sm text-muted-foreground">
          <button className="underline" onClick={() => hamtaRapport(aktiv.id)}>
            <RefreshCw className="mr-1 inline h-3 w-3" /> Hämta analysen för {aktiv.name}
          </button>
        </p>
      )}
    </div>
  );
}

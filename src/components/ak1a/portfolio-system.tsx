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
import { VagSkattning } from "@/components/ak1a/vag-skattning";
import { VagfundamentMatris } from "@/components/ak1a/vagfundament-matris";
import { PortfoljVagProfil } from "@/components/ak1a/portfolj-vagprofil";

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

type VagfundamentSvar = {
  portfolj?: {
    totalText: string;
    radTexter: string[];
    tackningProcent: number;
    notering?: string;
  };
};

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
  const [begaran, setBegaran] = useState("");
  const [djup, setDjup] = useState<any | null>(null);
  const [djupBusy, setDjupBusy] = useState(false);
  const [begaranStatus, setBegaranStatus] = useState("");
  const [vagfundament, setVagfundament] = useState<VagfundamentSvar | null>(null);
  const [vagfundamentRader, setVagfundamentRader] = useState<Rad[]>([]);
  const [vagfundamentBusy, setVagfundamentBusy] = useState(false);
  const [vagfundamentFel, setVagfundamentFel] = useState("");

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

  const korDjupanalys = async () => {
    if (!aktiv) return;
    setDjupBusy(true);
    setDjup(null);
    try {
      const res = await fetch(`/api/member/portfolio/djupanalys?portfolioId=${aktiv.id}`);
      if (res.ok) setDjup(await res.json());
      else setDjup({ fel: (await res.json().catch(() => ({}))).error || `HTTP ${res.status}` });
    } catch {
      setDjup({ fel: "Nätverksfel" });
    } finally {
      setDjupBusy(false);
    }
  };

  // ── Fundamentalvågor (Vågfundamentet) — portföljens 20×5-matris, viktad per innehav ──
  const korVagfundament = async () => {
    const rensade: Rad[] = [];
    for (const r of rader) {
      const t = r.ticker.trim();
      if (!t || !/^[A-Za-z0-9.\-]{1,12}$/.test(t) || rensade.some((x) => x.ticker === t)) continue;
      rensade.push({ ...r, ticker: t });
    }
    if (rensade.length === 0) {
      setVagfundament(null);
      setVagfundamentFel("Fyll i minst en ticker i portföljen ovan — fundamentalvågor läses per bolag.");
      return;
    }
    const urval = rensade.slice(0, 12);
    const ravarde = urval.map((r) => (Number(r.antal.replace(",", ".")) || 0) * (Number(r.pris.replace(",", ".")) || 0));
    const summa = ravarde.reduce((a, b) => a + b, 0);
    const vikter: Record<string, number> = {};
    urval.forEach((r, i) => {
      vikter[r.ticker] = summa > 0 ? ravarde[i] / summa : 1 / urval.length;
    });
    setVagfundamentBusy(true);
    setVagfundamentFel("");
    setVagfundament(null);
    try {
      const res = await fetch("/api/vagfundament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: urval.map((r) => r.ticker), vikter }),
      });
      const data = (await res.json().catch(() => null)) as VagfundamentSvar | null;
      if (res.ok && data?.portfolj) {
        setVagfundamentRader(urval);
        setVagfundament(data);
      } else {
        setVagfundamentFel("Vågfundamentet kunde inte läsas just nu — kontrollera tickarna och försök igen. Motorn gissar aldrig: utan underlag visas ingen våg.");
      }
    } catch {
      setVagfundamentFel("Nätverksfel — fundamentalvågorna kunde inte hämtas. Försök igen om en stund.");
    } finally {
      setVagfundamentBusy(false);
    }
  };

  const sparaVag = async (holdingId: string, horisont: "mikro" | "kort" | "medel" | "lang", varde: string) => {
    setRapport((p) =>
      p
        ? {
            ...p,
            innehav: p.innehav.map((h) => (h.id === holdingId ? { ...h, vager: { ...h.vager, [horisont]: varde } } : h)),
          }
        : p
    );
    try {
      await fetch("/api/member/holding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          horisont === "mikro"
            ? { holdingId, mikro: varde }
            : horisont === "kort"
              ? { holdingId, kort: varde }
              : horisont === "medel"
                ? { holdingId, medel: varde }
                : { holdingId, lang: varde }
        ),
      });
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
          {/* Mobil: stapla e-post + knapp; tryckyta ≥44 px */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              onKeyDown={(e) => e.key === "Enter" && hittaMedlem()}
              className="min-h-[44px]"
            />
            <Button className="btn-marin min-h-[44px]" onClick={hittaMedlem}>
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
        {/* DNA: rubrikaxel med guld-hårlinje under */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold">Bygg din portfölj</h2>
          <span className="text-xs text-muted-foreground">
            Inloggad: {medlem.email}
          </span>
        </div>
        <div className="hjarlinje mt-2" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input value={portfoljNamn} onChange={(e) => setPortfoljNamn(e.target.value)} placeholder="Portföljns namn" />
          <Input value={kassa} onChange={(e) => setKassa(e.target.value)} inputMode="decimal" placeholder="Kassa (valfri, samma enhet)" />
          <Button className="btn-marin min-h-[44px]" onClick={sparaPortfolj} disabled={busy}>
            {busy ? "Sparar…" : "Spara & analysera"}
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {/* Inmatningsrad: mobil = 2-kolumners stapel (smal "Sektor"-spalt är oanvändbar på 412px), ≥sm = en 12-kolumnsrad */}
          {rader.map((r, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-12">
              <Input className="col-span-2 min-h-[44px] sm:col-span-3" placeholder="Ticker (t.ex. PREC.ST)" value={r.ticker} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, ticker: e.target.value } : x)))} />
              <Input className="col-span-2 min-h-[44px] sm:col-span-3" placeholder="Bolag" value={r.bolag} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, bolag: e.target.value } : x)))} />
              <Input className="col-span-1 min-h-[44px] sm:col-span-2" placeholder="Antal aktier" inputMode="decimal" value={r.antal} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, antal: e.target.value } : x)))} />
              <Input className="col-span-1 min-h-[44px] sm:col-span-2" placeholder="Kurs/aktie" inputMode="decimal" value={r.pris} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, pris: e.target.value } : x)))} />
              <Input className="col-span-1 min-h-[44px] sm:col-span-1" placeholder="Sektor" value={r.sektor} onChange={(e) => setRader((p) => p.map((x, j) => (j === i ? { ...x, sektor: e.target.value } : x)))} />
              <Button variant="ghost" size="icon" className="col-span-1 h-11 w-full justify-self-stretch sm:w-11" onClick={() => setRader((p) => p.filter((_, j) => j !== i))} aria-label="Ta bort rad">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => setRader((p) => [...p, { ticker: "", bolag: "", antal: "", pris: "", sektor: "" }])}>
            <Plus className="mr-1 h-3 w-3" /> Lägg till rad
          </Button>
        </div>
        {meddelande && <p className="mt-3 text-xs text-gold">{meddelande}</p>}
        {portfoljer.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Dina portföljer:</span>
            {portfoljer.map((p) => (
              <Button key={p.id} variant={aktiv?.id === p.id ? "default" : "outline"} size="sm" className={`min-h-[44px] ${aktiv?.id === p.id ? "bg-gold text-background" : ""}`} onClick={() => { setAktiv(p); hamtaRapport(p.id); }}>
                {p.name}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Steg 3: rapporten */}
      {rapport && (
        <>
          {/* DNA: tunn marin topp-rad — resultatpanelen börjar här */}
          <div className="marin-panel h-1.5 rounded-full" aria-hidden />
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
              {/* DNA: koppar som sparsam data-accent på risktalet */}
              <p className="font-serif text-2xl font-bold koppar-text">{rapport.aggregat.koncentration} %</p>
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
            <div className="hjarlinje mt-1.5" />
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
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(["mikro", "kort", "medel", "lang"] as const).map((hz) => {
                      const etikett = { mikro: "Mikro", kort: "Kort", medel: "Medel", lang: "Lång" }[hz];
                      return (
                        <label key={hz} className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Våg · {etikett}
                          <Select value={h.vager[hz] || "osatt"} onValueChange={(v) => sparaVag(h.id, hz, v === "osatt" ? "" : v)}>
                            <SelectTrigger className="mt-1 h-11 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="osatt">— osatt —</SelectItem>
                              <SelectItem value="impulsvåg">Impulsvåg</SelectItem>
                              <SelectItem value="korrigering">Korrigering</SelectItem>
                              <SelectItem value="basbygge">Basbygge</SelectItem>
                            </SelectContent>
                          </Select>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PORTFÖLJENS VÅGOR — analys-motorns aggregerade vågprofil (lib/
              portfolj-vagor.ts) direkt under innehavstabellen: fem horisonter,
              per-aktie-matris och motorns sammanfattande vågbild i text.
              Komponenten sköter själv Fas 2-lås/preview (utan Fas 2: fem låsta
              horisont-ikoner + inbjudan) och hämtar via djupanalys-routen med
              den aktiva portföljens id. */}
          <PortfoljVagProfil portfolioId={aktiv?.id} />

          {/* Vågprofil */}
          <section className="rounded-xl border border-gold/20 bg-card p-5">
            <h3 className="font-serif text-xl font-bold">Vågprofil per horisont</h3>
            <div className="hjarlinje mt-1.5" />
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

          {/* Fundamentalvågor — Vågfundamentet */}
          <section className="rounded-xl border border-gold/20 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-gold">🌊 Fundamentalvågor — Vågfundamentet</h3>
                <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                  AKM1-variablerna som tidsserier — varje fundamentalvariabel har sin egen vågklass per tidshorizont (mikro/kort/medellång/lång/mega).
                </p>
              </div>
              <Button onClick={korVagfundament} disabled={vagfundamentBusy} className="btn-marin min-h-[44px]">
                {vagfundamentBusy ? "Analyserar fundamentalvågor…" : "Analysera fundamentalvågor"}
              </Button>
            </div>
            <div className="hjarlinje mt-3" />

            {vagfundamentFel && <p className="mt-3 text-sm text-red-600">{vagfundamentFel}</p>}

            {vagfundament?.portfolj && (
              <div className="mt-5 space-y-5">
                <div className="rounded-lg border border-gold/30 bg-paper p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Portföljens fundamentalvåg · täckning {vagfundament.portfolj.tackningProcent} %
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{vagfundament.portfolj.totalText || ""}</p>
                  <ul className="mt-3 space-y-1.5">
                    {(vagfundament.portfolj.radTexter || []).map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed">
                        <span className="text-gold">◆</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  {vagfundament.portfolj.notering && (
                    <p className="mt-2 text-[11px] italic text-muted-foreground">{vagfundament.portfolj.notering}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Per innehav — öppna för hela 20×5-matrisen
                  </p>
                  <div className="mt-2 space-y-2">
                    {vagfundamentRader.map((rad) => (
                      <details key={rad.ticker} className="rounded-lg border border-gold/20 p-3">
                        <summary className="cursor-pointer text-sm">
                          <strong>{rad.ticker}</strong>
                          {rad.bolag.trim() ? <span className="text-xs text-muted-foreground"> — {rad.bolag.trim()}</span> : null}
                        </summary>
                        <div className="mt-3">
                          <VagfundamentMatris ticker={rad.ticker} />
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* DJUPANALYS — id="djup": AI-mentorns #djup-ankare scrollar hit */}
          <section id="djup" className="scroll-mt-24 rounded-xl border border-gold/40 bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold">Djupanalys — 5×5×4-ekosystemet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Live pris/volymdata via oberoende källor → Python-motor → 5 horisonter ×
                  5 teorier per aktie → viktad portföljbild.
                </p>
              </div>
              <Button onClick={korDjupanalys} disabled={djupBusy} className="btn-marin min-h-[44px]">
                {djupBusy ? "Analyserar (upp till 45 s)…" : "Kör djupanalys"}
              </Button>
            </div>
            <div className="hjarlinje mt-3" />

            {djup?.fel && <p className="mt-3 text-sm text-red-600">{djup.fel}</p>}

            {djup && !djup.fel && (
              <div className="mt-5 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Portföljens 25-cellers-matris (viktad) · täckning {djup.analysTackning}%
                  </p>
                  {/* 25-cellersmatris: scroll-wrapper + min-bredd så cellerna aldrig kläms på mobil */}
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-[280px] text-[11px]">
                      <thead>
                        <tr>
                          <th className="p-1"></th>
                          {(djup.horisonter as string[]).map((h) => (
                            <th key={h} className="p-1 capitalize text-muted-foreground">
                              {h.replace("medellang", "medellång")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(djup.teorier as string[]).map((t) => (
                          <tr key={t}>
                            <td className="p-1 pr-2 font-semibold capitalize">{t}</td>
                            {(djup.horisonter as string[]).map((h) => {
                              const v = djup.portfolj.matris25[`${t}.${h}`] || 0;
                              const styl =
                                v > 0.15
                                  ? "bg-green-100 text-green-800"
                                  : v < -0.15
                                    ? "bg-red-100 text-red-800"
                                    : "bg-muted text-muted-foreground";
                              return (
                                <td key={h} className={`p-1.5 text-center font-mono ${styl}`} title={`${t} · ${h}: ${v}`}>
                                  {v > 0.15 ? "▲" : v < -0.15 ? "▼" : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {djup.portfolj.celler.bull} ▲ · {djup.portfolj.celler.bear} ▼ · {djup.portfolj.celler.neutral} — →{" "}
                    <strong className="text-gold">{djup.portfolj.celler.bias}</strong>
                    {djup.portfolj.viktadSigma != null && (
                      <> · viktad σ {Math.round(djup.portfolj.viktadSigma * 100)} %/år</>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vågprofil per horisont (motorns klassificering, viktad)
                  </p>
                  <div className="mt-2 space-y-2">
                    {(djup.horisonter as string[]).map((hz) => {
                      const pr = djup.portfolj.vagProfil[hz];
                      return (
                        <div key={hz}>
                          <p className="text-[11px] capitalize">{hz.replace("medellang", "medellång")}</p>
                          <div className="mt-0.5 flex h-3.5 overflow-hidden rounded-full bg-muted text-[8px] leading-[14px] text-white">
                            {pr["impulsvåg"] > 0 && (
                              <div className="bg-green-600" style={{ width: `${pr["impulsvåg"]}%` }} title={`impulsvåg ${pr["impulsvåg"]}%`} />
                            )}
                            {pr.basbygge > 0 && (
                              <div className="bg-gold" style={{ width: `${pr.basbygge}%` }} title={`bas ${pr.basbygge}%`} />
                            )}
                            {pr.korrigering > 0 && (
                              <div className="bg-orange-600" style={{ width: `${pr.korrigering}%` }} title={`korrigering ${pr.korrigering}%`} />
                            )}
                            {pr.osatt > 0 && (
                              <div className="bg-muted-foreground/40" style={{ width: `${pr.osatt}%` }} title={`osatt ${pr.osatt}%`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Per aktie</p>
                  <div className="mt-2 space-y-3">
                    {djup.innehav.map((ih: any) => (
                      <details key={ih.ticker} className="rounded-lg border border-gold/20 p-3">
                        <summary className="cursor-pointer text-sm">
                          <strong>{ih.bolag}</strong>{" "}
                          <span className="text-xs text-muted-foreground">
                            {ih.viktProcent} %{" "}
                            {ih.analys.data
                              ? `· pris ${ih.analys.data.pris} · σ ${Math.round((ih.analys.data.sigma_ar || 0) * 100)} % · ${ih.analys.sammanfattning.bull}▲/${ih.analys.sammanfattning.bear}▼`
                              : ""}
                          </span>
                        </summary>
                        {ih.analys.data ? (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>
                              52v: {ih.analys.data.lag52}–{ih.analys.data.hojd52} (position{" "}
                              {Math.round(ih.analys.data.pos52 * 100)} %) · källor: {ih.analys.kallor}
                            </p>
                            {ih.analys.fundament && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {ih.analys.fundament.pe != null && (
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${ih.analys.fundament.pe < 15 ? "bg-bull/10 text-bull" : ih.analys.fundament.pe > 30 ? "bg-bear/10 text-bear" : "bg-muted"}`}>
                                    P/E {ih.analys.fundament.pe}
                                  </span>
                                )}
                                {ih.analys.fundament.pb != null && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">V05 P/B {ih.analys.fundament.pb}</span>
                                )}
                                {ih.analys.fundament.roe != null && (
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${ih.analys.fundament.roe >= 0.15 ? "bg-bull/10 text-bull" : "bg-muted"}`}>
                                    V09 ROE {Math.round(ih.analys.fundament.roe * 100)} %
                                  </span>
                                )}
                                {ih.analys.fundament.vinstmarginal != null && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                                    V08 marginal {Math.round(ih.analys.fundament.vinstmarginal * 100)} %
                                  </span>
                                )}
                                {ih.analys.fundament.tillvaxt != null && (
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${ih.analys.fundament.tillvaxt >= 0.1 ? "bg-bull/10 text-bull" : ih.analys.fundament.tillvaxt < 0 ? "bg-bear/10 text-bear" : "bg-muted"}`}>
                                    V01 tillväxt {ih.analys.fundament.tillvaxt > 0 ? "+" : ""}{Math.round(ih.analys.fundament.tillvaxt * 100)} %
                                  </span>
                                )}
                                {ih.analys.fundament.skuldEk != null && (
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${ih.analys.fundament.skuldEk > 150 ? "bg-bear/10 text-bear" : "bg-muted"}`}>
                                    V10 skuld/EK {Math.round(ih.analys.fundament.skuldEk)}
                                  </span>
                                )}
                                {ih.analys.fundament.utdelning != null && ih.analys.fundament.utdelning > 0 && (
                                  <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                                    utdelning {ih.analys.fundament.utdelning.toFixed(2)} %
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="mt-1">Vågor: {Object.values(ih.analys.vager).join(" → ")}</p>
                            <VagSkattning ticker={ih.ticker} motorSvar={ih.analys.vager?.kort} />
                            <p className="mt-1 italic">{ih.analys.notering}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-red-600">{ih.analys.fel}</p>
                        )}
                      </details>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] italic leading-relaxed text-muted-foreground">{djup.notering}</p>
              </div>
            )}
          </section>

          {/* Tips */}
          <section className="rounded-xl border border-gold/40 bg-paper p-5">
            <h3 className="font-serif text-xl font-bold">Tips & tankar</h3>
            <div className="hjarlinje mt-1.5" />
            <ul className="mt-3 space-y-2">
              {rapport.tips.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-gold">◆</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Begär analys */}
          <section className="rounded-xl border border-dashed border-gold/40 bg-card p-5">
            <h3 className="font-serif text-xl font-bold">Saknar du ett bolag?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Begär analys — förekomna önskemål prioriteras av grundaren.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                value={begaran}
                onChange={(e) => setBegaran(e.target.value)}
                placeholder="Ticker eller bolagsnamn (t.ex. SAAB-B)"
                className="max-w-xs min-h-[44px] flex-1"
              />
              <Button
                variant="outline"
                onClick={async () => {
                  if (!begaran.trim()) return;
                  setBegaranStatus("Skickar…");
                  try {
                    const res = await fetch("/api/member/analys-efterfragad", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: medlem.email, ticker: begaran.trim() }),
                    });
                    setBegaranStatus(res.ok ? "Tack! Önskemålet är registrerat." : "Kunde inte skicka — försök igen.");
                    if (res.ok) setBegaran("");
                  } catch {
                    setBegaranStatus("Nätverksfel");
                  }
                }}
                className="min-h-[44px]"
              >
                Begär analys
              </Button>
            </div>
            {begaranStatus && <p className="mt-2 text-xs text-gold">{begaranStatus}</p>}
          </section>

          {/* Fråga portföljen */}
          <section className="rounded-xl border border-gold/20 bg-card p-5">
            <h3 className="font-serif text-xl font-bold">Fråga portföljen</h3>
            <div className="hjarlinje mt-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">
              Regelbaserad analys från DINA siffror — svarar på risk, vågor, AKM1, spridning.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input value={fraga} onChange={(e) => setFraga(e.target.value)} placeholder="t.ex. hur stor är risken?" className="min-h-[44px]" />
              {/* VÅG 78 B7: knappen var död (svaret renderas redan live via
                  svara-memo:t). Nu öppnar den AI-mentorn med frågan
                  förhandsfylld — samma CustomEvent-mönster som
                  "ak1a:oppna-sok" (chat-widget lyssnar globalt). */}
              <Button
                variant="outline"
                className="min-h-[44px] shrink-0"
                title="Öppna AI-mentorn med din fråga förhandsfylld"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("ak1a:oppna-mentor", {
                      detail: { fraga: fraga.trim() || undefined },
                    })
                  )
                }
              >
                Fråga mentorn →
              </Button>
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

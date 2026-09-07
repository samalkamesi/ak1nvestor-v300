"use client";

import * as React from "react";
import {
  Check,
  Clock,
  Database,
  FileJson,
  History,
  Lock,
  Pencil,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { adminHeaders, adminJsonHeaders, sparaAdminLosenord } from "@/lib/admin-klient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * VARIABEL-PANELN — admin-mega steg 1 (våg 79, STYRELSE-ADMIN-MEGA
 * BYGGKONTRAKT STEG 1, PANEL-UI-agenten).
 *
 * Kundens "Excel på långt håll": prisvärden redigerbara utan deploy.
 * Guldkällan är priser.json (fil-default) + Supabase-override där
 * SENASTE raden vinner (system_events type="variabel", m10/mÖs-
 * mönstret) — ändringen slår igenom på sajten vid nästa sidbygge
 * (ISR 5 min).
 *
 * KÄLLOR (x-admin-password via admin-klienten — samma lås-rad som
 * övriga admin-paneler):
 *   GET  /api/admin/variabler   (poster + logg: senaste 20 ändringar)
 *   POST /api/admin/variabler   ({nyckel, varde} → Supabase-override)
 *
 * LÅS (KONTRAKT): panelen ändrar ENDAST värden på de kanoniska
 * nycklarna — aldrig skapa nya nivåer (de lever i filen), aldrig
 * negativa/tomma värden, gratis-Fas-1 röras aldrig (ligger utanför
 * priser.json och panelens nyckeluppsättning). Valideringen finns
 * både här (UI-låset) och i API-rutten (vitlista + heltal ≥ 0).
 */

// ── Svartyper (speglar API-kontraktet) ───────────────────────────────────────

type PosterRad = {
  nyckel: string;
  varde: number | null;
  filvarde: number | null;
  kalla: string | null;
  andrad: string | null;
};

type LoggRad = {
  nyckel: string | null;
  gammalt: number | string | null;
  nytt: number | string | null;
  av: string | null;
  kalla?: string | null;
  /** Tidstämpeln — kontraktet säger "tidpunkt", lib:en (variabler-lagring.ts)
   *  serialiserar "andrad" — panelen accepterar båda, defensivt. */
  tidpunkt?: string | null;
  andrad?: string | null;
};

type GetSvar = {
  ok?: boolean;
  poster?: PosterRad[];
  logg?: LoggRad[];
  error?: string;
};

type PostSvar = {
  ok?: boolean;
  error?: string;
  meddelande?: string;
  notis?: string;
};

// ── Nyckelregistret — kanoniska nycklar + läsbara etiketter ─────────────────

type GruppId = "privat" | "b2b" | "fas";

type NyckelInfo = { nyckel: string; etikett: string; grupp: GruppId; enhet: string };

const NYCKLAR: readonly NyckelInfo[] = [
  { nyckel: "pris.forskning.manad", etikett: "Portföljforskning Grund", grupp: "privat", enhet: "kr/mån · inkl. moms" },
  { nyckel: "pris.forskning.ar", etikett: "Portföljforskning Grund — årsplan", grupp: "privat", enhet: "kr/år · inkl. moms" },
  { nyckel: "pris.forskning-plus.manad", etikett: "Portföljforskning Plus", grupp: "privat", enhet: "kr/mån · inkl. moms" },
  { nyckel: "pris.forskning-plus.ar", etikett: "Portföljforskning Plus — årsplan", grupp: "privat", enhet: "kr/år · inkl. moms" },
  { nyckel: "pris.portfolj-hyra.manad", etikett: "Portföljhyra", grupp: "privat", enhet: "kr/mån · inkl. moms" },
  { nyckel: "pris.portfolj-hyra.ar", etikett: "Portföljhyra — årsplan", grupp: "privat", enhet: "kr/år · inkl. moms" },
  { nyckel: "pris.pro-analytiker.manad", etikett: "Pro Analytiker", grupp: "b2b", enhet: "kr/mån/seat · exkl. moms" },
  { nyckel: "pris.pro-studio.manad", etikett: "Pro Studio", grupp: "b2b", enhet: "kr/mån/seat · exkl. moms" },
  { nyckel: "pris.pro-institution.manad", etikett: "Pro Institution", grupp: "b2b", enhet: "kr/mån/seat · exkl. moms" },
  { nyckel: "pris.b2b-onboarding.engang", etikett: "B2B-onboarding", grupp: "b2b", enhet: "engångspris · exkl. moms" },
  { nyckel: "pris.fas2.engang", etikett: "Fas 2-utbildningen", grupp: "fas", enhet: "engångspris · inkl. moms" },
  { nyckel: "pris.fas3.engang", etikett: "Fas 3-utbildningen", grupp: "fas", enhet: "engångspris · inkl. moms" },
  { nyckel: "pris.fas3-intro.manad", etikett: "Fas 3-intro — Pro Analytiker", grupp: "fas", enhet: "kr/mån · exkl. moms" },
];

const GRUPPER: readonly { id: GruppId; rubrik: string; beskrivning: string }[] = [
  {
    id: "privat",
    rubrik: "Privatnivåer",
    beskrivning: "Prenumerationsnivåerna i priser.json (forskning, plus, hyra) — månads- och årsplan.",
  },
  {
    id: "b2b",
    rubrik: "B2B-nivåer",
    beskrivning: "Pro-nivåerna per seat samt onboarding-engången (B2B-BESLUT §3.4).",
  },
  {
    id: "fas",
    rubrik: "Fas-utbildningar",
    beskrivning: "Fas 2/Fas 3-engångsprisen och Fas 3-intros introduktionspris (våg 78 A6).",
  },
];

// ── Hjälpare ─────────────────────────────────────────────────────────────────

function tidSedan(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const sek = Math.floor((Date.now() - t) / 1000);
  if (sek < 60) return `${sek}s sedan`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min}m sedan`;
  const tim = Math.floor(min / 60);
  if (tim < 24) return `${tim}h sedan`;
  return `${Math.floor(tim / 24)}d sedan`;
}

function datumKort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

/** Tidstämpeln på en loggrad — "tidpunkt" (kontraktet) eller "andrad" (lib:en). */
function tidpunktAv(rad: LoggRad): string | null {
  return rad.tidpunkt ?? rad.andrad ?? null;
}

const sv = (n: number | null | undefined): string =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("sv-SE") : "—";

/** Låsikon + tooltip: panelen ändrar värden — nivåerna lever i filen. */
function LasIkon() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="Låst nyckel" className="shrink-0 text-muted-foreground/70 hover:text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        Nivåer skapas/i filen — panelen ändrar värden
      </TooltipContent>
    </Tooltip>
  );
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function VariabelPanel() {
  const { toast } = useToast();
  const [data, setData] = React.useState<GetSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const posterEfterNyckel = React.useMemo(() => {
    const karta = new Map<string, PosterRad>();
    for (const p of data?.poster ?? []) karta.set(p.nyckel, p);
    return karta;
  }, [data]);

  const hamta = React.useCallback(async () => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    try {
      const res = await fetch("/api/admin/variabler", { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        setLosenFel(json.error || "Admin-lösenord krävs.");
        setData(null);
        return;
      }
      if (res.ok) {
        setData((await res.json()) as GetSvar);
        setBehoverLosen(false);
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFel(json.error || `Kunde inte hämta variabler (HTTP ${res.status}).`);
      }
    } catch {
      setFel("Nätverksfel — kunde inte hämta variabeldata.");
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    void hamta();
  }, [hamta]);

  // 60 s-poll som övriga livepaneler — endast när fliken syns.
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !behoverLosen) void hamta();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [hamta, behoverLosen]);

  const lasUpp = async () => {
    if (!losenord) return;
    sparaAdminLosenord(losenord); // admin-klienten bär den på kommande anrop
    await hamta();
  };

  /** POST en ändring — UI-låset (heltal ≥ 0) är redan passeraat här. */
  const spara = React.useCallback(
    async (info: NyckelInfo, nyttVarde: number, gammalt: number | null): Promise<boolean> => {
      try {
        const res = await fetch("/api/admin/variabler", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ nyckel: info.nyckel, varde: nyttVarde }),
        });
        const json = (await res.json().catch(() => ({}))) as PostSvar;
        if (res.ok && json.ok !== false) {
          toast({
            title: "Sparat — Supabase-override aktiv",
            description: `${info.etikett}: ${sv(gammalt)} → ${sv(nyttVarde)} ${info.enhet.split(" · ")[0]}. Syns på sajten vid nästa sidbygge (ISR 5 min).`,
          });
          void hamta();
          return true;
        }
        toast({
          variant: "destructive",
          title: "Sparningen misslyckades",
          description: json.error || `Servern svarade HTTP ${res.status} utan meddelande.`,
        });
        return false;
      } catch {
        toast({
          variant: "destructive",
          title: "Sparningen misslyckades",
          description: "Nätverksfel — värdet sparades inte. Försök igen.",
        });
        return false;
      }
    },
    [toast, hamta],
  );

  // ── Lås-vy (samma mönster som översättningspanelen) ───────────────────────
  if (behoverLosen && !data) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Variabler — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Prisvärdena skyddas av ADMIN_PASSWORD — lämnad i headern x-admin-password,
          samma mönster som övriga admin-rutter.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="max-w-xs"
          />
          <Button onClick={lasUpp} className="bg-gold text-background hover:bg-gold/90">
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-600">{losenFel}</p>}
      </div>
    );
  }

  const logg = (data?.logg ?? []).slice(0, 20);

  return (
    <div className="space-y-5">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Variabler 📊</h3>
          <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
            GULDKÄLLA
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            <Clock className="mr-1 h-3 w-3" /> LIVE · 60 s
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
          <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
        </Button>
      </div>

      {/* Överskrift med förklaring av mekaniken */}
      <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <FileJson className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-gold" />
        Guldkällan: priser.json (fil) + Supabase-override (senaste vinner) — ändringen slår
        igenom på sajten vid nästa sidbygge (ISR 5 min).
      </p>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {laddar && !data && <p className="text-xs text-muted-foreground">Hämtar variabler …</p>}

      {/* Grupperade nycklar */}
      {GRUPPER.map((grupp) => (
        <div key={grupp.id} className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-serif text-sm font-bold">{grupp.rubrik}</h4>
            <span className="text-[10px] text-muted-foreground">{grupp.beskrivning}</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {NYCKLAR.filter((n) => n.grupp === grupp.id).map((info) => (
              <VariabelRad
                key={info.nyckel}
                info={info}
                rad={posterEfterNyckel.get(info.nyckel) ?? null}
                spara={spara}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Logg — senaste 20 ändringarna */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold" />
            <h4 className="font-serif text-sm font-bold">Senaste ändringarna ({logg.length})</h4>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Revisbarhet: varje skrivning loggas som system_event med gammalt/nytt värde.
          </span>
        </div>
        {logg.length === 0 ? (
          <p className="mt-3 rounded-md border border-bull/40 bg-card px-3 py-4 text-center text-xs text-muted-foreground">
            <Database className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-green-600" />
            Inga ändringar loggade än — filvärdena i priser.json gäller rakt av.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {logg.map((rad, i) => (
              <li
                key={(tidpunktAv(rad) ?? String(i)) + ":" + (rad.nyckel ?? "") + ":" + i}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card px-3 py-2 text-[11px]"
              >
                <Badge variant="outline" className="max-w-full truncate text-[10px] tabular-nums">
                  {rad.nyckel ?? "okänd nyckel"}
                </Badge>
                <span className="tabular-nums text-muted-foreground">
                  {sv(typeof rad.gammalt === "number" ? rad.gammalt : Number(rad.gammalt))} →{" "}
                  <span className="font-semibold text-foreground">
                    {sv(typeof rad.nytt === "number" ? rad.nytt : Number(rad.nytt))}
                  </span>
                </span>
                <span className="text-muted-foreground">av {rad.av || "admin"}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {datumKort(tidpunktAv(rad))} · {tidSedan(tidpunktAv(rad))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── En nyckelrad: etikett · nu-värde · filvärde · inline-edit ────────────────

function VariabelRad({
  info,
  rad,
  spara,
}: {
  info: NyckelInfo;
  rad: PosterRad | null;
  spara: (info: NyckelInfo, nyttVarde: number, gammalt: number | null) => Promise<boolean>;
}) {
  const [redigerar, setRedigerar] = React.useState(false);
  const [text, setText] = React.useState("");
  const [arbetar, setArbetar] = React.useState(false);

  const nuVarde = rad?.varde ?? null;
  const filVarde = rad?.filvarde ?? null;
  const harOverride =
    !!rad &&
    (rad.kalla === "panel" ||
      rad.kalla === "supabase" ||
      rad.kalla === "override" ||
      (filVarde !== null && nuVarde !== filVarde));

  // UI-låset: negativa/tomma/icke-heltal kan ALDRIG skickas.
  const tal = Number(text.trim());
  const giltigt = text.trim() !== "" && Number.isInteger(tal) && tal >= 0;

  const oppnaEdit = () => {
    setText(nuVarde !== null ? String(nuVarde) : "");
    setRedigerar(true);
  };

  const sparaRad = async () => {
    if (!giltigt) return;
    setArbetar(true);
    const ok = await spara(info, tal, nuVarde);
    setArbetar(false);
    if (ok) setRedigerar(false);
  };

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Etikett + nyckel + lås */}
        <div className="flex min-w-0 items-center gap-2">
          <LasIkon />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold" title={info.nyckel}>
              {info.etikett}
            </p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">{info.nyckel}</p>
          </div>
        </div>

        {/* Nu-värde (stort) + filvärde (grått) + ändrad-stämpel */}
        {!redigerar ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-serif text-2xl font-bold tabular-nums" title={info.enhet}>
              {sv(nuVarde)}
            </span>
            <span className="text-[10px] text-muted-foreground">{info.enhet}</span>
            {filVarde !== null && (
              <span className="text-[10px] text-muted-foreground/70">fil: {sv(filVarde)}</span>
            )}
            {harOverride ? (
              <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
                Supabase-override
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                fil-värde gäller
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              ändrad: {rad?.andrad ? `${datumKort(rad.andrad)} · ${tidSedan(rad.andrad)}` : "aldrig"}
            </span>
            <Button size="sm" variant="outline" onClick={oppnaEdit} disabled={arbetar || !rad}>
              <Pencil className="mr-1 h-3 w-3" /> Ändra
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && giltigt && sparaRad()}
              className="h-8 w-32 text-right tabular-nums"
              placeholder="nytt värde"
              aria-label={`Nytt värde för ${info.etikett}`}
            />
            <span className="text-[10px] text-muted-foreground">{info.enhet}</span>
            <Button
              size="sm"
              className="bg-gold text-background hover:bg-gold/90"
              disabled={arbetar || !giltigt}
              onClick={sparaRad}
            >
              {arbetar ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
              Spara
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={arbetar}
              onClick={() => {
                setRedigerar(false);
                setText("");
              }}
            >
              <X className="mr-1 h-3 w-3" /> Avbryt
            </Button>
          </div>
        )}
      </div>

      {/* Inline-valideringshint — låset syns i UI:t */}
      {redigerar && text.trim() !== "" && !giltigt && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-red-600">
          <X className="h-3 w-3" />
          Värdet måste vara ett heltal ≥ 0 — negativa eller tomma värden kan inte sparas.
        </p>
      )}
      {redigerar && giltigt && nuVarde !== null && tal !== nuVarde && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-green-700 dark:text-green-400">
          <Check className="h-3 w-3" />
          Ändring: {sv(nuVarde)} → {sv(tal)} — filen förblir {sv(filVarde)} (senaste vinner).
        </p>
      )}
      {!rad && !redigerar && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Nyckeln saknas i API-svaret — redigering inaktiverad tills den finns i registret.
        </p>
      )}
    </div>
  );
}

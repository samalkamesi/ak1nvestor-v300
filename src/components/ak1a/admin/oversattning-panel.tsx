"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Globe,
  Languages,
  Lock,
  Pencil,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * ÖVERSÄTTNINGS-PANELN — MÖS granskningsbänk (Våg 52 agent C).
 *
 * Kunddirektiv: "vi måste garantera att översättningen har också rätt
 * översättning" — MÄNNISKOKONTROLLEN är inbyggd: maskinens utkast (90–99 poäng)
 * publiceras ALDRIG automatiskt; varje objekt passerar denna panel där
 * administratören ser svensk källtext brevid översättningen (AR höger-till-
 * vänster), kvalitetspoäng + full kontrollrapport (termer, siffror, struktur,
 * längd) och kan redigera (omkontroll! ärlig poäng även för mänsklig text),
 * godkänna, publicera (varning under 90 — force med intyg) eller avslå.
 *
 * KÄLLOR (60 s-poll, x-admin-password — samma lås-rad som Trafik & Säkerhet):
 *   GET  /api/admin/oversattning          (sammanfattning + granskningskö + rond)
 *   POST /api/admin/oversattning          (godkann | publicera | avslå | redigera)
 *   GET  /api/admin/oversattning/termbank (banken + levande tillägg)
 *   POST /api/admin/oversattning/termbank (lägg/uppdatera/ta bort term)
 *
 * Språkregistret läser panelen ur API-svaret (MALSPRAK ur översättnings-
 * modulen på servern) — framtida språk dyker upp automatiskt, AR dir=rtl.
 *
 * AK1A-DNA: guld-accenter, serif-rubriker, tabular-nums, tomma läget
 * uppmuntrande ("Allt översatt och publicerat — inget att granska").
 */

// ── Svartyper (speglar API-routerna) ─────────────────────────────────────────

type KontrollResultat = {
  namn: "termKonsistens" | "sifferIntegritet" | "strukturIntegritet" | "lateralKolla";
  pass: boolean;
  detaljer: string;
};

type Kontrollrapport = { poang: number; resultat: readonly KontrollResultat[] };

type KoRad = {
  id: number | null;
  scope_typ: string;
  scope_nyckel: string;
  sprak: string;
  status: string;
  kvalitet: number;
  kallhash: string;
  text: string;
  kontrollrapport: Kontrollrapport | { tom: true } | null;
  uppdaterad: string;
  kalltext: string | null;
  kallaAndrad: boolean;
};

type SprakSammanfattning = {
  namn: string;
  dir: "ltr" | "rtl";
  totaltKallor: number;
  publicerad: number;
  granskningsKo: number;
  vantarMotor: number;
  vantarKvot?: number;
  inaktuell: number;
  utkast: number;
  kraverGranskning: number;
  granskad: number;
  procentPublicerad: number;
};

/** Täckning per kategori (scope_typ × språk) — våg 62. */
type TypSammanfattning = {
  namn: string;
  totaltKallor: number;
  publiceradTotalt: number;
  procentPublicerad: number;
  perSprak: Record<
    string,
    { publicerad: number; granskningsKo: number; vantarMotor: number; vantarKvot?: number; inaktuell: number; procentPublicerad: number }
  >;
};

/** "Kvar i gratis-kvot"-estimat (ca 5 000 ord/dygn) — våg 62. */
type KvotEstimat = {
  ordPerDygn: number;
  ordKvar: number;
  dagarKvar: number;
  perSprak: Record<string, { ordKvar: number; dagarKvar: number }>;
  notering: string;
};

type OversattningSvar = {
  ok?: boolean;
  genererad?: string;
  motorAktiv?: boolean;
  lage?: "tabell" | "events" | "tabell-saknas" | "ko";
  lagerFel?: string | null;
  konfigurationKravs?: { rubrik: string; instruktion: string } | null;
  sprakRegister?: { id: string; namn: string; dir: "ltr" | "rtl" }[];
  sammanfattning?: {
    totaltKallor: number;
    oversattningsobjekt: number;
    perSprak: Record<string, SprakSammanfattning>;
    perTyp?: Record<string, TypSammanfattning>;
    kvot?: KvotEstimat;
    kallfel?: string | null;
  };
  ko?: KoRad[];
  koSidinfo?: { sida: number; perSida: number; totalt: number; sidor: number };
  termbank?: { statiska: number; tillagg: number };
  senasteRond?: { datum: string | null; rapport: string } | null;
};

type TermRadVy = { sv: string; en: string; ar: string; kat: string; notering?: string; uppdaterad?: string; kalla?: "fil" | "supabase" | "bada" };

type TermbankSvar = {
  ok?: boolean;
  antalStatiska?: number;
  antalTillagg?: number;
  kategorier?: string[];
  statiska?: TermRadVy[];
  tillagg?: TermRadVy[];
  notering?: string;
  /** Våg 79: lagrens läge — Supabase (sanningen) vs filen (dev-spegling). */
  lage?: {
    supabase: { ok: boolean; antal: number | null; fel: string | null };
    fil: { antal: number };
    synkaLokalt: boolean;
    instruktion?: string | null;
  };
};

type PostSvar = {
  ok?: boolean;
  error?: string;
  varning?: string;
  kraverForce?: boolean;
  notis?: string;
  status?: string;
  kvalitet?: number;
  kontrollrapport?: Kontrollrapport | null;
  meddelande?: string;
};

// ── Etiketter ────────────────────────────────────────────────────────────────

const STATUS_ETIKETT: Record<string, { text: string; cls: string }> = {
  utkast: { text: "Utkast — väntar granskning", cls: "border-gold/40 text-gold" },
  "maskinutkast-behovar-granskning": { text: "Kräver granskning", cls: "border-orange-500/40 text-orange-600 dark:text-orange-400" },
  granskad: { text: "Granskad — väntar publicering", cls: "border-blue-500/40 text-blue-600 dark:text-blue-400" },
  publicerad: { text: "Publicerad", cls: "border-bull/40 text-green-700 dark:text-green-400" },
  "vantar-motor": { text: "Väntar motor", cls: "border-border text-muted-foreground" },
  "vantar-kvot": { text: "Väntar kvot (MyMemory-gratisnivån)", cls: "border-border text-muted-foreground" },
  inaktuell: { text: "Inaktuell — köas om", cls: "border-red-500/40 text-red-600 dark:text-red-400" },
};

const KONTROLL_ETIKETT: Record<string, string> = {
  termKonsistens: "Termer mot termbanken",
  sifferIntegritet: "Sifferintegritet",
  strukturIntegritet: "Struktur & stycken",
  lateralKolla: "Längd & teckenläckor",
};

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

const sv = (n: number | undefined): string => (n ?? 0).toLocaleString("sv-SE");

/** Poängbadge — grönn ≥ 90, guld 70–89, orange < 70. */
function PoangBadge({ poang }: { poang: number }) {
  const cls =
    poang >= 90
      ? "border-bull/40 text-green-700 dark:text-green-400"
      : poang >= 70
        ? "border-gold/40 text-gold"
        : "border-orange-500/40 text-orange-600 dark:text-orange-400";
  return (
    <Badge variant="outline" className={cn("tabular-nums", cls)}>
      {poang}/100
    </Badge>
  );
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function OversattningPanel() {
  const [data, setData] = React.useState<OversattningSvar | null>(null);
  const [termbank, setTermbank] = React.useState<TermbankSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  // Granskningskönens filter
  const [sprakFilter, setSprakFilter] = React.useState("alla");
  const [statusFilter, setStatusFilter] = React.useState("granskningsko");
  const [sida, setSida] = React.useState(1);

  const hamta = React.useCallback(
    async (pwd?: string, sidaArg?: number, sprakArg?: string, statusArg?: string) => {
      setLaddar(true);
      setFel("");
      setLosenFel("");
      const headers = pwd ? { "x-admin-password": pwd } : undefined;
      const params = new URLSearchParams({ sida: String(sidaArg ?? sida) });
      const sprak = sprakArg ?? sprakFilter;
      const status = statusArg ?? statusFilter;
      if (sprak !== "alla") params.set("sprak", sprak);
      if (status !== "granskningsko") params.set("status", status);
      try {
        const [hRes, tRes] = await Promise.all([
          fetch(`/api/admin/oversattning?${params}`, { headers }),
          fetch("/api/admin/oversattning/termbank", { headers }),
        ]);
        if (hRes.status === 401 || hRes.status === 429) {
          const json = (await hRes.json().catch(() => ({}))) as { error?: string };
          setBehoverLosen(true);
          setLosenFel(json.error || "Admin-lösenord krävs.");
          setData(null);
          setTermbank(null);
          return;
        }
        if (hRes.ok) setData((await hRes.json()) as OversattningSvar);
        if (tRes.ok) setTermbank((await tRes.json()) as TermbankSvar);
        setBehoverLosen(false);
      } catch {
        setFel("Nätverksfel — kunde inte hämta översättningsdata.");
      } finally {
        setLaddar(false);
      }
    },
    [sida, sprakFilter, statusFilter],
  );

  React.useEffect(() => {
    void hamta();
  }, []);

  // 60 s-poll som övriga livepaneler — endast när fliken syns.
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !behoverLosen) void hamta();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [hamta, behoverLosen]);

  const bytFilter = (sprak?: string, status?: string) => {
    const nastaSida = 1;
    setSida(nastaSida);
    if (sprak) setSprakFilter(sprak);
    if (status) setStatusFilter(status);
    void hamta(undefined, nastaSida, sprak ?? sprakFilter, status ?? statusFilter);
  };

  const lasUpp = async () => {
    if (!losenord) return;
    await hamta(losenord);
  };

  /** POST en åtgärd — lösenordet följer med i headern (samma lås-rad). */
  const utfor = React.useCallback(
    async (body: Record<string, unknown>): Promise<PostSvar> => {
      try {
        const res = await fetch("/api/admin/oversattning", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(losenord ? { "x-admin-password": losenord } : {}) },
          body: JSON.stringify(body),
        });
        const json = (await res.json().catch(() => ({}))) as PostSvar;
        if (res.ok || res.status === 409) {
          void hamta();
          return json;
        }
        return { ...json, ok: false };
      } catch {
        return { ok: false, error: "Nätverksfel — åtgärden genomfördes inte." };
      }
    },
    [losenord, hamta],
  );

  // ── Lås-vy ─────────────────────────────────────────────────────────────────
  if (behoverLosen && !data) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Översättning — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Granskningskön och termbanken skyddas av ADMIN_PASSWORD — lämnad i
          headern x-admin-password, samma mönster som övriga admin-rutter.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="max-w-xs"
          />
          <Button onClick={lasUpp} className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0">
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-600">{losenFel}</p>}
      </div>
    );
  }

  const register = data?.sprakRegister ?? [];
  const senasteRond = data?.senasteRond ?? null;

  return (
    <div className="space-y-5">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Översättning 🌍</h3>
          <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
            LIVE · 60 s
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {data?.motorAktiv ? (
              <><ShieldCheck className="mr-1 h-3 w-3 text-green-600" /> ZAI-motor aktiv</>
            ) : (
              <><Clock className="mr-1 h-3 w-3" /> ZAI inaktiv — köat som vantar-motor</>
            )}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
          <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
        </Button>
      </div>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {data?.sammanfattning?.kallfel && (
        <p className="text-xs text-orange-600 dark:text-orange-400">{data.sammanfattning.kallfel}</p>
      )}

      {/* Events-backend-notis (våg 62): lagret fungerar — men bästa läget väntar */}
      {data?.lage === "events" && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/[0.05] px-3 py-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
          system_events-backend aktiv — tabellen <span className="font-mono">oversattningar</span> saknas ännu
          (kör <span className="font-mono">data/sql/oversattningar.sql</span> för bästa läget: unika nycklar + publik
          RLS-läsning). Granskning och publicering fungerar ändå — läsning/skrivning går via lagret med samma
          senaste-vinner-regler som speglarna.
        </p>
      )}

      {/* Konfigurationskort — tabellen saknas: aldrig krasch, alltid instruktion */}
      {data?.konfigurationKravs && (
        <div className="rounded-lg border border-orange-500/40 bg-orange-500/[0.04] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-orange-500" />
            <h4 className="font-serif text-sm font-bold">{data.konfigurationKravs.rubrik}</h4>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{data.konfigurationKravs.instruktion}</p>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Nedanstående speglar den lokala fallback-kön (data/oversattning-kö.json) — läsning fungerar,
            men granskning/publicering kräver tabellen för att bestå.
          </p>
        </div>
      )}
      {!data?.konfigurationKravs && data?.lagerFel && (
        <p className="text-xs text-orange-600 dark:text-orange-400">{data.lagerFel} — visar lokala fallback-kön.</p>
      )}

      {/* KPI-rad per språk */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {register.map((s) => {
          const sum = data?.sammanfattning?.perSprak?.[s.id];
          if (!sum) return null;
          return (
            <div key={s.id} className="rounded-lg border border-gold/30 bg-card p-4">
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 shrink-0 text-gold" />
                <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.namn} ({s.id.toUpperCase()}){s.dir === "rtl" ? " · RTL" : ""}
                </span>
              </div>
              <p className="mt-1 font-serif text-3xl font-bold tabular-nums">{sum.procentPublicerad}&nbsp;%</p>
              <p className="text-[10px] text-muted-foreground">
                {sv(sum.publicerad)} av {sv(sum.totaltKallor)} källor publicerat
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px] tabular-nums">
                  {sv(sum.granskningsKo)} i granskningskö
                </Badge>
                <Badge variant="outline" className="text-[10px] tabular-nums">
                  {sv(sum.vantarMotor)} väntar motor
                </Badge>
                {(sum.vantarKvot ?? 0) > 0 && (
                  <Badge variant="outline" className="text-[10px] tabular-nums">
                    {sv(sum.vantarKvot)} väntar kvot
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] tabular-nums">
                  {sv(sum.inaktuell)} inaktuella
                </Badge>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Senaste rond: {datumKort(senasteRond?.datum)}
              </p>
            </div>
          );
        })}
        {register.length === 0 && (
          <p className="text-xs text-muted-foreground">Ingen sammanfattning tillgänglig ännu.</p>
        )}
      </div>

      {/* Täckning per kategori (våg 62): scope_typ × språk + totalrad + kvotestimat */}
      {data?.sammanfattning?.perTyp && Object.keys(data.sammanfattning.perTyp).length > 0 && (
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gold" />
              <h4 className="font-serif text-sm font-bold">Täckning per kategori</h4>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {sv(data.sammanfattning.totaltKallor)} källor × {register.length} språk ={" "}
              {sv(data.sammanfattning.oversattningsobjekt)} översättningsobjekt
            </span>
          </div>
          {/* våg 104: minsta bredd — tabellen scrollar horisontellt på mobil i stället för att klämmas */}
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-1.5 pr-3 font-semibold">Kategori</th>
                  <th className="py-1.5 pr-3 text-right font-semibold">Källor</th>
                  {register.map((s) => (
                    <th key={s.id} className="py-1.5 pr-3 text-right font-semibold">
                      {s.namn} ({s.id.toUpperCase()}) · publ. / %
                    </th>
                  ))}
                  <th className="py-1.5 text-right font-semibold">Täckning</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.sammanfattning.perTyp).map(([typ, t]) => (
                  <tr key={typ} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-3 font-medium">
                      {t.namn || typ} <span className="ml-1 font-mono text-[10px] text-muted-foreground">{typ}</span>
                    </td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{sv(t.totaltKallor)}</td>
                    {register.map((s) => {
                      const ps = t.perSprak?.[s.id];
                      const proc = ps?.procentPublicerad ?? 0;
                      return (
                        <td key={s.id} className="py-1.5 pr-3 text-right tabular-nums">
                          {sv(ps?.publicerad)} /{" "}
                          <span
                            className={cn(
                              "font-semibold",
                              proc >= 80
                                ? "text-green-700 dark:text-green-400"
                                : proc > 0
                                  ? "text-gold"
                                  : "text-muted-foreground",
                            )}
                          >
                            {proc} %
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-1.5 text-right font-semibold tabular-nums">{t.procentPublicerad} %</td>
                  </tr>
                ))}
                {/* Totalrad */}
                <tr className="border-t-2 border-border font-semibold">
                  <td className="py-1.5 pr-3">Totalt</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{sv(data.sammanfattning.totaltKallor)}</td>
                  {register.map((s) => {
                    const ps = data.sammanfattning?.perSprak?.[s.id];
                    return (
                      <td key={s.id} className="py-1.5 pr-3 text-right tabular-nums">
                        {sv(ps?.publicerad)} / {ps?.procentPublicerad ?? 0} %
                      </td>
                    );
                  })}
                  <td className="py-1.5 text-right tabular-nums">
                    {data.sammanfattning.totaltKallor > 0 && register.length > 0
                      ? Math.round(
                          (register.reduce(
                            (summa, s) => summa + (data.sammanfattning?.perSprak?.[s.id]?.publicerad ?? 0),
                            0,
                          ) /
                            (data.sammanfattning.totaltKallor * register.length)) *
                            100,
                        )
                      : 0}{" "}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {data.sammanfattning.kvot && (
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <Clock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
              Kvar i gratis-kvot: ca <strong className="tabular-nums">{sv(data.sammanfattning.kvot.ordKvar)}</strong> ord
              (
              {register.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 ? " + " : ""}
                  {s.id.toUpperCase()} {sv(data.sammanfattning?.kvot?.perSprak?.[s.id]?.ordKvar)}
                </React.Fragment>
              ))}
              ) → ca <strong className="tabular-nums">{sv(data.sammanfattning.kvot.dagarKvar)}</strong> dygn à{" "}
              {sv(data.sammanfattning.kvot.ordPerDygn)} ord/dygn. {data.sammanfattning.kvot.notering}
            </p>
          )}
        </div>
      )}

      {/* Underflikar: granskning + termbank (våg 104: horisontell scroll på mobil) */}
      <Tabs defaultValue="granskning" className="w-full">
        <div className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-auto w-max flex-nowrap gap-1 rounded-lg bg-muted p-1">
            <TabsTrigger value="granskning" className="min-h-[44px] shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:min-h-0 sm:py-1.5 sm:text-sm">Granskningskö</TabsTrigger>
            <TabsTrigger value="termbank" className="min-h-[44px] shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:min-h-0 sm:py-1.5 sm:text-sm">Termbank ({sv(termbank?.antalStatiska)} + {sv(termbank?.antalTillagg)})</TabsTrigger>
            <TabsTrigger value="rond" className="min-h-[44px] shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:min-h-0 sm:py-1.5 sm:text-sm">Senaste rond</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Granskningskön ── */}
        <TabsContent value="granskning" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={sprakFilter} onValueChange={(v) => bytFilter(v, undefined)}>
                <SelectTrigger className="h-8 w-36 max-w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alla">Alla språk</SelectItem>
                  {register.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.namn} ({s.id.toUpperCase()})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => bytFilter(undefined, v)}>
                <SelectTrigger className="h-8 w-56 max-w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="granskningsko">Granskningskö (utkast+granskad)</SelectItem>
                  <SelectItem value="utkast">Utkast</SelectItem>
                  <SelectItem value="maskinutkast-behovar-granskning">Kräver granskning</SelectItem>
                  <SelectItem value="granskad">Granskad — väntar publicering</SelectItem>
                  <SelectItem value="publicerad">Publicerad</SelectItem>
                  <SelectItem value="vantar-motor">Väntar motor</SelectItem>
                  <SelectItem value="vantar-kvot">Väntar kvot</SelectItem>
                  <SelectItem value="inaktuell">Inaktuell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data?.koSidinfo && data.koSidinfo.totalt > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sida <= 1}
                  onClick={() => {
                    const n = sida - 1;
                    setSida(n);
                    void hamta(undefined, n);
                  }}
                >
                  Förra
                </Button>
                <span className="tabular-nums">
                  sida {data.koSidinfo.sida}/{data.koSidinfo.sidor} · {sv(data.koSidinfo.totalt)} poster
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sida >= (data.koSidinfo.sidor ?? 1)}
                  onClick={() => {
                    const n = sida + 1;
                    setSida(n);
                    void hamta(undefined, n);
                  }}
                >
                  Nästa
                </Button>
              </div>
            )}
          </div>

          {(data?.ko ?? []).length === 0 ? (
            <div className="rounded-lg border border-bull/40 bg-card p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 font-serif text-base font-bold">Allt översatt och publicerat — inget att granska</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {sv(data?.sammanfattning?.oversattningsobjekt)} översättningsobjekt ({sv(data?.sammanfattning?.totaltKallor)} källor ×
                {" "}{register.length} språk) i registret. Senaste rond: {datumKort(senasteRond?.datum)}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.ko ?? []).map((rad) => (
                <GranskningsKort
                  key={(rad.id ?? 0) + ":" + rad.scope_typ + ":" + rad.scope_nyckel + ":" + rad.sprak}
                  rad={rad}
                  utfor={utfor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Termbanken ── */}
        <TabsContent value="termbank" className="mt-4 space-y-4">
          <TermbankVy termbank={termbank} losenord={losenord} onAndrad={() => hamta()} />
        </TabsContent>

        {/* ── Senaste rond-rapporten ── */}
        <TabsContent value="rond" className="mt-4">
          <div className="rounded-lg border border-gold/30 bg-card p-4">
            <div className="flex min-w-0 items-center gap-2">
              <Languages className="h-4 w-4 shrink-0 text-gold" />
              <h4 className="font-serif text-sm font-bold">
                Senaste översättningsrond {senasteRond?.datum ? "— " + datumKort(senasteRond.datum) : ""}
              </h4>
            </div>
            {senasteRond ? (
              <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-[11px] leading-relaxed">
                {senasteRond.rapport}
              </pre>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Ingen rond har körts ännu — cronden (/api/cron/oversatt) skriver data/rapporter/oversattning-SENASTE.md
                vid varje körning.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Granskningskort: källtext brevid översättning + åtgärder ─────────────────

function GranskningsKort({
  rad,
  utfor,
}: {
  rad: KoRad;
  utfor: (body: Record<string, unknown>) => Promise<PostSvar>;
}) {
  const [oppnad, setOppnad] = React.useState(false);
  const [redigerar, setRedigerar] = React.useState(false);
  const [text, setText] = React.useState(rad.text);
  const [resultat, setResultat] = React.useState<PostSvar | null>(null);
  const [arbetar, setArbetar] = React.useState(false);
  const [forceFraga, setForceFraga] = React.useState(false);

  const rtl = rad.sprak === "ar";
  const statusE = STATUS_ETIKETT[rad.status] ?? { text: rad.status, cls: "border-border text-muted-foreground" };
  const rapport = rad.kontrollrapport && !("tom" in rad.kontrollrapport) ? rad.kontrollrapport : null;
  const ident = rad.id !== null ? { id: rad.id } : { scope_typ: rad.scope_typ, scope_nyckel: rad.scope_nyckel, sprak: rad.sprak };

  const kör = async (body: Record<string, unknown>) => {
    setArbetar(true);
    const svar = await utfor(body);
    setArbetar(false);
    setResultat(svar);
    if (svar.kraverForce) setForceFraga(true);
    if (svar.ok) {
      setRedigerar(false);
      setForceFraga(false);
    }
    return svar;
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Rubrikrad: scope (klickbar) + badges */}
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setOppnad((v) => !v)}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {oppnad ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gold" />}
          <span className="truncate font-mono text-xs font-semibold" title={rad.scope_typ + ":" + rad.scope_nyckel}>
            {rad.scope_typ}:{rad.scope_nyckel}
          </span>
          <Badge variant="secondary" className="text-[10px] uppercase">{rad.sprak}</Badge>
          <Badge variant="outline" className={cn("text-[10px]", statusE.cls)}>{statusE.text}</Badge>
          <PoangBadge poang={rad.kvalitet} />
          {rad.kallaAndrad && (
            <Badge variant="outline" className="border-orange-500/40 text-[10px] text-orange-600 dark:text-orange-400">
              <AlertTriangle className="mr-1 h-3 w-3" /> källan ändrad
            </Badge>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">{tidSedan(rad.uppdaterad)}</span>
      </button>

      {oppnad && (
        <div className="mt-3 space-y-3">
          {/* Två kolumner: SV källa | översättning (AR dir=rtl) */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Källtext (Svenska)
              </p>
              <p className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">
                {rad.kalltext ?? "(källtexten finns inte längre i registret — objektet kan vara avlägsnat)"}
              </p>
            </div>
            <div className="rounded-md border border-gold/30 bg-gold/[0.03] p-3" dir={rtl ? "rtl" : "ltr"}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Översättning ({rad.sprak.toUpperCase()}){rtl ? " · höger-till-vänster" : ""}
              </p>
              <p className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">
                {rad.text || "(ingen text — fallback-kön bär inte text; kör data/sql/oversattningar.sql)"}
              </p>
            </div>
          </div>

          {/* Kontrollrapportens detaljer */}
          {rapport ? (
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className={cn("h-4 w-4", rapport.poang >= 90 ? "text-green-600" : "text-orange-500")} />
                <h5 className="text-xs font-semibold">Kontrollrapport — {rapport.poang}/100</h5>
              </div>
              <ul className="mt-2 space-y-1.5">
                {rapport.resultat.map((k) => (
                  <li key={k.namn} className="flex items-start gap-2 text-[11px]">
                    {k.pass ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                    ) : (
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                    )}
                    <span>
                      <span className="font-semibold">{KONTROLL_ETIKETT[k.namn] ?? k.namn}:</span>{" "}
                      <span className="text-muted-foreground">{k.detaljer}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Ingen kontrollrapport lagrad (objektet har inte passerat motorn — t.ex. vantar-motor).
            </p>
          )}

          {/* Redigeringsläge */}
          {redigerar ? (
            <div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir={rtl ? "rtl" : "ltr"}
                rows={Math.min(20, Math.max(4, Math.ceil((text.length || 80) / 80) + 1))}
                className="text-xs leading-relaxed"
                placeholder="Redigera översättningen — kontrollerna körs om vid sparandet"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0"
                  disabled={arbetar || !text.trim()}
                  onClick={() => kör({ action: "redigera", ...ident, text })}
                >
                  <Send className="mr-1 h-3 w-3" /> Spara + kör om kontroller
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRedigerar(false);
                    setText(rad.text);
                  }}
                  disabled={arbetar}
                >
                  Avbryt
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  Ärlig poäng: fyra kontroller (termer, siffror, struktur, längd) körs om på den nya texten.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setRedigerar(true)} disabled={arbetar || !rad.text}>
                <Pencil className="mr-1 h-3 w-3" /> Redigera
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500/40 text-blue-600 dark:text-blue-400"
                disabled={arbetar}
                onClick={() => kör({ action: "godkann", ...ident })}
              >
                <Check className="mr-1 h-3 w-3" /> Godkänn
              </Button>
              <Button
                size="sm"
                className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0"
                disabled={arbetar}
                onClick={() => kör({ action: "publicera", ...ident })}
              >
                <Send className="mr-1 h-3 w-3" /> Publicera
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/40 text-red-600 dark:text-red-400"
                disabled={arbetar}
                onClick={() => kör({ action: "avslå", ...ident })}
              >
                <X className="mr-1 h-3 w-3" /> Avslå
              </Button>
            </div>
          )}

          {/* Force-bekräftelse vid publicering under tröskeln */}
          {forceFraga && resultat?.kraverForce && (
            <div className="rounded-md border border-orange-500/40 bg-orange-500/[0.04] p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">{resultat.varning}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="min-h-[44px] bg-orange-600 text-white hover:bg-orange-700 sm:min-h-0"
                  disabled={arbetar}
                  onClick={() => kör({ action: "publicera", ...ident, force: true })}
                >
                  Ja — jag intygar innehållet (force)
                </Button>
                <Button size="sm" variant="outline" onClick={() => setForceFraga(false)}>
                  Avbryt
                </Button>
              </div>
            </div>
          )}

          {/* Åtgärdens resultat */}
          {resultat && (
            <p className={cn("text-[11px]", resultat.ok ? "text-green-700 dark:text-green-400" : "text-red-600")}>
              {resultat.ok
                ? (resultat.notis ?? resultat.meddelande ?? `Klar — status nu: ${STATUS_ETIKETT[resultat.status ?? ""]?.text ?? resultat.status}`) +
                  (resultat.varning ? " Varning: " + resultat.varning : "") +
                  (typeof resultat.kvalitet === "number" ? ` (poäng ${resultat.kvalitet}/100)` : "")
                : (resultat.error ?? "Åtgärden misslyckades.") + (resultat.varning ? " " + resultat.varning : "")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Termbanksvyn: tabell + lägg-till-rad + tillägg ───────────────────────────

function TermbankVy({
  termbank,
  losenord,
  onAndrad,
}: {
  termbank: TermbankSvar | null;
  losenord: string;
  onAndrad: () => void;
}) {
  const [sok, setSok] = React.useState("");
  const [ny, setNy] = React.useState({ sv: "", en: "", ar: "", kat: "pedagogik", notering: "" });
  const [resultat, setResultat] = React.useState<PostSvar | null>(null);
  const [arbetar, setArbetar] = React.useState(false);

  const statiska = termbank?.statiska ?? [];
  const filtrerade = sok.trim()
    ? statiska.filter((t) =>
        (t.sv + " " + t.en + " " + t.ar).toLowerCase().includes(sok.trim().toLowerCase()),
      )
    : statiska;
  const visade = filtrerade.slice(0, 100);

  const posta = async (body: Record<string, unknown>) => {
    setArbetar(true);
    try {
      const res = await fetch("/api/admin/oversattning/termbank", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(losenord ? { "x-admin-password": losenord } : {}) },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as PostSvar;
      setResultat(res.ok ? { ...json, ok: true } : { ...json, ok: false });
      if (res.ok) onAndrad();
      return res.ok;
    } catch {
      setResultat({ ok: false, error: "Nätverksfel — termen sparades inte." });
      return false;
    } finally {
      setArbetar(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Den kanoniska banken ({sv(termbank?.antalStatiska)} termer, källfakta i src/lib/oversattning/termbank.ts) är
        rätt-översättningsgarantin: varje svensk term i en källa SKALL återfinnas med sin målterm — kontrolleras
        deterministiskt av pipelinens fyra kontroller. Nya termer läggs till här och ingår i pipelinen när raden
        slagits samman in i banken (status visas nedan — aldrig tyst).
      </p>

      {/* Våg 79: lagrens läge — Supabase (sanningen) + filen (dev-spegling) */}
      {termbank?.lage && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 text-[11px]",
            termbank.lage.synkaLokalt ? "border-orange-500/40 bg-orange-500/5" : "border-border bg-card",
          )}
        >
          <span className="font-semibold">Lager:</span>
          <span>
            Supabase:{" "}
            {termbank.lage.supabase.ok ? (
              <span className="font-medium tabular-nums">{sv(termbank.lage.supabase.antal ?? 0)} termer</span>
            ) : (
              <span className="text-red-600 dark:text-red-400" title={termbank.lage.supabase.fel ?? ""}>
                onåbart ({termbank.lage.supabase.fel ?? "okänd orsak"})
              </span>
            )}
          </span>
          <span>
            Fil: <span className="font-medium tabular-nums">{sv(termbank.lage.fil.antal)} termer</span>
          </span>
          {termbank.lage.synkaLokalt ? (
            <span className="font-medium text-orange-600 dark:text-orange-400">
              skillnad — synka lokalt: node verktyg/synka-termbank.mjs
            </span>
          ) : (
            <span className="text-muted-foreground">i synk</span>
          )}
        </div>
      )}

      {/* Lägg-till-rad */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <h4 className="font-serif text-sm font-bold">Lägg till / uppdatera term (sv → en → ar)</h4>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Svensk term (grundform)" value={ny.sv} onChange={(e) => setNy({ ...ny, sv: e.target.value })} className="text-xs" />
          <Input placeholder="English term" dir="ltr" value={ny.en} onChange={(e) => setNy({ ...ny, en: e.target.value })} className="text-xs" />
          <Input placeholder="المصطلح العربي" dir="rtl" value={ny.ar} onChange={(e) => setNy({ ...ny, ar: e.target.value })} className="text-xs" />
          <Select value={ny.kat} onValueChange={(v) => setNy({ ...ny, kat: v })}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(termbank?.kategorier ?? ["pedagogik"]).map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Notering (valfritt — varför detta val)"
            value={ny.notering}
            onChange={(e) => setNy({ ...ny, notering: e.target.value })}
            className="max-w-md text-xs"
          />
          <Button
            size="sm"
            className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0"
            disabled={arbetar || !ny.sv.trim() || !ny.en.trim() || !ny.ar.trim()}
            onClick={async () => {
              const ok = await posta({ action: "laggTill", ...ny });
              if (ok) setNy({ sv: "", en: "", ar: "", kat: ny.kat, notering: "" });
            }}
          >
            <Check className="mr-1 h-3 w-3" /> Lägg till term
          </Button>
        </div>
        {resultat && (
          <p className={cn("mt-2 text-[11px]", resultat.ok ? "text-green-700 dark:text-green-400" : "text-red-600")}>
            {resultat.ok
              ? (resultat.meddelande ?? "Termen sparad.") + (resultat.varning ? " ⚠ " + resultat.varning : "")
              : (resultat.error ?? "Termen sparades inte.")}
          </p>
        )}
      </div>

      {/* Tillägg — väntar sammanslagning */}
      {(termbank?.tillagg ?? []).length > 0 && (
        <div className="rounded-lg border border-orange-500/40 bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-orange-500" />
            <h4 className="font-serif text-sm font-bold">
              Tillägg — {sv(termbank?.antalTillagg)} termer väntar sammanslagning in i banken
            </h4>
          </div>
          {/* våg 104: minsta bredd — sju kolumner scrollar horisontellt på mobil */}
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-1.5 pr-3 font-semibold">Svenska</th>
                  <th className="py-1.5 pr-3 font-semibold">English</th>
                  <th className="py-1.5 pr-3 font-semibold">العربية</th>
                  <th className="py-1.5 pr-3 font-semibold">Kategori</th>
                  <th className="py-1.5 pr-3 font-semibold">Lager</th>
                  <th className="py-1.5 pr-3 font-semibold">Uppdaterad</th>
                  <th className="py-1.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {(termbank?.tillagg ?? []).map((t) => (
                  <tr key={t.sv} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-3 font-medium">{t.sv}</td>
                    <td className="py-1.5 pr-3">{t.en}</td>
                    <td className="py-1.5 pr-3" dir="rtl">{t.ar}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{t.kat}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">
                      {t.kalla === "supabase" ? "Supabase" : t.kalla === "bada" ? "Supabase + fil" : "Fil"}
                    </td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{datumKort(t.uppdaterad)}</td>
                    <td className="py-1.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-red-600 dark:text-red-400"
                        disabled={arbetar}
                        onClick={() => posta({ action: "taBort", sv: t.sv })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{termbank?.notering}</p>
        </div>
      )}

      {/* Kanoniska banken */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-serif text-sm font-bold">Kanoniska termbanken — {sv(filtrerade.length)} termer</h4>
          <Input
            placeholder="Sök term (sv/en/ar)…"
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            className="h-8 max-w-xs text-xs"
          />
        </div>
        {/* våg 104: minsta bredd — fyra termkolumner scrollar horisontellt på mobil */}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-1.5 pr-3 font-semibold">Svenska</th>
                <th className="py-1.5 pr-3 font-semibold">English</th>
                <th className="py-1.5 pr-3 font-semibold">العربية</th>
                <th className="py-1.5 font-semibold">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {visade.map((t) => (
                <tr key={t.sv} className="border-b border-border/50 last:border-0">
                  <td className="py-1.5 pr-3 font-medium" title={t.notering}>{t.sv}</td>
                  <td className="py-1.5 pr-3">{t.en}</td>
                  <td className="py-1.5 pr-3" dir="rtl">{t.ar}</td>
                  <td className="py-1.5 text-muted-foreground">{t.kat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrerade.length > visade.length && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Visar första 100 träffarna av {sv(filtrerade.length)} — förfina sökningen för fler.
          </p>
        )}
      </div>
    </div>
  );
}

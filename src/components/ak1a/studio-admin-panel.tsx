"use client";

import * as React from "react";

import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  History,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  SearchCheck,
  Send,
  Wrench,
  X,
} from "lucide-react";

import { adminHeaders, adminJsonHeaders } from "@/lib/admin-klient";
import { cn } from "@/lib/utils";

/**
 * STUDIO-ADMIN-PANEL — "🔧 Verktyg"-drawern i /studio (VÅG 88 I2,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 88" §I2: ADMIN I STUDIO — "kunden styr
 * HELA systemet från ETT ställe").
 *
 * Admin-panelens kraftkommandon som drawer i studions ikonrad, i exakt
 * filträdets/Minne 🧠-stil (marin #0D1B31 + guld, höger drawer, mobil-först):
 *
 *   · VARIABLER 📊 — alla 13 kanoniska prisnycklar, grupperade som i
 *     admin-panelen (Privatnivåer / B2B-nivåer / Fas-utbildningar), nuvärde
 *     stort + filvärde grått + inline-redigering. Källor:
 *     GET /api/admin/variabler (poster + logg) · POST {nyckel, varde}
 *     (VÅG 79-kontraktet: vitlista + heltal ≥ 0 i rutten — UI-låset här är
 *     komfort, inte säkerhet).
 *
 *   · BLOGG ✍️ — utkastlistan + "Nytt utkast" (titel/ingress/body) med
 *     flödet Kontrollera (kontrolleraText via servern) → Skicka till
 *     granskning (0-FEL-grinden, våg 66) → Exportera (Läge A: JSON-paketet
 *     till urklipp + <slug>.json — droppas i data/blogg/ vid main-push).
 *     Källor: GET /api/admin/blogg · POST {action: "spara"|"kontrollera"|
 *     "status"|"exportera"} (VÅG 80b del B-kontraktet).
 *
 *   · MINNE 🧠 — NAVIGERING till studions befintliga Minne-panel (inget
 *     dubbeldriv: knappen stänger denna drawer och öppnar Minne 🧠).
 *
 * SKYDD: rutterna kräver admin (requireAdmin — session-cookien åker med
 * automatiskt; adminHeaders() bär ev. lösenord i lösenordsläget). Studion
 * kräver redan admin ⇒ sektionen är alltid synlig; svaret 401/403 visas
 * som tydligt fel i drawern (lås-vy som admin-panelernas).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Svartyper (speglar API-kontrakten) ───────────────────────────────────────

type VariabelRad = {
  nyckel: string;
  varde: number | null;
  filvarde: number | null;
  kalla: string | null;
  andrad: string | null;
};

type VariabelLoggRad = {
  nyckel: string | null;
  gammalt: number | string | null;
  nytt: number | string | null;
  av: string | null;
  tidpunkt?: string | null;
  andrad?: string | null;
};

type VariabelGetSvar = { poster?: VariabelRad[]; logg?: VariabelLoggRad[]; error?: string };

type VariabelPostSvar = {
  ok?: boolean;
  error?: string;
  meddelande?: string;
  gammalt?: number;
  nytt?: number;
};

type BloggStatus = "utkast" | "granskad" | "publicerad";

type BloggKontroll = {
  felAntal: number;
  varningAntal: number;
  godkand: boolean;
  ord: number;
  readingMinutes: number;
};

type BloggRad = {
  slug: string;
  titel: string;
  ingress: string;
  bodyMarkdown: string;
  status: BloggStatus;
  av: string;
  version: number;
  uppdaterad: string;
  kontroll: BloggKontroll;
};

type TraffRad = { fras: string; ersattning: string };
type StrukturRad = { meddelande: string; allvar: "FEL" | "VARNING" };

type BloggRapport = {
  fel: TraffRad[];
  varningar: TraffRad[];
  strukturFel: StrukturRad[];
  strukturVarningar: StrukturRad[];
  godkand: boolean;
  ord: number;
  readingMinutes: number;
};

type BloggGetSvar = { poster?: BloggRad[]; error?: string };

type BloggPostSvar = {
  ok?: boolean;
  error?: string;
  meddelande?: string;
  post?: BloggRad;
  rapport?: BloggRapport;
  paket?: Record<string, unknown>;
  filnamn?: string;
};

// ── Nyckelregistret — samma 13 kanoniska nycklar + grupper som admin-panelen ─

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

const GRUPPER: readonly { id: GruppId; rubrik: string }[] = [
  { id: "privat", rubrik: "Privatnivåer" },
  { id: "b2b", rubrik: "B2B-nivåer" },
  { id: "fas", rubrik: "Fas-utbildningar" },
];

// ── Blogg-editorns state (samma form som admin-panelens, utan media) ─────────

type EditorState = {
  slug: string;
  titel: string;
  ingress: string;
  bodyMarkdown: string;
  /** Taggar (kommaseparerade i fältet — array mot export-rutten). */
  tags: string;
  /** True = ÄNNU EJ SPARAT nytt utkast (unik-slug-tvånget i rutten). */
  ny: boolean;
};

const TOM_EDITOR: EditorState = { slug: "", titel: "", ingress: "", bodyMarkdown: "", tags: "", ny: true };

// ── Hjälpare ─────────────────────────────────────────────────────────────────

const sv = (n: number | null | undefined): string =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("sv-SE") : "—";

/** Tidstämpeln på en loggrad — "tidpunkt" (kontraktet) eller "andrad" (lib:en). */
function tidpunktAv(rad: VariabelLoggRad): string | null {
  return rad.tidpunkt ?? rad.andrad ?? null;
}

function datumKort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

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

/** Statuspiller i drawer-färger (bull-grön / guld / grå). */
function StatusPiller({ status }: { status: BloggStatus }) {
  if (status === "publicerad") {
    return (
      <span className="shrink-0 rounded-full border border-emerald-400/50 px-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
        publicerad
      </span>
    );
  }
  if (status === "granskad") {
    return (
      <span className="shrink-0 rounded-full border border-gold/50 px-1.5 text-[9px] font-bold uppercase tracking-wider text-gold">
        granskad
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full border border-white/20 px-1.5 text-[9px] font-bold uppercase tracking-wider text-[#EDE6D6]/50">
      utkast
    </span>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface StudioAdminPanelProps {
  oppen: boolean;
  stang: () => void;
  /** Öppna studions befintliga Minne 🧠-panel (stänger denna drawer först). */
  oppnaMinne: () => void;
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function StudioAdminPanel({ oppen, stang, oppnaMinne }: StudioAdminPanelProps) {
  const [sektion, setSektion] = React.useState<"variabler" | "blogg" | "minne">("variabler");

  // ── VARIABLER — poster + logg + lås-vy ────────────────────────────────────
  const [vPoster, setVPoster] = React.useState<VariabelRad[] | null>(null);
  const [vLogg, setVLogg] = React.useState<VariabelLoggRad[]>([]);
  const [vLaddar, setVLaddar] = React.useState(false);
  const [vFel, setVFel] = React.useState("");
  const [vLasad, setVLasad] = React.useState(false);
  const [loggOppen, setLoggOppen] = React.useState(false);

  // ── BLOGG — lista + editor + rapport ──────────────────────────────────────
  const [bPoster, setBPoster] = React.useState<BloggRad[] | null>(null);
  const [bLaddar, setBLaddar] = React.useState(false);
  const [bFel, setBFel] = React.useState("");
  const [bLasad, setBLasad] = React.useState(false);
  const [editor, setEditor] = React.useState<EditorState | null>(null);
  const [arbetar, setArbetar] = React.useState(false);
  const [rapport, setRapport] = React.useState<BloggRapport | null>(null);
  const [rapportText, setRapportText] = React.useState("");
  /** Kompakt notis i foten (sparat/misslyckat — drawern har ingen toaster). */
  const [notis, setNotis] = React.useState<{ text: string; ton: "guld" | "fel" } | null>(null);

  const visaNotis = React.useCallback((text: string, ton: "guld" | "fel" = "guld") => {
    setNotis({ text, ton });
    window.setTimeout(() => setNotis((n) => (n?.text === text ? null : n)), 5_000);
  }, []);

  // ── Hämtning (lasy per sektion vid öppning — som admin-panelernas mount) ──

  const hamtaVariabler = React.useCallback(async () => {
    setVLaddar(true);
    setVFel("");
    try {
      const res = await fetch(`/api/admin/variabler?frisk=${Date.now()}`, { headers: adminHeaders() });
      const data = (await res.json().catch(() => ({}))) as VariabelGetSvar;
      if (res.ok && Array.isArray(data.poster)) {
        setVPoster(data.poster);
        setVLogg(Array.isArray(data.logg) ? data.logg : []);
        setVLasad(true);
      } else {
        setVFel(data.error || (res.status === 401 || res.status === 403 ? "Admin-sessionen har löpt ut — öppna admin-panelen och logga in igen." : `Kunde ej hämta variabler (HTTP ${res.status}).`));
      }
    } catch {
      setVFel("Nätverksfel — variablerna kunde ej hämtas.");
    } finally {
      setVLaddar(false);
    }
  }, []);

  const hamtaBlogg = React.useCallback(async () => {
    setBLaddar(true);
    setBFel("");
    try {
      const res = await fetch(`/api/admin/blogg?frisk=${Date.now()}`, { headers: adminHeaders() });
      const data = (await res.json().catch(() => ({}))) as BloggGetSvar;
      if (res.ok && Array.isArray(data.poster)) {
        setBPoster(data.poster);
        setBLasad(true);
      } else {
        setBFel(data.error || (res.status === 401 || res.status === 403 ? "Admin-sessionen har löpt ut — öppna admin-panelen och logga in igen." : `Kunde ej hämta utkast (HTTP ${res.status}).`));
      }
    } catch {
      setBFel("Nätverksfel — bloggutkasten kunde ej hämtas.");
    } finally {
      setBLaddar(false);
    }
  }, []);

  // Lasy per sektion: hämta när drawern är öppen + sektionen visas första
  // gången. queueMicrotask: hämtningen (som börjar med setVLaddar) körs UR
  // effektens synkrona kedja — react-hooks/set-state-in-effect förblir nöjd.
  React.useEffect(() => {
    if (!oppen) return;
    if (sektion === "variabler" && !vLasad) queueMicrotask(() => void hamtaVariabler());
    if (sektion === "blogg" && !bLasad) queueMicrotask(() => void hamtaBlogg());
  }, [oppen, sektion, vLasad, bLasad, hamtaVariabler, hamtaBlogg]);

  // Escape: stänger drawern (blogg-editorn stängs med sin egen Stäng-knapp).
  React.useEffect(() => {
    if (!oppen) return;
    const paTangent = (e: KeyboardEvent) => {
      if (e.key === "Escape") stang();
    };
    window.addEventListener("keydown", paTangent);
    return () => window.removeEventListener("keydown", paTangent);
  }, [oppen, stang]);

  // ── VARIABLER: POST en ändring (UI-låset heltal ≥ 0 är passeraat här) ─────

  const sparaVariabel = React.useCallback(
    async (info: NyckelInfo, nyttVarde: number, gammalt: number | null): Promise<boolean> => {
      try {
        const res = await fetch("/api/admin/variabler", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ nyckel: info.nyckel, varde: nyttVarde }),
        });
        const data = (await res.json().catch(() => ({}))) as VariabelPostSvar;
        if (res.ok && data.ok !== false) {
          visaNotis(`${info.etikett}: ${sv(gammalt)} → ${sv(nyttVarde)} — gäller inom cache-fönstret.`);
          void hamtaVariabler();
          return true;
        }
        visaNotis(data.error || `Sparningen misslyckades (HTTP ${res.status}).`, "fel");
        return false;
      } catch {
        visaNotis("Nätverksfel — värdet sparades INTE.", "fel");
        return false;
      }
    },
    [hamtaVariabler, visaNotis],
  );

  // ── BLOGG: POST-action (spara | kontrollera | status | exportera) ─────────

  const postaBlogg = React.useCallback(
    async (kropp: Record<string, unknown>): Promise<{ ok: boolean; svar: BloggPostSvar; status: number }> => {
      try {
        const res = await fetch("/api/admin/blogg", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify(kropp),
        });
        const svar = (await res.json().catch(() => ({}))) as BloggPostSvar;
        if (!res.ok || svar.ok === false) {
          visaNotis(svar.error || `Åtgärden misslyckades (HTTP ${res.status}).`, "fel");
          return { ok: false, svar, status: res.status };
        }
        return { ok: true, svar, status: res.status };
      } catch {
        visaNotis("Nätverksfel — inget sparades.", "fel");
        return { ok: false, svar: {}, status: 0 };
      }
    },
    [visaNotis],
  );

  const editorText = (e: EditorState): string => `${e.titel}\n${e.ingress}\n${e.bodyMarkdown}`;
  const rapportArAktuell =
    rapport !== null && editor !== null && editorText(editor) === rapportText;
  const kanSkickaTillGranskad =
    editor !== null && !editor.ny && rapportArAktuell && rapport !== null && rapport.godkand;

  const oppnaRad = (rad: BloggRad) => {
    setEditor({
      slug: rad.slug,
      titel: rad.titel,
      ingress: rad.ingress,
      bodyMarkdown: rad.bodyMarkdown,
      tags: "",
      ny: false,
    });
    setRapport(null);
    setRapportText("");
  };

  const oppnaNy = () => {
    setEditor({ ...TOM_EDITOR });
    setRapport(null);
    setRapportText("");
  };

  const sparaUtkast = async () => {
    if (!editor) return;
    setArbetar(true);
    const { ok, svar } = await postaBlogg({
      action: "spara",
      slug: editor.slug,
      titel: editor.titel,
      ingress: editor.ingress,
      bodyMarkdown: editor.bodyMarkdown,
      ny: editor.ny,
    });
    setArbetar(false);
    if (ok) {
      visaNotis(svar.meddelande || `${editor.slug} sparad i lagret.`);
      setEditor({ ...editor, ny: false });
      void hamtaBlogg();
    }
  };

  const kolla = async () => {
    if (!editor) return;
    setArbetar(true);
    const { ok, svar } = await postaBlogg({
      action: "kontrollera",
      titel: editor.titel,
      ingress: editor.ingress,
      bodyMarkdown: editor.bodyMarkdown,
    });
    setArbetar(false);
    if (ok && svar.rapport) {
      setRapport(svar.rapport);
      setRapportText(editorText(editor));
    }
  };

  const skickaTillGranskad = async () => {
    if (!editor || !kanSkickaTillGranskad) return;
    setArbetar(true);
    const { ok, svar } = await postaBlogg({ action: "status", slug: editor.slug, status: "granskad" });
    setArbetar(false);
    if (ok) {
      visaNotis(svar.meddelande || "0 FEL — utkastet är granskningsklart.");
      void hamtaBlogg();
    }
  };

  /** Exportera (Läge A): JSON till urklipp + <slug>.json-nedladdning. */
  const exportera = async () => {
    if (!editor || editor.ny) return;
    setArbetar(true);
    const { ok, svar } = await postaBlogg({
      action: "exportera",
      slug: editor.slug,
      tags: editor.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setArbetar(false);
    if (!ok || !svar.paket) return;

    const json = JSON.stringify(svar.paket, null, 2);
    const filnamn = svar.filnamn || `${editor.slug}.json`;
    let kopierat = false;
    try {
      await navigator.clipboard.writeText(json);
      kopierat = true;
    } catch {
      // urklipp nekat — nedladdningen räcker
    }
    try {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filnamn;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // nedladdningen misslyckades — urklippet har paketet
    }
    visaNotis(
      `${filnamn}${kopierat ? " nedladdad + JSON i urklipp" : " nedladdad"} — droppa i data/blogg/ vid nästa main-push.`,
    );
    void hamtaBlogg();
  };

  // ── Rendera ────────────────────────────────────────────────────────────────

  if (!oppen) return null;

  const vKarta = new Map((vPoster ?? []).map((p) => [p.nyckel, p] as const));

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
        onClick={stang}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Verktyg — admin-kommandon"
        className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[420px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
      >
        {/* Header — verktygstitel + admin-badge + uppdatera + stäng */}
        <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
          <Wrench className="h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Verktyg 🔧</h2>
            <p className="truncate text-[10px] text-[#EDE6D6]/55">
              admin-kommandon — hela systemet från ett ställe
            </p>
          </div>
          <button
            onClick={() => {
              if (sektion === "variabler") void hamtaVariabler();
              if (sektion === "blogg") void hamtaBlogg();
            }}
            disabled={(sektion === "variabler" && vLaddar) || (sektion === "blogg" && bLaddar)}
            title="Uppdatera sektionen"
            className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                (sektion === "variabler" && vLaddar) || (sektion === "blogg" && bLaddar) ? "animate-spin" : "",
              )}
            />
          </button>
          <button
            onClick={stang}
            title="Stäng (Esc)"
            className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sektionsflikar — stora tryckytor (mobil-först, ≥ 44 px) */}
        <div className="flex border-b border-gold/25 bg-black/15" role="tablist" aria-label="Admin-sektioner">
          {(
            [
              { id: "variabler", ikon: "📊", etikett: "Variabler" },
              { id: "blogg", ikon: "✍️", etikett: "Blogg" },
              { id: "minne", ikon: "🧠", etikett: "Minne" },
            ] as const
          ).map((s) => {
            const aktiv = sektion === s.id;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={aktiv}
                onClick={() => setSektion(s.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2.5 text-[11px] font-semibold transition-colors",
                  aktiv
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-transparent text-[#EDE6D6]/60 hover:bg-white/5 hover:text-[#EDE6D6]",
                )}
              >
                <span aria-hidden>{s.ikon}</span>
                {s.etikett}
              </button>
            );
          })}
        </div>

        {/* ── SEKTION: VARIABLER — 13 nycklar, grupperade, inline-edit ── */}
        {sektion === "variabler" && (
          <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5 [scrollbar-width:thin]">
            <p className="mb-2 rounded-md border border-gold/20 bg-gold/5 px-2.5 py-1.5 text-[10px] leading-relaxed text-[#EDE6D6]/60">
              Guldkällan: priser.json (fil) + Supabase-override (senaste vinner) — ändringen gäller
              inom cache-fönstret (publik läsning 60 s, modul-cache 5 min). Nivåer skapas/i filen —
              här ändras ENDAST värden (heltal ≥ 0).
            </p>

            {vLaddar && !vPoster && (
              <div className="flex items-center gap-2 px-1 py-3 text-[11px] text-[#EDE6D6]/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                Läser variabler…
              </div>
            )}
            {vFel && (
              <p className="flex items-start gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] leading-relaxed text-red-300">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {vFel}
              </p>
            )}

            {GRUPPER.map((grupp) => (
              <div key={grupp.id} className="mb-3">
                <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gold/80">
                  {grupp.rubrik}
                </p>
                <div className="space-y-1.5">
                  {NYCKLAR.filter((n) => n.grupp === grupp.id).map((info) => (
                    <VariabelRadVy
                      key={info.nyckel}
                      info={info}
                      rad={vKarta.get(info.nyckel) ?? null}
                      spara={sparaVariabel}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Ändringsloggen — revisbarhet (kollapsad default, mobil-yta) */}
            <div className="rounded-lg border border-gold/20">
              <button
                onClick={() => setLoggOppen((v) => !v)}
                className="flex w-full items-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold text-[#EDE6D6]/75 transition-colors hover:bg-white/5"
                aria-expanded={loggOppen}
              >
                <History className="h-3.5 w-3.5 text-gold" />
                Senaste ändringarna ({vLogg.length})
                <ChevronDown
                  className={cn("ml-auto h-3.5 w-3.5 transition-transform", loggOppen && "rotate-180")}
                />
              </button>
              {loggOppen && (
                <div className="border-t border-gold/15 px-2.5 py-2">
                  {vLogg.length === 0 ? (
                    <p className="text-[10px] leading-relaxed text-[#EDE6D6]/50">
                      Inga ändringar loggade än — filvärdena i priser.json gäller rakt av.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {vLogg.map((rad, i) => (
                        <li
                          key={`${tidpunktAv(rad) ?? i}:${rad.nyckel ?? ""}:${i}`}
                          className="text-[10px] leading-relaxed text-[#EDE6D6]/65"
                        >
                          <span className="font-mono text-[#EDE6D6]/85">{rad.nyckel ?? "okänd nyckel"}</span>{" "}
                          {sv(typeof rad.gammalt === "number" ? rad.gammalt : Number(rad.gammalt))} →{" "}
                          <span className="font-semibold text-[#EDE6D6]">
                            {sv(typeof rad.nytt === "number" ? rad.nytt : Number(rad.nytt))}
                          </span>{" "}
                          · {rad.av || "admin"} · {datumKort(tidpunktAv(rad))}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEKTION: BLOGG — utkastlista + editor + kontrollflöde ── */}
        {sektion === "blogg" && (
          <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5 [scrollbar-width:thin]">
            {bLaddar && !bPoster && (
              <div className="flex items-center gap-2 px-1 py-3 text-[11px] text-[#EDE6D6]/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                Läser bloggutkast…
              </div>
            )}
            {bFel && (
              <p className="mb-2 flex items-start gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] leading-relaxed text-red-300">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {bFel}
              </p>
            )}

            {/* Editor: nytt/bevintligt utkast — flödet Kontrollera → Granskad → Exportera */}
            {editor ? (
              <div className="rounded-lg border border-gold/30 bg-black/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-serif text-xs font-bold text-[#EDE6D6]">
                    {editor.ny ? "Nytt utkast" : `Redigerar: ${editor.slug}`}
                  </p>
                  <button
                    onClick={() => {
                      setEditor(null);
                      setRapport(null);
                      setRapportText("");
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
                  >
                    <X className="h-3 w-3" /> Stäng
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                      Slug ^[a-z0-9-]+$ {editor.ny ? "(måste vara ledig)" : "(låst)"}
                    </label>
                    <input
                      value={editor.slug}
                      disabled={!editor.ny}
                      onChange={(e) => setEditor({ ...editor, slug: e.target.value.toLowerCase().trim() })}
                      placeholder="t.ex. komplett-guide-svensk-aktieanalys-2026"
                      className="w-full rounded-md border border-gold/40 bg-black/30 px-2.5 py-1.5 font-mono text-xs text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70 disabled:opacity-60"
                      aria-label="Utkastets slug"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                      Titel
                    </label>
                    <input
                      value={editor.titel}
                      onChange={(e) => setEditor({ ...editor, titel: e.target.value })}
                      placeholder="Rubriken — gravör, inte reklam"
                      className="w-full rounded-md border border-gold/40 bg-black/30 px-2.5 py-1.5 text-xs text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                      aria-label="Utkastets titel"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                      Ingress
                    </label>
                    <textarea
                      value={editor.ingress}
                      onChange={(e) => setEditor({ ...editor, ingress: e.target.value })}
                      rows={2}
                      placeholder="En-två meningar — också OG-beskrivningen."
                      className="w-full resize-y rounded-md border border-gold/40 bg-black/30 px-2.5 py-1.5 text-xs leading-relaxed text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                      aria-label="Utkastets ingress"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                      Body — markdown (≥ 800 tecken, minst 2 &quot;## &quot;-rubriker)
                    </label>
                    <textarea
                      value={editor.bodyMarkdown}
                      onChange={(e) => setEditor({ ...editor, bodyMarkdown: e.target.value })}
                      rows={10}
                      spellCheck={false}
                      placeholder={"Inledande stycke …\n\n## Första rubriken\n\nBrödtext med [länkar](/kurser) …"}
                      className="w-full resize-y rounded-md border border-gold/40 bg-black/30 px-2.5 py-1.5 font-mono text-xs leading-relaxed text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                      aria-label="Utkastets body i markdown"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                      Ämnesord (kommaseparerade — exporteras som tags)
                    </label>
                    <input
                      value={editor.tags}
                      onChange={(e) => setEditor({ ...editor, tags: e.target.value })}
                      placeholder="t.ex. riskhantering, AKM2, portfölj"
                      className="w-full rounded-md border border-gold/40 bg-black/30 px-2.5 py-1.5 text-xs text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                      aria-label="Utkastets ämnesord"
                    />
                  </div>
                </div>

                {/* Knapprad — flödet: Spara → Kontrollera → Granskad → Exportera */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => void sparaUtkast()}
                    disabled={arbetar || editor.slug === "" || editor.titel.trim() === ""}
                    className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
                  >
                    {arbetar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Spara utkast
                  </button>
                  <button
                    onClick={() => void kolla()}
                    disabled={arbetar}
                    className="flex items-center gap-1 rounded-md border border-gold/30 px-2.5 py-1.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
                  >
                    <SearchCheck className="h-3 w-3" /> Kontrollera
                  </button>
                  <button
                    onClick={() => void skickaTillGranskad()}
                    disabled={arbetar || !kanSkickaTillGranskad}
                    title={
                      editor.ny
                        ? "Spara utkastet först"
                        : !rapportArAktuell
                          ? "Kör Kontrollera på aktuell text först"
                          : rapport && !rapport.godkand
                            ? "0 FEL krävs (våg 66-grinden)"
                            : "Sätt status granskad"
                    }
                    className="flex items-center gap-1 rounded-md border border-gold/30 px-2.5 py-1.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" /> Skicka till granskning
                  </button>
                  <button
                    onClick={() => void exportera()}
                    disabled={arbetar || editor.ny}
                    title={editor.ny ? "Spara utkastet först (exporten bygger på den sparade raden)" : "Exportera klar post (Läge A)"}
                    className="flex items-center gap-1 rounded-md border border-emerald-400/40 px-2.5 py-1.5 text-[11px] text-emerald-300 transition-colors hover:bg-emerald-400/10 disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" /> Exportera
                  </button>
                </div>
                <p className="mt-2 text-[9px] leading-relaxed text-[#EDE6D6]/40">
                  Granskning kräver 0 FEL i kontrolleraText på exakt aktuell text · exporten kör
                  grinden igen på den sparade raden, lägger till disclaimer om den saknas, markerar
                  utkastet publicerat och levererar JSON (urklipp + &lt;slug&gt;.json) — droppas i
                  data/blogg/ vid main-push.
                </p>

                {/* Kontrollrapporten */}
                {rapport && (
                  <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {rapport.godkand ? (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-400/50 px-1.5 text-[9px] font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> 0 FEL — godkänd
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-red-500/50 px-1.5 text-[9px] font-bold text-red-300">
                          <X className="h-3 w-3" /> {rapport.fel.length + rapport.strukturFel.length} FEL — nekas
                        </span>
                      )}
                      <span className="rounded-full border border-white/20 px-1.5 text-[9px] tabular-nums text-[#EDE6D6]/55">
                        {rapport.varningar.length + rapport.strukturVarningar.length} varningar
                      </span>
                      <span className="text-[9px] text-[#EDE6D6]/45">
                        {rapport.ord} ord · ~{rapport.readingMinutes} min
                      </span>
                      {!rapportArAktuell && (
                        <span className="rounded-full border border-gold/40 px-1.5 text-[9px] font-bold text-gold">
                          texten ändrad efter kontrollen — kör igen
                        </span>
                      )}
                    </div>
                    {rapport.fel.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {rapport.fel.map((t, i) => (
                          <li key={`f${i}-${t.fras}`} className="text-[10px] text-red-300">
                            FEL: &quot;{t.fras}&quot; → {t.ersattning}
                          </li>
                        ))}
                      </ul>
                    )}
                    {rapport.strukturFel.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {rapport.strukturFel.map((s, i) => (
                          <li key={`sf${i}`} className="text-[10px] text-red-300">
                            FEL (struktur): {s.meddelande}
                          </li>
                        ))}
                      </ul>
                    )}
                    {rapport.varningar.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {rapport.varningar.map((t, i) => (
                          <li key={`v${i}-${t.fras}`} className="text-[10px] text-yellow-300/90">
                            VARNING: &quot;{t.fras}&quot; → {t.ersattning}
                          </li>
                        ))}
                      </ul>
                    )}
                    {rapport.strukturVarningar.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {rapport.strukturVarningar.map((s, i) => (
                          <li key={`sv${i}`} className="text-[10px] text-yellow-300/90">
                            VARNING (struktur): {s.meddelande}
                          </li>
                        ))}
                      </ul>
                    )}
                    {rapport.godkand &&
                      rapport.fel.length === 0 &&
                      rapport.varningar.length === 0 &&
                      rapport.strukturFel.length === 0 &&
                      rapport.strukturVarningar.length === 0 && (
                        <p className="mt-1.5 text-[10px] text-[#EDE6D6]/50">
                          Ren rapport — inga träffar i varumärkesregistret, strukturkraven uppfyllda.
                        </p>
                      )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Utkastlistan */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold/80">
                    Utkast ({bPoster?.length ?? 0})
                  </p>
                  <button
                    onClick={oppnaNy}
                    className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20"
                  >
                    <Plus className="h-3 w-3" /> Nytt utkast
                  </button>
                </div>
                {bPoster && bPoster.length === 0 && !bLaddar && (
                  <p className="rounded-md border border-white/10 px-2.5 py-3 text-center text-[11px] leading-relaxed text-[#EDE6D6]/55">
                    Inga utkast i lagret än — skapa det första med knappen ovan.
                  </p>
                )}
                <ul className="space-y-1.5">
                  {bPoster?.map((rad) => (
                    <li key={rad.slug}>
                      <button
                        onClick={() => oppnaRad(rad)}
                        className="w-full rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-left transition-colors hover:border-gold/40 hover:bg-white/5"
                        title={`Öppna ${rad.slug} i editorn`}
                      >
                        <span className="flex items-center gap-1.5">
                          <StatusPiller status={rad.status} />
                          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#EDE6D6]/90">
                            {rad.titel}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-1.5 text-[9px] tabular-nums",
                              rad.kontroll.felAntal > 0
                                ? "border-red-500/40 text-red-300"
                                : "border-emerald-400/40 text-emerald-300",
                            )}
                          >
                            {rad.kontroll.felAntal > 0 ? `${rad.kontroll.felAntal} FEL` : "0 fel"}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-[#EDE6D6]/45">
                          <span className="truncate font-mono">{rad.slug}</span>
                          <span>v{rad.version}</span>
                          <span className="ml-auto shrink-0">{tidSedan(rad.uppdaterad)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* ── SEKTION: MINNE — navigering till den befintliga panelen ── */}
        {sektion === "minne" && (
          <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-width:thin]">
            <div className="rounded-lg border border-gold/25 bg-gold/5 p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 shrink-0 text-gold" />
                <p className="font-serif text-xs font-bold text-[#EDE6D6]">Minne 🧠 — agentens minne</p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#EDE6D6]/65">
                Minnesfilerna och AGENTS.md (arbetsytans stående instruktioner) sköts i studions
                befintliga Minne-panel — läs, rätta rader och skapa nya fakta utan att chatta.
              </p>
              <button
                onClick={oppnaMinne}
                className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-2 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                Öppna Minne-panelen
              </button>
            </div>
            <p className="mt-3 px-1 text-[10px] leading-relaxed text-[#EDE6D6]/45">
              Källor: GET/PUT/DELETE /api/studio/minne (requireAdmin) — samma panel som
              Minne 🧠-knappen i verktygsraden. Radering backas alltid upp i .minnes-backup/.
            </p>
          </div>
        )}

        {/* Notis-fot — drawern har ingen toaster (studio-ytan är fristående) */}
        <div className="border-t border-gold/25 bg-black/25 px-3 py-2">
          {notis ? (
            <p
              className={cn(
                "text-[10px] leading-relaxed",
                notis.ton === "fel" ? "text-red-300" : "text-gold",
              )}
              role="status"
            >
              {notis.text}
            </p>
          ) : (
            <p className="text-[9px] leading-relaxed text-[#EDE6D6]/40">
              🔧 Verktyg (våg 88 I2) — variabler/blogg/minne med studions admin-session · alla
              skrivningar loggas som system_events (revisbarhet).
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

// ── En nyckelrad: etikett · nu-värde · filvärde grått · inline-edit ───────────

function VariabelRadVy({
  info,
  rad,
  spara,
}: {
  info: NyckelInfo;
  rad: VariabelRad | null;
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

  // UI-låset (samma som admin-panelen): heltal ≥ 0 — resten validerar rutten.
  const tal = Number(text.trim());
  const giltigt = text.trim() !== "" && Number.isInteger(tal) && tal >= 0;

  const sparaRad = async () => {
    if (!giltigt) return;
    setArbetar(true);
    const ok = await spara(info, tal, nuVarde);
    setArbetar(false);
    if (ok) setRedigerar(false);
  };

  return (
    <div className="rounded-md border border-white/10 bg-black/20 px-2.5 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-[#EDE6D6]/90" title={info.nyckel}>
            {info.etikett}
          </p>
          <p className="truncate font-mono text-[9px] text-[#EDE6D6]/40">{info.nyckel}</p>
        </div>
        {!redigerar && (
          <button
            onClick={() => {
              setText(nuVarde !== null ? String(nuVarde) : "");
              setRedigerar(true);
            }}
            disabled={arbetar || !rad}
            title="Ändra värdet (heltal ≥ 0)"
            aria-label={`Ändra ${info.etikett}`}
            className="flex shrink-0 items-center gap-1 rounded-md border border-gold/30 px-2 py-1 text-[10px] text-[#EDE6D6]/80 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
          >
            <Pencil className="h-3 w-3" /> Ändra
          </button>
        )}
      </div>

      {!redigerar ? (
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-serif text-lg font-bold tabular-nums text-[#EDE6D6]" title={info.enhet}>
            {sv(nuVarde)}
          </span>
          <span className="text-[9px] text-[#EDE6D6]/50">{info.enhet}</span>
          {filVarde !== null && (
            <span className="text-[9px] text-[#EDE6D6]/40">fil: {sv(filVarde)}</span>
          )}
          {harOverride ? (
            <span className="rounded-full border border-gold/40 px-1.5 text-[8px] font-bold uppercase tracking-wider text-gold">
              override
            </span>
          ) : (
            <span className="rounded-full border border-white/15 px-1.5 text-[8px] font-bold uppercase tracking-wider text-[#EDE6D6]/40">
              fil-värde
            </span>
          )}
          {rad?.andrad && (
            <span className="text-[9px] text-[#EDE6D6]/35">ändrad {tidSedan(rad.andrad)}</span>
          )}
        </div>
      ) : (
        <div className="mt-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && giltigt) void sparaRad();
                if (e.key === "Escape") setRedigerar(false);
              }}
              placeholder="nytt värde"
              aria-label={`Nytt värde för ${info.etikett}`}
              className="w-28 rounded-md border border-gold/40 bg-black/30 px-2.5 py-1.5 text-right font-mono text-xs tabular-nums text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
            />
            <span className="text-[9px] text-[#EDE6D6]/45">{info.enhet}</span>
            <button
              onClick={() => void sparaRad()}
              disabled={arbetar || !giltigt}
              className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {arbetar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Spara
            </button>
            <button
              onClick={() => {
                setRedigerar(false);
                setText("");
              }}
              disabled={arbetar}
              className="rounded-md px-2 py-1 text-[10px] text-[#EDE6D6]/65 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
            >
              Avbryt
            </button>
          </div>
          {redigerar && text.trim() !== "" && !giltigt && (
            <p className="mt-1 text-[9px] text-red-300">
              Värdet måste vara ett heltal ≥ 0 — negativa eller tomma värden kan inte sparas.
            </p>
          )}
          {redigerar && giltigt && nuVarde !== null && tal !== nuVarde && (
            <p className="mt-1 text-[9px] text-emerald-300">
              Ändring: {sv(nuVarde)} → {sv(tal)} — filen förblir {sv(filVarde)} (senaste vinner).
            </p>
          )}
        </div>
      )}
    </div>
  );
}

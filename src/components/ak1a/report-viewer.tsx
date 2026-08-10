"use client";

/* ──────────────────────────────────────────────────────────────────────
   AK1A Research Lab — Report Viewer
   99-page institutional analyses at 3 depth levels (15 / 35 / 99 sidor).

   • Gallery: cards grouped by company (Volvo Cars ×3 levels, Precise ×1)
   • Viewer: depth selector, page nav, section nav, iframe w/ CSS injection
   • Pedagogical intro card explaining the ecosystem framework
   ────────────────────────────────────────────────────────────────────── */

import * as React from "react";
import {
  FileText,
  Microscope,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  BookOpen,
  Layers,
  ExternalLink,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { cn } from "@/lib/utils";

/* ============================================================
   TYPES
   ============================================================ */

interface ManifestSection {
  del: string;
  title: string;
  pages: string; // e.g. "1-3", "48-59"
}

interface ReportMeta {
  slug: string;
  company: string;
  ticker: string;
  level: "nyborjare" | "intermediar" | "avancerad";
  levelLabel: string;
  title: string;
  description: string;
  pages: number;
  file: string;
  verified: string;
  ticker2: string;
  isin: string;
  exchange: string;
  sector: string;
  sections: ManifestSection[];
}

interface ManifestLevel {
  label: string;
  description: string;
  pages: number;
  icon: string;
}

interface Manifest {
  reports: ReportMeta[];
  levels: Record<string, ManifestLevel>;
}

type Depth = 15 | 35 | 99;

/* ============================================================
   CONSTANTS
   ============================================================ */

const DEPTHS: {
  value: Depth;
  short: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  blurb: string;
}[] = [
  {
    value: 15,
    short: "15",
    label: "Sammanfattning",
    sub: "15 sidor",
    icon: <Sparkles className="h-4 w-4" />,
    blurb: "Snabb överblick — bolaget, branschen och rekommendationen på en kaffepaus.",
  },
  {
    value: 35,
    short: "35",
    label: "Detaljerad",
    sub: "35 sidor",
    icon: <BarChart3 className="h-4 w-4" />,
    blurb: "Mer djup — alla tidshorisonter och fundamental våganalys inkluderas.",
  },
  {
    value: 99,
    short: "99",
    label: "Fullständig",
    sub: "99 sidor",
    icon: <Microscope className="h-4 w-4" />,
    blurb: "Full institutionell analys — varje cell, varje variabel, varje källa.",
  },
];

const LEVEL_BADGE_STYLES: Record<ReportMeta["level"], string> = {
  nyborjare: "border-bull/40 text-bull bg-bull/5",
  intermediar: "border-gold/40 text-gold bg-gold/5",
  avancerad: "border-bear/40 text-bear bg-bear/5",
};

const LEVEL_ICON: Record<ReportMeta["level"], React.ReactNode> = {
  nyborjare: <Sparkles className="h-3.5 w-3.5" />,
  intermediar: <BarChart3 className="h-3.5 w-3.5" />,
  avancerad: <Microscope className="h-3.5 w-3.5" />,
};

/* ============================================================
   HELPERS
   ============================================================ */

/** Parse "1-3" → 1, "48-59" → 48. Returns 1 if unparseable. */
function parseFirstPage(pages: string): number {
  const m = pages.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

/** Parse "1-3" → 3, "48-59" → 59. Returns firstPage if unparseable. */
function parseLastPage(pages: string): number {
  const m = pages.match(/-(\d+)$/);
  const first = parseFirstPage(pages);
  return m ? parseInt(m[1], 10) : first;
}

/** Default depth for a given report level. */
function defaultDepthForLevel(level: ReportMeta["level"]): Depth {
  if (level === "nyborjare") return 15;
  if (level === "intermediar") return 35;
  return 99;
}

/* ============================================================
   MAIN — ReportViewer
   ============================================================ */

export function ReportViewer() {
  const [manifest, setManifest] = React.useState<Manifest | null>(null);
  const [loadState, setLoadState] = React.useState<"loading" | "ok" | "error">("loading");
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null);
  const [depth, setDepth] = React.useState<Depth>(99);

  // Fetch manifest once on mount
  React.useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    fetch("/reports/manifest.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Manifest>;
      })
      .then((m) => {
        if (cancelled) return;
        setManifest(m);
        setLoadState("ok");
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeReport = React.useMemo(
    () => manifest?.reports.find((r) => r.slug === activeSlug) ?? null,
    [manifest, activeSlug]
  );

  const handleOpen = React.useCallback(
    (slug: string) => {
      const r = manifest?.reports.find((x) => x.slug === slug);
      if (r) setDepth(defaultDepthForLevel(r.level));
      setActiveSlug(slug);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [manifest]
  );

  const handleClose = React.useCallback(() => {
    setActiveSlug(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  if (loadState === "loading") return <LoadingState />;
  if (loadState === "error" || !manifest) return <ErrorState />;
  if (manifest.reports.length === 0) return <EmptyState />;

  if (activeReport) {
    return (
      <ReportViewerDetail
        report={activeReport}
        depth={depth}
        setDepth={setDepth}
        onClose={handleClose}
      />
    );
  }

  return <ReportGallery manifest={manifest} onOpen={handleOpen} />;
}

/* ============================================================
   STATES — Loading / Error / Empty
   ============================================================ */

function LoadingState() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-gold" />
        <p className="text-sm text-muted-foreground">
          Hämtar rapportmanifest från AK1A-arkivet…
        </p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <Card className="mx-auto max-w-md border-bear/30 bg-bear/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-bear/40 bg-bear/10 text-bear">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-serif text-lg font-bold">
          Kunde inte läsa manifestet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Rapportmanifestet (<code className="text-xs">/reports/manifest.json</code>)
          kunde inte hämtas. Kontrollera att filen existerar och är giltig JSON.
        </p>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <Card className="mx-auto max-w-md border-dashed border-border p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-serif text-lg font-semibold">
          Inga rapporter tillgängliga
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Arkivet är tomt. METODMÅL: en ny 99-sidig analys publiceras varje månad.
        </p>
      </Card>
    </div>
  );
}

/* ============================================================
   GALLERY — Cards grouped by company
   ============================================================ */

function ReportGallery({
  manifest,
  onOpen,
}: {
  manifest: Manifest;
  onOpen: (slug: string) => void;
}) {
  // Group reports by company
  const companies = React.useMemo(() => {
    const map = new Map<string, ReportMeta[]>();
    for (const r of manifest.reports) {
      if (!map.has(r.company)) map.set(r.company, []);
      map.get(r.company)!.push(r);
    }
    // Sort levels within each company: nyborjare → intermediar → avancerad
    const order: Record<string, number> = {
      nyborjare: 0,
      intermediar: 1,
      avancerad: 2,
    };
    for (const list of map.values()) {
      list.sort((a, b) => order[a.level] - order[b.level]);
    }
    return Array.from(map.entries());
  }, [manifest]);

  const totalReports = manifest.reports.length;
  const totalCompanies = companies.length;
  const totalLevels = Object.keys(manifest.levels).length;

  return (
    <div>
      {/* Stats banner */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <GalleryStat
              value={totalReports.toString()}
              label="Rapporter i arkivet"
              tag="matt"
            />
            <GalleryStat
              value={totalCompanies.toString()}
              label="Bolag granskade"
              tag="matt"
            />
            <GalleryStat
              value={totalLevels.toString()}
              label="Djupnivåer per rapport"
              tag="metodmal"
            />
          </div>
        </div>
      </section>

      {/* Company groups */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Arkiv — Publicerade rapporter</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Välj bolag och djupnivå.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Varje rapport finns i tre djupnivåer — 15, 35 eller 99 sidor. Samma
            underliggande AK1A-ekosystem-ramverk, tre längder för tre typer av
            läsare. Alla sidor är reproducerbara till offentlig rådata.
          </p>
          <GoldRule className="mt-6 max-w-xs" />

          <div className="mt-10 space-y-12">
            {companies.map(([company, reports]) => (
              <div key={company}>
                <div className="flex flex-col items-start justify-between gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end">
                  <div>
                    <h3 className="font-serif text-2xl font-bold tracking-tight">
                      {company}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {reports[0].exchange} · {reports[0].sector} · ISIN{" "}
                      <span className="font-mono">{reports[0].isin}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {reports[0].ticker}
                    </Badge>
                    <HonestyTag kind="matt" />
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {reports.length} rapport{reports.length > 1 ? "er" : ""}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {reports.map((r) => (
                    <ReportCard key={r.slug} report={r} onOpen={() => onOpen(r.slug)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pedagogical intro at bottom of gallery */}
      <PedagogicalIntroBlock />
    </div>
  );
}

function GalleryStat({
  value,
  label,
  tag,
}: {
  value: string;
  label: string;
  tag: "matt" | "metodmal";
}) {
  return (
    <Card className="border-border p-5">
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-3xl font-bold tracking-tight text-gold">
          {value}
        </span>
        <HonestyTag kind={tag} />
      </div>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </Card>
  );
}

function ReportCard({
  report,
  onOpen,
}: {
  report: ReportMeta;
  onOpen: () => void;
}) {
  return (
    <Card className="group flex flex-col border-border p-5 transition-all hover:border-gold/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className={cn(
            "gap-1 uppercase tracking-wider text-[10px] font-semibold",
            LEVEL_BADGE_STYLES[report.level]
          )}
        >
          {LEVEL_ICON[report.level]}
          {report.levelLabel}
        </Badge>
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <FileText className="h-3 w-3" />
          {report.pages} sidor
        </span>
      </div>

      <h4 className="mt-4 font-serif text-lg font-bold leading-tight">
        {report.title}
      </h4>

      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {report.description}
      </p>

      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <div className="flex justify-between">
          <span className="uppercase tracking-wider">Verifierad</span>
          <span className="font-mono">{report.verified}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase tracking-wider">Sektioner</span>
          <span className="font-mono">{report.sections.length} delar</span>
        </div>
      </div>

      <Button
        onClick={onOpen}
        className="mt-5 w-full bg-gold text-background hover:bg-gold/90"
        size="sm"
      >
        Läs rapporten
        <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}

/* ============================================================
   VIEWER DETAIL — depth selector, nav, iframe
   ============================================================ */

function ReportViewerDetail({
  report,
  depth,
  setDepth,
  onClose,
}: {
  report: ReportMeta;
  depth: Depth;
  setDepth: (d: Depth) => void;
  onClose: () => void;
}) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(true);
  const [pendingPage, setPendingPage] = React.useState<number | null>(null);
  const [mobileSection, setMobileSection] = React.useState<string>("");

  // The maximum navigable page given the current depth and the report's
  // actual page count (manifest says 97, but the depth selector caps at 99).
  const maxPage = Math.min(depth, report.pages);

  /* ── Inject CSS into iframe to hide pages beyond depth ── */
  const applyDepthCss = React.useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Remove any previously injected style
      const existing = doc.getElementById("ak1a-depth-style");
      if (existing) existing.remove();

      const style = doc.createElement("style");
      style.id = "ak1a-depth-style";
      const rules: string[] = [];

      // Hide pages beyond current depth
      if (depth < 99) {
        rules.push(
          `div.page:nth-child(n+${depth + 1}) { display: none !important; }`
        );
      }

      // Cosmetic — give the embedded pages a paper-on-paper look
      rules.push(
        `body { background: #f5f1e8 !important; padding: 24px 0 !important; }`
      );
      rules.push(
        `.page { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; margin: 0 auto 24px auto !important; }`
      );

      style.textContent = rules.join("\n");
      doc.head.appendChild(style);
    } catch {
      // cross-origin — won't happen for same-origin /reports/
    }
  }, [depth]);

  /* ── Scroll the iframe to a specific 1-indexed page ── */
  const scrollToPage = React.useCallback((page: number) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const pages = iframe.contentDocument.querySelectorAll("div.page");
    const el = pages[page - 1] as HTMLElement | undefined;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(page);
    }
  }, []);

  // Re-apply CSS whenever depth changes or iframe loads
  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      setIframeLoaded(true);
      applyDepthCss();
      // If we have a pending page jump (from a section click that required
      // expanding depth), execute it now.
      if (pendingPage !== null) {
        const target = pendingPage;
        setPendingPage(null);
        // Slight delay to let display:none be removed before scrolling
        window.setTimeout(() => scrollToPage(target), 80);
      }
    };

    iframe.addEventListener("load", onLoad);
    // If already loaded (cached), apply immediately
    if (iframe.contentDocument?.readyState === "complete") {
      setIframeLoaded(true);
      applyDepthCss();
    }

    return () => iframe.removeEventListener("load", onLoad);
  }, [applyDepthCss, pendingPage, scrollToPage]);

  // Reset page when depth or report changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [depth, report.slug]);

  const goToPage = React.useCallback(
    (raw: number) => {
      const clamped = Math.max(1, Math.min(raw, maxPage));
      scrollToPage(clamped);
    },
    [maxPage, scrollToPage]
  );

  /* ── Section click — auto-expand depth if section beyond current depth ── */
  const handleSectionClick = React.useCallback(
    (section: ManifestSection) => {
      const firstPage = parseFirstPage(section.pages);
      if (firstPage > maxPage) {
        // Need to expand depth first; the iframe onLoad effect will pick up
        // pendingPage once the CSS is re-applied.
        setDepth(99);
        setPendingPage(firstPage);
      } else {
        scrollToPage(firstPage);
      }
    },
    [maxPage, scrollToPage, setDepth]
  );

  /* ── Print ── */
  const handlePrint = React.useCallback(() => {
    try {
      const w = iframeRef.current?.contentWindow;
      if (!w) return;
      w.focus();
      w.print();
    } catch {
      // ignore
    }
  }, []);

  /* ── Open report file in new tab (full 99-page version) ── */
  const handleOpenFull = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.open(report.file, "_blank", "noopener,noreferrer");
    }
  }, [report.file]);

  // Determine the section currently in view (best-effort: based on currentPage)
  const activeSectionDel = React.useMemo(() => {
    let current: ManifestSection | null = null;
    for (const s of report.sections) {
      const first = parseFirstPage(s.pages);
      if (first <= currentPage) current = s;
      else break;
    }
    return current?.del ?? null;
  }, [report.sections, currentPage]);

  return (
    <div>
      {/* ────────── Top bar ────────── */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Tillbaka till galleriet</span>
              <span className="sm:hidden">Tillbaka</span>
            </Button>

            <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
              <span className="truncate font-serif text-sm font-semibold">
                {report.title}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 gap-1 uppercase tracking-wider text-[9px]",
                  LEVEL_BADGE_STYLES[report.level]
                )}
              >
                {LEVEL_ICON[report.level]}
                {report.levelLabel}
              </Badge>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenFull}
                title="Öppna i ny flik (full 99-sidig rapport)"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Ny flik</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Skriv ut / PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
                aria-label="Stäng rapporten"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ────────── Depth selector ────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Välj djupnivå
              </span>
            </div>
            <Tabs
              value={String(depth)}
              onValueChange={(v) => setDepth(Number(v) as Depth)}
              className="w-full lg:w-auto"
            >
              <TabsList className="h-auto w-full lg:w-auto">
                {DEPTHS.map((d) => (
                  <TabsTrigger
                    key={d.value}
                    value={String(d.value)}
                    className="flex-1 gap-1.5 px-3 py-1.5 lg:flex-initial"
                  >
                    {d.icon}
                    <span className="font-semibold">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {d.sub}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Active depth blurb */}
          <p className="mt-3 text-xs italic text-muted-foreground">
            {DEPTHS.find((d) => d.value === depth)?.blurb}
          </p>
        </div>
      </section>

      {/* ────────── Pedagogical intro card ────────── */}
      {showIntro && (
        <PedagogicalIntroCard onClose={() => setShowIntro(false)} />
      )}

      {/* ────────── Page nav ────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Föregående sida"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sida
              </span>
              <Input
                type="number"
                min={1}
                max={maxPage}
                value={currentPage}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!Number.isNaN(n)) goToPage(n);
                }}
                className="h-8 w-16 text-center font-mono text-sm"
              />
              <span className="font-mono text-sm text-muted-foreground">
                / {maxPage}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= maxPage}
              aria-label="Nästa sida"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Mobile section dropdown */}
            <div className="ml-auto lg:hidden">
              <Select
                value={mobileSection || activeSectionDel || ""}
                onValueChange={(v) => {
                  setMobileSection(v);
                  const sec = report.sections.find((s) => s.del === v);
                  if (sec) handleSectionClick(sec);
                }}
              >
                <SelectTrigger size="sm" className="h-8 w-[240px] max-w-full">
                  <SelectValue placeholder="Hoppa till del…" />
                </SelectTrigger>
                <SelectContent>
                  {report.sections.map((s) => {
                    const first = parseFirstPage(s.pages);
                    const beyond = first > maxPage;
                    return (
                      <SelectItem
                        key={s.del}
                        value={s.del}
                        disabled={beyond}
                      >
                        <span className="font-mono text-[10px] text-gold">
                          Del {s.del}
                        </span>
                        <span className="ml-1 truncate">{s.title}</span>
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          ({s.pages})
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Body: sidebar + iframe ────────── */}
      <section className="bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            {/* Section sidebar (desktop) */}
            <aside className="hidden lg:block">
              <SectionSidebar
                report={report}
                depth={depth}
                maxPage={maxPage}
                activeDel={activeSectionDel}
                onSelect={handleSectionClick}
              />
            </aside>

            {/* Iframe */}
            <div className="min-w-0">
              <div className="relative overflow-x-auto rounded-md border border-border bg-muted/40">
                {!iframeLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gold" />
                      <p className="text-xs text-muted-foreground">
                        Laddar {report.pages} sidor…
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={report.file}
                  title={`${report.title} — AK1A Research Lab`}
                  className="block bg-white"
                  style={{
                    width: "210mm",
                    maxWidth: "100%",
                    height: "85vh",
                    minHeight: "600px",
                    border: "0",
                  }}
                />
              </div>

              {/* Below-iframe meta */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  Visar <strong className="font-mono text-foreground">{maxPage}</strong> av{" "}
                  <strong className="font-mono text-foreground">{report.pages}</strong> sidor
                  · djup <strong className="font-mono text-foreground">{depth}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HonestyTag kind="matt" />
                  99,9 % säkerhet · 100 % rådata-garanti
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Footer note ────────── */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Rapporten är producerad enligt AK1A-ekosystemet:{" "}
              <span className="font-semibold text-foreground">
                5 tidshorisonter × 5 teorier × 4 dimensioner
              </span>
              . Alla slutsatser är reproducerbara till offentlig rådata.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              Stäng rapporten
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   SECTION SIDEBAR
   ============================================================ */

function SectionSidebar({
  report,
  depth,
  maxPage,
  activeDel,
  onSelect,
}: {
  report: ReportMeta;
  depth: Depth;
  maxPage: number;
  activeDel: string | null;
  onSelect: (s: ManifestSection) => void;
}) {
  return (
    <Card className="sticky top-32 border-border p-4">
      <div className="flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5 text-gold" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Innehåll
        </span>
      </div>
      <GoldRule className="my-3" />

      <nav className="space-y-0.5" aria-label="Rapportens innehåll">
        {report.sections.map((s) => {
          const first = parseFirstPage(s.pages);
          const last = parseLastPage(s.pages);
          const beyond = first > maxPage;
          const active = activeDel === s.del;
          return (
            <button
              key={s.del}
              onClick={() => onSelect(s)}
              disabled={beyond}
              className={cn(
                "group flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-1.5 text-left transition-colors",
                active
                  ? "bg-gold/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                beyond && "opacity-50 hover:cursor-not-allowed"
              )}
              title={beyond ? `Öka djupet för att se Del ${s.del}` : `Sidor ${s.pages}`}
            >
              <span className="flex w-full items-center gap-1.5">
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold",
                    active ? "text-gold" : "text-muted-foreground/80"
                  )}
                >
                  Del {s.del}
                </span>
                <span className="ml-auto font-mono text-[9px] text-muted-foreground/70">
                  {s.pages}
                </span>
              </span>
              <span className="text-[11px] leading-tight">{s.title}</span>
              {beyond && (
                <span className="text-[9px] italic text-muted-foreground/60">
                  (utanför djup {depth})
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-border pt-3 text-[10px] text-muted-foreground">
        <p>
          Visar <span className="font-mono text-foreground">{maxPage}</span> /{" "}
          <span className="font-mono">{report.pages}</span> sidor.
        </p>
        <p className="mt-1">
          Klicka på en del för att hoppa dit. Delar utanför aktuellt djup
          expanderas automatiskt till 99 sidor.
        </p>
      </div>
    </Card>
  );
}

/* ============================================================
   PEDAGOGICAL INTRO
   ============================================================ */

/** Inline intro card shown above the iframe the first time a report opens. */
function PedagogicalIntroCard({ onClose }: { onClose: () => void }) {
  return (
    <section className="border-b border-border bg-gradient-to-br from-gold/[0.04] to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Card className="border-gold/30 bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <Eyebrow>Innan du läser</Eyebrow>
                <h3 className="mt-0.5 font-serif text-base font-bold leading-tight">
                  Så är rapporten uppbyggd
                </h3>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={onClose}
              aria-label="Stäng introduktionen"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <IntroPoint
              icon={<Layers className="h-4 w-4" />}
              title="Ekosystem-ramverket"
              body="5 tidshorisonter × 5 teorier × 4 dimensioner. Varje sida bygger på samma struktur — du kan hoppa in var som helst."
            />
            <IntroPoint
              icon={<Sparkles className="h-4 w-4" />}
              title="Tre djupnivåer"
              body="15 sidor för snabb överblick, 35 sidor för mer detalj, 99 sidor för fullständig institutionell analys. Välj ovan."
            />
            <IntroPoint
              icon={<Microscope className="h-4 w-4" />}
              title="Reproducerbar"
              body="Varje siffra spårbar till offentlig rådata. Inga svarta lådor, inga påhittade variabler — bara verifierbar analys."
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <HonestyTag kind="matt" />
            <span className="text-xs text-muted-foreground">
              99,9 % säkerhet, 100 % rådata-garanti — varje uttalat tal är
              spårbart till offentlig källa.
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

function IntroPoint({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-gold">
        {icon}
      </span>
      <div>
        <h4 className="font-serif text-sm font-bold leading-tight">{title}</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}

/** Stand-alone intro block shown at the bottom of the gallery. */
function PedagogicalIntroBlock() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Eyebrow>◆ METODIKEN ◆</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
          Samma ramverk — tre djupnivåer.
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground leading-relaxed">
          Denna rapport följer AK1A:s ekosystem-ramverk med{" "}
          <strong className="text-foreground">5 tidshorisonter × 5 teorier × 4 dimensioner</strong>.
          Välj djup: 15 sidor för snabb överblick, 35 sidor för mer detalj,
          99 sidor för fullständig institutionell analys.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {DEPTHS.map((d) => (
            <Card key={d.value} className="border-border p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                  {d.icon}
                </span>
                <div>
                  <div className="font-serif text-base font-bold leading-none">
                    {d.label}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {d.sub}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {d.blurb}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <HonestyTag kind="matt" />
          <span className="text-xs text-muted-foreground">
            99,9 % säkerhet, 100 % rådata-garanti
          </span>
        </div>
      </div>
    </section>
  );
}

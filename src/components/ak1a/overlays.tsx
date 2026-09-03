"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAk1aStore } from "@/lib/ak1a-store";
import { AKM1_VARIABLES, NAV_SECTIONS, ORGANS } from "@/lib/ak1a/data";
import { HonestyTag, SignalPill } from "./primitives";
import { Search, Share2, Link2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { Button } from "@/components/ui/button";

/** Global ⌘K search modal. Searches sections, AKM1 variables, organs, cases. */
export function SearchModal() {
  const { searchOpen, setSearchOpen, setSection } = useAk1aStore();
  const [q, setQ] = React.useState("");

  const results = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    const items: { type: string; title: string; sub: string; section: any }[] = [];
    NAV_SECTIONS.forEach((s) =>
      items.push({ type: "Sektion", title: s.label, sub: "Navigera till sektion", section: s.id })
    );
    AKM1_VARIABLES.forEach((v) =>
      items.push({
        type: "AKM1",
        title: `${v.id} · ${v.name}`,
        sub: `${v.category} · ${v.weight} · ${v.summary}`,
        section: "kurser",
      })
    );
    ORGANS.forEach((o) =>
      items.push({
        type: "AI-organ",
        title: `${o.symbol} ${o.name}`,
        sub: o.role,
        section: "om-oss",
      })
    );
    if (!query) return items.slice(0, 8);
    return items
      .filter((i) => (i.title + " " + i.sub).toLowerCase().includes(query))
      .slice(0, 12);
  }, [q]);

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Sök</DialogTitle>
          <DialogDescription>Sök i AK1A Research Lab</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sök sektioner, AKM1-variabler, AI-organ…"
            className="border-0 px-0 focus-visible:ring-0 h-8"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto scrollbar-ak1a p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Inga träffar för &ldquo;{q}&rdquo;
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  setSection(r.section);
                  setSearchOpen(false);
                  setQ("");
                }}
                className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
              >
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded-sm border border-gold/30 bg-gold/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold">
                  {r.type}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{r.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Summary drawer — the "Sammanfattning" panel. */
export function SummaryDrawer() {
  const { summaryOpen, setSummaryOpen, setSection } = useAk1aStore();
  return (
    <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex justify-center">
            <VarumarkesLogo storlek="sm" medText={false} />
          </div>
          <SheetTitle className="mt-2 font-serif">Sammanfattning</SheetTitle>
          <SheetDescription>
            AK1A Research Lab i korthet — håll know-how, redovisa generöst.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 text-sm">
          <p className="leading-relaxed text-muted-foreground">
            <span className="text-foreground font-semibold">AK1A Research Lab</span> är
            Sveriges enda institutionella metodik byggd för privatpersoner. Vi
            publicerar slutsatser, scenarier, risker och rekommendationer fullt
            offentligt — de proprietära metoderna bakom bevaras som know-how.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Kurser" value="300+" tag="matt" /> {/* Uppdaterad 2026-09-01: 307 kurser */}
            <Stat label="Sidor per analys" value="99" tag="matt" />
            <Stat label="AKM1-variabler" value="20" tag="matt" /> {/* Uppdaterad 2026-09-01: V01–V20 = 20 variabler (stod tidigare 19) */}
            <Stat label="AK1TS-celler" value="25" tag="matt" />
            <Stat label="AI-organ aktiva" value="5 / 8" tag="metodmal" />
            <Stat label="Push-notiser" value="0" tag="matt" />
          </div>
          <div className="rounded-md border border-border bg-card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">
              Tre vägar in
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>· Nybörjare → utbildning</li>
              <li>· Aktiv investerare → analyser</li>
              <li>· Framtidens analytiker → labbet</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => { setSection("prec"); setSummaryOpen(false); }}>
              Läs PREC-analysen (99 sidor)
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setSection("kurser"); setSummaryOpen(false); }}>
              Börja med Power 20
            </Button>
            <Button size="sm" onClick={() => { setSection("labb"); setSummaryOpen(false); }}>
              Öppna Labbet
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Pedagogisk finansanalys — inte investeringsråd. Investera aldrig
            pengar du inte har råd att förlora.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  label,
  value,
  tag,
}: {
  label: string;
  value: string;
  tag: "matt" | "metodmal";
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <HonestyTag kind={tag} />
      </div>
      <p className="mt-2 font-serif text-2xl font-bold">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

/** Share dialog. */
export function ShareDialog() {
  const { shareOpen, setShareOpen, section } = useAk1aStore();
  const [copied, setCopied] = React.useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "https://ak1nvestor.com";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Dialog open={shareOpen} onOpenChange={setShareOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Share2 className="h-4 w-4 text-gold" /> Dela analysen
          </DialogTitle>
          <DialogDescription>
            AK1A Research Lab — sektion: {NAV_SECTIONS.find((s) => s.id === section)?.label}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <code className="flex-1 truncate text-xs">{url}</code>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="h-3 w-3" /> : "Kopiera"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Alla slutsatser, scenarier, risker och rekommendationer är offentliga.
            Metoderna bakom bevaras som know-how.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

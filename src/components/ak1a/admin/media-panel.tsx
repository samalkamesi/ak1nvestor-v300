"use client";

import * as React from "react";
import {
  ClipboardCopy,
  ImagePlus,
  Lock,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminHeaders, adminJsonHeaders, sparaAdminLosenord } from "@/lib/admin-klient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * MEDIA-PANELN — admin-mega steg 3 (våg 81, STYRELSE-VAG81-MEDIABIBLIOTEK
 * §A4 — "WordPress-kärnan" steg 3).
 *
 * Kundens bildbibliotek: uppladdning till Supabase Storage (bucket `media`,
 * public-read — bootstrap sköts SERVER-side av rutten), rutnät med
 * tumnaglar, "Kopiera URL" samt radering med bekräftelse. URL:erna klistras
 * i blogg-editorns omslagsfält ("Välj från mediebiblioteket") — export av
 * omslagUrl i paketet sköts av exportvägen (Läge A), inte av panelen.
 *
 * LAZY (§A4): panelen mountas först när fliken "Media 🖼️" aktiveras
 * (Radix TabsContent utan forceMount) — GET körs vid fliköppning,
 * ALDRIG vid sidladdning av admin-sidan.
 *
 * KÄLLOR (x-admin-password via admin-klienten — samma lås-rad som övriga
 * admin-paneler):
 *   GET    /api/admin/media  → { poster: MediaFil[], konfigurerat, fel? }
 *   POST   /api/admin/media  → multipart, fält "fil" (201 { post } | 400 { fel })
 *   DELETE /api/admin/media  → { id } → { ok } | { fel }
 *
 * Tumnaglarna använder vanlig <img> — admin-ytan behöver ingen
 * next/image-optimering (remotePatterns-wiring sköts av §A5-agenten).
 */

// ── Svartyper (speglar §A2/§A3-kontraktet) ───────────────────────────────────

type MediaFil = {
  id: string;
  url: string;
  bytes: number;
  mime: string;
  skapad: string;
  /** Filnamnet — kontraktet (§A2) stavar fältet "filnaman"; panelen
   *  accepterar även "filnamn" defensivt (variabel-panelens mönster). */
  filnaman?: string;
  filnamn?: string;
};

type GetSvar = { poster?: MediaFil[]; konfigurerat?: boolean; fel?: string; error?: string };
type PostSvar = { post?: MediaFil; fel?: string; error?: string };
type RaderaSvar = { ok?: boolean; fel?: string; error?: string };

// ── Hjälpare ─────────────────────────────────────────────────────────────────

function namnAv(post: MediaFil): string {
  return post.filnamn ?? post.filnaman ?? post.id;
}

/** Storlek i kB/MB — MB över 1 048 576 bytes (§A1: max 2 MB per fil). */
function formateraStorlek(bytes: number | null | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

// ── Panelen ──────────────────────────────────────────────────────────────────

export function MediaPanel() {
  const { toast } = useToast();
  const [svar, setSvar] = React.useState<GetSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const filRef = React.useRef<HTMLInputElement>(null);
  const [valdFil, setValdFil] = React.useState<File | null>(null);
  const [laddarUpp, setLaddarUpp] = React.useState(false);
  const [raderarId, setRaderarId] = React.useState<string | null>(null);

  /** GET vid fliköppning (mount) + "Uppdatera" — aldrig vid sidladdning. */
  const hamta = React.useCallback(async () => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    try {
      const res = await fetch("/api/admin/media", { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string; fel?: string };
        setBehoverLosen(true);
        setLosenFel(json.fel || json.error || "Admin-lösenord krävs.");
        setSvar(null);
        return;
      }
      if (res.ok) {
        setSvar((await res.json().catch(() => ({}))) as GetSvar);
        setBehoverLosen(false);
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string; fel?: string };
        setFel(json.fel || json.error || `Kunde inte hämta mediebiblioteket (HTTP ${res.status}).`);
      }
    } catch {
      setFel("Nätverksfel — kunde inte hämta mediebiblioteket.");
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    void hamta();
  }, [hamta]);

  const lasUpp = async () => {
    if (!losenord) return;
    sparaAdminLosenord(losenord); // admin-klienten bär den på kommande anrop
    await hamta();
  };

  /** POST multipart — Content-Type sätts AV BROWSERN (gränsen), aldrig manuellt. */
  const laddaUpp = async () => {
    if (!valdFil) return;
    setLaddarUpp(true);
    try {
      const form = new FormData();
      form.append("fil", valdFil);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: adminHeaders(),
        body: form,
      });
      const json = (await res.json().catch(() => ({}))) as PostSvar;
      if (res.ok && json.post) {
        toast({
          title: "Uppladdad",
          description: `${namnAv(json.post)} (${formateraStorlek(json.post.bytes)}) ligger nu i biblioteket.`,
        });
        setValdFil(null);
        if (filRef.current) filRef.current.value = "";
        await hamta();
      } else {
        toast({
          variant: "destructive",
          title: "Uppladdningen misslyckades",
          description: json.fel || json.error || `Servern svarade HTTP ${res.status} utan meddelande.`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Uppladdningen misslyckades",
        description: "Nätverksfel — filen laddades inte upp. Försök igen.",
      });
    } finally {
      setLaddarUpp(false);
    }
  };

  const radera = async (id: string, namn: string) => {
    setRaderarId(id);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ id }),
      });
      const json = (await res.json().catch(() => ({}))) as RaderaSvar;
      if (res.ok && json.ok !== false) {
        toast({ title: "Bilden raderad", description: `${namn} togs bort ur biblioteket.` });
        await hamta();
      } else {
        toast({
          variant: "destructive",
          title: "Raderingen misslyckades",
          description: json.fel || json.error || `Servern svarade HTTP ${res.status} utan meddelande.`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Raderingen misslyckades",
        description: "Nätverksfel — bilden raderades inte. Försök igen.",
      });
    } finally {
      setRaderarId(null);
    }
  };

  /** Urklipp med fallback (http-sidor nekas clipboard-API:t). */
  const kopieraUrl = async (url: string, namn: string) => {
    let kopierat = false;
    try {
      await navigator.clipboard.writeText(url);
      kopierat = true;
    } catch {
      try {
        const ruta = document.createElement("textarea");
        ruta.value = url;
        ruta.style.position = "fixed";
        ruta.style.opacity = "0";
        document.body.appendChild(ruta);
        ruta.select();
        kopierat = document.execCommand("copy");
        ruta.remove();
      } catch {
        kopierat = false;
      }
    }
    if (kopierat) {
      toast({ title: "URL kopierad", description: url });
    } else {
      toast({
        variant: "destructive",
        title: "Kunde inte kopiera automatiskt",
        description: `Kopiera URL:n manuellt: ${namn}`,
      });
    }
  };

  // ── Lås-vy (samma mönster som variabel-/blogg-panelen) ────────────────────
  if (behoverLosen && !svar) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0 text-gold" />
          <h3 className="font-serif text-lg font-bold">Media — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Mediebiblioteket skyddas av ADMIN_PASSWORD — lämnad i headern x-admin-password,
          samma mönster som övriga admin-rutter.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="min-w-0 max-w-xs"
          />
          {/* våg 104: 44px touch-mål på mobil, återställs på sm */}
          <Button onClick={lasUpp} className="min-h-[44px] shrink-0 bg-gold text-background hover:bg-gold/90 sm:min-h-0">
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-600">{losenFel}</p>}
      </div>
    );
  }

  const poster = svar?.poster ?? [];
  const konfigureratOk = svar?.konfigurerat === true;
  const hamtat = svar !== null || fel !== "";

  return (
    <div className="space-y-5">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* våg 104: wrap även i inre raden — badges får inte svämma på 320px */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Media 🖼️</h3>
          <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold">
            ADMIN-MEGA STEG 3
          </Badge>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            SUPABASE STORAGE
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
          <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
        </Button>
      </div>

      {/* Förklaring av mekaniken */}
      <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <ImagePlus className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-gold" />
        Egna bilder (omslag, loggor) utan deploy: jpg/png/webp/avif, max 2 MB. Filerna lever i
        Supabase Storage (bucket <code className="font-mono">media</code>, publik läsning) — klistra
        URL:en i blogg-editorns omslagsfält eller "Välj från mediebiblioteket".
      </p>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {!hamtat && <p className="text-xs text-muted-foreground">Hämtar mediebiblioteket …</p>}

      {/* Ärligt läge: Supabase Storage saknas — sajten opåverkad (§A1). */}
      {hamtat && !konfigureratOk && !fel && (
        <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          Supabase Storage är inte konfigurerat — mediebiblioteket kan inte användas ännu
          {svar?.fel ? ` (${svar.fel})` : ""}. Konfigurera NEXT_PUBLIC_SUPABASE_URL och
          service-nyckeln i miljön, sedan ladda om. Sajten opåverkas inte.
        </p>
      )}

      {/* Uppladdning */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 shrink-0 text-gold" />
            <h4 className="font-serif text-sm font-bold">Ladda upp bild</h4>
          </div>
          <span className="text-[10px] text-muted-foreground">jpg · png · webp · avif · max 2 MB</span>
        </div>
        <input
          ref={filRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => setValdFil(e.target.files?.[0] ?? null)}
          aria-label="Välj bildfil att ladda upp"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* våg 104: 44px touch-mål på mobil, återställs på sm */}
          <Button
            size="sm"
            variant="outline"
            className="min-h-[44px] sm:min-h-0"
            disabled={!konfigureratOk || laddarUpp}
            title={!konfigureratOk ? "Kräver konfigurerad Supabase Storage" : "Välj en bildfil"}
            onClick={() => filRef.current?.click()}
          >
            <ImagePlus className="mr-1 h-3 w-3" /> Välj fil
          </Button>
          {valdFil && (
            <>
              <span className="min-w-0 max-w-full truncate text-xs" title={valdFil.name}>
                {valdFil.name} <span className="text-muted-foreground">({formateraStorlek(valdFil.size)})</span>
              </span>
              <Button
                size="sm"
                className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0"
                disabled={laddarUpp}
                onClick={laddaUpp}
              >
                {laddarUpp ? (
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="mr-1 h-3 w-3" />
                )}
                Ladda upp
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={laddarUpp}
                onClick={() => {
                  setValdFil(null);
                  if (filRef.current) filRef.current.value = "";
                }}
              >
                <X className="mr-1 h-3 w-3" /> Avbryt
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rutnätet */}
      {konfigureratOk && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-serif text-sm font-bold">Bilder ({poster.length})</h4>
            <span className="text-[10px] text-muted-foreground">
              Klicka på "Kopiera URL" och klistra i omslagsfältet — eller välj direkt i blogg-editorn.
            </span>
          </div>
          {laddar && poster.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">Hämtar biblioteket …</p>
          ) : poster.length === 0 ? (
            <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
              Inga bilder än — ladda upp din första.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {poster.map((post) => (
                <MediaKort
                  key={post.id}
                  post={post}
                  raderar={raderarId === post.id}
                  kopiera={() => kopieraUrl(post.url, namnAv(post))}
                  radera={() => radera(post.id, namnAv(post))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <ClipboardCopy className="h-3 w-3 shrink-0" />
        Varje uppladdning/radering loggas som system_event (revisbart) — inga IP-adresser spåras.
      </p>
    </div>
  );
}

// ── Ett bildkort: tumnagel + metadata + kopiera/ta bort ──────────────────────

function MediaKort({
  post,
  raderar,
  kopiera,
  radera,
}: {
  post: MediaFil;
  raderar: boolean;
  kopiera: () => void;
  radera: () => void;
}) {
  const [bekrafta, setBekrafta] = React.useState(false);
  const namn = namnAv(post);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {/* Vanlig <img> är OK i admin — §A4 (remotePatterns sköts av §A5). */}
        <img
          src={post.url}
          alt={namn}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="truncate text-xs font-semibold" title={namn}>
          {namn}
        </p>
        <p className="text-[10px] text-muted-foreground" title={`${datumKort(post.skapad)} · ${tidSedan(post.skapad)}`}>
          {formateraStorlek(post.bytes)} · {datumKort(post.skapad)}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
          <Button size="sm" variant="outline" className="min-h-[44px] sm:min-h-0" onClick={kopiera} aria-label={`Kopiera URL till ${namn}`}>
            <ClipboardCopy className="mr-1 h-3 w-3" /> Kopiera URL
          </Button>
          {!bekrafta ? (
            <Button
              size="sm"
              variant="outline"
              className="min-h-[44px] border-red-500/40 text-red-600 hover:bg-red-500/10 sm:min-h-0"
              disabled={raderar}
              onClick={() => setBekrafta(true)}
              aria-label={`Ta bort ${namn}`}
            >
              <Trash2 className="mr-1 h-3 w-3" /> Ta bort
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="min-h-[44px] border-red-500/60 text-red-600 hover:bg-red-500/10 sm:min-h-0"
                disabled={raderar}
                onClick={radera}
                aria-label={`Bekräfta borttagning av ${namn}`}
              >
                {raderar ? (
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-3 w-3" />
                )}
                Bekräfta ta bort
              </Button>
              <Button size="sm" variant="ghost" disabled={raderar} onClick={() => setBekrafta(false)}>
                <X className="mr-1 h-3 w-3" /> Avbryt
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

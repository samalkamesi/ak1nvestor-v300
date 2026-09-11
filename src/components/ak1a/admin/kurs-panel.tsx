"use client";

import * as React from "react";
import {
  ChevronDown,
  GraduationCap,
  History,
  Lock,
  RefreshCw,
  Save,
  Search,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminHeaders, adminJsonHeaders, sparaAdminLosenord } from "@/lib/admin-klient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * KURS-PANELN — admin-mega steg 4 (våg 82, STYRELSE-VAG82-BYGG §A3 —
 * "KURS-METADATA LIVE").
 *
 * Redigering av de 4 VITLISTADE kursfälteten (title/summary/learn/why) utan
 * deploy: filvärdena lever i deep-courses-filerna, överriderna i Supabase
 * (senaste-vinner per "{slug}.{falt}"). Skrivningar går ENDAST via
 * serverns skrivKursMetadata (hård validering: vitlista, längdtak,
 * kontrolleraText 0 FEL, vitlås på slug/category/weight/xp/minutes/
 * chapters) — panelen är UI, inte säkerhet.
 *
 * LAZY (§A3, media-panel-mönstret): panelen mountas först när fliken
 * "Kurser 🎓" aktiveras (Radix TabsContent utan forceMount) — GET körs
 * vid fliköppning, ALDRIG vid sidladdning av admin-sidan.
 *
 * KÄLLOR (x-admin-password via admin-klienten — samma lås-rad som övriga
 * admin-paneler):
 *   GET  /api/admin/kurser → { kurser, logg } (333 poster + senaste 20
 *                            kurs_metadata-andring)
 *   POST /api/admin/kurser → { slug, falt, varde | null } PER FÄLT —
 *                            varde:null = tombstone = ROLLBACK till
 *                            filvärdet (200 {ok} | 400 {fel})
 */

// ── Svartyper (speglar §A2-kontraktet, defensivt) ────────────────────────────

type FaltNyckel = "title" | "summary" | "learn" | "why";

type KursVarden = Partial<Record<FaltNyckel, string>>;

type KursRad = {
  slug: string;
  fil?: KursVarden;
  gallande?: KursVarden;
  kalla?: string | null;
  andrad?: boolean | string | null;
};

type LoggRad = {
  id?: string;
  /** §A2-loggrader: {andrad, slug, falt, gammalt, varde, av, kalla}. */
  andrad?: string;
  slug?: string | null;
  falt?: string | null;
  gammalt?: string | null;
  varde?: string | null;
  av?: string | null;
  kalla?: string | null;
  /** Defensivt: råa system_events-fält om svaret bär dem. */
  message?: string | null;
  meddelande?: string | null;
  details?: string | null;
  createdAt?: string;
  created_at?: string;
};

type GetSvar = {
  kurser?: KursRad[];
  logg?: LoggRad[];
  konfigurerat?: boolean;
  fel?: string;
  error?: string;
};

type PostSvar = { ok?: boolean; fel?: string; error?: string };

// ── Fältregistret — vitlistan är HEL (endast dessa 4 är skrivbara) ───────────

const FALT: { nyckel: FaltNyckel; etikett: string; tak: number; rader: number }[] = [
  { nyckel: "title", etikett: "Titel", tak: 120, rader: 2 },
  { nyckel: "summary", etikett: "Sammanfattning", tak: 300, rader: 3 },
  { nyckel: "learn", etikett: "Det du lär dig", tak: 300, rader: 3 },
  { nyckel: "why", etikett: "Varför kursen", tak: 900, rader: 5 },
];

// ── Hjälpare ─────────────────────────────────────────────────────────────────

function filVarde(rad: KursRad, f: FaltNyckel): string {
  return rad.fil?.[f] ?? "";
}

/** Gällande värde = override om den finns, annars filvärdet. */
function gallandeVarde(rad: KursRad, f: FaltNyckel): string {
  const g = rad.gallande?.[f];
  return g === undefined || g === null ? filVarde(rad, f) : g;
}

/** Override-finns = gällande skiljer sig från filen (tombstone = fil gäller). */
function harOverride(rad: KursRad, f: FaltNyckel): boolean {
  const g = rad.gallande?.[f];
  if (g === undefined || g === null) return false;
  return g !== filVarde(rad, f);
}

function antalOverridar(rad: KursRad): number {
  return FALT.filter((f) => harOverride(rad, f.nyckel)).length;
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

/** API-fel sanerat innan visning: kontrolltecken bort, rimlig längd. */
function sanera(text: string | null | undefined, tak = 300): string {
  if (!text) return "";
  return text
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, tak);
}

function initUtkast(rad: KursRad): Record<FaltNyckel, string> {
  const u = { title: "", summary: "", learn: "", why: "" };
  for (const f of FALT) u[f.nyckel] = gallandeVarde(rad, f.nyckel);
  return u;
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function KursPanel() {
  const { toast } = useToast();
  const [svar, setSvar] = React.useState<GetSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const [sok, setSok] = React.useState("");
  const [oppnad, setOppnad] = React.useState<string | null>(null);
  const [utkast, setUtkast] = React.useState<Record<FaltNyckel, string>>({
    title: "",
    summary: "",
    learn: "",
    why: "",
  });
  const [spararNyckel, setSpararNyckel] = React.useState<string | null>(null);

  /** GET vid fliköppning (mount) + "Uppdatera" — aldrig vid sidladdning. */
  const hamta = React.useCallback(async () => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    try {
      const res = await fetch("/api/admin/kurser", { headers: adminHeaders() });
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
        setFel(json.fel || json.error || `Kunde inte hämta kurserna (HTTP ${res.status}).`);
      }
    } catch {
      setFel("Nätverksfel — kunde inte hämta kurserna.");
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

  /** POST ETT fält i taget — {slug, falt, varde|null} (§A2-kontraktet). */
  const sparaFalt = async (rad: KursRad, f: FaltNyckel, varde: string | null) => {
    const nyckel = `${rad.slug}.${f}`;
    setSpararNyckel(nyckel);
    try {
      const res = await fetch("/api/admin/kurser", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ slug: rad.slug, falt: f, varde }),
      });
      const json = (await res.json().catch(() => ({}))) as PostSvar;
      if (res.ok && json.ok !== false) {
        toast({
          title: varde === null ? "Återställt till filvärdet" : "Fältet sparat",
          description:
            varde === null
              ? `${rad.slug}.${f} rullades tillbaka — filvärdet gäller igen.`
              : `${rad.slug}.${f} sparad (senaste-vinner).`,
        });
        await hamta();
        // Utkastet synkas mot det färska svaret (rollback ⇒ filvärdet tillbaka).
        setUtkast((u) => ({ ...u, [f]: varde ?? filVarde(rad, f) }));
      } else {
        toast({
          variant: "destructive",
          title: varde === null ? "Rollbacken misslyckades" : "Sparningen misslyckades",
          description:
            sanera(json.fel || json.error) || `Servern svarade HTTP ${res.status} utan meddelande.`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: varde === null ? "Rollbacken misslyckades" : "Sparningen misslyckades",
        description: "Nätverksfel — inget sparades. Försök igen.",
      });
    } finally {
      setSpararNyckel(null);
    }
  };

  // ── Lås-vy (samma mönster som variabel-/blogg-/media-panelen) ─────────────
  if (behoverLosen && !svar) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0 text-gold" />
          <h3 className="font-serif text-lg font-bold">Kurser — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Kursmetadata skyddas av ADMIN_PASSWORD — lämnad i headern x-admin-password,
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

  const kurser = svar?.kurser ?? [];
  const logg = svar?.logg ?? [];
  const konfigureratOk = svar?.konfigurerat !== false; // defensivt: ok om fältet saknas
  const hamtat = svar !== null || fel !== "";

  const sokNorm = sok.trim().toLowerCase();
  const filtrerade = sokNorm
    ? kurser.filter(
        (k) =>
          k.slug.toLowerCase().includes(sokNorm) ||
          gallandeVarde(k, "title").toLowerCase().includes(sokNorm),
      )
    : kurser;

  const oppna = (rad: KursRad) => {
    if (oppnad === rad.slug) {
      setOppnad(null);
      return;
    }
    setOppnad(rad.slug);
    setUtkast(initUtkast(rad));
  };

  return (
    <div className="space-y-5">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Kurser 🎓</h3>
          <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold">
            ADMIN-MEGA STEG 4
          </Badge>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            4 VITLISTE-FÄLT
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
          <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
        </Button>
      </div>

      {/* Förklaring av mekaniken */}
      <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <GraduationCap className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-gold" />
        Redigera kursers titel, sammanfattning, "det du lär dig" och "varför" utan deploy:
        ändringen lever i Supabase (senaste-vinner) och skrivs först när serverns kvalitetsgrind
        godkänner texten. <strong className="text-foreground">Rollback</strong> raderar
        överriden — filvärdet gäller igen. Övriga kursdata (slug, kategori, vikt, XP,
        kapitel m.m.) är låsta och kan aldrig skrivas här.
      </p>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {!hamtat && <p className="text-xs text-muted-foreground">Hämtar kurser …</p>}

      {/* Ärligt läge: Supabase saknas — filvärdena gäller, sajten opåverkad. */}
      {hamtat && !konfigureratOk && !fel && (
        <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          Supabase är inte konfigurerat — kursmetadata kan inte redigeras ännu
          {svar?.fel ? ` (${svar.fel})` : ""}. Konfigurera miljön och ladda om. Sajten
          opåverkas inte: filvärdena gäller.
        </p>
      )}

      {/* Sök + listan */}
      {hamtat && (
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 shrink-0 text-gold" />
              <h4 className="font-serif text-sm font-bold">Kurser ({kurser.length})</h4>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Sök på slug eller titel — klicka på en rad för att redigera fälten.
            </span>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              placeholder="Sök kurs (slug eller titel) …"
              className="h-8 pl-8 text-xs"
              aria-label="Sök kurs på slug eller titel"
            />
          </div>

          {laddar && kurser.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">Hämtar kurserna …</p>
          ) : kurser.length === 0 ? (
            <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
              Inga kurser i svaret — kurserna läses ur deep-courses-filerna.
            </p>
          ) : filtrerade.length === 0 ? (
            <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
              Ingen kurs matchar sökningen.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {filtrerade.map((rad) => (
                <KursRadKomponent
                  key={rad.slug}
                  rad={rad}
                  oppnad={oppnad === rad.slug}
                  utkast={utkast}
                  spararNyckel={spararNyckel}
                  konfigureratOk={konfigureratOk}
                  oppna={() => oppna(rad)}
                  setUtkast={setUtkast}
                  sparaFalt={sparaFalt}
                />
              ))}
            </ul>
          )}
          {sokNorm && filtrerade.length > 0 && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              {filtrerade.length} av {kurser.length} kurser matchar sökningen.
            </p>
          )}
        </div>
      )}

      {/* Spårhistorik — senaste 20 kurs_metadata-andring (§A2 logg) */}
      {hamtat && !fel && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 shrink-0 text-gold" />
            <h4 className="font-serif text-sm font-bold">Spårhistorik (senaste 20)</h4>
          </div>
          {logg.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Inga ändringar loggade än — varje sparning/rollback landar här (revisbart).
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {logg.map((rad, i) => {
                const id = rad.id ?? `${i}`;
                const tid = rad.andrad ?? rad.createdAt ?? rad.created_at;
                const nyckel = [rad.slug, rad.falt].filter(Boolean).join(".");
                const arRollback = rad.varde === null || rad.varde === "";
                const text =
                  rad.message ??
                  rad.meddelande ??
                  (nyckel
                    ? `${nyckel} — ${arRollback ? "rollback (filvärdet gäller igen)" : "ändrad"}`
                    : "ändring");
                const detalj =
                  rad.details ??
                  (arRollback
                    ? rad.gammalt
                      ? `gammalt: ${rad.gammalt}`
                      : null
                    : [rad.gammalt && `från: ${rad.gammalt}`, rad.varde && `till: ${rad.varde}`]
                        .filter(Boolean)
                        .join(" · ") || null);
                return (
                  <li
                    key={id}
                    className="rounded-md border border-border bg-card px-3 py-2 text-[11px]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 break-words font-medium">{text}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {tidSedan(tid)}
                      </span>
                    </div>
                    {detalj && (
                      <p
                        className="mt-1 break-all font-mono text-[10px] text-muted-foreground"
                        title={detalj}
                      >
                        {detalj.length > 200 ? `${detalj.slice(0, 200)} …` : detalj}
                      </p>
                    )}
                    {(rad.av || rad.kalla) && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {[rad.av && `av: ${rad.av}`, rad.kalla && `källa: ${rad.kalla}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Spara gäller ett fält i taget och valideras server-side (längdtak 120/300/300/900 +
        kvalitetsgrind). Tombstone-rollback (varde:null) återställer filvärdet — inget
        hittills skrivet försvinner spårlöst: varje ändring loggas som revisionsrad.
      </p>
    </div>
  );
}

// ── En kursrad: kompaktrubrik + expanderad fält-redigerare ───────────────────

function KursRadKomponent({
  rad,
  oppnad,
  utkast,
  spararNyckel,
  konfigureratOk,
  oppna,
  setUtkast,
  sparaFalt,
}: {
  rad: KursRad;
  oppnad: boolean;
  utkast: Record<FaltNyckel, string>;
  spararNyckel: string | null;
  konfigureratOk: boolean;
  oppna: () => void;
  setUtkast: React.Dispatch<React.SetStateAction<Record<FaltNyckel, string>>>;
  sparaFalt: (rad: KursRad, f: FaltNyckel, varde: string | null) => Promise<void>;
}) {
  const overridar = antalOverridar(rad);

  return (
    <li className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={oppna}
        aria-expanded={oppnad}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-left text-[11px] transition-colors hover:border-gold/40"
      >
        <ChevronDown
          className={cn("h-3 w-3 shrink-0 text-muted-foreground transition-transform", oppnad && "rotate-180")}
        />
        <span className="min-w-0 max-w-full truncate font-semibold" title={gallandeVarde(rad, "title")}>
          {gallandeVarde(rad, "title") || "(kurs utan titel)"}
        </span>
        <span className="truncate font-mono text-[10px] text-muted-foreground">{rad.slug}</span>
        {overridar > 0 && (
          <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold">
            ändrad ×{overridar}
          </Badge>
        )}
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {overridar > 0 ? `${overridar} överride${overridar > 1 ? "r" : ""} · fil + gällande` : "oförändrad"}
        </span>
      </button>

      {oppnad && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          {FALT.map((f) => {
            const fält = f.nyckel;
            const fil = filVarde(rad, fält);
            const gallande = gallandeVarde(rad, fält);
            const overrid = harOverride(rad, fält);
            const draft = utkast[fält] ?? "";
            const overTak = draft.length > f.tak;
            const oforandrad = draft === gallande;
            const sparar = spararNyckel === `${rad.slug}.${fält}`;

            return (
              <div key={fält} className="rounded-md border border-border bg-card p-3">
                {/* Etikettrad + ändrad-badge + teckenräknare */}
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {f.etikett}
                    </span>
                    {overrid && (
                      <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold">
                        ändrad
                      </Badge>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] tabular-nums text-muted-foreground",
                      overTak && "font-semibold text-red-600",
                    )}
                  >
                    {draft.length}/{f.tak}
                  </span>
                </div>

                {/* Diff-preview: filvärdet grått, gällande (om override) vanligt */}
                <div className="mt-1.5 space-y-1">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    <span className="text-[10px] font-semibold uppercase">Fil:</span> {fil || "—"}
                  </p>
                  {overrid && (
                    <p className="text-[11px] leading-relaxed">
                      <span className="text-[10px] font-semibold uppercase text-gold">Gällande:</span>{" "}
                      {gallande || "—"}
                    </p>
                  )}
                </div>

                {/* Textarean — ett fält, en sparning */}
                <Textarea
                  value={draft}
                  onChange={(e) => setUtkast((u) => ({ ...u, [fält]: e.target.value }))}
                  rows={f.rader}
                  className="mt-2 text-xs leading-relaxed"
                  aria-label={`${f.etikett} för ${rad.slug}`}
                  disabled={sparar}
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0"
                    disabled={sparar || overTak || oforandrad || !konfigureratOk}
                    title={
                      overTak
                        ? `Längdtaket är ${f.tak} tecken`
                        : oforandrad
                          ? "Ingen ändring att spara"
                          : !konfigureratOk
                            ? "Kräver konfigurerat lager"
                            : `Spara ${fält} för ${rad.slug}`
                    }
                    onClick={() => sparaFalt(rad, fält, draft)}
                  >
                    {sparar ? (
                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="mr-1 h-3 w-3" />
                    )}
                    Spara {f.etikett.toLowerCase()}
                  </Button>
                  {overrid && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-[44px] border-gold/40 text-gold hover:bg-gold/10 sm:min-h-0"
                      disabled={sparar || !konfigureratOk}
                      title={`Radera överriden — filvärdet gäller igen (${fält})`}
                      onClick={() => sparaFalt(rad, fält, null)}
                    >
                      {sparar ? (
                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Undo2 className="mr-1 h-3 w-3" />
                      )}
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}

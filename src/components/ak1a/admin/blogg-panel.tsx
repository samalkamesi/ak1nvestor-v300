"use client";

import * as React from "react";
import {
  Check,
  ClipboardCopy,
  Download,
  FileJson,
  History,
  ImagePlus,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  SearchCheck,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminHeaders, adminJsonHeaders, sparaAdminLosenord } from "@/lib/admin-klient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * BLOGG-PANELN — admin-mega steg 2 (våg 80b del B, STYRELSE-ADMIN-MEGA
 * BYGGKONTRAKT VÅG 80b §Del B — "WordPress-kärnan").
 *
 * LÄGE A: PAKETEXPORT. Utkasten lever i Supabase (system_events
 * type="blogg_utkast", SENASTE-VINNER per slug — variabel-mönstret våg 79).
 * Statusstegen: utkast → granskad (kräver 0 FEL i kontrolleraText — våg
 * 66-grinden) → publicerad (sätts ENBART via exportvägen: knappen
 * "Exportera klar post" ger JSON-paketet som main/agent droppar i
 * data/blogg/<slug>.json + commit → main-push → LIVE; bloggroutern
 * (/blogg/[slug]) renderar den automatiskt med metadata/OG). Läge B
 * (hot-path-läsning live) väntar på benchmark. VÅG 82 (B2): "Publicera
 * (skickar till agent)" kör samma 0-FEL-grind men postar även en agent-
 * påminnelse (blogg_publicerad) — filen landar vid nästa main-push; vyn
 * "Väntar på agent" visar utkast med status=publicerad.
 *
 * KÄLLOR (x-admin-password via admin-klienten — samma lås-rad som
 * övriga admin-paneler):
 *   GET  /api/admin/blogg  (lista: status + kontrollstatus per utkast)
 *   POST /api/admin/blogg  ({action: "spara"|"kontrollera"|"status"|
 *                            "exportera"})
 *   POST /api/admin/blogg/publicera  (B2, våg 82 del C: {slug, tags} →
 *                            0-FEL-grind + status=publicerad + agent-
 *                            påminnelse blogg_publicerad → {paket})
 *
 * GRINDEN är server-side (rutten + lib:en) — panelens lås ("Skicka till
 * granskad" avaktiverad tills senaste serverkontroll visar 0 FEL på EXAKT
 * aktuell text) är UI-komfort, inte säkerhet.
 */

// ── Svartyper (speglar API-kontraktet) ───────────────────────────────────────

type Status = "utkast" | "granskad" | "publicerad";

type KontrollStatus = {
  felAntal: number;
  varningAntal: number;
  godkand: boolean;
  ord: number;
  readingMinutes: number;
};

type PosterRad = {
  slug: string;
  titel: string;
  ingress: string;
  bodyMarkdown: string;
  status: Status;
  av: string;
  version: number;
  uppdaterad: string;
  kontroll: KontrollStatus;
  /** Omslagsbild-URL (våg 81 §A4) — rutten skickar den när wiring landat;
   *  panelen är defensiv tills dess. */
  omslagUrl?: string;
};

type TraffRad = { fras: string; ersattning: string };
type StrukturRad = { meddelande: string; allvar: "FEL" | "VARNING" };

type Rapport = {
  fel: TraffRad[];
  varningar: TraffRad[];
  strukturFel: StrukturRad[];
  strukturVarningar: StrukturRad[];
  godkand: boolean;
  ord: number;
  readingMinutes: number;
};

type GetSvar = { poster?: PosterRad[]; error?: string };

/** Mediebiblioteket (GET /api/admin/media — våg 81 §A3) för omslagsväljaren.
 *  Kontraktet stavar filnamnsfältet "filnaman" — båda stavningarna tas. */
type MediaFilVal = { id: string; url: string; filnaman?: string; filnamn?: string };
type MediaBibliotekSvar = { poster?: MediaFilVal[]; konfigurerat?: boolean; fel?: string; error?: string };
type PostSvar = {
  ok?: boolean;
  error?: string;
  meddelande?: string;
  post?: PosterRad;
  rapport?: Rapport;
  paket?: Record<string, unknown>;
  filnamn?: string;
};

/** B2-publicera-ruttens svar (POST /api/admin/blogg/publicera — våg 82). */
type PubliceraSvar = { paket?: Record<string, unknown>; fel?: string };

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

function statusBadge(status: Status) {
  if (status === "publicerad") {
    return (
      <Badge variant="outline" className="border-bull/60 text-[10px] text-bull">
        publicerad
      </Badge>
    );
  }
  if (status === "granskad") {
    return (
      <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
        granskad
      </Badge>
    );
  }
  return <Badge variant="outline" className="text-[10px] text-muted-foreground">utkast</Badge>;
}

/** Redaktörens editor-state — "ny" styrs av om utkastet redan finns i listan. */
type EditorState = {
  slug: string;
  titel: string;
  ingress: string;
  bodyMarkdown: string;
  /** Taggar (ämnesord) — kommaseparerade i fältet, array mot export-rutten. */
  tags: string;
  /** Omslagsbild (valfri URL — våg 81 §A4): följer med sparar-flödet som
   *  omslagUrl; kan klistras rakt av eller väljas ur mediebiblioteket. */
  omslagUrl: string;
  /** True när editorn är ett ÄNNU EJ SPARAT nytt utkast (unik-slug-tvånget). */
  ny: boolean;
};

const TOM_EDITOR: EditorState = { slug: "", titel: "", ingress: "", bodyMarkdown: "", tags: "", omslagUrl: "", ny: true };

/** Listans filteralternativ (våg 82 B2) — "Väntar på agent" = publicerad
 *  i lagret: agenten droppar filen + pushar vid nästa main-push. */
const FILTER_ALTERNATIV: Array<{ id: "alla" | Status; etikett: string }> = [
  { id: "alla", etikett: "Alla" },
  { id: "utkast", etikett: "Utkast" },
  { id: "granskad", etikett: "Granskade" },
  { id: "publicerad", etikett: "Väntar på agent" },
];

// ── Panelen ──────────────────────────────────────────────────────────────────

export function BloggPanel() {
  const { toast } = useToast();
  const [poster, setPoster] = React.useState<PosterRad[]>([]);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const [editor, setEditor] = React.useState<EditorState | null>(null);
  const [arbetar, setArbetar] = React.useState(false);
  /** Senaste serverkontrollen + vilken text den gällde (stämpla = exakt text). */
  const [rapport, setRapport] = React.useState<Rapport | null>(null);
  const [rapportText, setRapportText] = React.useState("");

  /** Listfilter (våg 82 B2): "Väntar på agent" = status=publicerad. */
  const [filter, setFilter] = React.useState<"alla" | Status>("alla");
  /** Senast publicerade paket (B2) — visas för hand-drop tills det stängs. */
  const [publiceratPaket, setPubliceratPaket] = React.useState<{
    slug: string;
    paket: Record<string, unknown>;
  } | null>(null);

  /** Omslagsväljaren (våg 81 §A4) — biblioteket hämtas LAZY vid första öppning. */
  const [bibliotekOppet, setBibliotekOppet] = React.useState(false);
  const [bibliotek, setBibliotek] = React.useState<MediaBibliotekSvar | null>(null);
  const [bibliotekLaddar, setBibliotekLaddar] = React.useState(false);

  const hamta = React.useCallback(async () => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    try {
      const res = await fetch("/api/admin/blogg", { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        setLosenFel(json.error || "Admin-lösenord krävs.");
        setPoster([]);
        return;
      }
      if (res.ok) {
        setPoster(((await res.json()) as GetSvar).poster ?? []);
        setBehoverLosen(false);
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFel(json.error || `Kunde inte hämta utkast (HTTP ${res.status}).`);
      }
    } catch {
      setFel("Nätverksfel — kunde inte hämta bloggutkast.");
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    void hamta();
  }, [hamta]);

  const lasUpp = async () => {
    if (!losenord) return;
    sparaAdminLosenord(losenord);
    await hamta();
  };

  /** Kör en POST-action mot ruttens fyra vägar — toast vid fel, svar i retur. */
  const posta = React.useCallback(
    async (kropp: Record<string, unknown>): Promise<{ ok: boolean; svar: PostSvar; status: number }> => {
      try {
        const res = await fetch("/api/admin/blogg", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify(kropp),
        });
        const svar = (await res.json().catch(() => ({}))) as PostSvar;
        if (!res.ok || svar.ok === false) {
          toast({
            variant: "destructive",
            title: "Åtgärden misslyckades",
            description: svar.error || `Servern svarade HTTP ${res.status} utan meddelande.`,
          });
          return { ok: false, svar, status: res.status };
        }
        return { ok: true, svar, status: res.status };
      } catch {
        toast({
          variant: "destructive",
          title: "Åtgärden misslyckades",
          description: "Nätverksfel — inget sparades. Försök igen.",
        });
        return { ok: false, svar: {}, status: 0 };
      }
    },
    [toast],
  );

  /** GET mediebiblioteket (våg 81 §A3) — körs först när väljaren öppnas. */
  const hamtaBibliotek = React.useCallback(async () => {
    setBibliotekLaddar(true);
    try {
      const res = await fetch("/api/admin/media", { headers: adminHeaders() });
      setBibliotek((await res.json().catch(() => ({}))) as MediaBibliotekSvar);
    } catch {
      setBibliotek({ fel: "Nätverksfel — kunde inte hämta mediebiblioteket." });
    } finally {
      setBibliotekLaddar(false);
    }
  }, []);

  const oppnaBibliotek = () => {
    setBibliotekOppet(true);
    if (!bibliotek) void hamtaBibliotek();
  };

  // ── Editor-handlingar ─────────────────────────────────────────────────────

  const oppna = (rad: PosterRad) => {
    setEditor({
      slug: rad.slug,
      titel: rad.titel,
      ingress: rad.ingress,
      bodyMarkdown: rad.bodyMarkdown,
      tags: "",
      omslagUrl: rad.omslagUrl ?? "",
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

  /** Texten kontrollen gällde — stämpel så "Skicka till granskad" vet om
   *  editorn ändrats EFTER senaste kontroll (då är låset tillbaka på). */
  const editorText = (e: EditorState): string => `${e.titel}\n${e.ingress}\n${e.bodyMarkdown}`;
  const rapportArAktuell =
    rapport !== null && editor !== null && editorText(editor) === rapportText;
  const kanSkickaTillGranskad =
    editor !== null && !editor.ny && rapportArAktuell && rapport !== null && rapport.godkand;

  /** Den SPARADE raden för editorns slug (B2-knappens underlag — serverns
   *  status + kontroll på den sparade raden, inte editorns lokala text). */
  const sparadRad =
    editor !== null && !editor.ny ? poster.find((p) => p.slug === editor.slug) : undefined;
  /** "Publicera (skickar till agent)" syns ENBART på granskade utkast med
   *  godkänd kontroll (status=granskad + kontroll godkänd — våg 82 B2). */
  const kanPubliceraTillAgent =
    !!sparadRad && sparadRad.status === "granskad" && sparadRad.kontroll.godkand;

  const sparaUtkast = async () => {
    if (!editor) return;
    setArbetar(true);
    const { ok, svar } = await posta({
      action: "spara",
      slug: editor.slug,
      titel: editor.titel,
      ingress: editor.ingress,
      bodyMarkdown: editor.bodyMarkdown,
      omslagUrl: editor.omslagUrl.trim(),
      ny: editor.ny,
    });
    setArbetar(false);
    if (ok) {
      toast({
        title: "Utkast sparat",
        description: svar.meddelande || `${editor.slug} sparad i lagret (senaste-vinner).`,
      });
      setEditor({ ...editor, ny: false });
      await hamta();
    }
  };

  const kolla = async () => {
    if (!editor) return;
    setArbetar(true);
    const { ok, svar } = await posta({
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
    const { ok, svar } = await posta({ action: "status", slug: editor.slug, status: "granskad" });
    setArbetar(false);
    if (ok) {
      toast({
        title: "Satt till granskad",
        description: svar.meddelande || "0 FEL — utkastet är granskningsklart.",
      });
      await hamta();
    }
  };

  /** Exportera: kopiera JSON till urklipp + nedladdning <slug>.json. */
  const exportera = async () => {
    if (!editor || editor.ny) return;
    setArbetar(true);
    const { ok, svar } = await posta({
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
      // urklipp nekat (t.ex. http) — nedladdningen räcker
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
    toast({
      title: "Klar post exporterad",
      description:
        `${filnamn}${kopierat ? " nedladdad + JSON i urklipp" : " nedladdad"} — droppa filen i data/blogg/ och committa (main-push → live). ` +
        "Utkastet markerades publicerat i lagret.",
    });
    await hamta();
  };

  /** Publicera (B2, våg 82 del C): 0-FEL-grind + status=publicerad + agent-
   *  påminnelse (blogg_publicerad) — paketet visas nedan som hand-drop-
   *  reservväg. Bygger på den SPARADE raden (samma som exporten). */
  const publicera = async () => {
    if (!editor || !kanPubliceraTillAgent) return;
    setArbetar(true);
    let ok = false;
    let svar: PubliceraSvar = {};
    try {
      const res = await fetch("/api/admin/blogg/publicera", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          slug: editor.slug,
          tags: editor.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      svar = (await res.json().catch(() => ({}))) as PubliceraSvar;
      ok = res.ok && !!svar.paket;
      if (!ok) {
        toast({
          variant: "destructive",
          title: "Publiceringen misslyckades",
          description: svar.fel || `Servern svarade HTTP ${res.status} utan meddelande.`,
        });
      }
    } catch {
      ok = false;
      toast({
        variant: "destructive",
        title: "Publiceringen misslyckades",
        description: "Nätverksfel — inget skickades till agenten. Försök igen.",
      });
    }
    setArbetar(false);
    if (!ok || !svar.paket) return;
    setPubliceratPaket({ slug: editor.slug, paket: svar.paket });
    toast({
      title: "Skickat till agent — publiceras vid nästa main-push",
      description:
        `${editor.slug}: status satt till publicerad i lagret + agent-påminnelse (blogg_publicerad) postad. ` +
        "Paketet visas nedan som reservväg (hand-drop).",
    });
    await hamta();
  };

  /** Hand-drop-reservvägen: kopiera det publicerade paketet till urklipp. */
  const kopieraPubliceratPaket = async () => {
    if (!publiceratPaket) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(publiceratPaket.paket, null, 2));
      toast({
        title: "Paketet i urklipp",
        description: `Klistra in som data/blogg/${publiceratPaket.slug}.json vid hand-drop.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Kunde inte kopiera",
        description: "Markera JSON:en i rutan och kopiera manuellt.",
      });
    }
  };

  /** Hand-drop-reservvägen: ladda ner det publicerade paketet som fil. */
  const laddaNerPubliceratPaket = () => {
    if (!publiceratPaket) return;
    try {
      const blob = new Blob([JSON.stringify(publiceratPaket.paket, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${publiceratPaket.slug}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        variant: "destructive",
        title: "Nedladdningen misslyckades",
        description: "Kopiera JSON:en i stället (knappen bredvid).",
      });
    }
  };

  // ── Lås-vy (samma mönster som variabel-panelen) ───────────────────────────
  if (behoverLosen && poster.length === 0) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Blogg — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Bloggutkasten skyddas av ADMIN_PASSWORD — lämnad i headern x-admin-password,
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

  const bibliotekPoster = bibliotek?.poster ?? [];
  const bibliotekFel = bibliotek?.fel || bibliotek?.error || "";

  const filtreradePoster = filter === "alla" ? poster : poster.filter((p) => p.status === filter);

  return (
    <div className="space-y-5">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Blogg ✍️</h3>
          <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
            ADMIN-MEGA STEG 2
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            LÄGE A · PAKETEXPORT
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
          <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
        </Button>
      </div>

      {/* Läge A-förklaringen — dokumenterad i panelen (filhuvudskravet) */}
      <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <FileJson className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-gold" />
        Utkast lever i Supabase (senaste-vinner per slug). <strong className="text-foreground">Läge A:</strong>{" "}
        "Exportera klar post" ger JSON-paketet — filen droppas i <code className="font-mono">data/blogg/</code> av
        main/agent + main-push → live (bloggroutern renderar den automatiskt med metadata/OG). Statusbyte till
        granskad kräver 0 FEL i kontrolleraText; "publicerad" sätts enbart via exportvägen.{" "}
        <strong className="text-foreground">Våg 82 (B2):</strong> "Publicera (skickar till agent)" kör samma 0-FEL-grind
        + postar en agent-påminnelse (blogg_publicerad) — vyn "Väntar på agent" visar utkast med status=publicerad.
      </p>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {laddar && poster.length === 0 && <p className="text-xs text-muted-foreground">Hämtar utkast …</p>}

      {/* Utkastlistan */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gold" />
            <h4 className="font-serif text-sm font-bold">Utkast ({filtreradePoster.length})</h4>
          </div>
          <Button size="sm" variant="outline" onClick={oppnaNy}>
            <Plus className="mr-1 h-3 w-3" /> Nytt utkast
          </Button>
        </div>
        {/* Filtersegment (våg 82 B2) — "Väntar på agent" = status=publicerad */}
        <div className="mt-3 flex flex-wrap gap-1">
          {FILTER_ALTERNATIV.map((alt) => {
            const antal =
              alt.id === "alla" ? poster.length : poster.filter((p) => p.status === alt.id).length;
            const aktiv = filter === alt.id;
            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => setFilter(alt.id)}
                aria-pressed={aktiv}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                  aktiv
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground",
                )}
              >
                {alt.etikett} ({antal})
              </button>
            );
          })}
        </div>
        {filter === "publicerad" && (
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            <Rocket className="mr-1 inline h-3 w-3 align-[-2px] text-bull" />
            Status publicerad i lagret — agenten droppar filen i data/blogg/ och pushar vid nästa
            main-push. Reservväg: öppna utkastet och "Exportera klar post" (hand-drop).
          </p>
        )}
        {filtreradePoster.length === 0 ? (
          <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
            {filter === "publicerad"
              ? "Inget väntar på agenten just nu — publicera ett granskat utkast (0 FEL) först."
              : filter === "alla"
                ? 'Inga utkast i lagret än — skapa det första med "Nytt utkast".'
                : "Inga utkast med denna status."}
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {filtreradePoster.map((rad) => (
              <li
                key={rad.slug}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card px-3 py-2 text-[11px]"
              >
                {statusBadge(rad.status)}
                <span className="min-w-0 max-w-full truncate font-semibold" title={rad.titel}>
                  {rad.titel}
                </span>
                <span className="truncate font-mono text-[10px] text-muted-foreground">{rad.slug}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] tabular-nums",
                    rad.kontroll.felAntal > 0 ? "border-red-500/40 text-red-600" : "border-bull/40 text-bull",
                  )}
                >
                  {rad.kontroll.felAntal > 0
                    ? `${rad.kontroll.felAntal} FEL`
                    : `0 fel · ${rad.kontroll.varningAntal} varn`}
                </Badge>
                <span className="text-muted-foreground">v{rad.version}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {rad.av} · {tidSedan(rad.uppdaterad)}
                </span>
                <Button size="sm" variant="outline" onClick={() => oppna(rad)}>
                  <Pencil className="mr-1 h-3 w-3" /> Öppna
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Publicerat paket (B2) — hand-drop-reservvägen tills agenten pushat */}
      {publiceratPaket && (
        <div className="rounded-lg border border-bull/40 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Rocket className="h-4 w-4 text-bull" />
              <h4 className="font-serif text-sm font-bold">Skickat till agent: {publiceratPaket.slug}</h4>
              <Badge variant="outline" className="border-bull/60 text-[10px] text-bull">
                väntar på main-push
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={kopieraPubliceratPaket}>
                <ClipboardCopy className="mr-1 h-3 w-3" /> Kopiera JSON
              </Button>
              <Button size="sm" variant="outline" onClick={laddaNerPubliceratPaket}>
                <Download className="mr-1 h-3 w-3" /> {publiceratPaket.slug}.json
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPubliceratPaket(null)}>
                <X className="mr-1 h-3 w-3" /> Stäng
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Agent-påminnelsen (blogg_publicerad) är postad — agenten droppar filen i{" "}
            <code className="font-mono">data/blogg/</code> och pushar vid nästa main-push. Reservväg
            (hand-drop): kopiera/ladda ner paketet nedan och droppa det själv.
          </p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-border bg-muted/40 p-2 font-mono text-[10px] leading-relaxed">
            {JSON.stringify(publiceratPaket.paket, null, 2)}
          </pre>
        </div>
      )}

      {/* Editorn */}
      {editor && (
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-serif text-sm font-bold">
              {editor.ny ? "Nytt utkast" : `Redigerar: ${editor.slug}`}
            </h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditor(null);
                setRapport(null);
                setRapportText("");
              }}
            >
              <X className="mr-1 h-3 w-3" /> Stäng
            </Button>
          </div>

          <div className="mt-3 grid gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="blogg-slug" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Slug ^[a-z0-9-]+$ {editor.ny ? "(måste vara ledig — unik-tvingad)" : "(låst för befintligt utkast)"}
              </label>
              <Input
                id="blogg-slug"
                value={editor.slug}
                disabled={!editor.ny}
                onChange={(e) => setEditor({ ...editor, slug: e.target.value.trim() })}
                placeholder="t.ex. komplett-guide-svensk-aktieanalys-2026"
                className="font-mono text-xs"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="blogg-titel" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Titel
              </label>
              <Input
                id="blogg-titel"
                value={editor.titel}
                onChange={(e) => setEditor({ ...editor, titel: e.target.value })}
                placeholder="Rubriken — gravör, inte reklam"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="blogg-ingress" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ingress (blir description i den exporterade posten)
              </label>
              <Textarea
                id="blogg-ingress"
                value={editor.ingress}
                onChange={(e) => setEditor({ ...editor, ingress: e.target.value })}
                rows={2}
                placeholder="En-två meningar som bärt texten — också OG-beskrivningen."
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="blogg-body" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Body — markdown (≥ 800 tecken, minst 2 "## "-rubriker)
              </label>
              <Textarea
                id="blogg-body"
                value={editor.bodyMarkdown}
                onChange={(e) => setEditor({ ...editor, bodyMarkdown: e.target.value })}
                rows={14}
                className="font-mono text-xs leading-relaxed"
                placeholder={"Inledande stycke …\n\n## Första rubriken\n\nBrödtext med [länkar](/kurser) …\n\n## Andra rubriken\n\n…"}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="blogg-tags" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ämnesord (kommaseparerade — exporteras som tags)
              </label>
              <Input
                id="blogg-tags"
                value={editor.tags}
                onChange={(e) => setEditor({ ...editor, tags: e.target.value })}
                placeholder="t.ex. riskhantering, AKM2, portfölj"
                className="text-xs"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="blogg-omslag" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Omslagsbild (valfri URL — sparas i utkastet som omslagUrl)
              </label>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="blogg-omslag"
                  value={editor.omslagUrl}
                  onChange={(e) => setEditor({ ...editor, omslagUrl: e.target.value.trim() })}
                  placeholder="https://…supabase.co/storage/v1/object/public/media/…"
                  className="min-w-0 flex-1 font-mono text-xs"
                  inputMode="url"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gold/40 text-gold hover:bg-gold/10"
                  onClick={oppnaBibliotek}
                >
                  <ImagePlus className="mr-1 h-3 w-3" /> Välj från mediebiblioteket
                </Button>
              </div>
              {editor.omslagUrl !== "" && (
                <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <img
                    src={editor.omslagUrl}
                    alt=""
                    className="h-6 w-10 rounded border border-border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  Förhandsvisning — blir OG-bild i den exporterade posten.
                </p>
              )}
            </div>
          </div>

          {/* Förhandsvisning av rubriker */}
          <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Rubrikstruktur ({(editor.bodyMarkdown.match(/^## /gm) ?? []).length} "## ")
            </p>
            {(editor.bodyMarkdown.match(/^## .+$/gm) ?? []).length === 0 ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Inga rubriker än — förhandsvisningen dyker upp när bodyn får "## "-rader.
              </p>
            ) : (
              <ol className="mt-1 space-y-0.5">
                {(editor.bodyMarkdown.match(/^## .+$/gm) ?? []).map((r, i) => (
                  <li key={`${i}-${r}`} className="font-serif text-xs font-semibold">
                    {i + 1}. {r.replace(/^## /, "")}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Knappraden */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-gold text-background hover:bg-gold/90"
              disabled={arbetar || editor.slug === "" || editor.titel.trim() === ""}
              onClick={sparaUtkast}
            >
              {arbetar ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
              Spara utkast
            </Button>
            <Button size="sm" variant="outline" disabled={arbetar} onClick={kolla}>
              <SearchCheck className="mr-1 h-3 w-3" /> Kontrollera
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gold/40 text-gold hover:bg-gold/10"
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
              onClick={skickaTillGranskad}
            >
              <Send className="mr-1 h-3 w-3" /> Skicka till granskad
            </Button>
            {kanPubliceraTillAgent && (
              <Button
                size="sm"
                variant="outline"
                className="border-bull/50 text-bull hover:bg-bull/10"
                disabled={arbetar}
                title="Publicerar den sparade raden: 0-FEL-grind + status=publicerad + agent-påminnelse (blogg_publicerad) — filen droppas av agenten vid nästa main-push"
                onClick={publicera}
              >
                {arbetar ? (
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Rocket className="mr-1 h-3 w-3" />
                )}
                Publicera (skickar till agent)
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-bull/50 text-bull hover:bg-bull/10"
              disabled={arbetar || editor.ny}
              title={editor.ny ? "Spara utkastet först (exporten bygger på den sparade raden)" : "Exportera klar post (Läge A)"}
              onClick={exportera}
            >
              <Download className="mr-1 h-3 w-3" /> Exportera klar post
            </Button>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            "Skicka till granskad" är låst tills senaste Kontrollera visar 0 FEL på exakt aktuell text ·
            "Publicera (skickar till agent)" syns på granskade utkast (sparad status + godkänd kontroll)
            och skickar paketet till agenten — filen landar vid nästa main-push ·
            "Exportera klar post" bygger på den <strong className="text-foreground">sparade</strong> raden (spara först),
            kör 0-FEL-grinden igen, lägger till disclaimer om den saknas, markerar utkastet publicerat och levererar
            JSON (urklipp + <code className="font-mono">&lt;slug&gt;.json</code>).
          </p>

          {/* Kontrollrapporten */}
          {rapport && (
            <div className="mt-4 rounded-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                {rapport.godkand ? (
                  <Badge variant="outline" className="border-bull/60 text-[10px] text-bull">
                    <Check className="mr-1 h-3 w-3" /> 0 FEL — godkänd
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500/50 text-[10px] text-red-600">
                    <X className="mr-1 h-3 w-3" /> {rapport.fel.length + rapport.strukturFel.length} FEL — nekas
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] tabular-nums text-muted-foreground">
                  {rapport.varningar.length + rapport.strukturVarningar.length} varningar
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {rapport.ord} ord · ~{rapport.readingMinutes} min läsning
                </span>
                {!rapportArAktuell && (
                  <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
                    texten ändrad efter kontrollen — kör igen
                  </Badge>
                )}
              </div>

              {rapport.fel.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {rapport.fel.map((t, i) => (
                    <li key={`f${i}-${t.fras}`} className="text-[11px] text-red-600">
                      FEL: "{t.fras}" → {t.ersattning}
                    </li>
                  ))}
                </ul>
              )}
              {rapport.strukturFel.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {rapport.strukturFel.map((s, i) => (
                    <li key={`sf${i}`} className="text-[11px] text-red-600">
                      FEL (struktur): {s.meddelande}
                    </li>
                  ))}
                </ul>
              )}
              {rapport.varningar.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {rapport.varningar.map((t, i) => (
                    <li key={`v${i}-${t.fras}`} className="text-[11px] text-yellow-700 dark:text-yellow-400">
                      VARNING: "{t.fras}" → {t.ersattning}
                    </li>
                  ))}
                </ul>
              )}
              {rapport.strukturVarningar.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {rapport.strukturVarningar.map((s, i) => (
                    <li key={`sv${i}`} className="text-[11px] text-yellow-700 dark:text-yellow-400">
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
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Ren rapport — inga träffar i varumärkesregistret, strukturkraven uppfyllda.
                  </p>
                )}
            </div>
          )}

          {/* Omslagsväljaren — mediebiblioteket (våg 81 §A4). Hämtas LAZY vid
              första öppning; klick på en bild fyller omslagsfältet. */}
          <Dialog open={bibliotekOppet} onOpenChange={setBibliotekOppet}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Välj omslagsbild ur mediebiblioteket</DialogTitle>
                <DialogDescription>
                  Klicka på en bild för att fylla fältet med dess URL. Uppladdning sköts under
                  fliken "Media 🖼️".
                </DialogDescription>
              </DialogHeader>
              {bibliotekLaddar ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Hämtar biblioteket …</p>
              ) : bibliotek?.konfigurerat === false ? (
                <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  Supabase Storage är inte konfigurerat — inga bilder kan hämtas ännu
                  {bibliotekFel ? ` (${bibliotekFel})` : ""}. Se fliken "Media 🖼️" för mer.
                </p>
              ) : bibliotekFel ? (
                <p className="text-xs text-red-600">{bibliotekFel}</p>
              ) : bibliotekPoster.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Inga bilder i biblioteket än — ladda upp din första under fliken "Media 🖼️".
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {bibliotekPoster.map((bild) => (
                    <button
                      key={bild.id}
                      type="button"
                      className="group overflow-hidden rounded-md border border-border bg-card text-left transition-colors hover:border-gold/60"
                      aria-label={`Välj ${bild.filnamn ?? bild.filnaman ?? bild.id} som omslagsbild`}
                      onClick={() => {
                        setEditor((e) => (e ? { ...e, omslagUrl: bild.url } : e));
                        setBibliotekOppet(false);
                      }}
                    >
                      <span className="block aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={bild.url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                        />
                      </span>
                      <span className="block truncate px-2 py-1 font-mono text-[10px] text-muted-foreground">
                        {bild.filnamn ?? bild.filnaman ?? bild.id}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Panelens minnesanteckning om städning av editor (UI-komfort) */}
      {editor === null && (
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Trash2 className="h-3 w-3" />
          Utkasthistoriken är revisbar (senaste-vinner per slug) — radering sköts av main via REST, inte av panelen.
        </p>
      )}
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <ClipboardCopy className="h-3 w-3" />
        Exporten kopierar paketet till urklipp <em>och</em> laddar ner filen — samma JSON som droppas i data/blogg/.
      </p>
    </div>
  );
}

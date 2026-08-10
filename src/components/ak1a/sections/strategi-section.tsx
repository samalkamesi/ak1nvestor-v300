"use client";

import * as React from "react";
import {
  ArrowRight,
  Target,
  Compass,
  Crown,
  Eye,
  Sparkles,
  Shield,
  Zap,
  Award,
  TrendingUp,
  Brain,
  Lock,
  CheckCircle2,
  AlertCircle,
  Layers,
  BookOpen,
  Microscope,
  Globe,
  Scale,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════════
   STRATEGI — #1 i världen i kategorin "Verifierbar Privatplacering"
   
   Denna sektion är AK1A:s strategiska manifest. Den samlar:
   - Zero to One-sanningen (kontrarisk positionering)
   - Blue Ocean (marknaden vi skapade)
   - Positioning (ordet vi äger: VERIFIERBARHET)
   - 48 uppgifter för AI-organen att följa
   ══════════════════════════════════════════════════════════════════════════ */

interface MegaTask {
  num: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  organOwner: string;
  status: string;
}

const ORGAN_MAP: Record<string, { name: string; role: string }> = {
  "Σ": { name: "Strategi-organet", role: "Positionering & långsiktighet" },
  "α": { name: "Analys-organet", role: "Metodik & slutsatser" },
  "Δ": { name: "Data-organet", role: "Datakällor & reproducerbarhet" },
  "Ω": { name: "Vision-organet", role: "Framtid & kategori-ledarskap" },
  "Φ": { name: "Innovation-organet", role: "Nya angreppssätt" },
  "Θ": { name: "Kvalitets-organet", role: "Granskning & ärlighet" },
  "Μ": { name: "Marknads-organet", role: "Marknadsföring & budskap" },
  "Ψ": { name: "Utbildnings-organet", role: "Pedagogik & kurser" },
};

const PRIORITY_STYLES: Record<string, string> = {
  KRITISK: "border-bear/40 text-bear bg-bear/[0.06]",
  HÖG: "border-gold/40 text-gold bg-gold/[0.06]",
  MEDEL: "border-border text-muted-foreground bg-muted/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  strategi: "STRATEGI",
  branding: "BRANDING",
  kundupplevelse: "KUNDUPPLEVELSE",
  innehåll: "INNEHÅLL",
  marknadsföring: "MARKNADSFÖRING",
  teknik: "TEKNIK",
  kvalitet: "KVALITET",
  tillväxt: "TILLVÄXT",
  "ai-organ": "AI-ORGAN",
};

export function StrategiSection() {
  const { setSection } = useAk1aStore();
  const [tasks, setTasks] = React.useState<MegaTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState<string>("alla");

  React.useEffect(() => {
    fetch("/api/mega/tasks", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = React.useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return ["alla", ...Array.from(cats).sort()];
  }, [tasks]);

  const filteredTasks = React.useMemo(() => {
    if (activeCategory === "alla") return tasks;
    return tasks.filter((t) => t.category === activeCategory);
  }, [tasks, activeCategory]);

  const stats = React.useMemo(() => {
    const kritisk = tasks.filter((t) => t.priority === "KRITISK").length;
    const hog = tasks.filter((t) => t.priority === "HÖG").length;
    const medel = tasks.filter((t) => t.priority === "MEDEL").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { total: tasks.length, kritisk, hog, medel, completed };
  }, [tasks]);

  return (
    <div className="paper-texture">
      {/* ───────────── HERO — Manifest ───────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-4xl">
            <Eyebrow>◆ STRATEGI · #1 I VÄRLDEN ◆</Eyebrow>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-gold">Zero to One · Blue Ocean · Positioning</span>
              <span className="text-border">·</span>
              <span>10 strategiska ramverk</span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="hidden sm:inline">48 uppgifter för AI-organen</span>
            </div>

            <h1 className="mt-5 font-serif text-3xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Vi skapade kategorin.{" "}
              <span className="text-gold">Andra kopierar.</span>
            </h1>

            <p className="mt-5 max-w-3xl text-base text-muted-foreground leading-relaxed sm:text-lg">
              AK1A äger ordet <strong className="text-foreground">verifierbarhet</strong> i en
              marknad där banker säljer åsikter, bloggare säljer tips och robo-rådgivare säljer
              automation. Vi säljer den enda metodiken som låter dig återskapa varje rekommendation själv.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <HonestyTag kind="matt" />
              <Badge variant="outline" className="border-gold/40 text-gold uppercase tracking-wider text-[10px]">
                Kognitiv suveränitet
              </Badge>
              <Badge variant="outline" className="border-border uppercase tracking-wider text-[10px]">
                Anti-bank · Anti-casino
              </Badge>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gold text-background hover:bg-gold/90"
                onClick={() => document.getElementById("mega-uppgifter")?.scrollIntoView({ behavior: "smooth" })}
              >
                Se 48 uppgifter <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("ramverk")?.scrollIntoView({ behavior: "smooth" })}
              >
                <BookOpen className="mr-1 h-4 w-4" /> Strategiska ramverk
              </Button>
            </div>

            <GoldRule className="mt-8 max-w-md" />
          </div>
        </div>
      </section>

      {/* ───────────── ZERO TO ONE — Den kontrariska sanningen ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
            <div>
              <Eyebrow>Zero to One · Peter Thiel</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
                Vilken sanning vet vi som banker inte håller med om?
              </h2>
              <blockquote className="mt-5 border-l-2 border-gold pl-4 font-serif text-lg italic leading-relaxed text-foreground/90 sm:text-xl">
                &ldquo;En investerares värsta fiende är inte marknaden — det är bristen på
                reproducerbarhet i sina egna beslut. Banker och bloggare har kommersiella skäl
                att dölja detta; vi har kommersiella skäl att avslöja det.&rdquo;
              </blockquote>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed sm:text-base">
                Privatpersoner lämnar inte banker för att de är dumma — de lämnar för att de
                känner sig löjliga när de inte kan återskapa resonemanget. Den viktigaste sanningen
                i svensk privatplacering 2026 är: <strong className="text-foreground">&ldquo;Jag vill inte
                bli tillsagd — jag vill kunna säga det till mig själv.&rdquo;</strong>
              </p>
            </div>

            <Card className="border-gold/40 bg-gradient-to-br from-card to-gold/[0.04] p-5 sm:p-6">
              <Eyebrow>Thiel-monopol — 4 egenskaper</Eyebrow>
              <div className="mt-4 space-y-3">
                <MonopolRow
                  icon={<Lock className="h-4 w-4" />}
                  label="Proprietary tech"
                  value="AKM1 (20 variabler), våglängds-metodik, 225 djupa kurser"
                />
                <MonopolRow
                  icon={<Layers className="h-4 w-4" />}
                  label="Network effects"
                  value="Analys → kurs → labb → styrelse — ekosystem-loop"
                />
                <MonopolRow
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Economies of scale"
                  value="99-sidig analys: lika dyr för 10 som 10 000 kunder"
                />
                <MonopolRow
                  icon={<Crown className="h-4 w-4" />}
                  label="Branding"
                  value="Kognitiv suveränitet · Verifiera allt"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── BLUE OCEAN — Marknaden vi skapade ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
          <Eyebrow>Blue Ocean Strategy · Kim & Mauborgne</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
            Marknaden vi skapade — som inte fanns
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
            Innan AK1A fanns två alternativ: banker (med intressekonflikt) eller bloggare (med
            klick-jakt). Vi skapade en tredje kategori: <strong className="text-foreground">Verifierbar
            Privatplacering</strong> — institutionell metodik, reproducerbar, utan intressekonflikt.
          </p>

          {/* ERRC Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ErrcCard
              action="ELIMINATE"
              tone="bear"
              title="Intressekonflikt"
              body="Inga egna fonder. Inga provisioner. Inga dolda ägarintressen. Vi äger inga aktier vi rekommenderar."
            />
            <ErrcCard
              action="REDUCE"
              tone="gold"
              title="Jargong & komplexitet"
              body="Bank-ord ('våra experter', 'din rådgivare') reduceras till noll. Pedagogisk svenska i 'du'-form."
            />
            <ErrcCard
              action="RAISE"
              tone="bull"
              title="Djup & reproducerbarhet"
              body="99-sidiga analyser. Varje siffra spårbar till offentlig källa. 'Verifiera själv'-knapp på varje analys."
            />
            <ErrcCard
              action="CREATE"
              tone="gold-strong"
              title="AI-organ styrelse + ekosystem"
              body="8 AI-organ som tar beslut öppet. Analys → kurs → labb → styrelse i en sluten ekosystem-loop."
            />
          </div>
        </div>
      </section>

      {/* ───────────── POSITIONING — Ordet vi äger ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <Eyebrow>Positioning · Ries & Trout</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
                Ordet vi äger i ditt sinne
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">
                Ett varumärke kan äga ett ord. Volvo äger <em>säkerhet</em>. Apple äger <em>design</em>.
                AK1A äger <strong className="text-gold">verifierbarhet</strong>.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">
                Banker kan inte låna ordet utan att spränga sin affärsmodell — deras rekommendationer
                är inte reproducerbara. Bloggare kan inte låna det — deras tips är inte spårbara.
                Robo-rådgivare kan inte låna det — deras algoritmer är svarta lådor.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base">
                <strong className="text-foreground">Känsloladdat ord:</strong> kognitiv suveränitet.
                Det är vad verifierbarhet ger dig — makten över dina egna beslut.
              </p>
            </div>

            <Card className="border-gold/40 bg-gradient-to-br from-gold/[0.08] to-transparent p-6 sm:p-8">
              <div className="text-center">
                <Eyebrow>Vårt ägda ord</Eyebrow>
                <div className="mt-4 font-serif text-5xl font-bold tracking-tight text-gold sm:text-7xl">
                  VERIFIERBARHET
                </div>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Kognitiv suveränitet
                </p>
                <Separator className="my-5 bg-border" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Varje analys, varje kurs, varje protokoll — allt bygger på detta ord.
                  Om vi tappar det, tappar vi allt.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <HonestyTag kind="matt" />
                  <span className="text-xs text-muted-foreground">MÄTT — gäller allt vi gör</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── STRATEGISKA RAMVERK ───────────── */}
      <section id="ramverk" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
          <Eyebrow>10 strategiska ramverk</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
            Vårt strategiska system
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
            Tio ramverk bygger vår väg till #1. Varje uppgift, varje beslut, varje rad text
            kan spåras till ett av dessa ramverk.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORKS.map((fw) => (
              <FrameworkCard key={fw.name} {...fw} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── MEGA-UPPGIFTER — 48 för AI-organen ───────────── */}
      <section id="mega-uppgifter" className="border-b border-border bg-muted/30 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Mega-uppgifter · AI-organen</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
                48 uppgifter för #1-positionering
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed sm:text-base">
                Varje uppgift ägs av ett AI-organ och spårar till ett strategiskt ramverk.
                Detta är vår väg från &ldquo;bästa i Sverige&rdquo; till &ldquo;bästa i världen&rdquo;.
              </p>
            </div>
            {stats.total > 0 && (
              <div className="flex gap-3">
                <StatPill label="Totalt" value={stats.total} tone="gold" />
                <StatPill label="Kritisk" value={stats.kritisk} tone="bear" />
                <StatPill label="Hög" value={stats.hog} tone="gold" />
                <StatPill label="Klar" value={stats.completed} tone="bull" />
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                  activeCategory === cat
                    ? "bg-gold text-background"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold/40"
                )}
              >
                {cat === "alla" ? "ALLA" : CATEGORY_LABELS[cat] || cat.toUpperCase()}
                <span className="ml-1.5 opacity-60">
                  {cat === "alla" ? stats.total : tasks.filter((t) => t.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Tasks list */}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 flex items-center justify-center py-12">
                <div className="text-sm text-muted-foreground">Hämtar 48 uppgifter…</div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-sm text-muted-foreground">
                Inga uppgifter i denna kategori.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard key={task.num} task={task} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ───────────── GÅ VIDARE ───────────── */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
          <Eyebrow>Fortsätt utforska</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
            Gå vidare
          </h2>
          <GoldRule className="mt-6 max-w-md" />

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <GoCard
              icon={<Eye className="h-5 w-5" />}
              title="AI-organ styrelse"
              sub="Se besluten live"
              onClick={() => setSection("styrelse")}
            />
            <GoCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Alla kurser"
              sub="225 djupa moduler"
              onClick={() => setSection("kurser")}
            />
            <GoCard
              icon={<Microscope className="h-5 w-5" />}
              title="Analyser"
              sub="99-sidiga rapporter"
              onClick={() => setSection("analyser")}
            />
            <GoCard
              icon={<Globe className="h-5 w-5" />}
              title="Om oss"
              sub="Vilka vi är"
              onClick={() => setSection("om-oss")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════════════════════ */

function MonopolRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
        {icon}
      </span>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium leading-snug">{value}</div>
      </div>
    </div>
  );
}

function ErrcCard({
  action,
  tone,
  title,
  body,
}: {
  action: string;
  tone: string;
  title: string;
  body: string;
}) {
  const toneClass: Record<string, string> = {
    bear: "border-bear/40 bg-bear/[0.04]",
    gold: "border-gold/40 bg-gold/[0.04]",
    bull: "border-bull/40 bg-bull/[0.04]",
    "gold-strong": "border-gold bg-gold/[0.08]",
  };
  const actionTone: Record<string, string> = {
    bear: "text-bear",
    gold: "text-gold",
    bull: "text-bull",
    "gold-strong": "text-gold",
  };
  return (
    <Card className={cn("border p-5", toneClass[tone])}>
      <div className={cn("text-[11px] font-bold uppercase tracking-[0.2em]", actionTone[tone])}>
        {action}
      </div>
      <h3 className="mt-2 font-serif text-lg font-bold leading-tight">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </Card>
  );
}

interface Framework {
  name: string;
  author: string;
  icon: string;
  question: string;
  answer: string;
}

const FRAMEWORKS: Framework[] = [
  {
    name: "Zero to One",
    author: "Peter Thiel",
    icon: "Target",
    question: "Vilken sanning vet vi som andra inte håller med om?",
    answer: "Användaren behöver metod, inte åsikter. Reproducerbarhet > rekommendation.",
  },
  {
    name: "Blue Ocean Strategy",
    author: "Kim & Mauborgne",
    icon: "Compass",
    question: "Vilken marknad skapade vi som inte fanns?",
    answer: "Verifierbar Privatplacering — institutionell metodik för privatpersoner.",
  },
  {
    name: "Positioning",
    author: "Ries & Trout",
    icon: "Crown",
    question: "Vilket ord äger vi i kundens sinne?",
    answer: "VERIFIERBARHET (tekniskt) + KOGNITIV SUVERÄNITET (känsloladdat).",
  },
  {
    name: "Purple Cow",
    author: "Seth Godin",
    icon: "Sparkles",
    question: "Vad gör oss anmärkningsvärda?",
    answer: "99-sidiga analyser + offentlig AI-styrelse + 'håll know-how, redovisa generöst'.",
  },
  {
    name: "Start With Why",
    author: "Simon Sinek",
    icon: "Brain",
    question: "Varför existerar vi?",
    answer: "Ge varje person samma beslutsunderlag som institutionerna — och metoden att förstå det.",
  },
  {
    name: "Crossing the Chasm",
    author: "Geoffrey Moore",
    icon: "TrendingUp",
    question: "Hur korsar vi från early adopters till majority?",
    answer: "Beachhead = DIY-sparare. Broar: 'Verifiera själv'-knapp + ekosystem-loop + head-to-head.",
  },
  {
    name: "Made to Stick",
    author: "Heath brothers",
    icon: "Zap",
    question: "Vad gör våra budskap klistriga?",
    answer: "SUCCESs: Simple, Unexpected, Concrete, Credible, Emotional, Stories.",
  },
  {
    name: "Contagious",
    author: "Jonah Berger",
    icon: "Globe",
    question: "Varför sprids vårt innehåll?",
    answer: "STEPPS: Social currency, Triggers, Emotion, Public, Practical, Stories.",
  },
  {
    name: "Hooked",
    author: "Nir Eyal",
    icon: "Lock",
    question: "Hur skapar vi vana?",
    answer: "Trigger → Action → Variable reward → Investment. Ekosystem-loopen = vår hook.",
  },
  {
    name: "Innovator's Dilemma",
    author: "Clayton Christensen",
    icon: "Shield",
    question: "Varför kan inte banker kopiera oss?",
    answer: "Deras affärsmodell kräver intressekonflikt. Reproducerbarhet dödar deras marginal.",
  },
];

function FrameworkCard({ name, author, icon, question, answer }: Framework) {
  const iconMap: Record<string, React.ReactNode> = {
    Target: <Target className="h-5 w-5" />,
    Compass: <Compass className="h-5 w-5" />,
    Crown: <Crown className="h-5 w-5" />,
    Sparkles: <Sparkles className="h-5 w-5" />,
    Brain: <Brain className="h-5 w-5" />,
    TrendingUp: <TrendingUp className="h-5 w-5" />,
    Zap: <Zap className="h-5 w-5" />,
    Globe: <Globe className="h-5 w-5" />,
    Lock: <Lock className="h-5 w-5" />,
    Shield: <Shield className="h-5 w-5" />,
  };
  return (
    <Card className="border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
          {iconMap[icon]}
        </span>
        <div>
          <h3 className="font-serif text-sm font-bold leading-tight">{name}</h3>
          <div className="text-[10px] text-muted-foreground">{author}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fråga
        </div>
        <p className="mt-1 text-xs italic text-muted-foreground">{question}</p>
      </div>
      <Separator className="my-3 bg-border" />
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gold">
          Vårt svar
        </div>
        <p className="mt-1 text-sm font-medium leading-snug">{answer}</p>
      </div>
    </Card>
  );
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  const toneClass: Record<string, string> = {
    gold: "text-gold border-gold/30",
    bear: "text-bear border-bear/30",
    bull: "text-bull border-bull/30",
  };
  return (
    <div className={cn("rounded-md border bg-card px-3 py-1.5 text-center", toneClass[tone])}>
      <div className="font-serif text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: MegaTask }) {
  const organ = ORGAN_MAP[task.organOwner] || { name: task.organOwner, role: "" };
  const priorityClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDEL;
  const isCompleted = task.status === "completed";

  return (
    <Card className={cn("flex flex-col border p-4", isCompleted && "opacity-60")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-gold/60">
            {String(task.num).padStart(2, "0")}
          </span>
          <Badge
            variant="outline"
            className={cn("text-[9px] uppercase tracking-wider", priorityClass)}
          >
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-bold text-gold" title={organ.name + " — " + organ.role}>
            {task.organOwner}
          </span>
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-bull" />}
        </div>
      </div>

      <h3 className="mt-2 font-serif text-sm font-bold leading-tight">{task.title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
        {task.description.split("\n")[0]}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <Badge variant="outline" className="border-border text-[9px] uppercase tracking-wider">
          {CATEGORY_LABELS[task.category] || task.category}
        </Badge>
        <span className="text-[10px] text-muted-foreground">{organ.name}</span>
      </div>
    </Card>
  );
}

function GoCard({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-gold/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-gold transition-colors group-hover:border-gold/40">
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-gold" />
      </div>
      <div className="mt-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Gå vidare →
        </div>
        <h3 className="mt-1 font-serif text-xl font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}

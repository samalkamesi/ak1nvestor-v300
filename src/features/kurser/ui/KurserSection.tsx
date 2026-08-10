"use client";

import * as React from "react";
import {
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Lock,
  Check,
  ChevronRight,
  BookOpen,
  Library,
  Briefcase,
  Layers,
  Lightbulb,
  Footprints,
  ShieldCheck,
  Activity,
  Calculator,
  Brain,
  Flame,
  Gavel,
  GraduationCap,
  Zap,
  Moon,
  Search,
  Quote,
} from "lucide-react";
import { useAk1aStore, type Level } from "@/lib/ak1a-store";
import {
  AKM1_VARIABLES,
  type Akm1Category,
  type Akm1Variable,
} from "@/lib/ak1a/data";
import { Eyebrow, HonestyTag } from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { DeepCourseViewer } from "@/components/ak1a/deep-course-viewer";
import { allCourseSlugs, slugToVariableId } from "@/lib/ak1a/deep-courses-data";

/** Map a variable id (e.g. "V01") to its deep course slug. */
function variableIdToSlug(vid: string): string | null {
  const vNum = vid.toLowerCase().replace("v", "");
  const slug = allCourseSlugs.find((s) => s.startsWith(`v${vNum}-`));
  return slug || null;
}

/** Map a KM course id + title to its deep course slug. */
function kmCourseIdToSlug(id: string, title: string): string | null {
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[åä]/g, "a")
      .replace(/[ö]/g, "o")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 40)
      .replace(/-$/, "");
  const titlePart = slugify(title.split("—")[0] || title);
  const candidateSlug = `${id.toLowerCase()}-${titlePart}`;
  return allCourseSlugs.includes(candidateSlug) ? candidateSlug : null;
}

/** Map any course id (V01, KM-001, TS-01, etc.) to deep course slug. */
function courseIdToSlug(id: string, title: string): string | null {
  if (id.startsWith("V")) {
    return variableIdToSlug(id);
  }
  return kmCourseIdToSlug(id, title);
}

/* ------------------------------------------------------------------ */
/* Static data — AKM1 existing                                         */
/* ------------------------------------------------------------------ */

const LEVEL_LABEL: Record<Level, string> = {
  nyborjare: "Nybörjare",
  intermediar: "Intermediär",
  avancerad: "Avancerad",
};

const LEVEL_ORDER: Record<Level, number> = {
  nyborjare: 0,
  intermediar: 1,
  avancerad: 2,
};

function isLockedFor(courseLevel: Level, userLevel: Level): boolean {
  return LEVEL_ORDER[courseLevel] > LEVEL_ORDER[userLevel];
}

const CATEGORY_FILTERS: { id: Akm1Category | "ALLA"; label: string; count: number }[] = [
  { id: "ALLA", label: "ALLA", count: 20 },
  { id: "Värdering", label: "VÄRDERING", count: 3 },
  { id: "Tillväxt", label: "TILLVÄXT", count: 3 },
  { id: "Lönsamhet", label: "LÖNSAMHET", count: 3 },
  { id: "Stabilitet", label: "STABILITET", count: 3 },
  { id: "Moat", label: "MOAT", count: 3 },
  { id: "Katalysator", label: "KATALYSATOR", count: 3 },
  { id: "Risk", label: "RISK", count: 1 },
];

const CATEGORY_CARDS = [
  {
    id: "akm1-20",
    title: "AKM1 20 VARIABLER",
    subtitle: "20 KURSER (V01-V20)",
    icon: Layers,
    description: "Grunden allt annat vilar på. Variabel för variabel.",
    target: "akm1-variabler",
  },
  {
    id: "marknad-full",
    title: "KUNSKAPSMARKNAD",
    subtitle: "251 KURSER",
    icon: Library,
    description: "Bred bibliotek — nyckeltal, branscher, historik, strategier.",
    target: "kunskapsmarknaden",
  },
  {
    id: "case-studies",
    title: "LEVANDE FALLSTUDIER",
    subtitle: "5 FALL",
    icon: Briefcase,
    description: "Levande historiska fall. Lär av andras segrar och misstag.",
    target: "fallstudier",
  },
  {
    id: "mega-levels",
    title: "MEGA NIVÅER 1-100",
    subtitle: "6 TIERS",
    icon: TrendingUp,
    description: "Sex nivåer av mästerskap — från nyfiken till expert.",
    target: "mega-nivaer",
  },
  {
    id: "rewards",
    title: "BELÖNINGAR",
    subtitle: "14 BADGES",
    icon: Award,
    description: "Tjäna badges, XP och streaks. Spelet är kunskap.",
    target: "beloningar",
  },
  {
    id: "insights",
    title: "ANALYTIKER-INSIKTER",
    subtitle: "5 INSIKTER",
    icon: Lightbulb,
    description: "Korta insikter från institutionella analytiker.",
    target: "analytiker-insikter",
  },
];

const LEARNING_PATHS = [
  {
    num: 1,
    eyebrow: "STEG 1 I LÄROPLANEN",
    title: "Nybörjare → Förstå ett bolag",
    body: "Aktie vs bolag vs fond. Läs en årsredovisning. Introduktion till AKM1. Första variabeln (V1 — försäljningstillväxt).",
    courses: 4,
    minutes: 52,
    premium: false,
  },
  {
    num: 2,
    eyebrow: "STEG 2 I LÄROPLANEN",
    title: "Aktiv → Räkna på det",
    body: "Bokföringens grunder. Nyckeltal. Scenario-analys. Kassaflödesmodellering. Värderingsmetoder. Risk-koncept.",
    courses: 6,
    minutes: 84,
    premium: true,
  },
  {
    num: 3,
    eyebrow: "STEG 3 I LÄROPLANEN",
    title: "Ambitiös → Bedöm det (Power 19)",
    body: "Alla 19 AKM1-variabler. Integration mot Labbet. Reproducera institutionella analyser självständigt.",
    courses: 9,
    minutes: 156,
    premium: true,
  },
];

/* ------------------------------------------------------------------ */
/* KUNSKAPSMARKNAD — 68-course browsable sample of 251                 */
/* ------------------------------------------------------------------ */

export type KmCategory =
  | "Bokföring & Årsredovisning"
  | "Värderingsmetoder"
  | "Riskhantering & Portföljteori"
  | "Beteendefinans"
  | "Svensk bolagsskatt & Juridik"
  | "Makroekonomi & Ränta"
  | "Teknisk Analys"
  | "Sektoranalys"
  | "ESG & Hållbarhet"
  | "Options & Derivat"
  | "Utdelningsstrategi"
  | "Private Equity & Investmentbolag"
  | "Aktiemarknaden i praktiken";

export interface KmCourse {
  id: string;
  category: KmCategory;
  title: string;
  level: Level;
  minutes: number;
  summary: string;
}

export const KM_CATEGORIES: KmCategory[] = [
  "Bokföring & Årsredovisning",
  "Värderingsmetoder",
  "Riskhantering & Portföljteori",
  "Beteendefinans",
  "Svensk bolagsskatt & Juridik",
  "Makroekonomi & Ränta",
  "Teknisk Analys",
  "Sektoranalys",
  "ESG & Hållbarhet",
  "Options & Derivat",
  "Utdelningsstrategi",
  "Private Equity & Investmentbolag",
  "Aktiemarknaden i praktiken",
];

export const KUNSKAPSMARKNAD_COURSES: KmCourse[] = [
  // Bokföring & Årsredovisning (6)
  { id: "KM-001", category: "Bokföring & Årsredovisning", title: "Bokföringens grunder — resultaträkning & balansräkning", level: "nyborjare", minutes: 22, summary: "Dubbel italiensk bokföring, debet/kredit, och hur resultaträkningen knyter till balansräkningen via eget kapital." },
  { id: "KM-002", category: "Bokföring & Årsredovisning", title: "Förvaltningsberättelsen — vad styrelsen berättar", level: "intermediar", minutes: 18, summary: "Årets händelser, risker och framtid i textform — och det styrelsen väljer att inte nämna." },
  { id: "KM-003", category: "Bokföring & Årsredovisning", title: "Kassaflödesanalysen — varför kassa ≠ resultat", level: "intermediar", minutes: 24, summary: "Kassaflödet visar pengarna som rör sig — obrukbara resultat visar sig här först." },
  { id: "KM-004", category: "Bokföring & Årsredovisning", title: "Noter — den dolda informationen", level: "avancerad", minutes: 28, summary: "Avskrivningsprinciper, pensionsåtaganden, relaterade parter — noterna bär halva sanningen." },
  { id: "KM-005", category: "Bokföring & Årsredovisning", title: "Eget kapital & utdelningar", level: "nyborjare", minutes: 16, summary: "Vart vinsten tar vägen: utdelning, återinvestering eller aktieåterköp — och hur det bokförs." },
  { id: "KM-006", category: "Bokföring & Årsredovisning", title: "Kvartalsrapporten — säsongsfällor", level: "intermediar", minutes: 20, summary: "Q1–Q4-rapporterna och varför säsongseffekter och engångsposter lurar den som bara läser årsredovisningen." },

  // Värderingsmetoder (6)
  { id: "KM-007", category: "Värderingsmetoder", title: "DCF — diskonterade kassaflöden", level: "avancerad", minutes: 35, summary: "Framtida kassaflöden diskonterade till idag — den mest teoretiskt rena värderingsmetoden." },
  { id: "KM-008", category: "Värderingsmetoder", title: "WACC — vägd kapitalkostnad", level: "avancerad", minutes: 30, summary: "Beräkna avkastningskrav med hänsyn till både skuld- och equity-kostnad — DCF-motorns bränsle." },
  { id: "KM-009", category: "Värderingsmetoder", title: "P/E — Price-to-Earnings djupdykning", level: "nyborjare", minutes: 14, summary: "Den mest citerade multiplen — dess styrkor, fällor och varför den varierar mellan sektorer." },
  { id: "KM-010", category: "Värderingsmetoder", title: "EV/EBIT — renare än P/E", level: "intermediar", minutes: 18, summary: "Företagsvärde över driftsresultat — ignorerar kapitalstruktur och ger jämförbarhet över bolag." },
  { id: "KM-011", category: "Värderingsmetoder", title: "Relativ värdering — peer comps", level: "intermediar", minutes: 22, summary: "Jämför bolagets multiplar mot direkta konkurrenter — och varför 'billig' inte alltid betyder 'köpvärd'." },
  { id: "KM-012", category: "Värderingsmetoder", title: "Sum-of-the-Parts (SOTP)", level: "avancerad", minutes: 26, summary: "Värdera konglomerat och investmentbolag som summan av sina delar — och förstå varför rabatten uppstår." },

  // Riskhantering & Portföljteori (5)
  { id: "KM-013", category: "Riskhantering & Portföljteori", title: "Volatilitet & standardavvikelse", level: "intermediar", minutes: 18, summary: "Den vanligaste mätaren på prisförändringars storlek — och varför den fångar bara halva bilden." },
  { id: "KM-014", category: "Riskhantering & Portföljteori", title: "Korrelation & diversifiering", level: "intermediar", minutes: 20, summary: "Varför orelaterade tillgångar stabiliserar portföljen — och varför 'diversifiering' är missförstått." },
  { id: "KM-015", category: "Riskhantering & Portföljteori", title: "Beta & CAPM", level: "avancerad", minutes: 24, summary: "Mät systematisk risk mot marknaden — och varför CAPM är en förenkling som ändå används." },
  { id: "KM-016", category: "Riskhantering & Portföljteori", title: "Sharpe-kvot — avkastning per enhet risk", level: "intermediar", minutes: 16, summary: "Två portföljer kan ha samma avkastning — Sharpe-kvoten skiljer den bättre från den sämre." },
  { id: "KM-017", category: "Riskhantering & Portföljteori", title: "Position sizing & Kelly-kriteriet", level: "avancerad", minutes: 28, summary: "Hur stor del av kapitalet ska du satsa på en position? Kelly ger ett matematiskt svar — och dess varning." },

  // Beteendefinans (5)
  { id: "KM-018", category: "Beteendefinans", title: "Förlustaversion — 1 kr förlust gör mer ont", level: "nyborjare", minutes: 15, summary: "Kahneman & Tverskys prospect theory — och varför vi klamrar oss fast vid förlorare." },
  { id: "KM-019", category: "Beteendefinans", title: "Bekräftelsefälla — vi söker det vi vill höra", level: "nyborjare", minutes: 14, summary: "Konfirmationsbias: vi noterar bevis som stöder vår tes och ignorerar det som talar emot." },
  { id: "KM-020", category: "Beteendefinans", title: "Ankareffekt — första intrycket sätter priset", level: "intermediar", minutes: 16, summary: "Det första priset vi ser på en aktie blir en referenspunkt — även när det borde göra det inte." },
  { id: "KM-021", category: "Beteendefinans", title: "Flockbeteende & herding", level: "intermediar", minutes: 18, summary: "Bubblor och kapitulation ur ett kognitivt perspektiv — varför vi springer med flocken." },
  { id: "KM-022", category: "Beteendefinans", title: "Överconfidens & Dunning-Kruger", level: "nyborjare", minutes: 13, summary: "Nybörjare överskattar sig mest — erfarna vet vad de inte vet. Hur du känner igen din egen bias." },

  // Svensk bolagsskatt & Juridik (5)
  { id: "KM-023", category: "Svensk bolagsskatt & Juridik", title: "Bolagsskatt i Sverige — 20,6 %", level: "intermediar", minutes: 18, summary: "Svensk bolagsskattesats och hur den påverkar utdelningar, återinvestering och värdering." },
  { id: "KM-024", category: "Svensk bolagsskatt & Juridik", title: "ISK vs AF vs depå", level: "nyborjare", minutes: 16, summary: "Skatteeffektiva konton för svensk retail — schablonbeskattning vs kupongskatt vs avanza-prenumeration." },
  { id: "KM-025", category: "Svensk bolagsskatt & Juridik", title: "Kupongskatt & 3:12-reglerna", level: "intermediar", minutes: 20, summary: "30 % kupongskatt på utdelning — och 3:12-reglerna som sänker skatten för fåmansbolagsägare." },
  { id: "KM-026", category: "Svensk bolagsskatt & Juridik", title: "Avyttringsregler & förlustavdrag", level: "avancerad", minutes: 22, summary: "Kvotering, neutraliseringsregler och wash-sale — hur Skatteverket begränsar förlustavdrag." },
  { id: "KM-027", category: "Svensk bolagsskatt & Juridik", title: "Aktiebolagslagen (ABL) i korthet", level: "intermediar", minutes: 24, summary: "Styrelseansvar, utdelningsregler, likvidationsregler — ABL sätter spelreglerna för svenska AB." },

  // Makroekonomi & Ränta (5)
  { id: "KM-028", category: "Makroekonomi & Ränta", title: "Räntans roll för värdering", level: "intermediar", minutes: 20, summary: "Låg ränta = högre multiplar — och varför DCF-värderingar är extra känsliga för avkastningskravet." },
  { id: "KM-029", category: "Makroekonomi & Ränta", title: "Inflation — KPI vs KPIF", level: "nyborjare", minutes: 15, summary: "Hur Riksbanken mäter inflation — och varför KPIF ger en stabilare bild än KPI." },
  { id: "KM-030", category: "Makroekonomi & Ränta", title: "Reporäntan & transmission", level: "intermediar", minutes: 18, summary: "Riksbankens styrränta och vägen ut till bolåneräntor, företagslån och aktiemarknad." },
  { id: "KM-031", category: "Makroekonomi & Ränta", title: "Valutor & FX-effekter", level: "avancerad", minutes: 22, summary: "Hur en stark krona påverkar exportbolag — och varför svensk retail ska förstå valutarisk." },
  { id: "KM-032", category: "Makroekonomi & Ränta", title: "Konjunkturcykler — tidiga, mid-, sentids-bolag", level: "intermediar", minutes: 24, summary: "Olika sektorer rör sig olika i cykeln — vissa leder, vissa lagg-ar, vissa är cykel-motståndskraftiga." },

  // Teknisk Analys (5)
  { id: "KM-033", category: "Teknisk Analys", title: "Stöd & motstånd — de grundläggande nivåerna", level: "nyborjare", minutes: 14, summary: "Den mest använda tekniska indikatorn — varför vissa priser fungerar som magnet och golv." },
  { id: "KM-034", category: "Teknisk Analys", title: "Rörliga medelvärden — SMA vs EMA", level: "nyborjare", minutes: 16, summary: "Trendföljarens arbetshäst — och varför valet mellan SMA och EMA spelar roll." },
  { id: "KM-035", category: "Teknisk Analys", title: "RSI — Relative Strength Index", level: "intermediar", minutes: 18, summary: "Översåld/överköpt och divergenser — RSI:s styrka och dess mest missbrukade signaler." },
  { id: "KM-036", category: "Teknisk Analys", title: "MACD — trend & momentum", level: "intermediar", minutes: 20, summary: "Signalkors och histogram — MACD kombinerar två EMAs för att fånga trendskiften." },
  { id: "KM-037", category: "Teknisk Analys", title: "Volume profile — volym till pris", level: "avancerad", minutes: 22, summary: "Volym fördelad på priser, inte tid — visar var marknaden faktiskt har handlat." },

  // Sektoranalys (6)
  { id: "KM-038", category: "Sektoranalys", title: "Tech — SaaS, ARR & molntjänster", level: "intermediar", minutes: 22, summary: "Varför tech-multiplar är annorlunda — ARR, NRR, churn och recurring-revenue-logiken." },
  { id: "KM-039", category: "Sektoranalys", title: "Industri — cyklisk analys", level: "intermediar", minutes: 20, summary: "Kapacitetsutnyttjande, orderstock och cykelrisk — industri-bolagens sårbarhet och styrka." },
  { id: "KM-040", category: "Sektoranalys", title: "Fastighet — NAV & direktavkastning", level: "avancerad", minutes: 24, summary: "Värdera byggnader, inte bolag — NAV, direktavkastning, hyresintäkter och finansieringsrisk." },
  { id: "KM-041", category: "Sektoranalys", title: "Pharma — pipeline & patentslut", level: "avancerad", minutes: 26, summary: "Läkemedelsprocessen, kliniska studier och patentklockan som driver värde i pharma-bolag." },
  { id: "KM-042", category: "Sektoranalys", title: "Banker — K/I, kreditförluster & kapitalbas", level: "intermediar", minutes: 22, summary: "Svensk bankanalys i praktiken — intjäningskraft, risk och regelverk i en sektor med hög hävstång." },
  { id: "KM-043", category: "Sektoranalys", title: "Konsument & retail — varumärke & kanal", level: "intermediar", minutes: 18, summary: "Hur varumärkesstyrka och distributionskanal avgör marginalerna i retail-bolag." },

  // ESG & Hållbarhet (5)
  { id: "KM-044", category: "ESG & Hållbarhet", title: "CSRD — vad det betyder för bolagen", level: "intermediar", minutes: 22, summary: "EU:s nya krav på hållbarhetsrapportering — dubbel väsentlighet och vad investerare får se." },
  { id: "KM-045", category: "ESG & Hållbarhet", title: "SFDR — artikel 6, 8, 9-fonder", level: "intermediar", minutes: 18, summary: "Hur fonder klassas efter hållbarhetsambition — och varför 'artikel 8' inte betyder grön." },
  { id: "KM-046", category: "ESG & Hållbarhet", title: "Scope 1, 2, 3 — utsläppskategorier", level: "nyborjare", minutes: 16, summary: "Väsentliga vs rent bokförda utsläpp — Scope 3 är ofta 80 % av fotavtrycket och svårast att mäta." },
  { id: "KM-047", category: "ESG & Hållbarhet", title: "Greenwashing — att skilja falskt från verkligt", level: "avancerad", minutes: 20, summary: "Hur du identifierar ekologisk moat vs PR-täckta utsläpp — en checklista för kritisk läsning." },
  { id: "KM-048", category: "ESG & Hållbarhet", title: "Governance — styrelse-mångfald & ägarstruktur", level: "intermediar", minutes: 18, summary: "Bortom kvotering — vad som egentligen driver bättre styrelsebeslut och långsiktigt ägande." },

  // Options & Derivat (5)
  { id: "KM-049", category: "Options & Derivat", title: "Optionens grunder — köp, sälj, premie, strike", level: "intermediar", minutes: 22, summary: "Vad en option är, vad premien betalar för, och varför 80 % av optioner löper ut värdelösa." },
  { id: "KM-050", category: "Options & Derivat", title: "Black-Scholes i praktiken", level: "avancerad", minutes: 28, summary: "Den klassiska värderingsmodellen, dess antaganden och varför den bryter i kriser." },
  { id: "KM-051", category: "Options & Derivat", title: "Covered calls — täcka med premie", level: "avancerad", minutes: 24, summary: "Sälja köpoptioner på aktier du redan äger — inkomstgenerering med avkastningstak." },
  { id: "KM-052", category: "Options & Derivat", title: "Cash-secured puts — generera inkomst", level: "avancerad", minutes: 22, summary: "Sälja säljoptioner och vänta på inlägg — en strategi för att komma in lägre." },
  { id: "KM-053", category: "Options & Derivat", title: "Grekerna — delta, gamma, theta, vega", level: "avancerad", minutes: 26, summary: "Vad grekerna betyder för din position — risk mot pris, tid, volatilitet och ränta." },

  // Utdelningsstrategi (5)
  { id: "KM-054", category: "Utdelningsstrategi", title: "Utdelningsyield — ränta på aktie", level: "nyborjare", minutes: 14, summary: "Bruttoutdelning / aktiekurs — den enklaste utdelningsnyckeltalet och dess fällor." },
  { id: "KM-055", category: "Utdelningsstrategi", title: "Utdelningshistorik & tillväxt", level: "intermediar", minutes: 18, summary: "Kontinuitet är viktigare än nivå — bolag som höjt utdelningen i 10+ år utmärker sig." },
  { id: "KM-056", category: "Utdelningsstrategi", title: "Payout ratio — hur mycket går till ägarna", level: "intermediar", minutes: 16, summary: "Utdelning / vinst — för högt betyder risk för nedskärning, för lågt betyder marginal till tillväxt." },
  { id: "KM-057", category: "Utdelningsstrategi", title: "Aristokrater & Challengers — 25+ eller 10+ år", level: "intermediar", minutes: 20, summary: "Amerikanska Dividend Aristocrats och europeiska motsvarigheter — vad kontinuiteten betyder." },
  { id: "KM-058", category: "Utdelningsstrategi", title: "Skatt på utdelning — ISK vs KF-depå", level: "intermediar", minutes: 18, summary: "Hur kontovalet avgör din netto-utdelning — och varför ISK-schablon slagit KF-depå på 5 år." },

  // Private Equity & Investmentbolag (5)
  { id: "KM-059", category: "Private Equity & Investmentbolag", title: "Investmentbolag-rabatt — varför Investor handlas under NAV", level: "intermediar", minutes: 20, summary: "Investor, Industrivärden, Latour — varför marknaden nästan alltid prissätter dem under NAV." },
  { id: "KM-060", category: "Private Equity & Investmentbolag", title: "Holdingstruktur & skatteeffekter", level: "avancerad", minutes: 22, summary: "Varför konglomeratstrukturer kan vara ineffektiva — dubbelbeskattning och driftssynergier." },
  { id: "KM-061", category: "Private Equity & Investmentbolag", title: "Private equity i praktiken", level: "avancerad", minutes: 24, summary: "Buyout, leverage, exit — och varför retail oftast inte kan delta förrän börsnoteringen." },
  { id: "KM-062", category: "Private Equity & Investmentbolag", title: "Ägarstyrning & röststrukturer (A/B-aktier)", level: "intermediar", minutes: 18, summary: "Varför vissa aktier har 10x röster — och vad det betyder för minoritetsaktieägaren." },
  { id: "KM-063", category: "Private Equity & Investmentbolag", title: "Buyback vs utdelning — när och varför", level: "avancerad", minutes: 22, summary: "När aktieåterköp skapar värde (låg värdering) och när det förstör (övervärderat bolag)." },

  // Aktiemarknaden i praktiken (5)
  { id: "KM-064", category: "Aktiemarknaden i praktiken", title: "Avanza vs Nordnet — nätmäklare jämfört", level: "nyborjare", minutes: 15, summary: "Avgifter, verktyg, utbud — och varför valet mellan de två svenska storheterna spelar roll." },
  { id: "KM-065", category: "Aktiemarknaden i praktiken", title: "Orderboken — köp- & säljsidor", level: "intermediar", minutes: 18, summary: "Likviditet, spread och market impact — läs orderboken så förstår du prisförändringar." },
  { id: "KM-066", category: "Aktiemarknaden i praktiken", title: "Marknadsordrar vs limitordrar", level: "nyborjare", minutes: 14, summary: "När du ska använda vilken — och varför marknadsordrar i illikvida aktier kan bli dyra." },
  { id: "KM-067", category: "Aktiemarknaden i praktiken", title: "OMXS30 & OMXSPI — index i korthet", level: "nyborjare", minutes: 16, summary: "Vad svenska index faktiskt innehåller — och varför OMXS30 inte är hela marknaden." },
  { id: "KM-068", category: "Aktiemarknaden i praktiken", title: "Euronext Stockholm — segment & listor", level: "intermediar", minutes: 18, summary: "Large/Mid/Small Cap och First North — noteringsskillnader, rapportkrav och risknivå." },
];

/* ------------------------------------------------------------------ */
/* LEVANDE FALLSTUDIER — 5 cases                                       */
/* ------------------------------------------------------------------ */

export interface Fallstudie {
  id: string;
  company: string;
  title: string;
  shortDesc: string;
  teaser: string;
  isPrec: boolean;
}

export const FALLSTUDIER: Fallstudie[] = [
  {
    id: "FS-01",
    company: "Precise Biometrics (PREC.ST)",
    title: "Special situation — fusion & riktad nyemission",
    shortDesc: "V19 (kapitalförbränning & emission-risk) applicerad på en riktad nyemission på 0,82 SEK.",
    teaser: "",
    isPrec: true,
  },
  {
    id: "FS-02",
    company: "Atlas Copco (ATCO-A)",
    title: "Compounder-moat — 100 års återinvestering",
    shortDesc: "En moat byggd på teknik, service och distribution som tillåtit 100+ år av organisk tillväxt.",
    teaser:
      "Atlas Copco är ett fallstudie i long-term compounding: en moat byggd på teknik, service och distribution som tillåtit 100+ år av organisk tillväxt. Vi bryter ner hur de återinvesterar kapital i nya produktlinjer och geografier, och varför ROIC fortsatt överstiger 25 %. Slutsatsen: compounder-bolag prissätts ofta rätt — felet är att sälja för tidigt.",
    isPrec: false,
  },
  {
    id: "FS-03",
    company: "Investor AB (INVE-B)",
    title: "Holding-rabatt — 30 % under NAV i 20 år",
    shortDesc: "Varför marknaden straffar holdingstrukturer — och när rabatten är en möjlighet vs en fälla.",
    teaser:
      "Investor AB handlas strukturellt 20–35 % under NAV. Vi analyserar varför marknaden straffar holdingstrukturer — och när rabatten är en möjlighet vs en fälla. Fallstudien visar hur Patel-utdelning, inlåst kapital och corporation-within-corporation-struktur försvårar värdering. Slutsatsen: holding-rabatten är inte gratis — den är en prislapp på låst kapital.",
    isPrec: false,
  },
  {
    id: "FS-04",
    company: "Novo Nordisk (NOVO-B)",
    title: "Pharma-moat & GLP-1 — patentskyddad tillväxt",
    shortDesc: "Patenträtt, pipeline, produktionskapacitet och läkarrelationer i en ovanligt stark kombination.",
    teaser:
      "Novo Nordisk och GLP-1-revolutionen (Ozempic, Wegovy) är ett textbook-fall av pharma-moat: patenträtt, produkt-pipeline, produktionskapacitet och läkarrelationer i en ovanligt stark kombination. Vi bryter ner varför Novo Nordisks moat är bredare än patent ensamt — och vad som hotar den. Slutsatsen: pharma-moat är tidsbestämd; patentslut är den största katalysatorn.",
    isPrec: false,
  },
  {
    id: "FS-05",
    company: "Silicon Valley Bank (SVB) — V19 fallstudie",
    title: "Riskfallstudie — kapitalförbränning & durationsfälla",
    shortDesc: "V19 applicerad på en bank som brände kapital genom durations-risk finansierad med korta insättningar.",
    teaser:
      "SVB:s kollaps mars 2023 är den renaste V19-fallstudien på decennier: en bank som brände kapital genom durations-risk (långa statsobligationer) finansierad med korta insättningar. Vi applicerar AKM1:s V19 (kapitalförbränning & emission-risk) på en bank och ser varför traditionella nyckeltal missade fallet. Slutsatsen: V19 är inte bara för startup-bolag — det är för allt med duration-mismatch.",
    isPrec: false,
  },
];

/* ------------------------------------------------------------------ */
/* MEGA NIVÅER 1-100 — 6 tiers                                        */
/* ------------------------------------------------------------------ */

export interface MegaNiva {
  num: number;
  title: string;
  milstolpe: string;
  xpThreshold: number;
  provning: string;
}

export const MEGA_NIVAER: MegaNiva[] = [
  {
    num: 1,
    title: "Första aktien",
    milstolpe: "Köp din första aktie på Avanza eller Nordnet.",
    xpThreshold: 250,
    provning: "Hitta ett svenskt stort bolag (Investor, Atlas Copco, Volvo) och köp för 500 kr.",
  },
  {
    num: 2,
    title: "Första årsredovisningen",
    milstolpe: "Läs en hel årsredovisning från pärm till pärm.",
    xpThreshold: 750,
    provning: "Läs H&M:s eller Ericssons senaste årsredovisning och svara på 10 frågor.",
  },
  {
    num: 3,
    title: "AKM1-grunden",
    milstolpe: "Fyll i alla 19 variabler för ett bolag du valt.",
    xpThreshold: 1500,
    provning: "Välj ett Mid Cap-bolag och fyll i alla 19 AKM1-variabler med egna siffror.",
  },
  {
    num: 4,
    title: "AK1TS-vågor",
    milstolpe: "Bygg en 25-cells våg-matris i Labbet.",
    xpThreshold: 3000,
    provning: "Klicka igenom alla 25 celler i våg-matrisen och skriv en slutsats om konfluens.",
  },
  {
    num: 5,
    title: "Egen analys",
    milstolpe: "Skriv en 99-sidig analys enligt AK1A-metoden.",
    xpThreshold: 5000,
    provning: "Skriv en fullständig analys (rekommendation, bolaget, historik, värdering, scenarier).",
  },
  {
    num: 6,
    title: "Master",
    milstolpe: "Publicera och försvara din analys offentligt.",
    xpThreshold: Number.POSITIVE_INFINITY,
    provning: "Publicera analysen på en blogg eller i ett forum och försvara dina slutsatser mot kritik.",
  },
];

function getMegaLevel(xp: number): number {
  if (xp < 250) return 1;
  if (xp < 750) return 2;
  if (xp < 1500) return 3;
  if (xp < 3000) return 4;
  if (xp < 5000) return 5;
  return 6;
}

/* ------------------------------------------------------------------ */
/* BELÖNINGAR — 14 badges                                             */
/* ------------------------------------------------------------------ */

type LucideIcon = React.ComponentType<{ className?: string }>;

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  auto: boolean;
  detect: (p: {
    completedCourses: string[];
    xp: number;
    streak: number;
    quizzesPassed: string[];
    flashcardsViewed: string[];
    precSection: number;
  }) => boolean;
}

const AKM1_IDS = AKM1_VARIABLES.map((v) => v.id);

export const BADGES: BadgeDef[] = [
  { id: "BD-01", name: "Första steget", description: "Första kursen klar.", icon: Footprints, auto: true, detect: (p) => p.completedCourses.length >= 1 },
  { id: "BD-02", name: "AKM1-grund", description: "Alla 19 AKM1-variabler klara.", icon: ShieldCheck, auto: true, detect: (p) => AKM1_IDS.every((id) => p.completedCourses.includes(id)) },
  { id: "BD-03", name: "Våg-mästare", description: "Våg-matris cell klickad i Labbet.", icon: Activity, auto: false, detect: () => false },
  { id: "BD-04", name: "Kalkylatorn", description: "AKM1-kalkylatorn använd i Labbet.", icon: Calculator, auto: false, detect: () => false },
  { id: "BD-05", name: "Quiz-vinnare", description: "Quiz godkänt i Labbet.", icon: Brain, auto: true, detect: (p) => p.quizzesPassed.length >= 1 },
  { id: "BD-06", name: "Flashcard-flipper", description: "Alla flashcards vända i Labbet.", icon: Layers, auto: true, detect: (p) => p.flashcardsViewed.length >= 6 },
  { id: "BD-07", name: "Streak 3", description: "3 dagars streak.", icon: Flame, auto: true, detect: (p) => p.streak >= 3 },
  { id: "BD-08", name: "Streak 7", description: "7 dagars streak.", icon: Flame, auto: true, detect: (p) => p.streak >= 7 },
  { id: "BD-09", name: "Första analysen läst", description: "PREC-analysen påbörjad.", icon: BookOpen, auto: true, detect: (p) => p.precSection >= 5 },
  { id: "BD-10", name: "Styrelse-gäst", description: "Deltagit i ett styrelsemöte.", icon: Gavel, auto: false, detect: () => false },
  { id: "BD-11", name: "Nybörjare-klar", description: "Steg 1 läroplan — V01 klar.", icon: GraduationCap, auto: true, detect: (p) => p.completedCourses.includes("V01") },
  { id: "BD-12", name: "Power 19", description: "Alla 19 variabler + quiz godkänt.", icon: Zap, auto: true, detect: (p) => AKM1_IDS.every((id) => p.completedCourses.includes(id)) && p.quizzesPassed.length >= 1 },
  { id: "BD-13", name: "Mörkrets herre", description: "Använt dark mode.", icon: Moon, auto: false, detect: () => false },
  { id: "BD-14", name: "Sökaren", description: "Använt ⌘K-sök.", icon: Search, auto: false, detect: () => false },
];

/* ------------------------------------------------------------------ */
/* ANALYTIKER-INSIKTER — 5 expandable insight cards                    */
/* ------------------------------------------------------------------ */

export interface AnalytikerInsikt {
  id: string;
  title: string;
  punch: string;
  detail: string;
}

export const ANALYTIKER_INSIKTER: AnalytikerInsikt[] = [
  {
    id: "AI-01",
    title: "Tid är insikt, inte risk",
    punch:
      "Det vi kallar 'risk' på kort sikt är ofta bara volatilitet — brus. På lång sikt är tid din fördel, inte din fiende. Institutionella analytiker betalar för tålamod; retail får det gratis.",
    detail:
      "I en 1-månaders horisont dominerar brus — makro, sentiment, kortsiktig nyhet. I en 5-årig horisont dominerar fundamental utveckling — intjäning, moat, kapitalallokering. Warren Buffett citeras ofta för att hans favorithorisont är 'för evigt' — inte för romantik utan för att det är där signal överröstar brus. Som svensk retail-investerare har du en fördel som institutioner saknar: du behöver inte redovisa kvartalsprestation. Använd den. Risken med att blanda 'tid som insikt' och 'tid som risk' är att du börjar agera som en kortsiktig trader och förlorar den enda verkliga edge du har.",
  },
  {
    id: "AI-02",
    title: "Värdering utan katalysator är en åsikt",
    punch:
      "En aktie kan vara 'undervärderad' i åratal innan marknaden rättar till. Skillnaden mellan att ha rätt och att tjäna pengar heter katalysator.",
    detail:
      "Värdering säger vad något är värt; katalysatorn säger när marknaden kommer inse det. En katalysator kan vara en kvartalsrapport, en fusion, en produktlansering, en ledningsförändring, en regulatorisk förändring, eller bara en långsiktig omtagning i sentiment. Utan katalysator kan du sitta med en 'undervärderad' aktie i 3 år och ge upp precis innan rörelsen kommer. Institutionella analytiker letar alltid efter både: 'undervärdering + katalysator'. Att köpa bara på undervärdering är att be marknaden om ursäkt — och marknaden ber inte om ursäkt.",
  },
  {
    id: "AI-03",
    title: "Den största risken är det du inte ser",
    punch:
      "Risk i en portfölj kommer sällan från det du identifierat och kvantifierat. Den kommer från det du inte ens ritat in i din analys.",
    detail:
      "Alla modeller — även AKM1:s 19 variabler — beskriver en känd okänd-värld. Kriser föds ur okända okända: durations-mismatch du inte sett (SVB), geopolitiska händelser (2022), pandemier (2020), valutarörelser ingen modellerat. Två strategier hanterar detta: (1) position sizing som är liten nog att överleva 80 % kapitalförlust på en position, och (2) diversifiering över orelaterade risker. Många retail-investerare brister i båda — de koncentrerar 50 % i ett bolag de 'känner' och kallar det conviction. Egentligen är det brist på fantasi om vad som kan gå fel.",
  },
  {
    id: "AI-04",
    title: "Möjnet avgör — inte tillväxten",
    punch:
      "Ett bolag kan växa 30 % om året i 10 år och ändå vara en dålig investering om mönet är svagt. Möjnet bestämmer hur mycket av tillväxten som stannar hos aktieägarna.",
    detail:
      "Möjnet (moat, varaktig konkurrensfördel) är det som hindrar konkurrenter från att äta upp tillväxten. Utan möjn blir hög tillväxt en kapitaltävling — kapital in, kapital ut, lite kvar till aktieägarna. Flygindustrin växte 6 % om året i 50 år och gav totalt sett negativ avkastning; Moody's växte 8 % om året och gav 15 % årligen. Skillnaden var möjn: Moody's har nätverkseffekter och varumärke; airline har råvarutjänst och fackföreningsmakt. Som analytiker ska du alltid fråga: 'varför kan inte någon annan göra det här och ta marginalen?' Svaret är möjn. Saknas det är tillväxten en illusion av värdeskapande.",
  },
  {
    id: "AI-05",
    title: "Reproducerbarhet > hemligheter",
    punch:
      "En analys du inte kan reproducera är en åsikt du inte kan lita på. Det du kan skriva ner i steg kan granskas, förbättras och skalas.",
    detail:
      "AK1A:s kärnprincip 'håll know-how, redovisa generöst' bygger på insikten att hemligheter är spröda och reproducerbarhet är robust. En analytiker som bara har 'känsla' kan inte granskas — och kan inte förbättras. En analytiker som har 19 variabler + formel + skala + scenarier kan granskas punkt för punkt, utmanas och revideras. I institutionell förvaltning kallas detta 'investment process' — och det är det som skiljer en bra förvaltare från en bra period. Som retail-investerare har du inte fördelen av att ha 50 kollegor som granskar varandra — då blir din egen struktur din enda försvarslinje mot överconfidence. Skriv ner din metod. Följ den. Revidera den öppet.",
  },
];

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */

export function KurserSection() {
  const { progress, completeCourse, level, kurserDeepSlug, setKurserDeepSlug } = useAk1aStore();
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALLA");
  const [activeCourseId, setActiveCourseId] = React.useState<string | null>(null);

  const visibleVariables = React.useMemo(() => {
    if (categoryFilter === "ALLA") return AKM1_VARIABLES;
    return AKM1_VARIABLES.filter((v) => v.category === categoryFilter);
  }, [categoryFilter]);

  const completedAkm1Ids = React.useMemo(
    () =>
      new Set(
        AKM1_VARIABLES.filter((v) =>
          progress.completedCourses.includes(v.id)
        ).map((v) => v.id)
      ),
    [progress.completedCourses]
  );

  const completedCount = completedAkm1Ids.size;
  const akm1ProgressPct = Math.round((completedCount / 20) * 100);

  const activeCourse = React.useMemo(
    () => AKM1_VARIABLES.find((v) => v.id === activeCourseId) ?? null,
    [activeCourseId]
  );

  // If a deep course slug is set, render the full-page deep viewer instead.
  // (Must be after all hooks — rules-of-hooks.)
  if (kurserDeepSlug) {
    return <DeepCourseViewer slug={kurserDeepSlug} />;
  }

  const scrollToId = (id: string) => {
    if (typeof document !== "undefined") {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="paper-texture">
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>AK1A Kurser</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Komplett kunskapsmarknad
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              270 kurser totalt. AKM1:s 19 variabler, kunskapsmarknad,
              mega-nivåer, belöningar och analytiker-insikter — allt på ett
              ställe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gold text-background hover:bg-gold/90"
                onClick={() => scrollToId("akm1-variabler")}
              >
                Börja med AKM1 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToId("kurserna-spar")}
              >
                Utforska marknaden
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── STATS ROW ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              kind="matt"
              value="270"
              label="Kurser"
              caption="↑ KONTINUERLIG TILLVÄXT"
            />
            <StatTile
              kind="matt"
              value="142.9"
              label="Timmar"
              caption="↑ 142.9H TOTAL"
            />
            <ProgressTile
              completed={completedCount}
              total={20}
              pct={akm1ProgressPct}
              xp={progress.xp}
            />
            <StatTile
              kind="matt"
              value="0"
              label="Dolda avgifter"
              caption="ALLTID GRATIS ATT LÄRA"
            />
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">
              Katalog:
            </span>{" "}
            19 AKM1 + 251 kunskapsmarknad + 5 fallstudier + 6 mega-nivåer + 14
            badges + 5 insikter. Browsebar idag: {19 + 68 + 5 + 6 + 14 + 5} av 270.
          </p>
        </div>
      </section>

      {/* ───────────── CATEGORIES ───────────── */}
      <section id="kurserna-spar" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Kurserna</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Välj ditt spår.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Sex sätt att utforska kunskap. Börja med AKM1:s 19 variabler —
            grunden allt annat vilar på.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToId(cat.target)}
                  className="group flex flex-col items-start rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-gold/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/30 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {cat.subtitle}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold leading-tight">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold group-hover:underline">
                    Öppna spåret
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── AKM1 19 VARIABLES ───────────── */}
      <section id="akm1-variabler" className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>AKM1 — grunden</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
                AKM1:s 19 variabler
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Lär dig varje indikator i AKM1-modellen. Varje kurs har teori,
                räkneexempel, övning och analytiker-insikt.
              </p>
            </div>
            <div className="min-w-[240px] rounded-lg border border-gold/30 bg-gold/[0.04] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Din progress
                </span>
                <HonestyTag kind="matt" />
              </div>
              <p className="mt-2 font-serif text-4xl font-bold leading-none">
                {completedCount}
                <span className="text-2xl text-muted-foreground">/19</span>
              </p>
              <ProgressBar pct={akm1ProgressPct} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                {akm1ProgressPct}% av AKM1 fullt behärskat
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <Tabs
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            className="mt-8"
          >
            <div className="-mx-4 overflow-x-auto pb-1 sm:mx-0">
              <TabsList className="h-auto w-max gap-1.5 rounded-lg border border-border bg-transparent p-1">
                {CATEGORY_FILTERS.map((f) => (
                  <TabsTrigger
                    key={f.id}
                    value={f.id}
                    className="rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground data-[state=active]:border-gold data-[state=active]:bg-gold data-[state=active]:text-background data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    {f.label}
                    <span className="ml-1 text-[10px] opacity-70">
                      ({f.count})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {/* Course grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVariables.map((v) => {
              const isCompleted = completedAkm1Ids.has(v.id);
              const isLocked = isLockedFor(v.level, level);
              return (
                <Akm1CourseCard
                  key={v.id}
                  variable={v}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  onStart={() => {
                    const slug = variableIdToSlug(v.id);
                    if (slug) {
                      setKurserDeepSlug(slug);
                    } else {
                      setActiveCourseId(v.id);
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Level-aware note */}
          <p className="mt-6 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-gold">
              Din nivå:
            </span>{" "}
            {LEVEL_LABEL[level]}.{" "}
            {level === "nyborjare" &&
              "Avancerade kurser är låsta — växla till Intermediär eller Avancerad i toppen för att låsa upp."}
            {level === "intermediar" &&
              "Nybörjare- och Intermediär-kurser är upplåsta. Avancerade kurser kräver Avancerad-nivå."}
            {level === "avancerad" &&
              "Alla 19 variabler är upplåsta. Du kan påbörja vilken kurs som helst."}
          </p>
        </div>
      </section>

      {/* ───────────── KUNSKAPSMARKNADEN ───────────── */}
      <KunskapsmarknadBlock />

      {/* ───────────── LEVANDE FALLSTUDIER ───────────── */}
      <FallstudieBlock />

      {/* ───────────── MEGA NIVÅER 1-100 ───────────── */}
      <MegaNivaerBlock />

      {/* ───────────── BELÖNINGAR ───────────── */}
      <BeloningarBlock />

      {/* ───────────── ANALYTIKER-INSIKTER ───────────── */}
      <AnalytikerInsikterBlock />

      {/* ───────────── KNOWLEDGE MAP ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>19 celler · 19 variabler</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Din kunskapskarta
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Så här ser din AKM1-kunskap ut som en struktur — inte en
            procentsats.
          </p>

          <Card className="mt-8 gap-0 p-6">
            {/* 19-cell grid */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-10">
              {AKM1_VARIABLES.map((v) => {
                const isMastered = completedAkm1Ids.has(v.id);
                return (
                  <div
                    key={v.id}
                    title={`${v.id} — ${v.name}${
                      isMastered ? " · Behärskad" : " · Ej påbörjad"
                    }`}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-md border text-center transition-colors",
                      isMastered
                        ? "border-gold/60 bg-gold/15 text-gold"
                        : "border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span className="font-serif text-sm font-bold">
                      {v.id}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70">
                      {isMastered ? "Klar" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5">
              <LegendItem
                swatch="bg-gold/20 border-gold/60"
                label="Behärskad"
                sub="Kurs slutförd + scenario + quiz godkänd"
              />
              <LegendItem
                swatch="bg-blue-400/30 border-blue-400/50"
                label="Pågår"
                sub="Kurs påbörjad, ej slutförd"
              />
              <LegendItem
                swatch="bg-amber-400/30 border-amber-400/50"
                label="Påbörjad"
                sub="Första lektionen öppnad"
              />
              <LegendItem
                swatch="bg-muted border-border"
                label="Ej påbörjad"
                sub="Nästa inlärningsmål"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <HonestyTag kind="matt" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Demo: En användares kunskapssnapshot
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────── LEARNING PATHS ───────────── */}
      <section
        id="inlarningsvagar"
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Inlärningsvägar</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Följ en väg, inte en lista.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tre steg. Börja där du är. Varje steg bygger på det förra.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {LEARNING_PATHS.map((p) => (
              <PathCard key={p.num} path={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── COURSE DETAIL DIALOG ───────────── */}
      <CourseDetailDialog
        course={activeCourse}
        isCompleted={
          activeCourse ? completedAkm1Ids.has(activeCourse.id) : false
        }
        isLocked={
          activeCourse ? isLockedFor(activeCourse.level, level) : false
        }
        onClose={() => setActiveCourseId(null)}
        onComplete={() => {
          if (activeCourse) completeCourse(activeCourse.id);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components — existing AKM1                                     */
/* ------------------------------------------------------------------ */

function StatTile({
  kind,
  value,
  label,
  caption,
}: {
  kind: "matt" | "metodmal";
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <HonestyTag kind={kind} />
      <p className="mt-3 font-serif text-4xl font-bold leading-none">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground/70">
        {caption}
      </p>
    </div>
  );
}

function ProgressTile({
  completed,
  total,
  pct,
  xp,
}: {
  completed: number;
  total: number;
  pct: number;
  xp: number;
}) {
  return (
    <div className="rounded-lg border border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-5">
      <div className="flex items-center justify-between">
        <HonestyTag kind="matt" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          XP {xp}
        </span>
      </div>
      <p className="mt-3 font-serif text-4xl font-bold leading-none">
        {completed}
        <span className="text-2xl text-muted-foreground">/{total}</span>
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Klara · Din personliga utveckling
      </p>
      <ProgressBar pct={pct} className="mt-3" />
    </div>
  );
}

function ProgressBar({
  pct,
  className,
}: {
  pct: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className="h-full bg-gold transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Akm1CourseCard({
  variable,
  isCompleted,
  isLocked,
  onStart,
}: {
  variable: Akm1Variable;
  isCompleted: boolean;
  isLocked: boolean;
  onStart: () => void;
}) {
  const weightLabel =
    variable.weight === "KRITISK"
      ? `${variable.category.toUpperCase()} · KRITISK`
      : `${variable.category.toUpperCase()} · ${variable.weight}`;

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden p-0 py-0 transition-all",
        isLocked && !isCompleted && "opacity-70",
        isCompleted
          ? "border-bull/40"
          : "hover:border-gold/40 hover:shadow-md"
      )}
    >
      <div className="p-5">
        {/* Top row: weight + minutes */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-gold/40 bg-gold/5 text-gold",
              variable.weight === "KRITISK" && "border-bear/40 bg-bear/5 text-bear"
            )}
          >
            {weightLabel}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {variable.minutes} min
          </span>
        </div>

        {/* Number + ID */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-serif text-5xl font-bold leading-none text-ink dark:text-foreground">
            {variable.num}
          </span>
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            {variable.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-serif text-lg font-bold leading-tight">
          {variable.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {variable.summary}
        </p>

        {/* Bottom row: level + tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            {LEVEL_LABEL[variable.level]}
          </Badge>
          <HonestyTag kind="matt" />
          {isCompleted && (
            <Badge className="border border-bull/30 bg-bull/15 text-bull">
              <Check className="h-3 w-3" /> Klar
            </Badge>
          )}
          {isLocked && !isCompleted && (
            <Badge
              variant="outline"
              className="border-muted-foreground/30 text-muted-foreground"
            >
              <Lock className="h-3 w-3" /> Avancerad-nivå
            </Badge>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 p-4">
        <Button
          className={cn(
            "w-full",
            isCompleted
              ? "bg-bull text-background hover:bg-bull/90"
              : "bg-gold text-background hover:bg-gold/90"
          )}
          onClick={onStart}
          disabled={isLocked && !isCompleted}
        >
          {isLocked && !isCompleted ? (
            <>
              <Lock className="h-4 w-4" /> Låst — kräver Avancerad-nivå
            </>
          ) : isCompleted ? (
            <>
              <Check className="h-4 w-4" /> Repetera kursen
            </>
          ) : (
            <>
              Starta <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

function CourseDetailDialog({
  course,
  isCompleted,
  isLocked,
  onClose,
  onComplete,
}: {
  course: Akm1Variable | null;
  isCompleted: boolean;
  isLocked: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const weightLabel = course
    ? course.weight === "KRITISK"
      ? `${course.category.toUpperCase()} · KRITISK`
      : `${course.category.toUpperCase()} · ${course.weight}`
    : "";

  return (
    <Dialog open={!!course} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {course && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-gold/40 bg-gold/5 text-gold",
                    course.weight === "KRITISK" &&
                      "border-bear/40 bg-bear/5 text-bear"
                  )}
                >
                  {weightLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {course.minutes} min
                </span>
              </div>
              <DialogTitle className="mt-2 font-serif text-2xl leading-tight">
                <span className="mr-2 font-mono text-base font-semibold text-gold">
                  {course.id}
                </span>
                {course.name}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {course.summary}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{LEVEL_LABEL[course.level]}</Badge>
                <HonestyTag kind="matt" />
                {isCompleted && (
                  <Badge className="border border-bull/30 bg-bull/15 text-bull">
                    <Check className="h-3 w-3" /> Redan klar
                  </Badge>
                )}
              </div>

              {course.formula && (
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Formel
                  </p>
                  <p className="mt-2 font-mono text-sm leading-relaxed text-foreground">
                    {course.formula}
                  </p>
                </div>
              )}

              {course.scale && (
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Poängskala 1–5
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {course.scale}
                  </p>
                </div>
              )}

              {!course.formula && !course.scale && (
                <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Kursen har teori, räkneexempel och övning — öppnas i
                    inlärningsvägen.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              {isLocked && !isCompleted ? (
                <Button variant="outline" disabled className="w-full">
                  <Lock className="h-4 w-4" /> Låst — kräver Avancerad-nivå
                </Button>
              ) : isCompleted ? (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  <Check className="h-4 w-4" /> Kursen redan klar (+100 XP)
                </Button>
              ) : (
                <Button
                  className="w-full bg-gold text-background hover:bg-gold/90"
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  <Check className="h-4 w-4" /> Markera som klar (+100 XP)
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LegendItem({
  swatch,
  label,
  sub,
}: {
  swatch: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 inline-block h-3 w-3 shrink-0 rounded-sm border",
          swatch
        )}
      />
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function PathCard({ path }: { path: (typeof LEARNING_PATHS)[number] }) {
  return (
    <Card
      className={cn(
        "gap-0 p-6",
        path.premium &&
          "border-gold/60 bg-gradient-to-br from-card to-gold/[0.04]"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-serif text-lg font-bold text-gold">
          {path.num}
        </span>
        {path.premium && (
          <Badge className="border border-gold/30 bg-gold/15 text-gold">
            <Lock className="h-3 w-3" /> Premium
          </Badge>
        )}
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
        {path.eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-xl font-bold leading-tight">
        {path.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {path.body}
      </p>
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          <BookOpen className="h-4 w-4 text-gold" />
          {path.courses}
          <span className="font-normal text-muted-foreground">kurser</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4 text-gold" />
          {path.minutes}
          <span className="font-normal text-muted-foreground">min total</span>
        </span>
      </div>
      <Button
        className={cn(
          "mt-4 w-full",
          path.premium
            ? "bg-gold text-background hover:bg-gold/90"
            : "bg-foreground text-background hover:bg-foreground/90"
        )}
      >
        Följ denna väg <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components — KUNSKAPSMARKNAD                                   */
/* ------------------------------------------------------------------ */

function KunskapsmarknadBlock() {
  const { progress, completeCourse, addXp, level } = useAk1aStore();
  const [filter, setFilter] = React.useState<KmCategory | "ALLA">("ALLA");
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<KmCourse | null>(null);

  const completedKmIds = React.useMemo(
    () =>
      new Set(
        KUNSKAPSMARKNAD_COURSES.filter((c) =>
          progress.completedCourses.includes(c.id)
        ).map((c) => c.id)
      ),
    [progress.completedCourses]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return KUNSKAPSMARKNAD_COURSES.filter((c) => {
      if (filter !== "ALLA" && c.category !== filter) return false;
      if (
        q &&
        !`${c.id} ${c.title} ${c.summary} ${c.category}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [filter, query]);

  const completedCount = completedKmIds.size;

  return (
    <section
      id="kunskapsmarknaden"
      className="border-b border-border bg-muted/20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Kunskapsmarknaden — utanför AKM1</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
              KUNSKAPSMARKNADEN
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
              251 kurser utanför AKM1-kärnan. Bokföring, värderingsmetoder,
              riskhantering, beteendefinans, svensk bolagsskatt — allt en svensk
              retail-investerare behöver. Nedan visas en browsbar sample av 68
              kurser i 13 kategorier.
            </p>
          </div>
          <div className="min-w-[200px] rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                Din progress
              </span>
              <HonestyTag kind="metodmal" />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold leading-none">
              {completedCount}
              <span className="text-xl text-muted-foreground">/68</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Av browsebar sample · mål 251
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-8">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sök kurs, kategori eller nyckelord…"
              className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Rensa sökning"
              >
                Rensa
              </button>
            )}
          </div>
        </div>

        {/* Category filter tabs */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as KmCategory | "ALLA")}
          className="mt-4"
        >
          <div className="-mx-4 overflow-x-auto pb-1 sm:mx-0">
            <TabsList className="h-auto w-max gap-1 rounded-lg border border-border bg-transparent p-1">
              <TabsTrigger
                value="ALLA"
                className="rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground data-[state=active]:border-gold data-[state=active]:bg-gold data-[state=active]:text-background data-[state=active]:shadow-none whitespace-nowrap"
              >
                ALLA ({KUNSKAPSMARKNAD_COURSES.length})
              </TabsTrigger>
              {KM_CATEGORIES.map((cat) => {
                const count = KUNSKAPSMARKNAD_COURSES.filter(
                  (c) => c.category === cat
                ).length;
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground data-[state=active]:border-gold data-[state=active]:bg-gold data-[state=active]:text-background data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    {cat.toUpperCase()} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </Tabs>

        {/* Course grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const isCompleted = completedKmIds.has(c.id);
            const isLocked = isLockedFor(c.level, level);
            return (
              <KmCourseCard
                key={c.id}
                course={c}
                isCompleted={isCompleted}
                isLocked={isLocked}
                onStart={() => {
                  const slug = kmCourseIdToSlug(c.id, c.title);
                  if (slug) {
                    setKurserDeepSlug(slug);
                  } else {
                    setActive(c);
                  }
                }}
              />
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Inga kurser matchade din sökning.
          </p>
        )}
      </div>

      <KmCourseDialog
        course={active}
        isCompleted={active ? completedKmIds.has(active.id) : false}
        isLocked={active ? isLockedFor(active.level, level) : false}
        onClose={() => setActive(null)}
        onComplete={() => {
          if (active) {
            completeCourse(active.id);
            addXp(50);
          }
        }}
      />
    </section>
  );
}

function KmCourseCard({
  course,
  isCompleted,
  isLocked,
  onStart,
}: {
  course: KmCourse;
  isCompleted: boolean;
  isLocked: boolean;
  onStart: () => void;
}) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden p-0 py-0 transition-all",
        isLocked && !isCompleted && "opacity-70",
        isCompleted
          ? "border-bull/40"
          : "hover:border-gold/40 hover:shadow-md"
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-gold/40 bg-gold/5 text-gold"
          >
            {course.category}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {course.minutes} min
          </span>
        </div>

        <div className="mt-4">
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            {course.id}
          </span>
        </div>

        <h3 className="mt-1 font-serif text-lg font-bold leading-tight">
          {course.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {course.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            {LEVEL_LABEL[course.level]}
          </Badge>
          <HonestyTag kind="metodmal" />
          {isCompleted && (
            <Badge className="border border-bull/30 bg-bull/15 text-bull">
              <Check className="h-3 w-3" /> Klar
            </Badge>
          )}
          {isLocked && !isCompleted && (
            <Badge
              variant="outline"
              className="border-muted-foreground/30 text-muted-foreground"
            >
              <Lock className="h-3 w-3" /> Kräver {LEVEL_LABEL[course.level]}
            </Badge>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 p-4">
        <Button
          className={cn(
            "w-full",
            isCompleted
              ? "bg-bull text-background hover:bg-bull/90"
              : "bg-gold text-background hover:bg-gold/90"
          )}
          onClick={onStart}
          disabled={isLocked && !isCompleted}
        >
          {isLocked && !isCompleted ? (
            <>
              <Lock className="h-4 w-4" /> Låst — kräver{" "}
              {LEVEL_LABEL[course.level]}
            </>
          ) : isCompleted ? (
            <>
              <Check className="h-4 w-4" /> Repetera kursen
            </>
          ) : (
            <>
              Starta <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

function KmCourseDialog({
  course,
  isCompleted,
  isLocked,
  onClose,
  onComplete,
}: {
  course: KmCourse | null;
  isCompleted: boolean;
  isLocked: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <Dialog open={!!course} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {course && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-gold/40 bg-gold/5 text-gold"
                >
                  {course.category}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {course.minutes} min
                </span>
              </div>
              <DialogTitle className="mt-2 font-serif text-2xl leading-tight">
                <span className="mr-2 font-mono text-base font-semibold text-gold">
                  {course.id}
                </span>
                {course.title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {course.summary}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{LEVEL_LABEL[course.level]}</Badge>
                <HonestyTag kind="metodmal" />
                {isCompleted && (
                  <Badge className="border border-bull/30 bg-bull/15 text-bull">
                    <Check className="h-3 w-3" /> Redan klar
                  </Badge>
                )}
              </div>

              <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Full kurs öppnas i inlärningsvägen — teori, räkneexempel och
                  övning.
                </p>
              </div>
            </div>

            <DialogFooter>
              {isLocked && !isCompleted ? (
                <Button variant="outline" disabled className="w-full">
                  <Lock className="h-4 w-4" /> Låst — kräver{" "}
                  {LEVEL_LABEL[course.level]}
                </Button>
              ) : isCompleted ? (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  <Check className="h-4 w-4" /> Kursen redan klar
                </Button>
              ) : (
                <Button
                  className="w-full bg-gold text-background hover:bg-gold/90"
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  <Check className="h-4 w-4" /> Markera som klar (+50 XP)
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components — LEVANDE FALLSTUDIER                               */
/* ------------------------------------------------------------------ */

function FallstudieBlock() {
  const { setSection } = useAk1aStore();
  const [active, setActive] = React.useState<Fallstudie | null>(null);

  return (
    <section id="fallstudier" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Eyebrow>Levande fallstudier</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
          LEVANDE FALLSTUDIER
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          5 fall där AKM1-metoden applicerats steg för steg. Samma 19
          variabler, olika bolag.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FALLSTUDIER.map((f) => (
            <Card
              key={f.id}
              className="flex flex-col gap-0 p-6"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 text-gold">
                  <Briefcase className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  {f.id}
                </span>
                {f.isPrec ? (
                  <Badge className="ml-auto border border-bull/30 bg-bull/15 text-bull">
                    <Check className="h-3 w-3" /> Live
                  </Badge>
                ) : (
                  <HonestyTag kind="metodmal" className="ml-auto" />
                )}
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f.company}
              </p>
              <h3 className="mt-1 font-serif text-lg font-bold leading-tight">
                {f.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {f.shortDesc}
              </p>
              <div className="mt-4">
                <Button
                  className="w-full bg-gold text-background hover:bg-gold/90"
                  onClick={() => {
                    if (f.isPrec) {
                      setSection("prec");
                    } else {
                      setActive(f);
                    }
                  }}
                >
                  Öppna <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="sm:max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <Badge
                  variant="outline"
                  className="border-gold/40 bg-gold/5 text-gold w-fit"
                >
                  {active.id}
                </Badge>
                <DialogTitle className="mt-2 font-serif text-2xl leading-tight">
                  {active.company}
                </DialogTitle>
                <DialogDescription className="text-sm font-semibold text-foreground">
                  {active.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HonestyTag kind="metodmal" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Full fallstudie under utveckling
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {active.teaser}
                </p>
                <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Full 99-sidig fallstudie publiceras framöver. Prenumerera på
                    AK1A-nyhetsbrevet för meddelande när den öppnar.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setActive(null)}
                  className="w-full"
                >
                  Stäng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components — MEGA NIVÅER 1-100                                 */
/* ------------------------------------------------------------------ */

function MegaNivaerBlock() {
  const { progress } = useAk1aStore();
  const currentLevel = getMegaLevel(progress.xp);

  return (
    <section id="mega-nivaer" className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Eyebrow>Mega nivåer 1–100</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
          MEGA NIVÅER 1–100
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          6 nivåer från första aktien till master-analytiker. Varje nivå har
          en milstolpe och en prövning.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
          <TrendingUp className="h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              Din nuvarande nivå
            </p>
            <p className="font-serif text-2xl font-bold leading-none">
              Nivå {currentLevel}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · {progress.xp.toLocaleString("sv-SE")} XP
              </span>
            </p>
          </div>
          <HonestyTag kind="matt" className="ml-auto" />
        </div>

        {/* Vertical stepped progression */}
        <div className="mt-10 space-y-4">
          {MEGA_NIVAER.map((niva) => {
            const isUnlocked = currentLevel >= niva.num;
            const isCurrent = currentLevel === niva.num;
            const isCompleted = currentLevel > niva.num;
            return (
              <div
                key={niva.num}
                className={cn(
                  "flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-start sm:gap-6",
                  isUnlocked
                    ? "border-gold/40 bg-card"
                    : "border-border bg-muted/30 opacity-75"
                )}
              >
                {/* Numbered circle */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1">
                  <span
                    className={cn(
                      "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 font-serif text-xl font-bold",
                      isCompleted
                        ? "border-bull bg-bull/15 text-bull"
                        : isCurrent
                        ? "border-gold bg-gold text-background"
                        : isUnlocked
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : niva.num}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isUnlocked ? "text-gold" : "text-muted-foreground"
                    )}
                  >
                    Nivå {niva.num}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-xl font-bold leading-tight">
                      {niva.title}
                    </h3>
                    {isCurrent && (
                      <Badge className="border border-gold/30 bg-gold/15 text-gold">
                        Du är här
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge className="border border-bull/30 bg-bull/15 text-bull">
                        <Check className="h-3 w-3" /> Klar
                      </Badge>
                    )}
                    {!isUnlocked && (
                      <Badge
                        variant="outline"
                        className="border-muted-foreground/30 text-muted-foreground"
                      >
                        <Lock className="h-3 w-3" /> Låst
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider text-foreground/80">
                      Milstolpe:
                    </span>{" "}
                    {niva.milstolpe}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider text-foreground/80">
                      Prövning:
                    </span>{" "}
                    {niva.provning}
                  </p>
                  {!isUnlocked && (
                    <div className="mt-3 flex items-center gap-2">
                      <HonestyTag kind="metodmal" />
                      <span className="text-[11px] text-muted-foreground">
                        Låses upp vid{" "}
                        {niva.xpThreshold === Number.POSITIVE_INFINITY
                          ? "max XP"
                          : `${niva.xpThreshold.toLocaleString("sv-SE")} XP`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components — BELÖNINGAR                                        */
/* ------------------------------------------------------------------ */

function BeloningarBlock() {
  const { progress, precSection } = useAk1aStore();

  const detectCtx = {
    completedCourses: progress.completedCourses,
    xp: progress.xp,
    streak: progress.streak,
    quizzesPassed: progress.quizzesPassed,
    flashcardsViewed: progress.flashcardsViewed,
    precSection,
  };

  const unlockedCount = BADGES.filter(
    (b) => b.auto && b.detect(detectCtx)
  ).length;

  return (
    <section id="beloningar" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Eyebrow>Belöningar</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
          BELÖNINGAR
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          14 badges. Inte för att visa upp — för att minnas vad du lärt dig.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
          <Award className="h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              Upplåsta badges
            </p>
            <p className="font-serif text-2xl font-bold leading-none">
              {unlockedCount}
              <span className="text-sm font-normal text-muted-foreground">
                /14
              </span>
            </p>
          </div>
          <HonestyTag kind="matt" className="ml-auto" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((badge) => {
            const isUnlocked = badge.auto && badge.detect(detectCtx);
            return (
              <BadgeMedallion
                key={badge.id}
                badge={badge}
                isUnlocked={isUnlocked}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BadgeMedallion({
  badge,
  isUnlocked,
}: {
  badge: BadgeDef;
  isUnlocked: boolean;
}) {
  const Icon = badge.icon;
  return (
    <Card
      className={cn(
        "flex flex-col items-center gap-0 p-5 text-center",
        isUnlocked
          ? "border-gold/40 bg-gradient-to-br from-card to-gold/[0.06]"
          : "border-border bg-muted/30 opacity-75"
      )}
    >
      <span
        className={cn(
          "inline-flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors",
          isUnlocked
            ? "border-gold bg-gold/15 text-gold"
            : "border-muted-foreground/30 bg-muted text-muted-foreground"
        )}
      >
        {isUnlocked ? (
          <Icon className="h-7 w-7" />
        ) : (
          <Lock className="h-6 w-6" />
        )}
      </span>
      <h3 className="mt-3 font-serif text-base font-bold leading-tight">
        {badge.name}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {badge.description}
      </p>
      <div className="mt-3">
        {isUnlocked ? (
          <Badge className="border border-gold/30 bg-gold/15 text-gold">
            <Check className="h-3 w-3" /> Upplåst
          </Badge>
        ) : badge.auto ? (
          <HonestyTag kind="metodmal" />
        ) : (
          <Badge
            variant="outline"
            className="border-muted-foreground/30 text-muted-foreground"
          >
            Låses upp när du gör det
          </Badge>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components — ANALYTIKER-INSIKTER                               */
/* ------------------------------------------------------------------ */

function AnalytikerInsikterBlock() {
  return (
    <section
      id="analytiker-insikter"
      className="border-b border-border bg-muted/20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Eyebrow>Analytiker-insikter</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
          ANALYTIKER-INSIKTER
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          5 insikter från institutionella analytiker — översatt till svenska
          retail.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {ANALYTIKER_INSIKTER.map((ins) => (
            <Card key={ins.id} className="gap-0 overflow-hidden p-0">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gold/10 text-gold">
                    <Quote className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {ins.id}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold leading-tight">
                      {ins.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  {ins.punch}
                </p>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem
                  value={ins.id}
                  className="border-b-0 px-5 pb-4"
                >
                  <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-gold hover:no-underline">
                    Läs hela insikten
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {ins.detail}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

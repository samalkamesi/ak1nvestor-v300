"use client";

import * as React from "react";
import {
  FlaskConical,
  AlertTriangle,
  History,
  Wallet,
  FileText,
  GitCompare,
  Activity,
  Gauge,
  Trophy,
  Zap,
  Flame,
  Brain,
  RotateCcw,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Lock,
  Calculator,
  Crown,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag } from "../primitives";
import { AKM1_VARIABLES } from "@/lib/ak1a/data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CombinationsBrowser } from "@/components/ak1a/cases-combinations-browsers";
import { PortfolioBuilder } from "@/components/ak1a/portfolio-builder";

// ============================================================
// TYPES
// ============================================================

type CaseType = "best" | "warning";
type CaseFilter = "all" | "best" | "warning";

interface CaseStudy {
  type: CaseType;
  company: string;
  ticker: string;
  title: string;
  desc: string;
  score: number; // out of 95
  decisive: string[]; // AKM1 variables that decided the case
  illustrative?: boolean;
}

// ============================================================
// DATA — 30 case studies (9 best + 21 warning) from labb.txt
// ============================================================

const CASES: CaseStudy[] = [
  // ----- BÄSTA FALL (9) -----
  {
    type: "best",
    company: "PRECISE BIOMETRICS",
    ticker: "PREC.ST",
    title: "Värde-upptäckt med fusionskatalysator",
    desc: "PREC hade låg värdering (P/S ~2), stark bruttomarginal (~70 % typisk mjukvara), och en katalysator: fusion med FPC. AKM1 hade gett poäng 3–4 på flera variabler.",
    score: 58,
    decisive: ["V04 P/S", "V07 Bruttomarginal", "V17 Avtal & Partnerskap"],
  },
  {
    type: "best",
    company: "AMAZON (ILLUSTRATIVT EXEMPEL)",
    ticker: "AMZN",
    title: "Tillväxtfasens paradox — negativt EPS i 7 år",
    desc: "Amazon hade negativt resultat 2001–2008 men växte omsättningen från 3 MUSD till 19 MMD. AKM1 hade gett poäng 1 på lönsamhet men poäng 5 på tillväxt och nätverkseffekter.",
    score: 62,
    illustrative: true,
    decisive: ["V01 Försäljningstillväxt", "V15 Nätverkseffekter"],
  },
  {
    type: "best",
    company: "TESLA (ILLUSTRATIVT EXEMPEL)",
    ticker: "TSLA",
    title: "Katalysator-stackning — flera händelser som bygger på varandra",
    desc: "Tesla hade flera katalysatorer över tid: Model S lansering (2012), Model 3 (2017), Shanghai-fabrik (2019), inklusion i S&P 500 (2020). Varje katalysator byggde på den föregående.",
    score: 68,
    illustrative: true,
    decisive: ["V16 Produktlanseringar", "V18 Regulatoriska katalysatorer"],
  },
  {
    type: "best",
    company: "APPLE",
    ticker: "AAPL",
    title: "Moat-stack — varumärke + ekosystem + services",
    desc: "Apple kombinerar tre moats: (1) varumärke (premium-pris, kundlojalitet), (2) ekosystem (iPhone → Mac → iPad → Watch — lås-in-effekt), (3) services (App Store 30 % take rate, iCloud, Apple Pay). AKM1: hög på nästan alla variabler.",
    score: 82,
    decisive: ["V14 Varumärke", "V15 Nätverkseffekter"],
  },
  {
    type: "best",
    company: "MICROSOFT",
    ticker: "MSFT",
    title: "Cloud-transformation under Satya Nadella",
    desc: "Microsoft 2014: 'Windows-essential', stagnerande, värd 300 Mdr USD. Satya Nadella blir VD → satsar på Azure (cloud), Office 365, GitHub. 2024: värd 3,1 biljoner USD. Cloud-intäkter 100+ Mdr USD/år. AKM1 visar att ledning (V13) betyder allt.",
    score: 78,
    decisive: ["V13 Patent & IPR", "V16 Produktlanseringar"],
  },
  {
    type: "best",
    company: "AMAZON",
    ticker: "AMZN",
    title: "Långsiktig tänkande — Jeff Bezos brev till aktieägare",
    desc: "Amazon 1997–2024: Bezos skrev 'det är dag 1' i varje årsbrev. Brände pengar i 7 år, växte 30 % per år. AWS lanserades 2006 = moln-industrin skapades. Long-term thinking + reinvestment. AKM1: V1 (tillväxt) 5, V19 (burn) 1, men 'bra bränning'.",
    score: 75,
    decisive: ["V01 Försäljningstillväxt", "V19 Kapitalförbränning & Emission-risk"],
  },
  {
    type: "best",
    company: "ATLAS COPCO",
    ticker: "ATCO-A.ST",
    title: "Industri-moat — premium-pris i 40+ år",
    desc: "Atlas Copco = svensk industri-moat. Verktyg, kompressorer, vacuum. Premium-pris (40 % över snitt) genom kvalitet + service-nätverk. ROE >20 % i 30+ år. Utdelning höjd 40+ år i rad. AKM1 klassisk 'compounder'.",
    score: 80,
    decisive: ["V09 ROE", "V14 Varumärke"],
  },
  {
    type: "best",
    company: "INVESTOR AB",
    ticker: "INVE-B.ST",
    title: "Holding-bolag — Wallenberg-familjens 100-åriga compounder",
    desc: "Investor AB = Wallenberg-familjens investmentbolag. Huvudinnehav: AstraZeneca, Ericsson, Atlas Copco, SEB, Saab. Handlas 25–30 % under NAV. Långsiktig strategi, aktivt ägande, 'fjärde generationen'. AKM1: moat = nätverk + tid.",
    score: 78,
    decisive: ["V14 Varumärke", "V12 Intäktsstabilitet"],
  },
  {
    type: "best",
    company: "NOVO NORDISK",
    ticker: "NOVO-B.CO",
    title: "Pharma-moat — GLP-1 revolutionen (Ozempic, Wegovy)",
    desc: "Novo Nordisk = dansk läkemedels-jätte. Dominerar diabetes-marknaden (insulin). 2017: lanserar Ozempic (semaglutide). 2021: Wegovy (viktnedgång). GLP-1 revolutionerar vikt-marknaden = 100+ Mdr USD potentiell marknad. AKM1: extrem moat.",
    score: 85,
    decisive: ["V13 Patent & IPR", "V18 Regulatoriska katalysatorer"],
  },

  // ----- VARNINGSFALL (21) -----
  {
    type: "warning",
    company: "SVENSKT SMÅBOLAG (ANONYMISERAT)",
    ticker: "EX-SE-1",
    title: "Hög tillväxt + hög kapitalförbränning = emission-fälla",
    desc: "Bolaget visade +35 % tillväxt (poäng 5 på variabel 1) men brände 8 MSEK/månad med bara 24 MSEK kassa. Såg 'bra' ut på ytan — tillväxt döljde risken.",
    score: 42,
    decisive: ["V01 Försäljningstillväxt", "V19 Kapitalförbränning & Emission-risk"],
  },
  {
    type: "warning",
    company: "VALUE TRAP-EXEMPEL (ANONYMISERAT)",
    ticker: "EX-SE-2",
    title: "Låg P/S + fallande omsättning = value trap",
    desc: "P/S 0,8 (poäng 5 på variabel 4) men omsättningen föll 15 % årligen. Nybörjare köpte för 'billig värdering' — utan att se trenden.",
    score: 28,
    decisive: ["V04 P/S", "V12 Intäktsstabilitet"],
  },
  {
    type: "warning",
    company: "BOKFÖRINGSSKANDAL-EXEMPEL (ANONYMISERAT)",
    ticker: "EX-SE-3",
    title: "Hög ROE + hög skuldsättning = dold risk",
    desc: "ROE 28 % (poäng 5 på variabel 9) men skuldsättningsgrad 180 % (poäng 1 på variabel 10). Hög ROE uppnåddes genom extrem finansiell hävstång — inte genom operationell kvalitet.",
    score: 35,
    decisive: ["V09 ROE", "V10 Skuldsättningsgrad"],
  },
  {
    type: "warning",
    company: "PATENT-FÖRLUST-EXEMPEL (ANONYMISERAT)",
    ticker: "EX-SE-4",
    title: "Stark moat — tills patentet löper ut",
    desc: "Bolaget hade 5 starka patent (poäng 5 på variabel 13) men alla löpte ut inom 3 år. Moat var 'på papper' men tiden tog den.",
    score: 45,
    decisive: ["V13 Patent & IPR", "V12 Intäktsstabilitet"],
  },
  {
    type: "warning",
    company: "SILICON VALLEY BANK (SVB)",
    ticker: "SIVB",
    title: "Räntekänslighet + koncentrerad kundbas = bankkollaps på 36 timmar",
    desc: "SVB investerade kundinlåning i långa statsobligationer vid 0 % ränta. När Fed höjde till 5 % föll obligationspriserna 20 %. Tech-kunder (koncentrerad bas) tog ut kassa. -1,8 MUSD förlust + bank run 42 MUSD/dag = kollaps.",
    score: 30,
    decisive: ["V11 Likviditet (Kvick)", "V03 Intäktsdiversifiering"],
  },
  {
    type: "warning",
    company: "ARCHEGOS CAPITAL MANAGEMENT",
    ticker: "PRIVAT (EJ BÖRSNOTERAD)",
    title: "Total return swaps — osynlig hävstång + koncentration",
    desc: "Archegos (Bill Hwang) hade 36 MUSD exponering via TRS — banker (Credit Suisse, Nomura, Morgan Stanley) köpte aktier för hans räkning. Ingen såg total exponering. När pris föll + margin call → banker sålde simultant → priskrasch → spiral. 10 MUSD raderat på en vecka.",
    score: 25,
    decisive: ["V10 Skuldsättningsgrad", "V03 Intäktsdiversifiering"],
  },
  {
    type: "warning",
    company: "TERRA / LUNA (DO KWON)",
    ticker: "LUNA",
    title: "Algorithmic stablecoin — Ponzi-liknande death spiral",
    desc: "Terra (UST) skulle hållas vid 1 USD via LUNA-minting/burning. Anchor Protocol erbjöd 20 % 'risk-free' avkastning. I maj 2022 bröt peggen — UST föll till 0,10, LUNA från 120 USD till 0,00001. 60 MUSD raderat på en vecka.",
    score: 20,
    decisive: ["V19 Kapitalförbränning & Emission-risk", "V15 Nätverkseffekter"],
  },
  {
    type: "warning",
    company: "FTX (SAM BANKMAN-FRIED)",
    ticker: "PRIVAT (EJ BÖRSNOTERAD)",
    title: "Kundmedel utlånade till systerkoncern = fraud",
    desc: "FTX (SBF) tog emot kund-krypto. Alameda Research (SBF:s hedgefond) handlade med dessa tillgångar — utan kundernas vetskap. CoinDesk avslöjade balansräkning nov 2022 → bank run → konkurs på 10 dagar. 8 MUSD kunders pengar borta.",
    score: 15,
    decisive: ["V19 Kapitalförbränning & Emission-risk", "V12 Intäktsstabilitet"],
  },
  {
    type: "warning",
    company: "LEHMAN BROTHERS",
    ticker: "LEHMQ (GAMLA)",
    title: "Subprime-exponering + hög hävstång = 158-årig bank faller",
    desc: "Lehman Brothers (158 år gammal) hade 30x hävstång + 80 MUSD subprime-obligationer. När property-marknaden kraschade 2007–2008 → nedskrivningar → inget kapital → konkurs 15 sep 2008. Startskottet till finanskrisen.",
    score: 25,
    decisive: ["V10 Skuldsättningsgrad", "V19 Kapitalförbränning & Emission-risk"],
  },
  {
    type: "warning",
    company: "WIRECARD",
    ticker: "WDI.DE",
    title: "Tysk Enron — 1,9 M€ 'falsk kassa' i Filippinerna",
    desc: "Wirecard = tysk fintech-jätte, DAX-30 medlem. Värderad till 24 M€ 2018. Kassa 1,9 M€ på balansräkningen — fanns inte. Financial Times reporter skrev om granskningar i 2 år. Juni 2020: VD erkände kassa saknas → konkurs.",
    score: 30,
    decisive: ["V12 Intäktsstabilitet", "V11 Likviditet (Kvick)"],
  },
  {
    type: "warning",
    company: "LUCKIN COFFEE",
    ticker: "LK (DELISTED)",
    title: "Kinesisk fraud — fingerade 2,2 MUSD intäkter",
    desc: "Luckin Coffee = 'kinesisk Starbucks', IPO maj 2019. Värderad till 12 MUSD. Muddy Waters (short-seller) rapport jan 2020: fingerade 2,2 MUSD intäkter. Luckin erkände april 2020. Delisted juni 2020. Aktien -75 % på en dag.",
    score: 25,
    decisive: ["V12 Intäktsstabilitet", "V03 Intäktsdiversifiering"],
  },
  {
    type: "warning",
    company: "CREDIT SUISSE",
    ticker: "CS (GAMLA)",
    title: "Förtroende-kollaps — flera skandaler + Archegos + Greensill",
    desc: "Credit Suisse (167-årig bank) träffades av: (1) Archegos-förlust 5,5 MUSD mars 2021, (2) Greensill-fond kollaps mars 2021, (3) Mozambique 'tuna bonds' skandal, (4) spying-skandal med Iqbal Khan. Saud-al-Rajhi vägrade kapitaltillskott → kollaps mars 2023.",
    score: 28,
    decisive: ["V12 Intäktsstabilitet", "V14 Varumärke"],
  },
  {
    type: "warning",
    company: "WEWORK",
    ticker: "WE (DELISTED)",
    title: "Värderings-galenskap — 47 MUSD för en fastighets-mäklare",
    desc: "WeWork värderad till 47 MUSD januari 2019. Adam Neumann (VD) levde lyxigt, sålde 'We'-varumärke till bolaget för 5,8 MUSD. IPO-försök aug 2019 avslöjade galen corporate governance. IPO inställd. VD sparkad. Värdering kraschade till 8 MUSD.",
    score: 22,
    decisive: ["V14 Varumärke", "V10 Skuldsättningsgrad"],
  },
  {
    type: "warning",
    company: "NOKIA",
    ticker: "NOK",
    title: "Disruption — när iPhone dödade Symbian",
    desc: "Nokia 2007: 40 % av mobil-marknaden, största europeiska tech-bolaget (värd 150 M€). Steve Jobs lanserade iPhone januari 2007. Nokia vägrade anpassa — höll fast vid Symbian-OS. 2011: partner med Microsoft (Windows Phone). 2013: sålde mobil-verksamhet till Microsoft.",
    score: 28,
    decisive: ["V16 Produktlanseringar", "V15 Nätverkseffekter"],
  },
  {
    type: "warning",
    company: "BLACKBERRY",
    ticker: "BB",
    title: "Disruption — när touchscreens dödade QWERTY-tangentbord",
    desc: "BlackBerry 2010: 20 % av mobil-marknaden, värd 80 MUSD. Särskilt populär bland 'business' — QWERTY-tangentbord + säker e-post. iPhone + Android (touchskärm) erövrade marknaden. BB10 lanserades 2013 — för sent. 2016: lämnade hårdvaru-marknaden.",
    score: 24,
    decisive: ["V16 Produktlanseringar", "V14 Varumärke"],
  },
  {
    type: "warning",
    company: "KODAK",
    ticker: "KODK",
    title: "Disruption — uppfunnen digitalkameran, dödades av den",
    desc: "Kodak 1975: uppfann digitalkameran. 2000: 90 % av USA-film-marknaden, värd 30 MUSD. Vägrade pivotera till digital (film var mer profitabelt). 2012: konkurs. Digitalkameror från Canon, Nikon + smartphones dödade film-marknaden.",
    score: 26,
    decisive: ["V16 Produktlanseringar", "V13 Patent & IPR"],
  },
  {
    type: "warning",
    company: "SWEDISH MATCH",
    ticker: "SWMA.ST",
    title: "Philip Morris bud 106 SEK — aktien föll när budet föll",
    desc: "Philip Morris (PM) budade på Swedish Match maj 2022 — 106 SEK/aktie. SWMA steg till 105 SEK. Oktober 2022: PM höjde ej budet. SWMA föll till 75 SEK. Många arbitrage-investerare köpt vid 100+ SEK = förlust.",
    score: 60,
    decisive: ["V17 Avtal & Partnerskap", "V18 Regulatoriska katalysatorer"],
  },
  {
    type: "warning",
    company: "KINNEVIK",
    ticker: "KINV-B.ST",
    title: "Value trap — tech-portfölj värderad lågt, ingen katalysator",
    desc: "Kinnevik 2017: tech-investeringsbolag, innehav Zalando, Rocket Internet, Global Fashion Group. Handlades 30 % under NAV. Köpte vid 250 SEK. 2021: strategi-skifte → mogna bolag. 2022: under NAV 40 %. Värderades inte rättvist — väntade på katalysator som aldrig kom.",
    score: 38,
    decisive: ["V04 P/S", "V16 Produktlanseringar"],
  },
  {
    type: "warning",
    company: "SWEDBANK",
    ticker: "SWED-A.ST",
    title: "Penningtvätt-skandal — Baltic AML-incident",
    desc: "SVT's 'Uppdrag Granskning' februari 2019 avslöjade att Swedbank (och SEB) hjälpte kunder i Baltikum att tvätta ryska pengar 2006–2015. Swedbank förlorade 50 % av sitt värde på 6 mån. USA-utredning. 4 Mdr SEK böter från svenska + estniska tillsynsmyndigheter.",
    score: 50,
    decisive: ["V18 Regulatoriska katalysatorer", "V14 Varumärke"],
  },
  {
    type: "warning",
    company: "NENT / VIAPLAY",
    ticker: "VPLAY-B.ST",
    title: "'Growth story' kraschar — expansion utan profit",
    desc: "NENT (knoppat från MTG 2018) lanserade Viaplay. 2022: 'offensive expansion' till 12 länder (Nederländerna, Polen, Baltikum). Q2 2023 resultat katastrofalt: kostnader exploderade, annons-intäkter föll. VD Anders Jensen sparkad. -90 % på 6 mån.",
    score: 22,
    decisive: ["V01 Försäljningstillväxt", "V19 Kapitalförbränning & Emission-risk"],
  },
  {
    type: "warning",
    company: "BOEING",
    ticker: "BA",
    title: "737 MAX-krisen — säkerhet åsidosatt för vinst",
    desc: "Boeing 737 MAX krävde 2 krascher (Lion Air okt 2018, Ethiopian Airlines mars 2019) — 346 döda. MCAS-systemet dolt för piloter. FDA-granskning avslöjade 'profit över säkerhet'-kultur. COVID-19 förvärrade. 2024: dörr-plugg flög av i flygning (Alaska Airlines).",
    score: 28,
    decisive: ["V19 Kapitalförbränning & Emission-risk", "V14 Varumärke"],
  },
];

// ============================================================
// TOOL TABS DEFINITION
// ============================================================

const TOOLS: {
  id: string;
  label: string;
  planned: boolean;
  desc: string;
}[] = [
  {
    id: "case-studies",
    label: "Case Studies",
    planned: false,
    desc: "Hur AKM1 fungerar i verkligheten — när indikatorer samverkar rätt och fel.",
  },
  {
    id: "farliga-komb",
    label: "Farliga komb.",
    planned: false,
    desc: "Identifiera kombinationer av AKM1-variabler som historiskt lett till kursras. T.ex. V01 + V19 = hög tillväxt + hög kapitalförbränning = emission-fälla.",
  },
  {
    id: "marknadshistoria",
    label: "Marknadshistoria",
    planned: true,
    desc: "Tidslinje över svenska och globala marknadshändelser med AKM1-signaler och våg-position vid varje vändpunkt.",
  },
  {
    id: "portfolj",
    label: "Portfölj",
    planned: false,
    desc: "Bygg en fiktiv portfölj och se hur din genomsnittliga AKM1-poäng fördelar sig över innehaven — moat, risk och katalysator i en vy.",
  },
  {
    id: "ak1a-rapport",
    label: "AK1A Rapport",
    planned: true,
    desc: "Generera ett utkast till institutionell rapport (sektioner, slutsats, risk) baserat på dina egna AKM1-inmatningar.",
  },
  {
    id: "scenario",
    label: "Scenario",
    planned: true,
    desc: "Skapa tre framtidsscenarier (bull, base, bear) och se hur bolagets AKM1-poäng och värdering rör sig i varje",
  },
  {
    id: "jamforelse",
    label: "Jämförelse",
    planned: true,
    desc: "Jämför två bolag sida vid sida — alla 20 AKM1-variabler och 25 AK1TS-celler i en matris.",
  },
  {
    id: "stress-test",
    label: "Stress-test",
    planned: true,
    desc: "Simulera kriser (räntehöjning, recession, branschchock) och se vilka bolag som historiskt överlevt liknande chocker.",
  },
];

// ============================================================
// QUIZ QUESTIONS
// ============================================================

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index
  explanation: string;
}

const QUIZ: QuizQuestion[] = [
  {
    q: "Vad mäter P/S (Price-to-Sales)?",
    options: [
      "Pris-till-omsättning — börsvärde / omsättning",
      "Pris-till-vinst — börsvärde / vinst",
      "Pris-till-bokfört — börsvärde / eget kapital",
      "Pris-till-EBITDA — EV / EBITDA",
    ],
    answer: 0,
    explanation:
      "P/S = börsvärde / omsättning. Används för bolag som inte går med vinst. AKM1 variabel V04.",
  },
  {
    q: "Vilken vågteori bygger på 5 vågor upp / 3 vågor ner?",
    options: ["Fibonacci", "Elliott", "Gann", "Lucas"],
    answer: 1,
    explanation:
      "Elliott Wave Theory (Ralph Nelson Elliott, 1938) — 5 impulsvågor upp, 3 korrektivvågor ner. En av AK1TS 5 vågteorier.",
  },
  {
    q: "Hur många fundamentala variabler har AKM1?",
    options: ["12", "19", "25", "8"],
    answer: 1,
    explanation:
      "AKM1 = 20 variabler i 7 kategorier (Tillväxt, Värdering, Lönsamhet, Stabilitet, Moat, Katalysator, Risk).",
  },
  {
    q: "Vilken AKM1-variabel mäter kapitalförbränning och emission-risk?",
    options: ["V01 Försäljningstillväxt", "V09 ROE", "V13 Patent & IPR", "V19 Kapitalförbränning"],
    answer: 3,
    explanation:
      "V19 är den 'kritiska' risk-variabeln — hur snabbt bolaget bränner pengar och risken för nyemission som utspäddar aktierna.",
  },
  {
    q: "Vad betyder 'moat' i en finansanalys?",
    options: [
      "Bolagets skuldsättningsgrad",
      "Ett konkurrensskydd som hindrar andra att erövra marknaden",
      "Utdelningspolicy för aktieägare",
      "Valuta-risk mot utländska marknader",
    ],
    answer: 1,
    explanation:
      "Moat = konkurrensskydd (varumärke, nätverkseffekter, patent). AKM1-variablerna V13–V15 mäter detta.",
  },
];

// ============================================================
// FLASHCARDS
// ============================================================

const FLASHCARDS: { term: string; def: string }[] = [
  {
    term: "EBITDA",
    def: "Resultat före ränta, skatt, avskrivningar och amortering. Mäter operativ lönsamhet utan hänsyn till kapitalstruktur. AKM1 variabel V08.",
  },
  {
    term: "Moat",
    def: "Konkurrensskydd som hindrar andra bolag att erövra marknaden. Typer: varumärke, nätverkseffekter, patent, switching costs. AKM1 V13–V15.",
  },
  {
    term: "ARR",
    def: "Annual Recurring Revenue. Intäkter som kommer tillbaka automatiskt varje år — prenumerationer, licenser, serviceavtal. AKM1 V02.",
  },
  {
    term: "TERP",
    def: "Theoretical Ex-Rights Price. Teoretiskt pris per aktie efter nyemission med teckningsrätter. Används för att värdera rättigheter.",
  },
  {
    term: "Kvickkvot",
    def: "(Omsättningstillgångar − varulager) / kortfristiga skulder. Mäter kortfristig betalningsförmåga. AKM1 V11. Stark >1,5.",
  },
  {
    term: "ROE",
    def: "Return on Equity = resultat / eget kapital. Hur mycket vinst bolaget skapar per krona eget kapital. AKM1 V09. Stark >20 %.",
  },
];

// ============================================================
// HELPERS
// ============================================================

function getLevel(xp: number): { level: number; title: string; nextAt: number } {
  if (xp < 500) return { level: 1, title: "NYANALYTIKER", nextAt: 500 };
  if (xp < 1500) return { level: 2, title: "ANALYTIKER-ELEV", nextAt: 1500 };
  if (xp < 4000) return { level: 3, title: "ANALYTIKER", nextAt: 4000 };
  if (xp < 9000) return { level: 4, title: "SENIOR ANALYTIKER", nextAt: 9000 };
  return { level: 5, title: "MASTER ANALYTIKER", nextAt: -1 };
}

function verdict(score: number): { label: string; color: string } {
  if (score > 75) return { label: "Stark", color: "text-bull" };
  if (score >= 50) return { label: "Bra", color: "text-gold" };
  return { label: "Svag", color: "text-bear" };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LabbSection() {
  const { progress, addXp, passQuiz, viewFlashcard, bumpStreak, setSection } =
    useAk1aStore();

  const [caseFilter, setCaseFilter] = React.useState<CaseFilter>("all");
  const [activeCase, setActiveCase] = React.useState<CaseStudy | null>(null);

  // AKM1 calculator dialog state
  const [calcOpen, setCalcOpen] = React.useState(false);
  const [calcScores, setCalcScores] = React.useState<number[]>(
    () => Array(19).fill(3)
  );
  const [calcResult, setCalcResult] = React.useState<number | null>(null);
  const [calcXpAwarded, setCalcXpAwarded] = React.useState(false);

  // Quiz dialog state
  const [quizOpen, setQuizOpen] = React.useState(false);
  const [quizIdx, setQuizIdx] = React.useState(0);
  const [quizPicked, setQuizPicked] = React.useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = React.useState(0);
  const [quizDone, setQuizDone] = React.useState(false);

  // Flashcard dialog state
  const [fcOpen, setFcOpen] = React.useState(false);
  const [fcIdx, setFcIdx] = React.useState(0);
  const [fcFlipped, setFcFlipped] = React.useState(false);

  // Dagens utmaning — toast
  const [challengeToast, setChallengeToast] = React.useState<string | null>(
    null
  );

  const bestCount = CASES.filter((c) => c.type === "best").length;
  const warnCount = CASES.filter((c) => c.type === "warning").length;

  const filteredCases =
    caseFilter === "all"
      ? CASES
      : CASES.filter((c) => c.type === caseFilter);

  const levelInfo = getLevel(progress.xp);

  // ----- AKM1 calculator handlers -----
  function handleCalcRun() {
    const total = calcScores.reduce((a, b) => a + b, 0); // max 95
    setCalcResult(total);
    if (!calcXpAwarded) {
      addXp(50);
      setCalcXpAwarded(true);
    }
  }

  function handleCalcReset() {
    setCalcScores(Array(19).fill(3));
    setCalcResult(null);
  }

  // ----- Quiz handlers -----
  function startQuiz() {
    setQuizIdx(0);
    setQuizPicked(null);
    setQuizCorrect(0);
    setQuizDone(false);
    setQuizOpen(true);
  }

  function pickAnswer(i: number) {
    if (quizPicked !== null) return;
    setQuizPicked(i);
    if (i === QUIZ[quizIdx].answer) {
      setQuizCorrect((c) => c + 1);
      addXp(75);
    }
  }

  function nextQuestion() {
    if (quizIdx + 1 < QUIZ.length) {
      setQuizIdx((i) => i + 1);
      setQuizPicked(null);
    } else {
      setQuizDone(true);
      passQuiz("lab-quiz");
    }
  }

  // ----- Flashcard handlers -----
  function startFlashcards() {
    setFcIdx(0);
    setFcFlipped(false);
    setFcOpen(true);
  }

  function flipCard() {
    if (!fcFlipped) {
      viewFlashcard(`lab-fc-${fcIdx}`);
    }
    setFcFlipped((f) => !f);
  }

  function nextCard() {
    if (fcIdx + 1 < FLASHCARDS.length) {
      setFcIdx((i) => i + 1);
      setFcFlipped(false);
    } else {
      setFcOpen(false);
    }
  }

  // ----- Dagens utmaning handler -----
  function doDailyChallenge() {
    bumpStreak();
    addXp(120);
    setChallengeToast(
      `Streak ${progress.streak + 1} övningar · +120 XP tillagd`
    );
    window.setTimeout(() => setChallengeToast(null), 3500);
  }

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
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Eyebrow>LABBET</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Verifiera{" "}
              <span className="text-gold">själv.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Öppna AKM1-calculatorn och poängsätt ett bolag själv.
              Samma verktyg, samma metodik — data öppen, slutsatser verifierbara.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gold text-background hover:bg-gold/90"
                onClick={() =>
                  document
                    .getElementById("lab-tools")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Öppna konsolen <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("lab-calc")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Calculator className="mr-1 h-4 w-4" /> AKM1-kalkylatorn
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── KONSOLEN I SIFFROR ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <ConsoleStat
              value="8"
              label="Verktyg i konsolen"
              caption="Case Studies, Farliga komb., Marknadshistoria, Portfölj, AK1A Rapport, Scenario, Jämförelse, Stress-test."
            />
            <ConsoleStat
              value="METODMÅL"
              label="Reproducerbarhet"
              caption="Varje verktyg bygger på publicerad metodik — samma 20 AKM1-variabler och 25 AK1TS-celler som i rapportsidorna."
            />
            <ConsoleStat
              value="0"
              label="Push-notiser — pro-metod"
              caption="Du bestämmer när du tittar. Vi buffrar inte din uppmärksamhet med priser."
            />
          </div>
        </div>
      </section>

      {/* ───────────── TOOL TABS ───────────── */}
      <section id="lab-tools" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Konsolen</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
            Åtta verktyg — ett fönster mot marknaden.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tre verktyg är fullt utbyggda idag — Case Studies, Farliga
            komb. och Portfölj. De övriga fem är metodmål — vi visar dem
            ärligt som <HonestyTag kind="metodmal" /> istället för att
            låtsas att de redan finns.
          </p>

          <Tabs defaultValue="case-studies" className="mt-8">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex h-auto w-max flex-nowrap gap-1 rounded-lg bg-muted p-1">
                {TOOLS.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="flex-1 whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Case Studies — full implementation */}
            <TabsContent value="case-studies" className="mt-6">
              <CaseStudiesPanel
                filter={caseFilter}
                setFilter={setCaseFilter}
                cases={filteredCases}
                counts={{ all: CASES.length, best: bestCount, warning: warnCount }}
                onOpenCase={setActiveCase}
              />
            </TabsContent>

            {/* Farliga komb. — now a real combinations browser from DB */}
            <TabsContent value="farliga-komb" className="mt-6">
              <CombinationsBrowser />
            </TabsContent>

            {/* Portfölj — djup portföljbyggare med AKM1 + teknisk + AK1TS */}
            <TabsContent value="portfolj" className="mt-6">
              <PortfolioBuilder />
            </TabsContent>

            {/* Placeholder panels for the 6 remaining planned tools */}
            {TOOLS.filter((t) => t.planned && t.id !== "farliga-komb").map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-6">
                <PlannedToolPanel label={t.label} desc={t.desc} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ───────────── REPRODUCERBARHET ───────────── */}
      <section id="lab-calc" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Reproducerbarhet</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
            Varje verktyg bygger på publicerad metodik.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Du kan reproducera varje analys steg för steg. Inga hemliga
            källor, inga dolda formler — samma 20 AKM1-variabler och samma 25
            AK1TS-celler som i de publicerade rapportsidorna.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* AKM1 Calculator card */}
            <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.03] p-5">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gold" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Verktyg 1
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold">
                AKM1 Calculator
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Samma 20 variabler som i analyserna. Samma vikter, samma
                skala 1–5. Räkna ut din egen poäng.
              </p>
              <Button
                className="mt-4 bg-gold text-background hover:bg-gold/90"
                onClick={() => setCalcOpen(true)}
              >
                ÖPPNA <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>

            {/* Se publicerade analyser */}
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-ink dark:text-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Verktyg 2
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold">
                Se publicerade analyser
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Jämför dina resultat med våra. Varje analys är approximativt reproducerbar
                steg för steg — metoden är vår know-how, men data och slutsatser är öppna.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSection("prec")}
              >
                ÖPPNA <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>

            {/* Lär dig metoden */}
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-ink dark:text-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Verktyg 3
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold">
                Lär dig metoden
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Förstå varje variabel i en kurs. Power 20-kursen ger dig
                grunden.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSection("kurser")}
              >
                ÖPPNA <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* Principle strip */}
          <div className="mt-10 rounded-lg border border-gold/30 bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Princip 9
                </span>
                <span className="font-serif text-base font-bold sm:text-lg">
                  Reproducerbart — eller det finns inte.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <HonestyTag kind="matt" />
                <span className="text-xs text-muted-foreground">
                  AKM1-variabler: 19
                </span>
                <span className="hidden text-muted-foreground sm:inline">·</span>
                <span className="text-xs text-muted-foreground">
                  AK1TS-celler: 25
                </span>
                <span className="hidden text-muted-foreground sm:inline">·</span>
                <span className="text-xs text-muted-foreground">
                  Verktyg i konsolen: 8
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── INTERAKTIVT LÄRANDE ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Interaktivt lärande</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
            Gör lärandet roligt.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Quiz, flashcards och dagliga utmaningar — tjäna XP och klättra i
            nivåer.
          </p>

          {/* XP header */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Total XP
                </span>
              </div>
              <p className="mt-2 font-serif text-4xl font-bold tabular-nums">
                {progress.xp}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {levelInfo.nextAt > 0
                  ? `Nästa nivå vid ${levelInfo.nextAt} XP`
                  : "Högsta nivån nådd"}
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Crown className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Nivå
                </span>
              </div>
              <p className="mt-2 font-serif text-4xl font-bold tabular-nums">
                Lvl {levelInfo.level}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                {levelInfo.title}
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Övningar (streak)
                </span>
              </div>
              <p className="mt-2 font-serif text-4xl font-bold tabular-nums">
                {progress.streak}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Klara dagens utmaning för att bygga streaken
              </p>
            </Card>
          </div>

          {/* Three learning cards */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* Quiz */}
            <Card className="flex flex-col p-6">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/40 text-gold">
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Quiz
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold">Quiz</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                12 frågor om AKM1, risk och vågteori. Testa vad du kan.
              </p>
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className="border-gold/40 text-gold"
                >
                  50–100 XP PER FRÅGA
                </Badge>
              </div>
              <Button
                className="mt-4 bg-gold text-background hover:bg-gold/90"
                onClick={startQuiz}
              >
                Starta quiz <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>

            {/* Flashcards */}
            <Card className="flex flex-col p-6">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/40 text-gold">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Flashcards
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold">Flashcards</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                12 kort för snabb inlärning av alla nyckeltermer.
              </p>
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className="border-gold/40 text-gold"
                >
                  20 XP PER KORT
                </Badge>
              </div>
              <Button
                className="mt-4 bg-gold text-background hover:bg-gold/90"
                onClick={startFlashcards}
              >
                Börja bläddra <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>

            {/* Dagens utmaning */}
            <Card className="flex flex-col p-6">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/40 text-gold">
                  <Flame className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Dagens utmaning
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold">
                Dagens utmaning
              </h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                3 utmaningar — öva din streak. Kom tillbaka varje dag.
              </p>
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className="border-gold/40 text-gold"
                >
                  100–150 XP PER UTMANING
                </Badge>
              </div>
              <Button
                className="mt-4 bg-gold text-background hover:bg-gold/90"
                onClick={doDailyChallenge}
              >
                Klara utmaning <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* Toast */}
          {challengeToast && (
            <div className="mt-4 rounded-lg border border-bull/40 bg-bull/10 px-4 py-3 text-sm font-medium text-bull">
              <Check className="mr-1 inline h-4 w-4" /> {challengeToast}
            </div>
          )}

          {/* Continue exploring */}
          <div className="mt-12">
            <Eyebrow>◆ Fortsätt utforska</Eyebrow>
            <h3 className="mt-2 font-serif text-2xl font-bold">Gå vidare</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <CtaCard
                title="AKM1-kalkylatorn"
                sub="20 variabler — räkna ut din poäng"
                onClick={() => setCalcOpen(true)}
              />
              <CtaCard
                title="Lär dig metoden"
                sub="Power 20-kurser"
                onClick={() => setSection("kurser")}
              />
              <CtaCard
                title="Se analyser"
                sub="Jämför dina resultat"
                onClick={() => setSection("prec")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/*               DIALOGS                       */}
      {/* ═══════════════════════════════════════════ */}

      {/* Case detail dialog */}
      <Dialog
        open={activeCase !== null}
        onOpenChange={(o) => !o && setActiveCase(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {activeCase && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CaseTypeBadge type={activeCase.type} />
                  {activeCase.illustrative && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      Illustrativt
                    </Badge>
                  )}
                </div>
                <DialogTitle className="mt-2 font-serif text-2xl">
                  {activeCase.company}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono uppercase tracking-wider">
                  {activeCase.ticker}
                </DialogDescription>
              </DialogHeader>

              <div>
                <p className="font-serif text-lg font-semibold leading-snug">
                  {activeCase.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {activeCase.desc}
                </p>
              </div>

              {/* AKM1 score breakdown */}
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AKM1-poäng
                  </span>
                  <span
                    className={cn(
                      "font-serif text-2xl font-bold tabular-nums",
                      verdict(activeCase.score).color
                    )}
                  >
                    {activeCase.score}
                    <span className="text-base text-muted-foreground">/95</span>
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full transition-all",
                      activeCase.type === "best" ? "bg-bull" : "bg-bear"
                    )}
                    style={{ width: `${(activeCase.score / 95) * 100}%` }}
                  />
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avgörande AKM1-variabler
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeCase.decisive.map((v) => (
                      <Badge
                        key={v}
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          activeCase.type === "best"
                            ? "border-bull/40 text-bull"
                            : "border-bear/40 text-bear"
                        )}
                      >
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveCase(null)}>
                  Stäng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AKM1 Calculator dialog */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              AKM1 Calculator
            </DialogTitle>
            <DialogDescription>
              Sätt poäng 1–5 på var och en av de 20 variablerna. Räkna ut
              din totala AKM1-poäng (max 95).
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[55vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {AKM1_VARIABLES.map((v, i) => (
              <div
                key={v.id}
                className="rounded-md border border-border bg-card p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase text-gold">
                    {v.id}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {v.category}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium leading-snug">
                  {v.name}
                </p>
                <Select
                  value={String(calcScores[i])}
                  onValueChange={(val) =>
                    setCalcScores((prev) => {
                      const next = [...prev];
                      next[i] = Number(val);
                      return next;
                    })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="mt-2 h-8 w-full text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Result */}
          {calcResult !== null && (
            <div className="rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Resultat
                  </span>
                  <p
                    className={cn(
                      "font-serif text-3xl font-bold tabular-nums",
                      verdict(calcResult).color
                    )}
                  >
                    {calcResult}
                    <span className="text-base text-muted-foreground">/95</span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-current text-sm",
                    verdict(calcResult).color
                  )}
                >
                  {verdict(calcResult).label}
                </Badge>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gold transition-all"
                  style={{ width: `${(calcResult / 95) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {">"}75 = Stark · 50–75 = Bra · &lt;50 = Svag
                {calcXpAwarded && (
                  <span className="ml-1 text-bull">· +50 XP tillagd</span>
                )}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCalcReset}>
              <RotateCcw className="mr-1 h-4 w-4" /> Återställ
            </Button>
            <Button
              className="bg-gold text-background hover:bg-gold/90"
              onClick={handleCalcRun}
            >
              <Calculator className="mr-1 h-4 w-4" /> Räkna ut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              AKM1 Quiz
            </DialogTitle>
            <DialogDescription>
              {quizDone
                ? `Du svarade rätt på ${quizCorrect} av ${QUIZ.length} frågor.`
                : `Fråga ${quizIdx + 1} av ${QUIZ.length} · +75 XP per rätt svar`}
            </DialogDescription>
          </DialogHeader>

          {!quizDone ? (
            <div>
              <p className="font-serif text-lg font-semibold leading-snug">
                {QUIZ[quizIdx].q}
              </p>
              <div className="mt-4 grid gap-2">
                {QUIZ[quizIdx].options.map((opt, i) => {
                  const isCorrect = i === QUIZ[quizIdx].answer;
                  const isPicked = i === quizPicked;
                  const showResult = quizPicked !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => pickAnswer(i)}
                      disabled={showResult}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-all",
                        !showResult &&
                          "border-border bg-card hover:border-gold/50",
                        showResult && isCorrect && "border-bull/50 bg-bull/10",
                        showResult &&
                          isPicked &&
                          !isCorrect &&
                          "border-bear/50 bg-bear/10",
                        showResult &&
                          !isCorrect &&
                          !isPicked &&
                          "border-border bg-card opacity-60"
                      )}
                    >
                      <span>{opt}</span>
                      {showResult && isCorrect && (
                        <Check className="h-4 w-4 text-bull" />
                      )}
                      {showResult && isPicked && !isCorrect && (
                        <X className="h-4 w-4 text-bear" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizPicked !== null && (
                <div className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed">
                  <span className="font-semibold text-gold">Förklaring: </span>
                  {QUIZ[quizIdx].explanation}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setQuizOpen(false)}
                >
                  Avsluta
                </Button>
                <Button
                  className="bg-gold text-background hover:bg-gold/90"
                  onClick={nextQuestion}
                  disabled={quizPicked === null}
                >
                  {quizIdx + 1 < QUIZ.length
                    ? "Nästa fråga"
                    : "Avsluta quiz"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold/40 text-gold">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="mt-3 font-serif text-3xl font-bold">
                {quizCorrect} / {QUIZ.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {quizCorrect === QUIZ.length
                  ? "Perfekt — du har behärskning."
                  : quizCorrect >= 3
                    ? "Bra jobbat. Fortsätt öva."
                    : "Läs om AKM1 och försök igen."}
              </p>
              <p className="mt-2 text-xs text-bull">
                +{quizCorrect * 75} XP tillagd · Quiz markerat som klarat
              </p>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizIdx(0);
                    setQuizPicked(null);
                    setQuizCorrect(0);
                    setQuizDone(false);
                  }}
                >
                  <RefreshCw className="mr-1 h-4 w-4" /> Gör om
                </Button>
                <Button
                  className="bg-gold text-background hover:bg-gold/90"
                  onClick={() => setQuizOpen(false)}
                >
                  Stäng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flashcards dialog */}
      <Dialog open={fcOpen} onOpenChange={setFcOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Flashcards
            </DialogTitle>
            <DialogDescription>
              Kort {fcIdx + 1} av {FLASHCARDS.length} · Vänd kortet för
              definitionen · +20 XP per vändning
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={flipCard}
            className="relative flex min-h-[180px] w-full items-center justify-center rounded-lg border-2 border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-8 text-center transition-all hover:border-gold/60"
          >
            {!fcFlipped ? (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Term
                </span>
                <p className="mt-2 font-serif text-3xl font-bold">
                  {FLASHCARDS[fcIdx].term}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Klicka för att vända →
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Definition
                </span>
                <p className="mt-2 text-base leading-relaxed">
                  {FLASHCARDS[fcIdx].def}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Klicka för att vända tillbaka ↺
                </p>
              </div>
            )}
          </button>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFcOpen(false)}>
              Avsluta
            </Button>
            <Button
              className="bg-gold text-background hover:bg-gold/90"
              onClick={nextCard}
            >
              {fcIdx + 1 < FLASHCARDS.length ? "Nästa kort" : "Klart"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ConsoleStat({
  value,
  label,
  caption,
}: {
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        <HonestyTag kind="matt" />
      </div>
      <p className="mt-2 font-serif text-5xl font-bold leading-none tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto sm:mx-0">
        {caption}
      </p>
    </div>
  );
}

function CaseTypeBadge({ type }: { type: CaseType }) {
  if (type === "best") {
    return (
      <Badge className="border-bull/40 bg-bull/10 text-bull">
        <Check className="h-3 w-3" /> BÄSTA FALL
      </Badge>
    );
  }
  return (
    <Badge className="border-bear/40 bg-bear/10 text-bear">
      <AlertTriangle className="h-3 w-3" /> VARNINGSFALL
    </Badge>
  );
}

function CaseStudiesPanel({
  filter,
  setFilter,
  cases,
  counts,
  onOpenCase,
}: {
  filter: CaseFilter;
  setFilter: (f: CaseFilter) => void;
  cases: CaseStudy[];
  counts: { all: number; best: number; warning: number };
  onOpenCase: (c: CaseStudy) => void;
}) {
  return (
    <div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            Verkliga fall · Case Studies
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Hur AKM1 fungerar i verkligheten — när indikatorer samverkar rätt
          och fel.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <HonestyTag kind="matt" />
          <span className="text-xs text-muted-foreground">
            Verktyg i konsolen: 8
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(
          [
            { id: "all", label: "ALLA", n: counts.all },
            { id: "best", label: "BÄSTA FALL", n: counts.best },
            { id: "warning", label: "VARNINGSFALL", n: counts.warning },
          ] as { id: CaseFilter; label: string; n: number }[]
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all",
              filter === f.id
                ? "border-gold bg-gold text-background"
                : "border-border bg-card text-muted-foreground hover:border-gold/40"
            )}
          >
            {f.label}
            <span
              className={cn(
                "tabular-nums",
                filter === f.id
                  ? "text-background/80"
                  : "text-muted-foreground/80"
              )}
            >
              ({f.n})
            </span>
          </button>
        ))}
      </div>

      {/* Case grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <CaseCard key={`${c.ticker}-${i}`} c={c} onOpen={() => onOpenCase(c)} />
        ))}
      </div>

      {cases.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Inga fall i denna kategori.
        </p>
      )}
    </div>
  );
}

function CaseCard({ c, onOpen }: { c: CaseStudy; onOpen: () => void }) {
  const isBest = c.type === "best";
  const scorePct = (c.score / 95) * 100;
  return (
    <Card
      className={cn(
        "group flex flex-col p-5 transition-all hover:shadow-md",
        isBest ? "border-bull/25" : "border-bear/25"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <CaseTypeBadge type={c.type} />
        {c.illustrative && (
          <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
            Illustrativt
          </Badge>
        )}
      </div>

      <div className="mt-3">
        <p className="font-serif text-base font-bold leading-tight">
          {c.company}
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {c.ticker}
        </p>
      </div>

      <p className="mt-2 text-sm font-medium leading-snug">{c.title}</p>
      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground leading-relaxed">
        {c.desc}
      </p>

      {/* Score */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>AKM1</span>
          <span
            className={cn(
              "tabular-nums",
              isBest ? "text-bull" : "text-bear"
            )}
          >
            {c.score}/95
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all",
              isBest ? "bg-bull" : "bg-bear"
            )}
            style={{ width: `${scorePct}%` }}
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={onOpen}
      >
        LÄS <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}

function PlannedToolPanel({
  label,
  desc,
}: {
  label: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gold/40 bg-card p-8 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 border border-gold/40 text-gold">
        <Lock className="h-5 w-5" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="font-serif text-xl font-bold">{label}</span>
        <HonestyTag kind="metodmal" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        Under utveckling · METODMÅL
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <HonestyTag kind="matt" />
        <span className="text-xs text-muted-foreground">
          Verktyg i konsolen: 8
        </span>
      </div>
    </div>
  );
}

function CtaCard({
  title,
  sub,
  onClick,
}: {
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-gold/50 hover:shadow-md"
    >
      <span>
        <span className="block font-serif text-lg font-bold">{title}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
    </button>
  );
}

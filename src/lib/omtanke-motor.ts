/**
 * AK1A OMTANKE-MOTOR — ekosystemets nervsystem.
 *
 * Kunddirektivet: "Systemet ska veta vad klienten vill innan den tänker på
 * något sätt... mönsteranalys 24/7... chocka klienterna med hänsyn och ställa
 * frågor och bry oss om deras ekonomi — inte för att tjäna på dem... sidan ska
 * interagera med alla system dynamiskt och agera som en kropp, känna på
 * varandra och jobba harmoniskt."
 *
 * Designprinciper:
 *  1. VÄRME — tonen är en mentor som lyssnar, aldrig en säljare som pushar.
 *  2. FÖRE FRÅGAN — motorn härleder klientens tillstånd ur redan insamlade
 *     signaler (tracer, quiz-progress, chat-minne, profil, XP) och agerar
 *     INNAN klienten behöver be om hjälp.
 *  3. ALDRIG PÅTRÄNGANDE — max en omsorgsnotis per 24 h; graderad ton efter
 *     hur länge klienten varit borta (värme ökar, kraven minskar).
 *  4. KROPPEN — lasPuls() samlar alla systems tillstånd i ett slag; varje
 *     system kan "känna" de andra via pulsen (harmentyret).
 *  5. ÄRLIGHET — motorn gissar aldrig; osäkerhet => ingen åtgärd.
 *     (Samma princip som portfolj-vagor.ts: "osatt" är hedervärt.)
 *
 * KLIENTSIDA ONLY (localStorage-läsning). Kör vid varje sidvisning via
 * ekosystemPuls(); konsumeras av notis-centret (typ "omtanje") och
 * AI-Mentorn (proaktiv hälsning).
 */

// ── Signaler (allt som redan finns — ingen ny insamling) ─────────────────────

export type OmtankeSignaler = {
  /** Tracer: sidbesök i ordning (ak1a-tracer-v1). */
  tracerSidor: string[];
  /** Medlemsdata: XP, nivå, streak (ak1a-member). */
  xp: number | null;
  niva: number | null;
  streak: number | null;
  /** Antal mentor-samtal (ak1a-chat-minne-v1: räknas elevfrågor). */
  mentorFragor: number;
  /** Senaste mentor-frågans text (för rädsla-detektion). */
  senasteMentorFraga: string | null;
  /** Senaste aktivitet (ISO) — senaste tracer-postens tid om finns. */
  senastAktiv: string | null;
  /** Har klienten godkänt kak-samtycke minst en gång? */
  inteForstaBesok: boolean;
  /** Kognitiv profil svarad? (ak1a-kognitiv-profil / nyckel kan variera) */
  profilSvarad: boolean;
};

export function lasSignaler(): OmtankeSignaler {
  const las = (nyckel: string): unknown => {
    if (typeof window === "undefined") return null;
    try {
      const rå = window.localStorage.getItem(nyckel);
      return rå ? JSON.parse(rå) : null;
    } catch {
      return null;
    }
  };

  // Tracer: format kan vara array av {sida,ts} eller liknande — läs resilient.
  const tracer = las("ak1a-tracer-v1");
  let tracerSidor: string[] = [];
  let senastAktiv: string | null = null;
  if (Array.isArray(tracer)) {
    const poster = tracer as Array<Record<string, unknown>>;
    tracerSidor = poster.map((p) => String(p.sida ?? p.sektion ?? p.path ?? "")).filter(Boolean);
    const ts = poster.map((p) => p.ts ?? p.tid ?? null).filter(Boolean);
    if (ts.length > 0) senastAktiv = String(ts[ts.length - 1]);
  } else if (tracer && typeof tracer === "object") {
    const t = tracer as Record<string, unknown>;
    if (Array.isArray(t.sidor)) tracerSidor = (t.sidor as unknown[]).map(String);
    if (typeof t.senast === "string") senastAktiv = t.senast;
  }

  const member = las("ak1a-member") as Record<string, unknown> | null;

  const chatMinne = las("ak1a-chat-minne-v1");
  let mentorFragor = 0;
  let senasteMentorFraga: string | null = null;
  if (Array.isArray(chatMinne)) {
    const turer = chatMinne as Array<{ roll?: string; text?: string }>;
    const fragor = turer.filter((t) => t.roll === "du" && typeof t.text === "string");
    mentorFragor = fragor.length;
    senasteMentorFraga = fragor.length > 0 ? fragor[fragor.length - 1].text! : null;
  }

  return {
    tracerSidor,
    xp: member && typeof member.xp === "number" ? member.xp : null,
    niva: member && typeof member.niva === "number" ? member.niva : null,
    streak: member && typeof member.streak === "number" ? member.streak : null,
    mentorFragor,
    senasteMentorFraga,
    senastAktiv,
    inteForstaBesok: window.localStorage.getItem("ak1a-cookie-samtycke") !== null,
    profilSvarad:
      window.localStorage.getItem("ak1a-kognitiv-profil") !== null ||
      window.localStorage.getItem("ak1a-kognitiv-profil-v1") !== null,
  };
}

// ── Tillstånd → omsorgsåtgärd ────────────────────────────────────────────────

export type OmtankeTillstand =
  | "ny-still"          // ny/nyligen aktiv men aldrig startat — rädd eller vet inte var börja
  | "fastnad"           // återkommer till samma sida utan progression
  | "radslOro"          // frågat om svårt/rädd/förstår-ej i chatten
  | "glod"              // momentum: aktiv + växer — bekräfta och visa nästa steg
  | "ensidig"           // bara en typ av innehåll — bjud in till bredd
  | "aterkomsten"       // borta länge, nu tillbaka — värme, inga krav
  | "harmoni";          // allt balanserat — tystnad är guld (ingen notis)

export type OmtankeAtgard = {
  tillstand: OmtankeTillstand;
  /** Vår fråga till klienten — alltid en fråga, aldrig en uppmaning. */
  fraga: string;
  /** Vart svaret leder (länk) — klienten väljer själva. */
  lank: string;
  lankText: string;
  /** Kort intern notering för notis-centret. */
  notisText: string;
  /** Prioritet 1-3 (1 = visa först vid flera kandidater). */
  prioritet: 1 | 2 | 3;
};

const RADSLA_ORD = /rädd|orolig|svårt|svårt|förstår inte|inte förstår|avancerat|för mycket|överrumpl|borttappat|hinner inte|känns dum|felt|fel av mig|osäker/i;

/** Kärnan: härled tillstånd → åtgärd. Kör på varje pulsslag. */
export function lasOmtanke(s: OmtankeSignaler): OmtankeAtgard | null {
  const dagarBorta = s.senastAktiv
    ? Math.floor((Date.now() - new Date(s.senastAktiv).getTime()) / 86_400_000)
    : null;

  // 1. Rädslo-oro — högst prioritet: någon har sagt ifrån att det känns svårt.
  if (s.senasteMentorFraga && RADSLA_ORD.test(s.senasteMentorFraga)) {
    return {
      tillstand: "radslOro",
      fraga:
        "Du skrev att något känns svårt — det är helt normalt, och det är vårt jobb att göra det enkelt. Vill du att vi tar det från början, i ditt tempo?",
      lank: "/dagens-pass",
      lankText: "Börja med dagens 5-minuterspass",
      notisText: "Oro upptäckt i mentor-samtalet — omsorgserbjudande skickat.",
      prioritet: 1,
    };
  }

  // 2. Återkommen efter frånvaro — värme utan krav (dag 7+).
  if (dagarBorta !== null && dagarBorta >= 7) {
    return {
      tillstand: "aterkomsten",
      fraga:
        `Välkommen tillbaka! Det har gått ${dagarBorta} dagar — inget stress, allt står kvar precis som du lämnade det. Vill du att mentorn gör en snabb sammanfattning av var du var?`,
      lank: "/min-sida",
      lankText: "Visa var jag var",
      notisText: `Återkomst efter ${dagarBorta} dagar — välkomsthälsning.`,
      prioritet: 2,
    };
  }

  // 3. Ny och still — aktivitet finns men ingen progression alls.
  const unikaSidor = new Set(s.tracerSidor);
  if (s.mentorFragor === 0 && (s.xp === null || s.xp < 20) && unikaSidor.size >= 3) {
    return {
      tillstand: "ny-still",
      fraga:
        "Vi har märkt att du tittar runt men ännu inte påbörjat något — vill du att vi visar den enklaste vägen in, steg för steg? Ingen kunskap krävs i förväg.",
      lank: "/kurser/the-intelligent-investor",
      lankText: "Visa första steget (2 minuter)",
      notisText: "Ny klient utan start — erbjudande om guidad ingång.",
      prioritet: 2,
    };
  }

  // 4. Fastnad — samma sida ≥ 5 besök.
  const rakna = new Map<string, number>();
  for (const sida of s.tracerSidor.slice(-25)) rakna.set(sida, (rakna.get(sida) ?? 0) + 1);
  let fastSida: string | null = null;
  for (const [sida, n] of rakna) if (n >= 5) fastSida = sida;
  if (fastSida && s.mentorFragor <= 1) {
    return {
      tillstand: "fastnad",
      fraga:
        "Du har återvänt till samma sida flera gånger — det brukar betyda att något känns otydligt. Vill du att mentorn förklarar det på ett enklare sätt, med ett exempel?",
      lank: "/?chat=1",
      lankText: "Fråga mentorn",
      notisText: `Fastnad på ${fastSida} — erbjudande om förklaring.`,
      prioritet: 2,
    };
  }

  // 5. Glöd — streak + aktiv mentor.
  if ((s.streak ?? 0) >= 3 && s.mentorFragor >= 2) {
    return {
      tillstand: "glod",
      fraga:
        `Du är i flyt — ${s.streak} dagar i rad och dina frågor blir djupare. Vill du se vad som vanligtvis kommer härnäst på din nivå?`,
      lank: "/min-sida",
      lankText: "Visa nästa steg",
      notisText: `Glöd: streak ${s.streak} — nästa-steg-förslag.`,
      prioritet: 3,
    };
  }

  // 6. Ensidig — bara kurser eller bara verktyg (aldrig båda).
  const oppnaKurser = s.tracerSidor.some((p) => p.includes("/kurser/"));
  const oppnaVerktyg = s.tracerSidor.some((p) => /kalkylator|vagfundament|konfluens|netnet|superanalys/.test(p));
  if (oppnaKurser && !oppnaVerktyg && s.tracerSidor.length >= 10) {
    return {
      tillstand: "ensidig",
      fraga:
        "Du läser mycket kurser — vill du prova att sätta kunskapen i spel i kalkylatorn? Det är där teorin blir din egen. Vi går bredvid, steg för steg.",
      lank: "/kalkylator",
      lankText: "Prova kalkylatorn med vägledning",
      notisText: "Ensidigt kursfokus — verktygsinbjudan.",
      prioritet: 3,
    };
  }

  // 7. Harmoni — inget behov av att synas. Tystnad är också omtanke.
  return null;
}

// ── Kroppen: ekosystem-pulsen ("känna på varandra") ──────────────────────────

export type EkosystemPuls = {
  ts: string;
  /** Klientens omsorgsläge just nu. */
  omtanke: OmtankeAtgard | null;
  /** Systemöverblick — varje system "känner" de andra via detta slag. */
  system: {
    tracerAktiv: boolean;
    mentorMinneAktivt: boolean;
    profilSvarad: boolean;
    medlemAktiv: boolean;
  };
};

/**
 * Ekosystemets hjärtslag — kör vid varje sidvisning. Samlar signaler från
 * alla system, härleder omsorgsläget och returnerar pulsen. Notis-centret
 * pollar denna; AI-Mentorn läser den för proaktiva hälsningar.
 */
export function ekosystemPuls(): EkosystemPuls {
  const signaler = lasSignaler();
  return {
    ts: new Date().toISOString(),
    omtanke: lasOmtanke(signaler),
    system: {
      tracerAktiv: signaler.tracerSidor.length > 0,
      mentorMinneAktivt: signaler.mentorFragor > 0,
      profilSvarad: signaler.profilSvarad,
      medlemAktiv: signaler.xp !== null,
    },
  };
}

// ── Cooldown — max en omsorgsnotis per 24 h ──────────────────────────────────

const COOLDOWN_NYCKEL = "ak1a-omtanje-v1";

export function omtankeTillaten(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const senast = window.localStorage.getItem(COOLDOWN_NYCKEL);
    if (!senast) return true;
    return Date.now() - Number(senast) > 86_400_000;
  } catch {
    return false;
  }
}

export function markeraOmtankeVisad(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOLDOWN_NYCKEL, String(Date.now()));
  } catch {
    /* ignorera */
  }
}

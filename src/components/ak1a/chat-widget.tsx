"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { lasMedlem, niva, lasXP, lasKlaraKurser, lasStjarnor, addXP, lasStreak } from "@/lib/member-local";
import {
  forfallnaKort,
  bedomKort,
  forjanaXP,
  srStatistik,
  ALLA_KORT,
  type SRKort,
} from "@/lib/spaced-repetition";

/**
 * AI-MENTOR PRO — Superintelligent guide som:
 * 
 * 1. KÄNNER ELEVEN: nivå, XP, klarade kurser, senaste aktivitet
 * 2. KÄNNER PLATSEN: var på sajten eleven befinner sig just nu
 * 3. GER HANDLINGAR: klickbara knappar som tar eleven exakt dit den behöver
 * 4. ANTICIPERAR: föreslår nästa steg INNAN eleven frågar
 * 5. FÖLJER AKM1/AK1TS: alla svar strukturerade efter ekosystemet
 * 6. ÄR PROAKTIV: "jag ser att du är på kurssidan — vill du testa dig?"
 * 7. HANTERAR SYSTEMET: kan navigera eleven till ALLT på sajten
 * 8. LÄR SIG: sparar elevens preferenser och anpassar sig
 */

type Handling = { text: string; lank: string; ikon: string; beskrivning?: string };
type Meddelande = { fran: "du" | "ai"; text: string; handlings?: Handling[]; ikon?: string };

type elevContext = {
  niva: number;
  xp: number;
  klaraKurser: number;
  stjarnor: number;
  inloggad: boolean;
  aktuellSida: string;
  sidTyp: "kurs" | "analys" | "kalkylator" | "portfölj" | "blogg" | "labb" | "läroplan" | "start" | "admin" | "annan";
};

function analyseraSida(pathname: string): elevContext["sidTyp"] {
  if (!pathname) return "start";
  if (pathname.startsWith("/kurser/")) return "kurs";
  if (pathname.startsWith("/kurser")) return "kurs";
  if (pathname.startsWith("/analyser")) return "analys";
  if (pathname.startsWith("/kalkylator")) return "kalkylator";
  if (pathname.startsWith("/min-portfolj")) return "portfölj";
  if (pathname.startsWith("/blogg")) return "blogg";
  if (pathname.startsWith("/labb")) return "labb";
  if (pathname.startsWith("/laroplan")) return "läroplan";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/") return "start";
  return "annan";
}

/** Generera proaktiva förslag baserat på KONTEXT */
function proaktivaForslag(ctx: elevContext): Handling[] {
  const forslag: Handling[] = [];

  // Baserat på aktuell sida
  switch (ctx.sidTyp) {
    case "kurs":
      forslag.push(
        { text: "Testa dig (quiz)", lank: "#quiz", ikon: "🧠", beskrivning: "Visa quiz i denna kurs" },
        { text: "Räkna på en aktie", lank: "/kalkylator", ikon: "🧮", beskrivning: "Öppna kalkylatorn" },
        { text: "Nästa kurs i läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Se var du är" },
      );
      break;
    case "kalkylator":
      forslag.push(
        { text: "Var hittar jag siffrorna?", lank: "#guide", ikon: "📖", beskrivning: "Årsredovisningsguide" },
        { text: "Läs en årsredovisning", lank: "/blogg/sa-laser-du-en-svensk-arsredovisning", ikon: "📚", beskrivning: "Steg-för-steg" },
        { text: "Bygg portfölj med dina siffror", lank: "/min-portfolj", ikon: "💼", beskrivning: "Lägg in aktier" },
      );
      break;
    case "portfölj":
      forslag.push(
        { text: "Kör djupanalys", lank: "#djup", ikon: "🔬", beskrivning: "Python-motor med live-data" },
        { text: "Lär dig ekosystemet", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "5×5×4-kursen" },
        { text: "Läs din portföljrapport", lank: "/blogg/sa-laser-du-din-portfoljrapport", ikon: "📖", beskrivning: "Guiden" },
      );
      break;
    case "analys":
      forslag.push(
        { text: "Räkna själv i kalkylatorn", lank: "/kalkylator", ikon: "🧮", beskrivning: "Verifiera siffrorna" },
        { text: "Graham: Marginal of Safety", lank: "/kurser/the-intelligent-investor", ikon: "🌉", beskrivning: "Lär dig marginalen" },
        { text: "Lägg bolaget i din portfölj", lank: "/min-portfolj", ikon: "💼", beskrivning: "Spåra det" },
      );
      break;
    case "läroplan":
      forslag.push(
        { text: "Fortsätt där du slutade", lank: "/kurser", ikon: "▶️", beskrivning: "Din nästa kurs" },
        { text: "Testa din nivå", lank: "/profil", ikon: "🧠", beskrivning: "Kognitiv profil" },
      );
      break;
    case "start":
      forslag.push(
        { text: "Börja här: Läroplanen", lank: "/laroplan", ikon: "🌱", beskrivning: "5 nivåer till självständighet" },
        { text: "Testa din personlighet", lank: "/profil", ikon: "🧠", beskrivning: "3-min scenario-test" },
        { text: "Räkna på en aktie", lank: "/kalkylator", ikon: "🧮", beskrivning: "20 variabler" },
      );
      break;
    case "blogg":
      forslag.push(
        { text: "Fortsätt lära", lank: "/laroplan", ikon: "🌱", beskrivning: "Strukturerad utbildning" },
        { text: "Alla artiklar", lank: "/blogg", ikon: "✍️", beskrivning: "29 artiklar" },
      );
      break;
    default:
      forslag.push(
        { text: "Läroplanen", lank: "/laroplan", ikon: "🗺️" },
        { text: "Kalkylatorn", lank: "/kalkylator", ikon: "🧮" },
        { text: "Min portfölj", lank: "/min-portfolj", ikon: "💼" },
      );
  }

  // Baserat på elevens nivå
  if (ctx.niva >= 25 && ctx.sidTyp !== "portfölj") {
    forslag.push({ text: "🎓redo för Fas 2 — ansök", lank: "/medlemskap#fas2", ikon: "🎓", beskrivning: "Nivå 25+ uppnådd!" });
  }

  if (!ctx.inloggad) {
    forslag.unshift({ text: "Logga in gratis — lås upp allt", lank: "/logga-in", ikon: "🔑", beskrivning: "20 sek, ingen betalning" });
  }

  return forslag.slice(0, 4);
}

/** Blanda samtliga 100 kort (övning även när inget är förfallet) */
function blandaKort(): SRKort[] {
  const ko = [...ALLA_KORT];
  for (let i = ko.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ko[i], ko[j]] = [ko[j], ko[i]];
  }
  return ko.slice(0, 10);
}

/** Kontextmedveten hälsning */
function halsning(ctx: elevContext): string {  const timme = new Date().getHours();
  const tid = timme < 10 ? "God morgon" : timme < 13 ? "God dag" : timme < 18 ? "God eftermiddag" : "God kväll";

  if (!ctx.inloggad) {
    return `${tid}! 👋 Jag är din AI-mentor. Jag ser att du är på ${ctx.sidTyp === "start" ? "startsidan" : ctx.sidTyp + "-sidan"}. Logga in gratis så hjälper jag dig komma igång — eller klicka på någon av länkarna nedan.`;
  }

  const klaraProcent = Math.round((ctx.klaraKurser / 227) * 100);

  switch (ctx.sidTyp) {
    case "kurs":
      return `${tid}, Nivå ${ctx.niva}! 📚 Jag ser att du läser en kurs. Quiz:et nedan kan ge dig +10 XP per rätt svar. Vill du att jag tar dig till nästa steg?`;
    case "kalkylator":
      return `${tid}! 🧮 Redan på kalkylatorn — bra! Om du behöver hjälp att hitta siffrorna, kolla årsredovisningsguiden. Annars är jag här.`;
    case "portfölj":
      return `${tid}, Nivå ${ctx.niva}! 💼 Jag ser din portfölj. Har du testat djupanalysen? Python-motorn hämtar live-data och ger dig en 25-cellers-matris.`;
    case "läroplan":
      return `${tid}! 🗺️ Du har klarat ${ctx.klaraKurser} kurser (${klaraProcent}%). Din nästa utmaning väntar — klicka på en kurs nedan.`;
    default:
      return `${tid}, Nivå ${ctx.niva}! ⭐ ${ctx.xp} XP · ${ctx.klaraKurser} kurser klarade. Vad vill du göra nu?`;
  }
}

export function ChatWidget() {
  const [oppnad, setOppnad] = useState(false);
  const [meddelanden, setMeddelanden] = useState<Meddelande[]>([]);
  const [fragor, setFraga] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrerad, setHydrerad] = useState(false);

  // ── SPACED REPETITION-session i chatten ──
  const [srAktiv, setSrAktiv] = useState(false);
  const [srKo, setSrKo] = useState<SRKort[]>([]);
  const [srIndex, setSrIndex] = useState(0);
  const [srVisaSvar, setSrVisaSvar] = useState(false);
  const [srResultat, setSrResultat] = useState({ svara: 0, bra: 0, latta: 0, xp: 0 });
  const [srForfallna, setSrForfallna] = useState(0);

  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bygg elev-kontext — ENDAST på klienten (localStorage kräver browser)
  const [ctx, setCtx] = useState<elevContext>({
    niva: 1, xp: 0, klaraKurser: 0, stjarnor: 0,
    inloggad: false, aktuellSida: "/", sidTyp: "start",
  });

  useEffect(() => {
    setCtx({
      niva: niva(),
      xp: lasXP(),
      klaraKurser: lasKlaraKurser().length,
      stjarnor: lasStjarnor(),
      inloggad: Boolean(lasMedlem()),
      aktuellSida: pathname || "/",
      sidTyp: analyseraSida(pathname || "/"),
    });
    setSrForfallna(forfallnaKort(1000).length);
    setHydrerad(true);
  }, [pathname]);

  // ── SR: starta repetitionssession ──
  const startaSR = useCallback((alla: boolean = false) => {
    const ko = alla ? blandaKort() : forfallnaKort(10);
    if (ko.length === 0) {
      const st = srStatistik();
      setMeddelanden((p) => [...p, {
        fran: "ai",
        ikon: "🃏",
        text: `Inga kort förfallna idag — perfekt discipl! 🌟\n\nDin statistik: ${st.beharskade}/${st.totalt} behärskade (sitter i långt minne) · ${st.repetitionerTotalt} repetitioner totalt.\nNästa kort förfaller ${st.nastaNasta || "snart"}. Glömskekurvan jobbar för dig — kom tillbaka imorgon.`,
        handlings: [
          { text: "Blanda samtliga 100 kort", lank: "sr:alla", ikon: "🎴", beskrivning: "Övning trots inga förfallna" },
          { text: "Tillbaka till lärandet", lank: "/laroplan", ikon: "🗺️", beskrivning: "Nästa steg" },
        ],
      }]);
      return;
    }
    setSrKo(ko);
    setSrIndex(0);
    setSrVisaSvar(false);
    setSrResultat({ svara: 0, bra: 0, latta: 0, xp: 0 });
    setSrAktiv(true);
  }, []);

  // ── SR: betygsätt kort (SM-2: Svär=2, Bra=4, Lätt=5) ──
  const bedom = useCallback((kvalitet: 2 | 4 | 5) => {
    const kort = srKo[srIndex];
    if (!kort) return;
    bedomKort(kort.id, kvalitet);

    let xpFortjanat = 0;
    if (kvalitet >= 4 && forjanaXP(kort.id)) {
      addXP(5);
      xpFortjanat = 5;
    }
    const ny = {
      svara: srResultat.svara + (kvalitet === 2 ? 1 : 0),
      bra: srResultat.bra + (kvalitet === 4 ? 1 : 0),
      latta: srResultat.latta + (kvalitet === 5 ? 1 : 0),
      xp: srResultat.xp + xpFortjanat,
    };
    setSrResultat(ny);

    if (srIndex + 1 >= srKo.length) {
      // Session klar → sammanfattning
      setSrAktiv(false);
      setSrKo([]);
      const total = ny.svara + ny.bra + ny.latta;
      const st = srStatistik();
      setMeddelanden((p) => [...p, {
        fran: "ai",
        ikon: "🏆",
        text: `Repetitionssession klar! 🏆\n\n${total} kort repeterade: ${ny.latta} ⚡ lätta · ${ny.bra} ✅ bra · ${ny.svara} 🔁 svåra (kommer igen imorgon).\n+${ny.xp} XP förtjänade.\n\nTotalt: ${st.beharskade}/${st.totalt} kort i långt minne. Glömskekurvan bestämmer när nästa kort dyker upp — jag påminner dig här.`,
        handlings: [
          { text: "Fortsätt lära", lank: "/laroplan", ikon: "🗺️", beskrivning: "Nästa steg i utbildningen" },
          { text: "Testa mig på en kurs", lank: "/kurser", ikon: "🧠", beskrivning: "Quiz: +10 XP per rätt svar" },
        ],
      }]);
    } else {
      setSrIndex((i) => i + 1);
      setSrVisaSvar(false);
    }
  }, [srKo, srIndex, srResultat]);

  // Nollställ ev. SR-läge när chatten stängs
  useEffect(() => {
    if (!oppnad && srAktiv) {
      setSrAktiv(false);
      setSrKo([]);
    }
  }, [oppnad, srAktiv]);

  // Initiera med proaktiv hälsning när chatt öppnas
  useEffect(() => {
    if (oppnad && meddelanden.length === 0) {
      setMeddelanden([
        { fran: "ai", text: halsning(ctx), handlings: proaktivaForslag(ctx) }
      ]);
    }
  }, [oppnad, ctx]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [meddelanden, srIndex, srVisaSvar, srAktiv]);

  // Uppdatera vid sidbyte
  useEffect(() => {
    if (oppnad && meddelanden.length > 0) {
      setMeddelanden((p) => [...p.slice(-4), {
        fran: "ai",
        text: `Jag följer med dig — vi är nu på ${ctx.sidTyp}-sidan. ${ctx.sidTyp === "kurs" ? "Vill du testa quiz:et?" : ctx.sidTyp === "kalkylator" ? "Behöver du årsredovisningsguiden?" : "Här är nästa steg:"}`,
        handlings: proaktivaForslag(ctx),
      }]);
    }
  }, [pathname]);

  const skicka = async (text?: string) => {
    const q = (text ?? fragor).trim();
    if (!q || busy) return;
    setFraga("");

    // Intercept: repetition startas lokalt (SM-2 går via localStorage, ej API)
    if (/repeter|flashcard|minnesträning|flashkort/i.test(q)) {
      setMeddelanden((p) => [...p, { fran: "du", text: q }]);
      startaSR(/alla|blanda/i.test(q));
      return;
    }

    setMeddelanden((p) => [...p, { fran: "du", text: q }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fraga: q, sokvag: pathname }),
      });
      const data = await res.json();

      // Om svaret har en länk som inte börjar med # — navigera direkt
      if (data.handlings?.length === 1 && !data.handlings[0].lank.startsWith("#")) {
        // Ett enda alternativ = navigera automatiskt
        setMeddelanden((p) => [...p, {
          fran: "ai",
          text: data.svar || "Tar dig dit...",
          handlings: data.handlings,
        }]);
        setTimeout(() => router.push(data.handlings[0].lank), 800);
      } else {
        setMeddelanden((p) => [...p, {
          fran: "ai",
          text: data.svar || "…",
          handlings: data.handlings,
        }]);
      }
    } catch {
      setMeddelanden((p) => [...p, { fran: "ai", text: "Nätverksfel — försök igen." }]);
    } finally {
      setBusy(false);
    }
  };

  // Snabbkommandon
  const snabbKommandon = [
    { text: "Börja lära", ikon: "🌱", fraga: "jag vill börja lära mig aktieanalys" },
    { text: "Räkna", ikon: "🧮", fraga: "kalkylator" },
    { text: "Portfölj", ikon: "💼", fraga: "portfölj" },
    { text: "Testa mig", ikon: "🧠", fraga: "testa min nivå" },
    { text: "Repetera", ikon: "🃏", fraga: "repetera" },
    { text: "Nästa steg", ikon: "➡️", fraga: "vad är nästa steg för mig" },
  ];

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {oppnad && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border-2 border-gold bg-paper shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gold px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold">AI-Mentor</span>
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px]">
                Nivå {ctx.niva} · {ctx.xp} XP
              </span>
              {hydrerad && lasStreak().antal > 0 && (
                <span
                  className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-bold"
                  title={`Daglig kedja: ${lasStreak().antal} dag${lasStreak().antal > 1 ? "ar" : ""} (bästa: ${lasStreak().basta})`}
                >
                  🔥 {lasStreak().antal}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-80">{ctx.sidTyp}</span>
              {hydrerad && srForfallna > 0 && (
                <button
                  onClick={() => startaSR()}
                  className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-bold hover:bg-primary-foreground/25"
                  title={`${srForfallna} flashcards förfallna — repetera nu`}
                >
                  🃏 {srForfallna} förfallna
                </button>
              )}
              <button onClick={() => setOppnad(false)} aria-label="Stäng" className="text-lg leading-none">×</button>
            </div>
          </div>

          {/* Snabbkommandon */}
          <div className="flex gap-1 border-b border-gold/20 bg-gold/5 px-2 py-2">
            {snabbKommandon.map((k) => (
              <button
                key={k.text}
                onClick={() => skicka(k.fraga)}
                className="flex-1 rounded-lg border border-gold/20 bg-paper px-1 py-1.5 text-[10px] font-medium hover:border-gold/50 hover:bg-gold/10"
              >
                {k.ikon} {k.text}
              </button>
            ))}
          </div>

          {/* Meddelanden */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">

            {/* ── SPACED REPETITION-session ── */}
            {srAktiv && srKo[srIndex] && (
              <div className="rounded-xl border-2 border-gold/40 bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                    🃏 {srKo[srIndex].kategori}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Kort {srIndex + 1}/{srKo.length} · +5 XP per bra svar
                  </span>
                </div>
                <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-gold/10">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: `${((srIndex) / srKo.length) * 100}%` }}
                  />
                </div>

                {/* Framsidan — alltid synlig */}
                <div className="rounded-lg border border-gold/20 bg-paper/60 px-3 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">FRÅGA</div>
                  <div className="mt-1 text-sm font-semibold leading-snug text-foreground">
                    {srKo[srIndex].framsida}
                  </div>
                </div>

                {/* Baksidan — visas efter vändning */}
                {srVisaSvar ? (
                  <div className="mt-2 rounded-lg border border-bull/30 bg-bull/5 px-3 py-3 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">SVAR</div>
                    <div className="mt-1 text-xs leading-relaxed text-foreground/90">
                      {srKo[srIndex].baksida}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSrVisaSvar(true)}
                    className="mt-2 w-full rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs font-bold text-gold hover:bg-gold/20"
                  >
                    🔄 Vänd kortet — tänk först, kolla sen
                  </button>
                )}

                {/* Betygsättning — först när svaret är vant */}
                {srVisaSvar && (
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => bedom(2)}
                      className="rounded-lg border border-bear/40 bg-bear/5 px-1 py-2 text-[11px] font-semibold text-bear hover:bg-bear/15"
                      title="Kommer igen imorgon (SM-2 nollställer intervallet)"
                    >
                      🔁 Svår
                    </button>
                    <button
                      onClick={() => bedom(4)}
                      className="rounded-lg border border-gold/40 bg-gold/10 px-1 py-2 text-[11px] font-semibold text-gold hover:bg-gold/20"
                      title="Rätt — intervallet växer"
                    >
                      ✅ Bra
                    </button>
                    <button
                      onClick={() => bedom(5)}
                      className="rounded-lg border border-bull/40 bg-bull/5 px-1 py-2 text-[11px] font-semibold text-bull hover:bg-bull/15"
                      title="Satt direkt — långt intervall"
                    >
                      ⚡ Lätt
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { setSrAktiv(false); setSrKo([]); }}
                  className="mt-2 w-full text-[10px] text-muted-foreground underline-offset-2 hover:underline"
                >
                  Avsluta repetitionen
                </button>
              </div>
            )}

            {meddelanden.map((m, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                    m.fran === "du"
                      ? "ml-auto bg-gold text-primary-foreground"
                      : "bg-card text-foreground/90 border border-gold/20"
                  }`}
                >
                  {m.text}
                </div>
                {/* Handlingsknappar */}
                {m.handlings && m.handlings.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.handlings.map((h, j) => (
                      <button
                        key={j}
                        onClick={() => {
                          if (h.lank === "sr:alla") {
                            startaSR(true);
                          } else if (h.lank === "#") {
                            // Konvention: "#" = starta spaced repetition i chatten
                            startaSR();
                          } else if (h.lank.startsWith("#")) {
                            // Scroll till sektion på samma sida
                            document.querySelector(h.lank)?.scrollIntoView({ behavior: "smooth" });
                          } else {
                            router.push(h.lank);
                          }
                        }}
                        className="flex w-full items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5 text-left text-xs font-semibold text-gold transition-all hover:border-gold/60 hover:bg-gold/15"
                      >
                        <span className="text-base">{h.ikon}</span>
                        <div className="min-w-0 flex-1">
                          <div>{h.text}</div>
                          {h.beskrivning && (
                            <div className="text-[10px] font-normal text-muted-foreground">{h.beskrivning}</div>
                          )}
                        </div>
                        <span className="text-gold/40">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="rounded-xl bg-card px-3 py-2 text-xs text-muted-foreground border border-gold/20">
                <span className="animate-pulse">AI-mentorn tänker…</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-gold/20 p-2">
            <input
              value={fragor}
              onChange={(e) => setFraga(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && skicka()}
              placeholder="Fråga mig vad som helst…"
              className="flex-1 rounded-lg border border-gold/30 bg-card px-3 py-2.5 text-xs outline-none focus:border-gold"
            />
            <button
              onClick={() => skicka()}
              disabled={busy}
              className="rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              Skicka
            </button>
          </div>
        </div>
      )}

      {/* Trigger-knapp */}
      <button
        onClick={() => setOppnad(!oppnad)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-paper text-2xl shadow-xl transition-transform hover:scale-105"
        aria-label="AI-Mentor"
        title="AI-Mentor — din personliga guide"
      >
        {oppnad ? "×" : "💬"}
      </button>
    </>
  );
}

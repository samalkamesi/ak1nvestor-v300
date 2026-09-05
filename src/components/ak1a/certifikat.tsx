"use client";

import { useState, useEffect } from "react";
import { lasMedlem, niva, lasXP, lasKlaraKurser, lasStjarnor } from "@/lib/member-local";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";

/** Certifikat — auto-genererad visuell proof på kompetens. Delbar. */
export function Certifikat() {
  const [medlem, setMedlem] = useState<{ email: string; namn?: string } | null>(null);
  const [kurser, setKurser] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [stjarnor, setStjarnor] = useState(0);
  const [betyg, setBetyg] = useState<"A" | "B" | "C" | "D" | null>(null);

  useEffect(() => {
    setMedlem(lasMedlem());
    setKurser(lasKlaraKurser());
    setXp(lasXP());
    setStjarnor(lasStjarnor());

    // Beräkna betyg
    const niv = niva();
    if (niv >= 50) setBetyg("A");
    else if (niv >= 35) setBetyg("B");
    else if (niv >= 25) setBetyg("C");
    else if (niv >= 15) setBetyg("D");
  }, []);

  const niv = niva();
  const datum = new Date().toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
  const certId = `AK1A-${new Date().getFullYear()}-${String(xp).padStart(6, "0")}`;

  const betgFarg = { A: "#047857", B: "#a8862a", C: "#d97706", D: "#5a5045" };
  const betgBeskrivning = {
    A: "Master — Exceptionell förståelse för institutionell aktieanalys",
    B: "Avancerad — Djup förståelse för AKM1-metodiken",
    C: "Certifierad — Behärskar grunderna i fundamental analys",
    D: "Grundläggande — På god väg mot självständighet",
  };

  if (!medlem) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border-2 border-gold/40 bg-card p-8 text-center">
        <p className="text-4xl">🏆</p>
        <h2 className="mt-3 font-serif text-2xl font-bold">Ditt certifikat väntar</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Logga in och klara kurser för att tjäna ditt officiella AK1A-certifikat.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Certifikat-kort */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-gold bg-gradient-to-br from-paper via-paper to-gold/5 p-10 shadow-2xl">
        {/* Vattenmärke */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="font-serif text-[180px] font-black">AK1A</span>
        </div>

        {/* Dekorativ kant */}
        <div className="absolute inset-2 rounded-2xl border-2 border-gold/30" />

        {/* Header */}
        <div className="relative text-center">
          <div className="flex justify-center">
            <VarumarkesLogo storlek="sm" />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gold">AK1A RESEARCH LAB</p>
          <div className="mx-auto mt-3 h-0.5 w-24 bg-gold/40" />
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight">
            Intyg på Kompetens
          </h1>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Institutionell Aktieanalys — AKM1 & AK1TS Ekosystemet
          </p>
        </div>

        {/* Namn */}
        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Detta intygs att</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">
            {medlem.namn || medlem.email.split("@")[0]}
          </p>
        </div>

        {/* Betyg */}
        {betyg && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white"
              style={{ background: betgFarg[betyg] }}
            >
              {betyg}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: betgFarg[betyg] }}>
                {betgBeskrivning[betyg]}
              </p>
            </div>
          </div>
        )}

        {/* Statistik */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gold/20 bg-paper/80 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gold">{kurser.length}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Kurser</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-paper/80 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gold">{xp}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">XP</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-paper/80 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gold">Nivå {niv}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Av 100</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="font-serif text-sm font-semibold text-gold">Ak1 Apex Nexus</p>
            <p className="text-[10px] text-muted-foreground">Grundare, AK1A Research Lab</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Certifikat-ID</p>
            <p className="font-mono text-xs font-bold">{certId}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{datum}</p>
          </div>
        </div>

        {/* Sigill */}
        <div className="mt-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/50 text-2xl">
            🔬
          </div>
        </div>
      </div>

      {/* Dela / ladda ner */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => {
            const text = `🏆 AK1A Certifikat — ${betyg || "Pågående"}\n${medlem.namn || medlem.email}\n${kurser.length} kurser · ${xp} XP · Nivå ${niv}/100\nVerifiera: lab.ak1nvestor.com/certifikat/${certId}`;
            if (navigator.share) {
              navigator.share({ title: "AK1A Certifikat", text }).catch(() => {});
            } else {
              navigator.clipboard.writeText(text).catch(() => {});
              alert("Kopierat till urklipp!");
            }
          }}
          className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          📤 Dela certifikat
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-xl border-2 border-gold/40 px-6 py-3 text-sm font-semibold text-gold hover:bg-gold/10"
        >
          🖨️ Skriv ut / PDF
        </button>
      </div>

      {/* Nästa steg */}
      <div className="mt-6 rounded-xl border border-dashed border-gold/40 bg-card p-4 text-center">
        {niv < 25 ? (
          <>
            <p className="text-sm font-semibold text-gold">
              Nivå {niv}/100 — {Math.min(100, Math.round((xp / 2400) * 100))} % mot Fas 2-kvalificering
            </p>
            {/* VÅG 63 O2 #5: räknaren var "(25-niv)*2 kurser kvar" — antog 50
                XP/kurs och ignorerade quiz-XP (10 XP/svar) ≈ 4x avskräckande.
                Nu XP-baserad mot kodens verkliga tröskel: nivå 25 = 2 400 XP
                (nivaFranXP), ≈ antal rätt quiz-svar som återstår. */}
            <p className="mt-1 text-xs text-muted-foreground">
              {Math.max(0, 2400 - xp).toLocaleString("sv-SE")} XP kvar — ≈{" "}
              {Math.ceil(Math.max(0, 2400 - xp) / 10).toLocaleString("sv-SE")} rätt
              quiz-svar (10 XP per svar)
            </p>
            {niv < 15 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Mellanmilstenare på vägen: nivå 15 ger D-certifikatet.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-green-700">
              🎓 Du är kvalificerad för Fas 2 — utbildning medgrundaren!
            </p>
            <a href="/medlemskap#fas2" className="mt-2 inline-block text-xs font-bold text-gold underline">
              Ansök om Fas 2 →
            </a>
          </>
        )}
      </div>
    </div>
  );
}

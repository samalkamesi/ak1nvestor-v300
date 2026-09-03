"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Analys = {
  id: string;
  title: string;
  type: string;
  summary: string | null;
  body: string | null;
  portfolio_overview: string | null;
  risk_assessment: string | null;
  wave_analysis: string | null;
  recommendations: string | null;
  next_steps: string | null;
  confidence: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

function Block({ rubrik, text }: { rubrik: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gold">{rubrik}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

/** Medlemssida: analyser som AK1A:s analytiker publicerat till klienten. */
export function MyAnalyses() {
  const [email, setEmail] = useState("");
  const [medlemId, setMedlemId] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<Analys[]>([]);
  const [meddelande, setMeddelande] = useState("");

  const oppna = async () => {
    setMeddelande("");
    setAnalyser([]);
    setMedlemId(null);
    try {
      const mRes = await fetch(`/api/member/register?email=${encodeURIComponent(email)}`);
      const mData = await mRes.json();
      if (!mData.member) {
        setMeddelande("Ingen medlem med den e-posten — registrera dig först i portalen.");
        return;
      }
      setMedlemId(mData.member.id);
      const aRes = await fetch(`/api/member/analysis?memberId=${mData.member.id}`);
      const aData = await aRes.json();
      const lista = (aData.analyses || []).filter((a: Analys) => a.is_published);
      setAnalyser(lista);
      if (lista.length === 0) {
        setMeddelande("Inga publicerade analyser ännu. När din analytiker publicerar syns de här.");
      }
    } catch {
      setMeddelande("Nätverksfel — försök igen.");
    }
  };

  return (
    <div className="space-y-6">
      {!medlemId && (
        <div className="mx-auto max-w-md rounded-xl border border-gold/30 bg-card p-6">
          <h2 className="font-serif text-xl font-bold">Dina analyser</h2>
          <p className="mt-1 text-xs text-muted-foreground">Samma e-post som i portalen.</p>
          <div className="mt-4 flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              onKeyDown={(e) => e.key === "Enter" && oppna()}
            />
            <Button className="bg-gold text-background hover:bg-gold/90" onClick={oppna}>
              Öppna
            </Button>
          </div>
          {meddelande && <p className="mt-3 text-xs text-muted-foreground">{meddelande}</p>}
        </div>
      )}

      {medlemId && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{analyser.length} publicerade analyser</p>
            <Button variant="ghost" size="sm" onClick={() => { setMedlemId(null); setAnalyser([]); setEmail(""); }}>
              Byt konto
            </Button>
          </div>
          {analyser.map((a) => (
            <article key={a.id} className="rounded-xl border border-gold/30 bg-card p-6">
              <p className="text-xs uppercase tracking-widest text-gold">
                {a.type} {a.confidence ? `· konfidens ${a.confidence}` : ""} ·{" "}
                {a.published_at ? new Date(a.published_at).toLocaleDateString("sv-SE") : new Date(a.created_at).toLocaleDateString("sv-SE")}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-bold">{a.title}</h3>
              <div className="mt-4 space-y-4">
                <Block rubrik="Sammanfattning" text={a.summary} />
                <Block rubrik="Portföljäverblick" text={a.portfolio_overview} />
                <Block rubrik="Riskbedömning" text={a.risk_assessment} />
                <Block rubrik="Våganalys" text={a.wave_analysis} />
                <Block rubrik="Rekommendationer" text={a.recommendations} />
                <Block rubrik="Nästa steg" text={a.next_steps} />
                <Block rubrik="Fullständig analys" text={a.body} />
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  );
}

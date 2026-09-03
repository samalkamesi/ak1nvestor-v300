"use client";

import { useEffect, useState } from "react";

/** Läsnivå-indikator — fyller upp allt eftersom du scrollar. */
export function LasProgress() {
  const [procent, setProcent] = useState(0);
  useEffect(() => {
    const lyssna = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProcent(max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0);
    };
    window.addEventListener("scroll", lyssna, { passive: true });
    return () => window.removeEventListener("scroll", lyssna);
  }, []);
  return (
    <div className="fixed left-0 right-0 top-0 z-40 h-1 bg-gold/10">
      <div
        className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-300"
        style={{ width: `${procent}%` }}
      />
    </div>
  );
}

/** Visuell metafor per blocktyp — SVG-illustrationer som förklarar konceptet. */
export function VisaMetafor({ typ }: { typ: string }) {
  if (typ === "bro") return (
    <svg viewBox="0 0 200 80" className="mx-auto h-20 w-48">
      <path d="M10 70 Q100 10 190 70" stroke="#a8862a" strokeWidth="4" fill="none" />
      <path d="M30 70 L30 45 M60 70 L60 30 M100 70 L100 22 M140 70 L140 30 M170 70 L170 45" stroke="#c9a84c" strokeWidth="2" />
      <rect x="0" y="66" width="200" height="6" rx="2" fill="#0a0b0d" opacity="0.15" />
      <text x="100" y="78" textAnchor="middle" fontSize="7" fill="#5a5045" fontFamily="serif" fontStyle="italic">30-ton-last · 10-ton-bro</text>
    </svg>
  );
  if (typ === "mr-market") return (
    <svg viewBox="0 0 200 80" className="mx-auto h-20 w-48">
      <circle cx="60" cy="40" r="18" fill="#fffdf7" stroke="#a8862a" strokeWidth="2" />
      <circle cx="54" cy="36" r="2" fill="#0a0b0d" /><circle cx="66" cy="36" r="2" fill="#0a0b0d" />
      <path d="M52 48 Q60 42 68 48" stroke="#0a0b0d" strokeWidth="1.5" fill="none" />
      <path d="M80 40 L120 40 M130 40 L170 40" stroke="#a8862a" strokeWidth="1.5" strokeDasharray="4,4" />
      <path d="M85 25 L85 55 M100 20 L100 60 M115 25 L115 55" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5" />
      <text x="100" y="14" textAnchor="middle" fontSize="6" fill="#5a5045" fontFamily="serif">hans humör</text>
      <text x="150" y="48" fontSize="12" fill="#a8862a" fontWeight="bold">?</text>
    </svg>
  );
  if (typ === "skala") return (
    <svg viewBox="0 0 200 80" className="mx-auto h-20 w-48">
      <line x1="40" y1="60" x2="160" y2="60" stroke="#0a0b0d" strokeWidth="3" />
      <circle cx="40" cy="60" r="4" fill="#b91c1c" />
      <circle cx="70" cy="60" r="4" fill="#d97706" />
      <circle cx="100" cy="60" r="4" fill="#5a5045" />
      <circle cx="130" cy="60" r="4" fill="#a8862a" />
      <circle cx="160" cy="60" r="4" fill="#047857" />
      <text x="40" y="74" textAnchor="middle" fontSize="7" fill="#b91c1c" fontWeight="bold">SÄLJ</text>
      <text x="100" y="74" textAnchor="middle" fontSize="7" fill="#5a5045">FÖRSIKTIGT</text>
      <text x="160" y="74" textAnchor="middle" fontSize="7" fill="#047857" fontWeight="bold">KÖP</text>
      <circle cx="100" cy="60" r="14" fill="none" stroke="#a8862a" strokeWidth="1" opacity="0.6" />
    </svg>
  );
  return null;
}

/** Visuell kapitel-badge med nummer och färg per kategori. */
export function KapitelBadge({ num, total, aktiv }: { num: number; total: number; aktiv?: boolean }) {
  const farg = aktiv ? "bg-gold text-primary-foreground" : "bg-gold/10 text-gold border border-gold/30";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg font-bold ${farg}`}>
        {num}
      </div>
      {num < total && <div className="h-4 w-px bg-gold/30" />}
    </div>
  );
}

/** Animerad insiktsvisare — pulserande guldcirkel. */
export function InsiktPuls() {
  return (
    <span className="relative inline-flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-40" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
    </span>
  );
}

/** Interaktiv ordlista-tooltip: hover på understrukna termer. */
export function Term({ barn, forklaring }: { barn: React.ReactNode; forklaring: string }) {
  return (
    <span className="group relative cursor-help border-b border-dashed border-gold/50">
      {barn}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-foreground shadow-xl group-hover:block">
        {forklaring}
      </span>
    </span>
  );
}

/** Visuell quiz-progress-ring. */
export function QuizRing({ klarade, total }: { klarade: number; total: number }) {
  const procent = total > 0 ? (klarade / total) * 100 : 0;
  const radie = 18;
  const omkrets = 2 * Math.PI * radie;
  return (
    <svg viewBox="0 0 44 44" className="h-10 w-10">
      <circle cx="22" cy="22" r={radie} fill="none" stroke="#a8862a" strokeWidth="3" opacity="0.15" />
      <circle
        cx="22" cy="22" r={radie} fill="none" stroke="#a8862a" strokeWidth="3"
        strokeDasharray={omkrets}
        strokeDashoffset={omkrets - (omkrets * procent) / 100}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="25" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#a8862a">
        {klarade}/{total}
      </text>
    </svg>
  );
}

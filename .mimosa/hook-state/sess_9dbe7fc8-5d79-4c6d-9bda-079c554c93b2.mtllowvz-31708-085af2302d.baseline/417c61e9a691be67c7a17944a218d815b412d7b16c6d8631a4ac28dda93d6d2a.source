"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { besok, titelFranSida } from "@/lib/navigationsminne";

type Post = { path: string; t: number };

function ikonFranPath(path: string): string {
  if (path.startsWith("/kurser")) return "📚";
  if (path.startsWith("/blogg")) return "✍️";
  if (path.startsWith("/analyser")) return "📊";
  if (path.startsWith("/labb")) return "🧪";
  if (path.startsWith("/kalkylator")) return "🧮";
  if (path.startsWith("/min-portfolj")) return "💼";
  return "🔹";
}

/** "Fortsätt där du slutade" — läser navigationsminnet (fallback: äldre ak1a-senaste). */
export function FortsattPanel({ exkluderaAktuell = false }: { exkluderaAktuell?: boolean }) {
  const [poster, setPoster] = useState<Post[]>([]);

  useEffect(() => {
    try {
      // Nya minnet först (har läsbara titlar), sedan äldre format som fallback
      const nya = besok().map((b) => ({ path: b.sida, t: b.tid }));
      let lista: Post[] = nya;
      if (nya.length === 0) {
        const rå = localStorage.getItem("ak1a-senaste");
        lista = rå ? JSON.parse(rå) : [];
      }
      // unika paths, senaste först, aktuell sida exkluderad
      const ses = new Map<string, number>();
      for (const p of lista) if (!exkluderaAktuell || p.path !== location.pathname) ses.set(p.path, p.t);
      const ut = [...ses.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([path, t]) => ({ path, t }));
      setPoster(ut);
    } catch {}
  }, [exkluderaAktuell]);

  if (poster.length === 0) return null;

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Fortsätt där du slutade
      </p>
      <ul className="mt-2 space-y-1.5">
        {poster.map((p) => (
          <li key={p.path}>
            <Link
              href={p.path}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gold/10"
            >
              <span>{ikonFranPath(p.path)}</span>
              <span className="min-w-0 flex-1 truncate">{titelFranSida(p.path)}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(p.t).toLocaleDateString("sv-SE")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

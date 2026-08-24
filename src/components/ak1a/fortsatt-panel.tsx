"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = { path: string; t: number };

function titelFranPath(path: string): string {
  const d = path.replace(/^\//, "").split("/");
  if (d[0] === "kurser" && d[1]) {
    const slug = d[1].replace(/-/g, " ");
    return `Kurs: ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
  }
  if (d[0] === "blogg" && d[1]) return `Artikel: ${d[1].replace(/-/g, " ").slice(0, 40)}`;
  if (d[0] === "analyser" && d[1]) return `Analys: ${d[1].toUpperCase()}`;
  if (d[0] === "labb" && d[1]) return "Case i labbet";
  if (d[0] === "kalkylator") return "AKM1-kalkylatorn";
  if (d[0] === "min-portfolj") return "Min portfölj";
  return path;
}

function ikonFranPath(path: string): string {
  if (path.startsWith("/kurser")) return "📚";
  if (path.startsWith("/blogg")) return "✍️";
  if (path.startsWith("/analyser")) return "📊";
  if (path.startsWith("/labb")) return "🧪";
  if (path.startsWith("/kalkylator")) return "🧮";
  if (path.startsWith("/min-portfolj")) return "💼";
  return "🔹";
}

/** "Fortsätt där du slutade" — läser lokal besökshistorik (endast i din browser). */
export function FortsattPanel({ exkluderaAktuell = false }: { exkluderaAktuell?: boolean }) {
  const [poster, setPoster] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rå = localStorage.getItem("ak1a-senaste");
        let lista: Post[] = rå ? JSON.parse(rå) : [];
        // unika paths, senaste först, aktuell sida exkluderad
        const ses = new Map<string, number>();
        for (const p of lista) if (!exkluderaAktuell || p.path !== location.pathname) ses.set(p.path, p.t);
        const ut = [...ses.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([path, t]) => ({ path, t }));
        if (!cancelled) setPoster(ut);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
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
              <span className="min-w-0 flex-1 truncate">{titelFranPath(p.path)}</span>
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

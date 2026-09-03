"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  klassifiera,
  rapporteraBeteende,
  rapporteraKlick,
  rapporteraMus,
  rapporteraScroll,
  rapporteraTid,
  rapporteraViTillbaka,
} from "@/lib/tracer";

/**
 * TRACER-MOUNT (v2) — beteendetracerns sinnen i organismen.
 *
 * En passiv lyssnare: renderas EN gång i layout.tsx och följer med på
 * varje sidnavigering (usePathname). Varje ny sökväg rapporteras till
 * den lokala profilen — med ett intressespår om sökvägen kan klassas
 * (teknisk | fundamental | portfölj | beteende).
 *
 * v2 lyssnar dessutom på KLOCK, RÖRELSER och all klientinteraktion:
 * - Scroll-djup per sida (strypat 500 ms, enbart nya rekord skrivs)
 * - Klick på allt interaktivt (capture-läge, klassat mot ett
 *   kontrollerat regelverk eller data-tracer-typ/data-tracer-element)
 * - Tid per sektion via ett 10-sekundershjärtat — endast när fliken syns
 * - Musrörelse som aggregerad sträcka + jitter (koordinater lämnar
 *   ALDRIG minnet och skrivs ALDRIG till disk)
 * - Tillbaka-navigering (popstate mot den egna historik-stacken)
 *
 * INTEGRITET: inget lämnar webbläsaren här — allt stannar i
 * localStorage (ak1a-tracer-v1). Delning sker endast via en frivillig
 * knapp på Min Sida (ej byggd ännu) som anropar /api/tracer.
 */

/** Ett klassat klick: kontrollerat vokabulär, aldrig rå text från sidan. */
type KlickInfo = { typ: string; element: string };

/**
 * Kontrollerat regelverk för knapp-liknande element. Testas mot id,
 * klass, aria-label, data-slot och (kort) text — i ordning, första
 * träff vinner. Ger stabila nycklar som "quiz-svara" och "verktyg-kör".
 */
const KNAPP_REGELVERK: ReadonlyArray<{
  typ: string;
  element: string;
  monster: RegExp;
}> = [
  { typ: "quiz", element: "svara", monster: /quiz|svar|alternativ/i },
  { typ: "verktyg", element: "kalkylator", monster: /kalkyl/i },
  { typ: "verktyg", element: "superanalys", monster: /superanalys/i },
  { typ: "verktyg", element: "konfluens", monster: /konfluens/i },
  { typ: "verktyg", element: "portfolj", monster: /portfölj|portfolj/i },
  { typ: "verktyg", element: "kor", monster: /beräkn|uträkn|räkna|kör|simuler|generera/i },
  { typ: "meny", element: "oppna", monster: /meny|menu|burger|hamburg|navigation/i },
  { typ: "meny", element: "stang", monster: /stäng|stang|close/i },
  { typ: "sok", element: "oppna", monster: /sök|sok|ctrl\+k|search/i },
  { typ: "navigation", element: "nasta", monster: /nästa|nasta|next|fortsätt|fortsatt/i },
  { typ: "navigation", element: "tillbaka", monster: /tillbaka|föregående|foregaende|back/i },
  { typ: "dela", element: "kopiera", monster: /dela|share|kopiera|copy/i },
];

const KANDA_FALT_TYPER = [
  "text",
  "email",
  "password",
  "number",
  "checkbox",
  "radio",
  "search",
  "tel",
  "url",
  "date",
];

/**
 * Klassificera ett klickmål till (typ, element) — eller null för klick
 * på vanlig text. Prioritering:
 * 1. data-tracer-typ [+ data-tracer-element] på närmaste förfader
 *    (explicit framtida instrumentering vinner alltid)
 * 2. <a>: extern → "extern-<värdnamn>", intern → "lank-<sökväg>"
 * 3. input/select/textarea → "falt-<typ|tagg>"
 * 4. button/[role=button]/summary → KNAPP_REGELVERK, fallback "knapp-ovrig"
 */
function klassificeraKlick(mal: EventTarget | null): KlickInfo | null {
  if (!(mal instanceof Element)) return null;

  // 1. Explicit instrumentering.
  const spelad = mal.closest("[data-tracer-typ]");
  if (spelad) {
    const typ = (spelad.getAttribute("data-tracer-typ") ?? "").toLowerCase().slice(0, 40);
    if (typ) {
      const element = (spelad.getAttribute("data-tracer-element") ?? "").toLowerCase().slice(0, 80);
      return { typ, element: element || "ovrig" };
    }
  }

  // 2. Länkar.
  const lank = mal.closest("a");
  if (lank) {
    const href = lank.getAttribute("href") ?? "";
    try {
      const url = new URL(href, window.location.href);
      if (url.host !== window.location.host) return { typ: "extern", element: url.hostname };
      return { typ: "lank", element: url.pathname || "/" };
    } catch {
      return href.startsWith("#") ? { typ: "lank", element: "ankare" } : { typ: "lank", element: "ovrig" };
    }
  }

  // 3. Formulärfält.
  const falt = mal.closest("input, select, textarea");
  if (falt) {
    const typAttr = (falt.getAttribute("type") ?? "").toLowerCase();
    const element =
      falt.tagName !== "INPUT" || KANDA_FALT_TYPER.includes(typAttr)
        ? typAttr || falt.tagName.toLowerCase()
        : "ovrig";
    return { typ: "falt", element };
  }

  // 4. Knapp-liknande element.
  const knapp = mal.closest("button, [role='button'], summary");
  if (!knapp) return null; // klick i vanlig text är ingen interaktion

  const spegel = [
    knapp.id,
    knapp.getAttribute("class") ?? "",
    knapp.getAttribute("aria-label") ?? "",
    knapp.getAttribute("data-slot") ?? "",
    knapp.getAttribute("title") ?? "",
    knapp instanceof HTMLElement ? knapp.innerText.slice(0, 120) : "",
  ]
    .join(" ")
    .slice(0, 300);

  for (const regel of KNAPP_REGELVERK) {
    if (regel.monster.test(spegel)) return { typ: regel.typ, element: regel.element };
  }
  return { typ: "knapp", element: "ovrig" };
}

export function TracerMount() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname ?? "/");
  const historikRef = useRef<string[]>([]);
  // Musens minne: koordinater lever bara här, under ett sekundfönster —
  // de aggregeras till sträcka/jitter innan något lämnar ref:en.
  const musRef = useRef({
    dx: 0,
    dy: 0,
    jitter: 0,
    senasteX: 0,
    senasteY: 0,
    harPosition: false,
    senasteTick: 0,
  });

  // ── Sidvisning (v1, oförändrad) + historik-stack för back-detektering ──
  useEffect(() => {
    if (!pathname) return;
    pathnameRef.current = pathname;
    rapporteraBeteende({
      typ: "sidvisning",
      namn: pathname,
      intresse: klassifiera(pathname),
    });
    const historik = historikRef.current;
    if (historik[historik.length - 1] !== pathname) historik.push(pathname);
    if (historik.length > 50) historik.splice(0, historik.length - 50);
  }, [pathname]);

  // ── KLOCK, RÖRELSER, INTERAKTION — monteras en gång, lever kvar ──
  useEffect(() => {
    // Scroll-djup: strypat till 500 ms; kortare sidor än viewporten = 100 %.
    let senasteScroll = 0;
    const onScroll = () => {
      const nu = Date.now();
      if (nu - senasteScroll < 500) return;
      senasteScroll = nu;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const procent = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 100;
      rapporteraScroll(pathnameRef.current, procent);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Klick: fångstläge på documentet — syns även stoppad propagation.
    const onClick = (ev: MouseEvent) => {
      const info = klassificeraKlick(ev.target);
      if (info) rapporteraKlick(info.typ, info.element);
    };
    document.addEventListener("click", onClick, true);

    // Musrörelse: sträcka + jitter per 1s-fönster (strypat, leading edge).
    const onMouseMove = (ev: MouseEvent) => {
      const m = musRef.current;
      if (!m.harPosition) {
        m.senasteX = ev.clientX;
        m.senasteY = ev.clientY;
        m.harPosition = true;
        m.senasteTick = Date.now();
        return;
      }
      const nu = Date.now();
      if (nu - m.senasteTick < 1000) return;
      const dx = Math.abs(ev.clientX - m.senasteX);
      const dy = Math.abs(ev.clientY - m.senasteY);
      m.dx += dx;
      m.dy += dy;
      m.jitter = Math.max(m.jitter, Math.round(Math.hypot(dx, dy)));
      m.senasteX = ev.clientX;
      m.senasteY = ev.clientY;
      m.senasteTick = nu;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const spolaMus = () => {
      const m = musRef.current;
      if (m.dx === 0 && m.dy === 0 && m.jitter === 0) return;
      rapporteraMus(m.dx, m.dy, m.jitter);
      m.dx = 0;
      m.dy = 0;
      m.jitter = 0;
    };

    // Hjärtat: var 10:e sekund — tid per sektion + mus-spolning,
    // endast när fliken är synlig (gömd flik = ingen studietid).
    const hjarta = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      rapporteraTid(pathnameRef.current, 10);
      spolaMus();
    }, 10_000);

    // Fliken göms → spola musen direkt så inget går förlorat.
    const onSynlighet = () => {
      if (document.visibilityState === "hidden") spolaMus();
    };
    document.addEventListener("visibilitychange", onSynlighet);

    // Tillbaka-knappen: popstate där destinationen ligger steget under
    // i den egna stacken. (popstate avser även fram-navigering — därför
    // jämförs mot stacken och inte blint räknas varje event.)
    const onPopState = () => {
      const historik = historikRef.current;
      const nuSida = window.location.pathname;
      if (historik.length >= 2 && historik[historik.length - 2] === nuSida) {
        rapporteraViTillbaka();
        historik.pop(); // toppen matchar nu — sidvisningseffekten pushar inte dubbelt
      }
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("mousemove", onMouseMove);
      window.clearInterval(hjarta);
      document.removeEventListener("visibilitychange", onSynlighet);
      window.removeEventListener("popstate", onPopState);
      spolaMus(); // avmontering (HMR/StrictMode): spara det sista
    };
  }, []);

  return null;
}

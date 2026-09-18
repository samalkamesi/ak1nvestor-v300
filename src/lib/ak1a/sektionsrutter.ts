import type { SectionId } from "@/lib/ak1a-store";

// M3 SPA-avveckling (2026-09-02): dessa sektioner duplicerar riktiga routes —
// valet omdirigeras dit i stället för att rendera SPA-kopian. Endast hem +
// portal (plus prec/aktier, som ägs av andra) förblir äkta SPA-sektioner.
//
// o71 (spår 7, 2026-09-18): mappningarna bor i ett eget vägerlätt lib så att
// SpaHem kan fatta vidarebefodrans-beslutet (boolean) utan att dra in
// vidarebefodrans-VYN — den är JS-only och hämtas via next/dynamic.
export const ROUTE_FOR_SEKTION: Partial<Record<SectionId, string>> = {
  kurser: "/kurser",
  labb: "/labb",
  analyser: "/analyser",
  "om-oss": "/om-oss",
  utbildning: "/medlemskap",
};

// Visningsnamn för vidarebefordransvyn (utbildning landar på /medlemskap).
export const NAMN_FOR_SEKTION: Partial<Record<SectionId, string>> = {
  kurser: "Kurser",
  labb: "Labb",
  analyser: "Analyser",
  "om-oss": "Om oss",
  utbildning: "Utbildning & Medlemskap",
};

# AK1A — Varumärkesregister (logotyp-arkiv)

Alla logotyp-varianter samlade här med kategori och användningsregel.
Standard beslutad 2026-09-03 (kunddirektiv: "med eller utan bakgrund,
konsekvent på alla sidor — bestäm du").

## Aktiv standard

| Fil | Kategori | Bakgrund | Användning |
|---|---|---|---|
| `skulptur-mark.jpg` | **Primärmärke** | MED platta (#FDFBF7, rundad ruta + ring) | Header, mobilmeny, footer, certifikat, admin — alla ytor via `VarumarkesLogo`-komponenten |
| `skulptur-utan-bakgrund.png` | **Sekundärmärke** | UTAN (transparent PNG) | Dekorativa ytor direkt på cream/ljus bakgrund där plattan inte önskas; fungerar INTE på marin (linjerna är marin) |
| `skulptur-hero.jpg` | Hero/dekor | rå (cream-ton) | Stora dekorationer, landningssidor (269 kB, 1440 px) |

## Original (råa, ej behandlade — arkiv)

| Fil | Beskrivning |
|---|---|
| `skulptur-1.jpg` | Vinkel 1 — gråskuggig bakgrund (ej lämplig som märke; arkiverad) |
| `skulptur-2.jpg` | Vinkel 2 — ren vit bakgrund, KÄLLAN till mark + transparent |
| `skulptur-3.jpg` | Vinkel 3 — hel skulptur med krona, porträtt 1440×3200 (källa till hero) |

## Regler

1. **Komponent, inte fil**: alla implementationer går via
   `src/components/ak1a/varumarkes-logo.tsx` (storlek sm 32 / md 40 / lg 56,
   `medText` ger ordmärket). Aldrig `<img src="...skulptur...">` direkt.
2. **På marin/mörka ytor**: alltid plattan (skulptur-mark) — linjerna är
   marin och försvinner annars.
3. **På cream/ljusa ytor**: plattan som standard (konsekvens), transparent
   endast när designen specifikt kräver "utan".
4. **Certifikat**: `VarumarkesLogo storlek="sm"` i cert-huvudet (delad design
   med siten — certet är en AK1A-produkt).
5. Originalen raderas aldrig — de är källan till framtida varianter.

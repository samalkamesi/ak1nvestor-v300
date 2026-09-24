// _v182-manifest.mjs — bygger v167-manifestet (20 uppgifter, en per V-kurs) till agentfabrikens ko/
// Källor: DESIGN-v167-ovningskapitel.md (kontrakt) · V167-KARTA.md (slug:ar) · sond 1–3 (format/faktiska kapiteltal)
import { writeFileSync, mkdirSync } from 'node:fs';

const KURSER = [
  // [slug, V, kursTitel, underlagsfil, sektionsrubrik, kapitelnum, totalMinFore]
  ['v01-forsaljningstillvaxt', 'V01', 'Försäljningstillväxt', 'indikatorer-01-10.md', '## V01 — Försäljningstillväxt (Tillväxt)', 12],
  ['v02-arr-tillvaxt', 'V02', 'ARR-tillväxt', 'indikatorer-01-10.md', '## V02 — ARR-tillväxt (Tillväxt)', 12],
  ['v03-intaktsdiversifiering', 'V03', 'Intäktsdiversifiering', 'indikatorer-01-10.md', '## V03 — Intäktsdiversifiering (Tillväxt)', 12],
  ['v04-ps', 'V04', 'P/S (Price-to-Sales)', 'indikatorer-01-10.md', '## V04 — P/S, pris/omsättning (Värdering)', 12],
  ['v05-pb', 'V05', 'P/B (Price-to-Book)', 'indikatorer-01-10.md', '## V05 — P/B, pris/eget kapital (Värdering)', 12],
  ['v06-ev-ebitda', 'V06', 'EV/EBITDA', 'indikatorer-01-10.md', '## V06 — EV/EBITDA (Värdering)', 12],
  ['v07-bruttomarginal', 'V07', 'Bruttomarginal', 'indikatorer-01-10.md', '## V07 — Bruttomarginal (Lönsamhet)', 12],
  ['v08-ebitda-marginal', 'V08', 'EBITDA-marginal', 'indikatorer-01-10.md', '## V08 — EBITDA-marginal (Lönsamhet)', 12],
  ['v09-roe', 'V09', 'ROE (Return on Equity)', 'indikatorer-01-10.md', '## V09 — ROE, avkastning på eget kapital (Lönsamhet)', 12],
  ['v10-skuldsattningsgrad', 'V10', 'Skuldsättningsgrad', 'indikatorer-01-10.md', '## V10 — Skuldsättningsgrad (Stabilitet)', 12],
  ['v11-likviditet', 'V11', 'Likviditet (Kvick)', 'indikatorer-11-20.md', '## V11 — Likviditet · Stabilitet', 12],
  ['v12-intaktsstabilitet', 'V12', 'Intäktsstabilitet', 'indikatorer-11-20.md', '## V12 — Intäktsstabilitet · Stabilitet', 12],
  ['v13-patent-ip', 'V13', 'Patent & Immateriella rättigheter', 'indikatorer-11-20.md', '## V13 — Patent & IP · Moat', 12],
  ['v14-varumarke', 'V14', 'Varumärke & Kundlojalitet', 'indikatorer-11-20.md', '## V14 — Varumärke & Kundlojalitet · Moat', 12],
  ['v15-natverkseffekter', 'V15', 'Nätverkseffekter', 'indikatorer-11-20.md', '## V15 — Nätverkseffekter · Moat', 12],
  ['v16-produktlanseringar', 'V16', 'Produktlanseringar', 'indikatorer-11-20.md', '## V16 — Produktlanseringar · Katalysator', 12],
  ['v17-avtal-partnerskap', 'V17', 'Avtal & Partnerskap', 'indikatorer-11-20.md', '## V17 — Avtal & Partnerskap · Katalysator', 12],
  ['v18-regulatoriska', 'V18', 'Regulatoriska katalysatorer', 'indikatorer-11-20.md', '## V18 — Regulatoriska katalysatorer · Katalysator', 12],
  ['v19-kapitalforbranning', 'V19', 'Kapitalförbränning & Emission-risk', 'indikatorer-11-20.md', '## V19 — Kassatäckning — nyemissionsrisk · Risk & kapitalstruktur (KRITISK)', 14],
  ['v20-aterekop-egna-aktier', 'V20', 'Återköp av egna aktier', 'indikatorer-11-20.md', '## V20 — Återköp av egna aktier · Risk & kapitalstruktur', 12],
];

function promptFor([slug, v, kursTitel, underlagsfil, sektion, kapNum]) {
  return `UPPGIFT: Skapa övningskapitlet "Från teorin till egen räkning" som JSON-fragment för Fas 2-kursen ${v} ${kursTitel} (slug: ${slug}). Fabriksvåg v167 enligt DESIGN-v167-ovningskapitel.md.

LÄS FÖRST (kontrakt + underlag):
1. data/forskning/KURS-FAS2/DESIGN-v167-ovningskapitel.md — designkontraktet (BINDANDE).
2. data/kurser/fas2-djup/${underlagsfil} — din sektion "${sektion}" med underrubrikerna a)–f). Använd EXAKT din sektion (inte grannarnas).

SKRIV EN FIL (ditt EXKLUSIVA ägarskap — inga andra filer rörs):
data/forskning/KURS-FAS2/v167-fragment/${slug}.json

INNEHÅLL — exakt denna struktur (ren JSON, UTF-8, dubbla citattecken):
{
  "slug": "${slug}",
  "kapitel": {
    "num": ${kapNum},
    "minutes": 8,
    "title": "Från teorin till egen räkning",
    "intro": "2–3 meningar ur underlagets a) — vad indikatorn mäter och varför eleven nu ska räkna själv.",
    "blocks": [
      {"type": "text", "content": "BLOCK 1 — underlagets d) Räkneexempel: NorrTeknik AB ÖVERFÖRT ORDAGRAT: inled med meningen 'NorrTeknik AB är ett konstruerat bolag — låtsas-årsredovisningens tal är påhittade för övningens skull.' Därefter räkneexempelets STEG FÖR STEG med ALLA TAL, formler och enheter ordagrant från underlagets d)-sektion. Avsluta blocket med den ordagrata raden: 'Utbildningsmaterial — beskriver hur metoden läser och räknar; inga investeringsråd (2007:528).'"},
      {"type": "utmaning", "content": "BLOCK 2 — underlagets f) övningsfrågor 1–3 ORDAGRAT. Inled med journal-inramningen: 'Stopp — svara skriftligen i din analysjournal FÖRE du läser facit i nästa stycke.' Lista sedan de tre frågorna."},
      {"type": "text", "content": "BLOCK 3 — underlagets f) FACIT med motiveringar ORDAGRAT (siffror och beräkningar exakt som i underlaget)."},
      {"type": "text", "content": "BLOCK 4 — underlagets e) fallgropar KOMPAKTERAT till 3–5 meningar (kapitel 10 i kursen bär de fulla fallen — detta är en påminnelse)."},
      {"type": "insikt", "content": "BLOCK 5 — ekosystemkopplingen (skriv själv, 4–6 meningar): hur indikatorn lever i AKM1:s trösklar, nyckeltalsguiden, AKM2:s analysvittne, AI-Mentorns frågor och portföljmotorn — övningarna du just gjorde är hur verktygen drivs på riktigt material."}
    ],
    "quiz": [
      {"q": "PÅSTÅENDE om metoden (kap 1–6:s mönster — inte om NorrTekniks utfall)", "alternativ": ["fel","fel","rätt","fel"], "ratt": 2, "tips": "en mening som pekar på rätt stycke i kapitlet"},
      {"q": "…", "alternativ": ["…","…","…","…"], "ratt": 0, "tips": "…"},
      {"q": "…", "alternativ": ["…","…","…","…"], "ratt": 1, "tips": "…"}
    ]
  }
}

HÅRDA REGLER (juridik + kvalitet — bryt ALDRIG):
- Quiz: EXAKT 3 frågor, VARJE alternativ-lista har EXAKT 4 strängar, ratt ∈ {0,1,2,3} och de tre ratt-lägena är PARVIS OLIKA (t.ex. 2,0,1). Påståendeform om METODEN.
- Lagrum: ENDAST 2007:528 får nämnas (i den ordagrata deklarationsraden). ALDRIG 2022:260, 2022:261, 1985:716, 2022:482, 2005:59.
- ALDRIG köp-/sälj-/rekommendationsformuleringar. ALDRIG riktiga bolagsnamn eller varumärken — ENDAST NorrTeknik AB (konstruerat bolag).
- Talen i block 1 och 3 (d + f) ÖVERFÖRS ORDAGRAT ur underlaget — de är överföringsbeviset (granskningen mäter talmarkörer ≥ 80 %).
- minutes: 8 (tillåtet intervall 7–9). num: EXAKT ${kapNum}. title EXAKT "Från teorin till egen räkning".
- Blockordningen EXAKT: text, utmaning, text, text, insikt. Block = {"type": "...", "content": "..."}. Ingen markdown i content utom dubbla radbrytningar mellan stycken.
- totalMinutes/chapterCount/chapters: ingår INTE i fragmentet — huvudagentens emottag sköter appenden i public/deep-courses.json (DELAD FIL — du skriver ALDRIG i den). Rör EJ data/forskning/KURS-FAS2/V167-GRANSKNING.md (huvudagenten äger den).

EGEN KONTROLL FÖRE COMMIT (node-skript du skriver i /tmp och kör):
JSON.parse OK · num=${kapNum} · minutes 7–9 · 5 block med typerna [text,utmaning,text,text,insikt] · quiz 3 × (4 alternativ, ratt 0–3, unika) · deklarationsraden ordagrant · 'NorrTeknik AB är ett konstruerat bolag' finns · inga förbjudna lagrum · minst 8 tal från underlagets d)+f) finns i block 1+3.

COMMitta ENDAST din fragmentfil:
git add data/forskning/KURS-FAS2/v167-fragment/${slug}.json && git commit -m "fabrik v167: fragment ${slug} — övningskapitel ${kapNum} enligt DESIGN-v167"

Avsluta ditt svar med raden (fabrikens kvitto-krav):
LEVERANS: fragment ${slug} skrivet, egen kontroll N/N GRÖN, commit <hash>`;
}

const uppgifter = KURSER.map(([slug, v, kursTitel], i) => ({
  id: 'u' + String(i + 1).padStart(2, '0'),
  titel: `${v} ${kursTitel} — övningskapitelfragment`,
  roll: 'byggare',
  filer: [`data/forskning/KURS-FAS2/v167-fragment/${slug}.json`],
  prompt: promptFor(KURSER[i]),
}));

const manifest = {
  id: 'v167-ovningskapitel-' + Date.now(),
  titel: 'v167: 20 övningskapitel (V01–V20) — fragment enligt DESIGN-v167',
  skapad: Date.now(),
  commitPrefix: 'fabrik v167:',
  uppgifter,
};

mkdirSync('/home/ak1a/agent/ak1/data/vakten/agentfabrik/ko/', { recursive: true });
mkdirSync('/home/ak1a/agent/ak1/data/forskning/KURS-FAS2/v167-fragment/', { recursive: true });
const path = '/home/ak1a/agent/ak1/data/vakten/agentfabrik/ko/' + manifest.id + '.json';
writeFileSync(path, JSON.stringify(manifest, null, 2));
console.log('MANIFEST SKRIVET:', path);
console.log('uppgifter:', uppgifter.length, '· V19 num=14, övriga num=12');
console.log('exempel u19 filer:', JSON.stringify(uppgifter[18].filer));

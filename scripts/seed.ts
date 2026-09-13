/**
 * Seed-script: sparar styrelseprotokoll, 42 mega-uppgifter, och 20 indikatorer (V01-V20) i databasen.
 * Kör: bun run src/lib/ak1a/seed.ts
 */
import { db } from "@/lib/db";
import { readFileSync } from "fs";

const INDICATORS = [
  { id: "V01", num: 1, name: "Försäljningstillväxt", category: "Tillväxt", weight: "8%", level: "nyborjare", summary: "Omsättningstillväxt jämfört med föregående år — den viktigaste tillväxtindikatorn.", slug: "v01-forsaljningstillvaxt" },
  { id: "V02", num: 2, name: "ARR-tillväxt", category: "Tillväxt", weight: "8%", level: "intermediar", summary: "Tillväxt i Annual Recurring Revenue — återkommande intäkter.", slug: "v02-arr-tillvaxt" },
  { id: "V03", num: 3, name: "Intäktsdiversifiering", category: "Tillväxt", weight: "7%", level: "nyborjare", summary: "Hur bred intäktsbasen är — kund-/produkt-/marknadsberoende.", slug: "v03-intaktsdiversifiering" },
  { id: "V04", num: 4, name: "P/S (Price-to-Sales)", category: "Värdering", weight: "6%", level: "nyborjare", summary: "Börsvärde / omsättning. Enkel värdering för bolag utan vinst.", slug: "v04-ps" },
  { id: "V05", num: 5, name: "P/B (Price-to-Book)", category: "Värdering", weight: "6%", level: "nyborjare", summary: "Börsvärde / eget kapital.", slug: "v05-pb" },
  { id: "V06", num: 6, name: "EV/EBITDA", category: "Värdering", weight: "6%", level: "intermediar", summary: "Företagsvärde / EBITDA. Komplett värderingsmultipel.", slug: "v06-ev-ebitda" },
  { id: "V07", num: 7, name: "Bruttomarginal", category: "Lönsamhet", weight: "6%", level: "nyborjare", summary: "Bruttovinst / omsättning.", slug: "v07-bruttomarginal" },
  { id: "V08", num: 8, name: "EBITDA-marginal", category: "Lönsamhet", weight: "6%", level: "intermediar", summary: "EBITDA / omsättning.", slug: "v08-ebitda-marginal" },
  { id: "V09", num: 9, name: "ROE", category: "Lönsamhet", weight: "6%", level: "intermediar", summary: "Avkastning på eget kapital.", slug: "v09-roe" },
  { id: "V10", num: 10, name: "Skuldsättningsgrad", category: "Stabilitet", weight: "5%", level: "nyborjare", summary: "Räntebärande skulder / eget kapital.", slug: "v10-skuldsattningsgrad" },
  { id: "V11", num: 11, name: "Likviditet (Kvick)", category: "Stabilitet", weight: "5%", level: "nyborjare", summary: "(Omsättningstillgångar − varulager) / kortfristiga skulder.", slug: "v11-likviditet" },
  { id: "V12", num: 12, name: "Intäktsstabilitet", category: "Stabilitet", weight: "5%", level: "intermediar", summary: "Hur förutsägbara intäkterna är.", slug: "v12-intaktsstabilitet" },
  { id: "V13", num: 13, name: "Patent & IPR", category: "Moat", weight: "6%", level: "intermediar", summary: "Patent, varumärken, licenser — juridiskt skydd.", slug: "v13-patent-ip" },
  { id: "V14", num: 14, name: "Varumärke & Kundlojalitet", category: "Moat", weight: "5%", level: "intermediar", summary: "Styrkan i varumärket — prissättningsmakt.", slug: "v14-varumarke" },
  { id: "V15", num: 15, name: "Nätverkseffekter", category: "Moat", weight: "6%", level: "avancerad", summary: "Växer värdet med fler användare.", slug: "v15-natverkseffekter" },
  { id: "V16", num: 16, name: "Produktlanseringar", category: "Katalysator", weight: "7%", level: "intermediar", summary: "Kommande produktlanseringar som driver intäkter.", slug: "v16-produktlanseringar" },
  { id: "V17", num: 17, name: "Avtal & Partnerskap", category: "Katalysator", weight: "7%", level: "intermediar", summary: "Stora kundavtal, partner-avtal, distribution-deals.", slug: "v17-avtal-partnerskap" },
  { id: "V18", num: 18, name: "Regulatoriska katalysatorer", category: "Katalysator", weight: "7%", level: "avancerad", summary: "Lagändringar, godkännanden, regleringar.", slug: "v18-regulatoriska" },
  { id: "V19", num: 19, name: "Kapitalförbränning & Emission-risk", category: "Risk", weight: "KRITISK", level: "avancerad", summary: "Hur snabbt bolaget bränner pengar — emissionsrisk.", slug: "v19-kapitalforbranning" },
  { id: "V20", num: 20, name: "Återköp av egna aktier", category: "Kapitalstruktur", weight: "5%", level: "intermediar", summary: "Buybacks = bolaget köper tillbaka egna aktier. Signal: ledning tror aktien är undervärderad. Minskar antal aktier → höjer EPS. AKM1:s 20:e indikator — tillagd i mega-projektet 2026.", slug: "v20-aterekop-egna-aktier" },
];

const LYNCH_VIEWS: Record<string, string> = {
  V01: "Lynch älskade 'story-stocks' med stark tillväxt. I 'One Up On Wall Street' (1989) menade han att om du kan beskriva varför ett bolag växer på en mening ('de säljer kaffe billigare'), så är det en bra tillväxthistoria. Han varnade för 'di-worsification' — tillväxt genom uppköp i okända branscher.",
  V04: "Lynch använde P/S flitigt för att hitta 'fast growers' som ännu inte går med vinst. Han jämförde P/S med historiskt snitt och bransch — en P/S under 1x för ett bolag med 20% tillväxt var en röd flagga (för bra för att vara sant) eller en möjlighet.",
  V09: "Lynch föredrog bolag med stabil hög ROE (>15%) men varnade för extremt hög ROE uppnådd genom skulder. 'Ett bolag med 30% ROE och 200% skuldsättning är inte bättre än ett med 15% ROE och 0% skuld.'",
  V19: "Lynch undvek bolag som brände pengar. 'Om ett bolag behöver emissionera vart tredje år, äger du inte bolaget — bolaget äger dig.' Han föredrog bolag med positivt kassaflöde som kunde finansiera sin egen tillväxt.",
  V20: "Lynch såg buybacks som en av de starkaste signalerna. 'När ledningen köper tillbaka aktier med egna pengar, inte med lånade, så vet de något du inte vet — och de delar vinsten med dig.' Han föredrog buybacks framför utdelning ur skattesynpunkt.",
};

const GRAHAM_VIEWS: Record<string, string> = {
  V01: "Graham (Security Analysis, 1934) var skeptisk till tillväxt som värderingsgrund. Han menade att tillväxt är oförutsägbar och att marknaden överbetalar den. 'Tillväxt är en prognos, inte ett faktum.' Han föredrog att värdera bolag på nuvarande intäkter med en marginal of safety.",
  V04: "Graham använde P/S sällan — han föredrog P/E och P/B. Men han menade att P/S under 0.5x (bolag som säljer för mindre än halva omsättningen) ofta var 'cigar butt'-möjligheter — en sista dragning gratis.",
  V05: "Graham's klassiska regel: köp bolag med P/B under 1.5x. 'Inget bolag är värt mer än 1.5 gånger dess bokförda värde, oavsett tillväxt.' Han kombinerade P/B < 1.5 med P/E < 15 och ROE > 10% i sin 'defensive investor'-screen.",
  V09: "Graham krävde ROE > 10% för att ens överväga ett bolag. Han menade att låg ROE över lång tid indikerar en dålig affär, oavsett hur billig aktien är. 'Ett dåligt bolag till lågt pris är fortfarande en dålig affär.'",
  V19: "Graham var extremt riskavös mot kapitalförbränning. Han undvek bolag med negativt kassaflöde helt. 'Ett bolag som inte kan generera kassa från sin verksamhet är en teori, inte en investering.'",
  V20: "Graham såg buybacks som neutralt — han föredrog utdelning. 'En utdelning är en check du kan banka; ett buyback är ett löfte om framtida EPS-tillväxt som kanske infrias.' Han misstrodde buybacks gjorda med skuld.",
};

const AK1_VIEWS: Record<string, string> = {
  V01: "AKM1 vikt 8% — högsta vikten. Vi anser att tillväxt är kontexten som tolkar alla andra 18 variabler. En P/E på 40 är orimlig vid 0% tillväxt men rimlig vid 35% tillväxt. AKM1 bryter ner tillväxt i volym vs pris, organisk vs förvärvad — inte bara en siffra.",
  V04: "AKM1 vikt 6%. P/S är startpunkten för värdering, inte slutet. Vi kombinerar P/S med bruttomarginal (V07) — ett bolag med P/S 1x och bruttomarginal 20% är dyrare än P/S 3x och bruttomarginal 80%.",
  V19: "AKM1 vikt KRITISK — högsta riskvikten. Vi kombinerar V19 med V11 (likviditet) och V10 (skuldsättning). Ett bolag med 18 månaders runway, 60% skuldsättning och negativt kassaflöde får V19=1 (lägst) oavsett hur stark tillväxten är.",
  V20: "AKM1 vikt 5% (ny i V20-expansionen). Vi bedömer buybacks på tre kriterier: (1) finansierade med fritt kassaflöde, inte skuld; (2) till ett pris under intrinsic value; (3) inte i stället för nödvändig R&D-investering. Buybacks görs av rätt anledning = poäng 4-5; buybacks görd för att manipulera EPS = poäng 1.",
};

const MEGA_TASKS = [
  { num: 1, title: "V20 — Återköp av egna aktier (ny indikator)", category: "indikator", priority: "HÖG", organOwner: "Φ", description: "Lägg till V20 som 20:e AKM1-indikatorn med full djup kurs (6 kapitel + Lynch/Graham/AKM1-perspektiv)." },
  { num: 2, title: "Standardisera kursmall till V01-strukturen", category: "kurs", priority: "HÖG", organOwner: "Θ", description: "Alla kurser ska följa exakt V01-mallen: 6 kapitel, historisk kontext, insikter, definitioner." },
  { num: 3, title: "Lynch-perspektiv i alla kurser", category: "kurs", priority: "HÖG", organOwner: "α", description: "Lägg till Peter Lynchs perspektiv (One Up On Wall Street) i varje kurs." },
  { num: 4, title: "Graham-perspektiv i alla kurser", category: "kurs", priority: "HÖG", organOwner: "α", description: "Lägg till Benjamin Grahams perspektiv (Security Analysis) i varje kurs." },
  { num: 5, title: "AKM1-perspektiv i alla kurser", category: "kurs", priority: "HÖG", organOwner: "α", description: "Lägg till AKM1:s egna perspektiv (vårt 20-variabel ramverk) i varje kurs." },
  { num: 6, title: "200+ lyckade fallstudier", category: "fallstudie", priority: "HÖG", organOwner: "Ω", description: "Bygg 200+ fallstudier av lyckade investeringar i databasen." },
  { num: 7, title: "200+ misslyckade fallstudier", category: "fallstudie", priority: "HÖG", organOwner: "Θ", description: "Bygg 200+ fallstudier av misslyckade investeringar i databasen." },
  { num: 8, title: "200+ indikator-kombinationskurser", category: "kombination", priority: "HÖG", organOwner: "Φ", description: "Bygg 200+ kurser om vad händer när två indikatorer samverkar." },
  { num: 9, title: "Färgharmoni-förbättring 1000x", category: "integration", priority: "MEDEL", organOwner: "Φ", description: "Förbättra färgpalett och harmoni (guld/cream/bull/bear)." },
  { num: 10, title: "Integration 1000x", category: "integration", priority: "MEDEL", organOwner: "Σ", description: "Förbättra integration mellan sektioner, kurser och fallstudier." },
  { num: 11, title: "Databas-schema för kurser", category: "databas", priority: "HÖG", organOwner: "Δ", description: "DeepCourse-tabell i Prisma." },
  { num: 12, title: "Databas-schema för fallstudier", category: "databas", priority: "HÖG", organOwner: "Δ", description: "CaseStudy-tabell i Prisma." },
  { num: 13, title: "Databas-schema för mötesprotokoll", category: "databas", priority: "HÖG", organOwner: "Δ", description: "MeetingProtocol-tabell i Prisma." },
  { num: 14, title: "API för mötesprotokoll", category: "databas", priority: "HÖG", organOwner: "Δ", description: "GET/POST /api/styrelse/protokoll." },
  { num: 15, title: "API för fallstudier", category: "databas", priority: "HÖG", organOwner: "Δ", description: "GET/POST /api/cases med filter." },
  { num: 16, title: "API för indikator-kombinationer", category: "databas", priority: "HÖG", organOwner: "Δ", description: "GET/POST /api/combinations med filter." },
  { num: 17, title: "V20 djup kurs (6 kapitel)", category: "kurs", priority: "HÖG", organOwner: "Ψ", description: "Bygg full V20-kurs med 6 kapitel om återköp av egna aktier." },
  { num: 18, title: "Expansion V01-V19 med Lynch/Graham", category: "kurs", priority: "MEDEL", organOwner: "α", description: "Lägg till Lynch/Graham-sektioner i V01-V19." },
  { num: 19, title: "Fintech-förbättringar", category: "integration", priority: "LÅG", organOwner: "Φ", description: "Modern fintech UI-element." },
  { num: 20, title: "Case study browser i Labbet", category: "fallstudie", priority: "HÖG", organOwner: "Ψ", description: "Browser för 400+ fallstudier med sök/filter." },
  { num: 21, title: "Indikator-kombinationsbrowser i Labbet", category: "kombination", priority: "HÖG", organOwner: "Ψ", description: "Browser för 200+ kombinationskurser." },
  { num: 22, title: "Sök genom fallstudier", category: "fallstudie", priority: "MEDEL", organOwner: "Ψ", description: "Fritextsökning i fallstudier." },
  { num: 23, title: "Filtrera fallstudier efter indikator", category: "fallstudie", priority: "MEDEL", organOwner: "Ψ", description: "Filtrera på decisiveVars." },
  { num: 24, title: "Filtrera fallstudier efter utfall", category: "fallstudie", priority: "MEDEL", organOwner: "Ψ", description: "Filtrera på success/failure." },
  { num: 25, title: "Statistik dashboard för fallstudier", category: "fallstudie", priority: "LÅG", organOwner: "Μ", description: "Aggregerad statistik över 400+ fall." },
  { num: 26, title: "Mötesprotokoll-arkiv i databas", category: "databas", priority: "HÖG", organOwner: "Σ", description: "Spara alla styrelsemöten i DB." },
  { num: 27, title: "Task-tracking system", category: "databas", priority: "MEDEL", organOwner: "Σ", description: "MegaTask-tabell med status/prioritet." },
  { num: 28, title: "Mega-projekt roadmap", category: "integration", priority: "HÖG", organOwner: "Σ", description: "Fasad roadmap baserad på styrelsebeslut." },
  { num: 29, title: "Färgpalettförbättring", category: "integration", priority: "MEDEL", organOwner: "Φ", description: "Guld/cream/bull/bear harmoni." },
  { num: 30, title: "Animationer och övergångar", category: "integration", priority: "LÅG", organOwner: "Φ", description: "Framer Motion övergångar." },
  { num: 31, title: "Responsivitet för mobil", category: "integration", priority: "MEDEL", organOwner: "Ψ", description: "Mobiloptimering." },
  { num: 32, title: "Dark mode finjustering", category: "integration", priority: "LÅG", organOwner: "Φ", description: "Finjustera dark mode palett." },
  { num: 33, title: "Accessibility-förbättring", category: "integration", priority: "LÅG", organOwner: "Θ", description: "ARIA, tangentbord, screen reader." },
  { num: 34, title: "Loading states", category: "integration", priority: "LÅG", organOwner: "Φ", description: "Skeletons och spinners." },
  { num: 35, title: "Error handling", category: "integration", priority: "MEDEL", organOwner: "Θ", description: "Felhantering och återställning." },
  { num: 36, title: "Caching av API-svar", category: "integration", priority: "LÅG", organOwner: "Δ", description: "Cacha fallstudier/kombinationer." },
  { num: 37, title: "SEO-optimering", category: "integration", priority: "LÅG", organOwner: "Μ", description: "Meta-taggar, structured data." },
  { num: 38, title: "Performance-optimering", category: "integration", priority: "MEDEL", organOwner: "Φ", description: "Lazy loading, code splitting." },
  { num: 39, title: "Integration mellan sektioner", category: "integration", priority: "MEDEL", organOwner: "Σ", description: "Cross-linking mellan sektioner." },
  { num: 40, title: "Cross-reference kurser ↔ fallstudier", category: "integration", priority: "MEDEL", organOwner: "α", description: "Länka kurser till relevanta fallstudier." },
  { num: 41, title: "Cross-reference indikatorer", category: "integration", priority: "MEDEL", organOwner: "α", description: "Visa relaterade indikatorer." },
  { num: 42, title: "Utbildningsvägar genom fallstudier", category: "fallstudie", priority: "LÅG", organOwner: "Ψ", description: "Guider genom fallstudier per nivå." },
];

async function seed() {
  if (!db) {
    console.error("LEGACY-SCRIPT: src/lib/db.ts är null sedan Supabase-migreringen — migrera till @/lib/supabase-rest innan detta script körs.");
    process.exit(1);
  }
  console.log("Seeding AK1A mega-project database...");

  // 1. Save styrelse meeting protocol
  try {
    const meeting = JSON.parse(readFileSync("/tmp/mega_meeting.json", "utf-8"));
    const yes = (meeting.decision.signatures || []).filter((s: any) => s.verdict === "JA").length;
    const no = (meeting.decision.signatures || []).filter((s: any) => s.verdict === "NEJ").length;
    await db.meetingProtocol.upsert({
      where: { meetingId: meeting.id },
      create: {
        meetingId: meeting.id,
        agenda: meeting.agenda,
        viewpoints: JSON.stringify(meeting.viewpoints),
        decision: JSON.stringify(meeting.decision),
        decisionTitle: meeting.decision.title,
        confidence: meeting.decision.confidence,
        passed: yes > no,
        signatures: JSON.stringify(meeting.decision.signatures),
      },
      update: {},
    });
    console.log(`✓ Saved meeting protocol ${meeting.id}: "${meeting.decision.title}" (${meeting.decision.confidence}, ${yes}JA/${no}NEJ)`);
  } catch (e: any) {
    console.log("⚠ Meeting protocol not saved:", e.message);
  }

  // 2. Seed 20 indicators (V01-V20)
  for (const ind of INDICATORS) {
    await db.ak1Indicator.upsert({
      where: { id: ind.id },
      create: {
        ...ind,
        lynchView: LYNCH_VIEWS[ind.id] || null,
        grahamView: GRAHAM_VIEWS[ind.id] || null,
        ak1View: AK1_VIEWS[ind.id] || null,
      },
      update: {
        lynchView: LYNCH_VIEWS[ind.id] || null,
        grahamView: GRAHAM_VIEWS[ind.id] || null,
        ak1View: AK1_VIEWS[ind.id] || null,
      },
    });
  }
  console.log(`✓ Seeded ${INDICATORS.length} indicators (V01-V20, inkl. ny V20 återköp av egna aktier)`);

  // 3. Seed 42 mega-tasks
  for (const t of MEGA_TASKS) {
    await db.megaTask.upsert({
      where: { num: t.num },
      create: { ...t, status: "pending", estimatedXp: t.priority === "HÖG" ? 200 : 100 },
      update: {},
    });
  }
  console.log(`✓ Seeded ${MEGA_TASKS.length} mega-tasks`);

  console.log("\n✅ Seed complete!");
  console.log("   - 1 meeting protocol saved");
  console.log("   - 20 indicators (V01-V20) with Lynch/Graham/AKM1 views");
  console.log("   - 42 mega-tasks pending");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db?.$disconnect();
  });

import { NextResponse } from "next/server";

/**
 * Förslag på dagordningar för styrelsemöten.
 * Används som "seed" så styrelsen alltid har något att visa,
 * och så att besökaren förstår vad styrelsen kan besluta om.
 */

export const runtime = "nodejs";

const SUGGESTED_AGENDAS: { id: string; title: string; agenda: string; category: string }[] = [
  {
    id: "nya-bolag",
    title: "Nästa bolag för analys",
    category: "Forskning",
    agenda:
      "Vilket bolag ska bli AK1A:s nästa 99-sidiga institutionella analys? Kandidater: Boliden (BOL.ST), Sinch (SINCH.ST), Öresund (ÖRES.ST), Embracer (EMBRAC-B.ST). Väg ledningens kvalitet, katalysatorer och reproducerbarhet.",
  },
  {
    id: "emission-risk",
    title: "Emission-risk i portföljen",
    category: "Risk",
    agenda:
      "Hur ska AK1A hantera bolag med svag kassatäckning och nyemissionsrisk (V19) i den rekommenderade portföljen? Ska vi varna hårdare, eller behålla spekulativa positioner med tydligare etikett?",
  },
  {
    id: "kunskapsmarknad",
    title: "Kunskapsmarknadens nästa 50 kurser",
    category: "Utbildning",
    agenda:
      "Vilka 50 kurser ska läggas till i kunskapsmarknaden nästa kvartal? Fokus på svensk retail-investerarens faktiska luckor — inte vad som säljer bäst.",
  },
  {
    id: "labb-tools",
    title: "Labbets 5 saknade verktyg",
    category: "Innovation",
    agenda:
      "Labbet har 3 av 8 verktyg i drift. Vilka 5 ska byggas härnäst? Prioritera reproducerbarhet — verktyg utan publicerad metodik ska inte byggas.",
  },
  {
    id: "honesty-policy",
    title: "Ärlighets-filter skärpning",
    category: "Kvalitet",
    agenda:
      "Ska AK1A ta bort alla påståenden som varken är MÄTT eller METODMÅL? Kvalitets-organet föreslår ett noll-tolerans-filter. Vad tycker styrelsen?",
  },
  {
    id: "mega-vision",
    title: "Mega-vision: 50 bolag till 2027",
    category: "Vision",
    agenda:
      "Vision-organet vill sätta målet 50 publicerade analyser till slutet av 2027 (idag 1). Är detta realistiskt utan att kompromissa med 99-sidorsdjupet? Vad krävs?",
  },
  {
    id: "anti-casino",
    title: "Anti-casino-principens gränser",
    category: "Strategi",
    agenda:
      "Anti-casino = inga push-notiser om priser. Men ska vi erbjuda frivillig prisövervakning (opt-in, tyst) för användare som begär det, eller hålla fast vid total tystnad?",
  },
  {
    id: "internationellt",
    title: "Internationell expansion — Norden först?",
    category: "Strategi",
    agenda:
      "Ska AK1A expandera till dansk/norsk/finsk marknad, eller stanna svensk tills metoden är fullt bevisad? Risken: urholkad pedagogisk kvalitet om vi sprider oss för tidigt.",
  },
];

export async function GET() {
  return NextResponse.json({ agendas: SUGGESTED_AGENDAS });
}

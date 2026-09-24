// Rond 161: boka v161 — SEO-spårets nästa översättningsluckor (B24/B25/B26 -en).
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const ko = '/home/ak1a/AK1/data/vakten/agentfabrik/ko';
if (!existsSync(ko)) mkdirSync(ko, { recursive: true });

const bas =
  'SAMMANHANG: AK1A Research Lab — svensk finansiell UTBILDNING. JURISTGRIND: ALDRIG investeringsråd — formulera ALLT som utbildning. KUNDENS KVALITETSDOKTRIN: noggrannhet före hastighet. ' +
  'SPÅR: SEO-GUIDER översättningsomgången — läs data/forskning/SEO-GUIDER-2026-09.md (särskilt översättningssektionen) FÖRE arbetet. REGler: exakt BlogPost-form (slug + "-en", samma title-struktur på engelska, description ≤155 tkn, samma pillar/author, publishedAt = originalets, samma readingMinutes, tags översatta, body fullständigt översatt med SAMMA tal och räkneexempel som originalet — översätt ALDRIM om siffrorna), disclaimer-sista-rad översatt med samma budskap, utbildningsformuleringar genomgående, inga nya källor/påståenden. Mall: läs ett levererat syskonpar (t.ex. data/blogg-utkast/halvledaraktier-sa-analyserar-du-halvledarbolag-en.json + dess svenska original) och följ dess exakta form. ';

const manifest = {
  id: 'v161-seo-oversattning-' + Date.now(),
  titel: 'VÅG 161: Spår 3 — SEO-översättningar B-ordning (medtech/vård/skog -en)',
  skapad: Date.now(),
  uppgifter: [
    {
      id: 'u1',
      titel: 'B24 medtech — engelsk spegel',
      prompt:
        bas +
        'UPPGIFT: översätt data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json till engelska och skriv data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-en.json. Du äger ENDAST målfilen — rör aldrig originalet eller syskonens filer. KONTROLLERA INNAN LEVERANS: JSON giltigt (node -e "JSON.parse(require(\'fs\').readFileSync(\'<fil>\',\'utf8\'))") , title ≤60 tkn, description ≤155, samma talvärden som originalet (diffa bodyns siffror mot originalet), disclaimer sista raden. Committa: git add <målfil> && git commit -m "studio: fabrik v161-u1 — medtech-guiden en-speglad". Pusha ENDAST om ytan i /home/ak1a/AK1 är ren. Avsluta med exakt raden: LEVERANS: data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-en.json + <commit-hash>',
    },
    {
      id: 'u2',
      titel: 'B25 vård — engelsk spegel',
      prompt:
        bas +
        'UPPGIFT: översätt data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag.json till engelska och skriv data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-en.json. Du äger ENDAST målfilen — rör aldrig originalet eller syskonens filer. KONTROLLERA INNAN LEVERANS: JSON giltigt (node -e "JSON.parse(require(\'fs\').readFileSync(\'<fil>\',\'utf8\'))"), title ≤60 tkn, description ≤155, samma talvärden som originalet (diffa bodyns siffror mot originalet), disclaimer sista raden. Committa: git add <målfil> && git commit -m "studio: fabrik v161-u2 — vård-guiden en-speglad". Pusha ENDAST om ytan i /home/ak1a/AK1 är ren. Avsluta med exakt raden: LEVERANS: data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-en.json + <commit-hash>',
    },
    {
      id: 'u3',
      titel: 'B26 skog — engelsk spegel',
      prompt:
        bas +
        'UPPGIFT: översätt data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag.json till engelska och skriv data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag-en.json. Du äger ENDAST målfilen — rör aldrig originalet eller syskonens filer. KONTROLLERA INNAN LEVERANS: JSON giltigt (node -e "JSON.parse(require(\'fs\').readFileSync(\'<fil>\',\'utf8\'))"), title ≤60 tkn, description ≤155, samma talvärden som originalet (diffa bodyns siffror mot originalet), disclaimer sista raden. Committa: git add <målfil> && git commit -m "studio: fabrik v161-u3 — skog-guiden en-speglad". Pusha ENDAST om ytan i /home/ak1a/AK1 är ren. Avsluta med exakt raden: LEVERANS: data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag-en.json + <commit-hash>',
    },
  ],
};

const sok = `${ko}/${manifest.id}.json`;
writeFileSync(sok, JSON.stringify(manifest, null, 2));
console.log('MANIFEST BOKAT:', sok);
console.log('id:', manifest.id, '| uppgifter:', manifest.uppgifter.length);

#!/usr/bin/env node
// PASS 2 — filomfattande mönsterbank-svepning för public/deep-courses.json (AK1A Research Lab)
// Regler: kirurgisk ersättning, kontextkontrollerad; åäö-säkra ordgränser via klassen
// [A-Za-z0-9_ÅÄÖåäö] (JS \w räknar INTE åäö). All regex-logik i denna .mjs-fil (REGEL 3).
//
// Användning (från repo-rot):
//   node verktyg/pass2-mönster.mjs scan    → träffinventering, skriver tmp_parts/pass2/scan-träffar.json
//   node verktyg/pass2-mönster.mjs fix     → applicerar AUTO-mönster (backup läggs i tmp_parts/pass2/)
//   nodeverktyg/pass2-mönster.mjs verify   → slutkontroll (0 kvarvarande träffar)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIL = path.join(ROOT, 'public', 'deep-courses.json');
const TMP = path.join(ROOT, 'tmp_parts', 'pass2');
fs.mkdirSync(TMP, { recursive: true });

// Ordgränsklasser (REGEL 3 — åäö-säkra)
const NWB = '[A-Za-z0-9_ÅÄÖåäö]';          // tecken som hör till ett ord
const vB = (s) => `(?<!${NWB})${s}(?!${NWB})`; // svensk "ordgräns runt uttryck"

// ---------------------------------------------------------------- AUTO-mönster
// Varje regel: id, grupp, re (global regex), ers (sträng eller funktion), kontextverifierad i pass 2.
// Ordning = exekveringsordning (specifika kontextregler före generiska).
const AUTO = [
  // ---- GRUPP D: specifika CJK/kyrilliska kontextersättningar (FÖRE generella D-regler)
  { id: 'D10 km-028: "kassaflöde och潜在的 för"→"…och potentialen för"', grupp: 'D', re: /kassaflöde och潜在的 för aktieåterköp/g, ers: 'kassaflöde och potentialen för aktieåterköp', max: 1 },
  { id: 'D11 blue-ocean quiz: "avgår成功"→"avgör framgång"', grupp: 'D', re: /avgår成功/g, ers: 'avgör framgång', max: 1 },
  { id: 'D12 blue-ocean: "fulla的应用"→"fulla tillämpning"', grupp: 'D', re: /fulla的应用/g, ers: 'fulla tillämpning', max: 1 },
  { id: 'D13 km-038: "till供应链-efektivitet"→"till leveranskedje-effektivitet"', grupp: 'D', re: /till供应链-efektivitet/g, ers: 'till leveranskedje-effektivitet', max: 1 },
  { id: 'D13b km-038: "nätverks effekter"→"nätverkseffekter"', grupp: 'D', re: /nätverks effekter/g, ers: 'nätverkseffekter', max: 1 },
  { id: 'D14 rk-10: "永久t ändra"→"permanent ändra"', grupp: 'D', re: /永久t ändra/g, ers: 'permanent ändra', max: 1 },
  { id: 'D15 mk-01: "resultat变动"→"resultatvariationer"', grupp: 'D', re: /resultat变动/g, ers: 'resultatvariationer', max: 1 },
  { id: 'D15b mk-01: "gapet, beräknad med"→"gapet, beräknat med"', grupp: 'D', re: /gapet, beräknad med/g, ers: 'gapet, beräknat med', max: 1 },
  { id: 'D16 sj-04: "skapa额外的"→"skapa extra"', grupp: 'D', re: /skapa额外的/g, ers: 'skapa extra', max: 1 },
  { id: 'D17 made-in-america: "sentimental瀚"→"sentimental" (spåretecken bort)', grupp: 'D', re: /sentimental瀚/g, ers: 'sentimental', max: 1 },
  { id: 'D18 made-in-america: "så:刺激 att stimulera"→"så: att stimulera" (dubblett bort)', grupp: 'D', re: /så:刺激 att stimulera/g, ers: 'så: att stimulera', max: 1 },
  { id: 'D19 mk-03: "nегативt"→"negativt" (blandat kyrilliskt)', grupp: 'D', re: /nегативt/g, ers: 'negativt', max: 1 },

  // ---- GRUPP D: generella kända CJK-mappningar (km-053 m.m.)
  { id: 'D01 沃尔沃→Volvo', grupp: 'D', re: /沃尔沃/g, ers: 'Volvo', max: 0 },
  { id: 'D02 闭环→sluten krets', grupp: 'D', re: /闭环/g, ers: 'sluten krets', max: 0 },
  { id: 'D03 瑞典→den svenska', grupp: 'D', re: /瑞典/g, ers: 'den svenska', max: 0 },
  { id: 'D04 噪音→brus', grupp: 'D', re: /噪音/g, ers: 'brus', max: 0 },
  { id: 'D05 无用→värdelös', grupp: 'D', re: /无用/g, ers: 'värdelös', max: 0 },
  { id: 'D06 潜在的→potentiella', grupp: 'D', re: /潜在的/g, ers: 'potentiella', max: 0 },
  { id: 'D07 鲸鱼→val', grupp: 'D', re: /鲸鱼/g, ers: 'val', max: 0 },
  { id: 'D08 友好→friendly', grupp: 'D', re: /友好/g, ers: 'friendly', max: 0 },
  { id: 'D09 подпис→prenumerations', grupp: 'D', re: /подпис/g, ers: 'prenumerations', max: 0 },

  // ---- GRUPP A: -ör→-or-släktet, -är→-ar-verb, åäö-degenereringar
  { id: 'A01 vågör→vågor (alla sammansättningar)', grupp: 'A', re: /vågör/g, ers: 'vågor', max: 0 },
  { id: 'A01b Vågör→Vågor (versal)', grupp: 'A', re: /Vågör/g, ers: 'Vågor', max: 0 },
  { id: 'A02 trädär→träder', grupp: 'A', re: /trädär/g, ers: 'träder', max: 0 },
  { id: 'A03 städär→städar', grupp: 'A', re: /städär/g, ers: 'städar', max: 0 },
  { id: 'A04 förebådär→förebådar', grupp: 'A', re: /förebådär/g, ers: 'förebådar', max: 0 },
  { id: 'A05 därfär→därför', grupp: 'A', re: /därfär/g, ers: 'därför', max: 0 },
  { id: 'A06 nivåär→nivåer', grupp: 'A', re: /nivåär/g, ers: 'nivåer', max: 0 },
  { id: 'A07 informationsöär→informationsöar', grupp: 'A', re: /informationsöär/g, ers: 'informationsöar', max: 0 },
  { id: 'A08 lönär→lönar', grupp: 'A', re: /lönär/g, ers: 'lönar', max: 0 },
  { id: 'A09 jämfär→jämför', grupp: 'A', re: /jämfär/g, ers: 'jämför', max: 0 },
  { id: 'A10 förvånär→förvånar', grupp: 'A', re: /förvånär/g, ers: 'förvånar', max: 0 },
  { id: 'A11 bärbär→bärbar', grupp: 'A', re: /bärbär/g, ers: 'bärbar', max: 0 },
  { id: 'A12 tjänär→tjänar', grupp: 'A', re: /tjänär/g, ers: 'tjänar', max: 0 },
  { id: 'A13 VD:är→VD:ar', grupp: 'A', re: /VD:är/g, ers: 'VD:ar', max: 0 },
  { id: 'A14 PR:är→PR:ar', grupp: 'A', re: /PR:är/g, ers: 'PR:ar', max: 0 },
  { id: 'A15 swinglägör→swinglägor', grupp: 'A', re: /swinglägör/g, ers: 'swinglägor', max: 0 },
  { id: 'A16 ränter→räntor (fristående)', grupp: 'A', re: new RegExp(`${vB('ränter')}`, 'g'), ers: 'räntor', max: 0 },
  { id: 'A24 förmågör→förmågor', grupp: 'A', re: /förmågör/g, ers: 'förmågor', max: 0 },
  { id: 'A18 langsamt→långsamt (identifieraren tanka-snabbt-och-langsamt undantas)', grupp: 'A', re: /(?<!tanka-snabbt-och-)langsamt/g, ers: 'långsamt', max: 0 },
  { id: 'A19 framtiga→framtida', grupp: 'A', re: /framtiga/g, ers: 'framtida', max: 0 },
  { id: 'A20 overdriver→överdriver', grupp: 'A', re: /overdriver/g, ers: 'överdriver', max: 0 },
  { id: 'A21 overdrivna→överdrivna', grupp: 'A', re: /overdrivna/g, ers: 'överdrivna', max: 0 },
  { id: 'A22 overstiger→överstiger', grupp: 'A', re: /overstiger/g, ers: 'överstiger', max: 0 },
  { id: 'A25 overvakningsrutinen→övervakningsrutinen', grupp: 'A', re: /overvakningsrutinen/g, ers: 'övervakningsrutinen', max: 0 },
  { id: 'A26 overmodig→övermodig', grupp: 'A', re: /overmodig/g, ers: 'övermodig', max: 0 },
  { id: 'A27 overanalys→överanalys', grupp: 'A', re: /overanalys/g, ers: 'överanalys', max: 0 },
  { id: 'A28 overdröjs→överdröjs (diakritisk återställning, osäker)', grupp: 'A', re: /overdröjs/g, ers: 'överdröjs', max: 0 },
  { id: 'A29 marknaktör→marknadsaktör', grupp: 'A', re: /marknaktör/g, ers: 'marknadsaktör', max: 0 },
  { id: 'A30 högmariginalaktör→högmarginalaktör', grupp: 'A', re: /högmariginalaktör/g, ers: 'högmarginalaktör', max: 0 },
  { id: 'A31 "ochför"→"och för" (bortsatt mellanslag)', grupp: 'A', re: new RegExp(`${vB('ochför')}`, 'g'), ers: 'och för', max: 0 },
  { id: 'A32 VÅGÖR→VÅGOR (versalvariant)', grupp: 'A', re: /VÅGÖR/g, ers: 'VÅGOR', max: 0 },
  { id: 'A33 FÖRBEREDELSEFRÅGÖR→FÖRBEREDELSEFRÅGOR', grupp: 'A', re: /FÖRBEREDELSEFRÅGÖR/g, ers: 'FÖRBEREDELSEFRÅGOR', max: 0 },
  { id: 'A34 "samma ända"→"samma ände" (ända-familjen, expert C:s precedent)', grupp: 'A', re: /samma ända/g, ers: 'samma ände', max: 0 },
  { id: 'A35 "avmekanisiserar"→"mekaniserar" (rekonstruktion — flaggas)', grupp: 'A', re: /avmekanisiserar/g, ers: 'mekaniserar', max: 0 },
  { id: 'A17 undvita→undvika', grupp: 'E', re: /undvita/g, ers: 'undvika', max: 0 },
  { id: 'A23 mjukt bindestreck U+00AD bort', grupp: 'A', re: /\u00ad/g, ers: '', max: 0 },

  // ---- GRUPP B: engelska läckor (ordning: B02 före B07)
  { id: 'B01 varför detta matters→spelar roll', grupp: 'B', re: /[Vv]arför detta matters/g, ers: 'varför detta spelar roll', max: 0 },
  { id: 'B02 En systematisk approach till→Ett systematiskt angreppssätt för', grupp: 'B', re: /[Ee]n systematisk approach till/g, ers: 'Ett systematiskt angreppssätt för', max: 0 },
  { id: 'B07a -approach→-ansats (sammansättningar)', grupp: 'B', re: /-approach/g, ers: '-ansats', max: 0 },
  { id: 'B07b approach→ansats (övriga fristående)', grupp: 'B', re: new RegExp(`${vB('approach')}`, 'g'), ers: 'ansats', max: 0 },
  { id: 'B03 fiscal politik→finanspolitik', grupp: 'B', re: /fiscal politik/gi, ers: 'finanspolitik', max: 0 },
  { id: 'B05 strategien→strategin (dansk/norsk spår)', grupp: 'B', re: /strategien/g, ers: 'strategin', max: 0 },
  { id: 'B06 Kina-USAs→Kina-USA:s', grupp: 'B', re: /Kina-USAs/g, ers: 'Kina-USA:s', max: 0 },

  // ---- GRUPP C: läg→lag (filomfattande; samtliga 109 kontexter granskade = "lag")
  { id: 'C07 fristående läg→lag (global, versalmedveten)', grupp: 'C', re: new RegExp(`${vB('[lL]äg')}`, 'g'), ers: (m) => (m === 'Läg' ? 'Lag' : 'lag'), max: 0 },

  // ---- GRUPP E: mallfel (ordning: E01 före E02; E07 före E08)
  { id: 'E01 AK1M1→AKM1', grupp: 'E', re: /AK1M1/g, ers: 'AKM1', max: 0 },
  { id: 'E02 AK1M→AKM1', grupp: 'E', re: /AK1M/g, ers: 'AKM1', max: 0 },
  { id: 'E03 från svenska börsen→från den svenska börsen', grupp: 'E', re: /från svenska börsen/g, ers: 'från den svenska börsen', max: 0 },
  { id: 'E04 Sann/Sanna mästerskap→Sant mästerskap', grupp: 'E', re: /(Sann|Sanna) mästerskap/g, ers: 'Sant mästerskap', max: 0 },
  { id: 'E05 Esg→ESG', grupp: 'E', re: new RegExp(`${vB('Esg')}`, 'g'), ers: 'ESG', max: 0 },
  { id: 'E06 AK1 Research Lab→AK1A Research Lab', grupp: 'E', re: /AK1 Research Lab/g, ers: 'AK1A Research Lab', max: 0 },
  { id: 'E07 kognitiva bias→kognitiva biaser (plural; singular "den/denna kognitiva bias" lämnas)', grupp: 'E', re: new RegExp(`kognitiva bias(?!${NWB})`, 'g'), ers: (m, offset, s) => (/[Dd]en(?:na)?\s+$/.test(s.slice(0, offset)) ? m : 'kognitiva biaser'), max: 0 },
  { id: 'E07b Kognitiva bias→Kognitiva biaser (meningsinledande plural, bf-11)', grupp: 'E', re: new RegExp(`Kognitiva bias(?!${NWB})`, 'g'), ers: 'Kognitiva biaser', max: 0 },
  { id: 'E08 "biaser särskilt relevant"→"biaser särskilt relevanta" (kongruens, idempentsäker)', grupp: 'E', re: /biaser särskilt relevant(?![a-zåäö])/g, ers: 'biaser särskilt relevanta', max: 0 },
  { id: 'B04 av roa./roe./ebitda./p/e./arr./fcf.→versaler i tips', grupp: 'E', re: /av (roa|roe|ebitda|p\/e|arr|fcf)\./gi, ers: (_, w) => 'av ' + w.toUpperCase() + '.', max: 0 },
  { id: 'E09 "läs alltid v07 tillsammans"→V07 (versal i löptext)', grupp: 'E', re: /läs alltid v07 tillsammans/g, ers: 'läs alltid V07 tillsammans', max: 1 },
  { id: 'E10 "intäkter (v12)"→(V12) (versal i löptext)', grupp: 'E', re: /intäkter \(v12\)/g, ers: 'intäkter (V12)', max: 1 },

  // ---- GRUPP F: dubbelord (endast entydigt felaktiga; ordgräns på BÅDA orden)
  { id: 'F01 att att→att', grupp: 'F', re: new RegExp(`${vB('att')} ${vB('att')}`, 'g'), ers: 'att', max: 0 },
  { id: 'F02 sig sig→sig', grupp: 'F', re: new RegExp(`${vB('sig')} ${vB('sig')}`, 'g'), ers: 'sig', max: 0 },
  { id: 'F03 i i→i', grupp: 'F', re: new RegExp(`${vB('i')} ${vB('i')}`, 'g'), ers: 'i', max: 0 },
  { id: 'F06 och och→och', grupp: 'F', re: new RegExp(`${vB('och')} ${vB('och')}`, 'g'), ers: 'och', max: 0 },
  { id: 'F07 eller eller→eller', grupp: 'F', re: new RegExp(`${vB('eller')} ${vB('eller')}`, 'g'), ers: 'eller', max: 0 },
  { id: 'F08 "ingenting om om"→"ingenting om" (akm1:s legitima "rullas om om" rörs ej)', grupp: 'F', re: /ingenting om om/g, ers: 'ingenting om', max: 1 },
];

// ------------------------------------------------- GRANSKNINGSMÖNSTER (redovisas, ersätts ej automatiskt)
const GRANSKA = [
  { id: 'R-läg fristående', re: new RegExp(`${vB('läg')}`, 'g') },
  { id: 'R-CJK alla', re: /[\u2e80-\u2eff\u3000-\u303f\u3040-\u30ff\u3130-\u318f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/g },
  { id: 'R-kyrilliskt', re: /[\u0400-\u04ff]/g },
  { id: 'R-approach', re: new RegExp(`${vB('[a-zåäöA-ZÅÄÖ-]*approach')}`, 'g') },
  { id: 'R-matters', re: new RegExp(`${vB('matters')}`, 'g') },
  { id: 'R-sustained', re: new RegExp(`${vB('sustained')}`, 'g') },
  { id: 'R-founded/spun off', re: new RegExp(`${vB('(founded|spun)')} off?`, 'g') },
  { id: 'R-opportunity', re: new RegExp(`${vB('opportunit')}[a-zåäö]*`, 'g') },
  { id: 'R-beyond/within/compliance', re: new RegExp(`${vB('(beyond|within|compliance)')}`, 'g') },
  { id: 'R-sasongs', re: /sasongs/g },
  { id: 'R-det det', re: new RegExp(`${vB('det')} ${vB('det')}`, 'g') },
  { id: 'R-finns finns', re: new RegExp(`${vB('finns')} ${vB('finns')}`, 'g') },
  { id: 'R-den den', re: new RegExp(`${vB('den')} ${vB('den')}`, 'g') },
  { id: 'R-de de', re: new RegExp(`${vB('de')} ${vB('de')}`, 'g') },
  { id: 'R-som som', re: new RegExp(`${vB('som')} ${vB('som')}`, 'g') },
  { id: 'R-med med', re: new RegExp(`${vB('med')} ${vB('med')}`, 'g') },
  { id: 'R-var var', re: new RegExp(`${vB('var')} ${vB('var')}`, 'g') },
  { id: 'R-en en', re: new RegExp(`${vB('en')} ${vB('en')}`, 'g') },
  { id: 'R-ett ett', re: new RegExp(`${vB('ett')} ${vB('ett')}`, 'g') },
  { id: 'R-kognitiva bias (singular)', re: new RegExp(`kognitiva bias(?!${NWB})`, 'g') },
  { id: 'R-dessa bias', re: new RegExp(`dessa bias(?!${NWB})`, 'g') },
  { id: 'R-systematiska bias', re: new RegExp(`systematiska bias(?!${NWB})`, 'g') },
  { id: 'R-over-prefix', re: new RegExp(`(?<!${NWB})over[a-zåäö]{3,}`, 'g') },
  { id: 'R-norska spår', re: new RegExp(`${vB('(branssen|strategien|akvisitioner|produksjon|grönn|lettit|quotan|ägt)')}`, 'g') },
  { id: 'R-Kina-USAs', re: /Kina-USAs/g },
  { id: 'R-övriga -ör-slut', re: new RegExp(`[a-zåäö]{2,}ör(?!${NWB})`, 'g') },
];

// ------------------------------------------------------------------ hjälpare
function läsin() {
  const rå = fs.readFileSync(FIL, 'utf8');
  const d = JSON.parse(rå);
  return { rå, d };
}
function sträck(d) {
  let kap = 0, quiz = 0;
  for (const k of Object.keys(d)) {
    const c = d[k];
    kap += (c.chapters || []).length;
    for (const ch of c.chapters || []) quiz += (ch.quiz || []).length;
  }
  return { kurser: Object.keys(d).length, kapitel: kap, quiz };
}
function kontext(s, i, len, rad = 46) {
  return s.slice(Math.max(0, i - rad), i) + '⟦' + s.slice(i, i + len) + '⟧' + s.slice(i + len, i + len + rad);
}
// Samlar referenser till ALLA strängvärden i objektträdet (muterbara ställen)
function samlaSträngar(nod, ut) {
  if (typeof nod === 'string') ut.push(nod);
  else if (Array.isArray(nod)) { for (const v of nod) samlaSträngar(v, ut); }
  else if (nod && typeof nod === 'object') { for (const k of Object.keys(nod)) samlaSträngar(nod[k], ut); }
}

// ---------------------------------------------------------------------- SCAN
function scan() {
  const { d } = läsin();
  const b = sträck(d);
  console.log(`SCAN-bas: ${b.kurser} kurser · ${b.kapitel} kapitel · ${b.quiz} quiz`);
  const autoStat = {};   // id → {antal, kurser:Set}
  const granskaTräff = {}; // id → [{kurs, plats, kontext}]
  const frekvens = {};   // id → {ord: antal} för ordmönster
  // Dedikerad kontroll: misstänkt förstörda block (mycket kort innehåll utan mellanslag)
  granskaTräff['R-misstänkt förstörda block'] = [];
  for (const ck of Object.keys(d)) {
    const kurs = d[ck];
    (kurs.chapters || []).forEach((ch, ci) => {
      (ch.blocks || []).forEach((bl, bi) => {
        const c = bl && bl.content;
        if (typeof c === 'string' && c.length > 0 && c.length <= 15 && !/\s/.test(c)) {
          granskaTräff['R-misstänkt förstörda block'].push({ kurs: kurs.slug || ck, plats: `chapters[${ci}].blocks[${bi}] (kap "${ch.title || ''}")`, kontext: `type=${bl.type} content=⟦${c}⟧` });
        }
      });
      (ch.quiz || []).forEach((qz, qi) => {
        const t = qz && qz.tips;
        if (typeof t === 'string' && t.length > 0 && t.length <= 10 && !/\s/.test(t)) {
          granskaTräff['R-misstänkt förstörda block'].push({ kurs: kurs.slug || ck, plats: `chapters[${ci}].quiz[${qi}].tips`, kontext: `⟦${t}⟧` });
        }
      });
    });
  }
  if (granskaTräff['R-misstänkt förstörda block'].length === 0) delete granskaTräff['R-misstänkt förstörda block'];
  for (const ck of Object.keys(d)) {
    const kurs = d[ck];
    const fields = [];
    samlaSträngar(kurs, fields);
    for (const s of fields) {
      for (const r of AUTO) {
        const m = s.match(r.re);
        if (m) {
          autoStat[r.id] ??= { antal: 0, kurser: new Set() };
          autoStat[r.id].antal += m.length;
          autoStat[r.id].kurser.add(kurs.slug || ck);
        }
      }
      for (const r of GRANSKA) {
        let m; r.re.lastIndex = 0;
        while ((m = r.re.exec(s)) !== null) {
          granskaTräff[r.id] ??= [];
          if (granskaTräff[r.id].length < 2000)
            granskaTräff[r.id].push({ kurs: kurs.slug || ck, kontext: kontext(s, m.index, m[0].length) });
          // frekvenstabell för ordmönster
          if (r.id === 'R-övriga -ör-slut' || r.id === 'R-over-prefix' || r.id === 'R-norska spår') {
            frekvens[r.id] ??= {};
            frekvens[r.id][m[0]] = (frekvens[r.id][m[0]] || 0) + 1;
          }
        }
      }
    }
  }
  const ut = {
    bas: b,
    auto: Object.fromEntries(Object.entries(autoStat).map(([id, v]) => [id, { antal: v.antal, kurser: [...v.kurser] }])),
    granska: Object.fromEntries(Object.entries(granskaTräff).map(([id, v]) => [id, { antal: v.length, träff: v }])),
    frekvens,
  };
  fs.writeFileSync(path.join(TMP, 'scan-träffar.json'), JSON.stringify(ut, null, 2));
  console.log('\n=== AUTO-mönster (räknade träffar) ===');
  for (const [id, v] of Object.entries(ut.auto)) console.log(`${String(v.antal).padStart(5)}  ${id}  [${v.kurser.length} kurser]`);
  console.log('\n=== GRANSKNINGSMÖNSTER (träffar att bedöma) ===');
  for (const [id, v] of Object.entries(ut.granska)) console.log(`${String(v.antal).padStart(5)}  ${id}`);
  console.log('\n=== FREKVENSTABELLER (ordmönster) ===');
  for (const [id, f] of Object.entries(frekvens)) {
    const sorterad = Object.entries(f).sort((a, b2) => b2[1] - a[1]);
    console.log(`${id}: ` + sorterad.map(([w, n]) => `${w}(${n})`).join(', '));
  }
  console.log('\nFullständiga träfflistor: tmp_parts/pass2/scan-träffar.json');
}

// ----------------------------------------------------------------------- FIX
function fix() {
  const { d } = läsin();
  const b0 = sträck(d);
  const backupSökväg = path.join(TMP, 'backup-deep-courses-före-pass2.json');
  if (!fs.existsSync(backupSökväg)) {
    fs.copyFileSync(FIL, backupSökväg);
    console.log(`Backup: tmp_parts/pass2/backup-deep-courses-före-pass2.json`);
  } else {
    console.log('Backup finns redan (före pass 2) — behålls oförändrad.');
  }
  const stat = {}; // id → {antal, kurser:Set, platser:[första 30]}
  for (const r of AUTO) {
    r.re.lastIndex = 0;
    stat[r.id] = { antal: 0, kurser: new Set(), platser: [] };
    for (const ck of Object.keys(d)) {
      for (const kk of Object.keys(d[ck])) {
        const värde = d[ck][kk];
        const nytt = ersättRec(värde, r, stat[r.id], d[ck].slug || ck, kk);
        if (nytt !== undefined) d[ck][kk] = nytt;
      }
    }
  }
  fs.writeFileSync(FIL, JSON.stringify(d, null, 2) + '\n');
  const b1 = sträck(JSON.parse(fs.readFileSync(FIL, 'utf8')));
  console.log(`Före: ${b0.kurser} kurser · ${b0.kapitel} kapitel · ${b0.quiz} quiz`);
  console.log(`Efter: ${b1.kurser} kurser · ${b1.kapitel} kapitel · ${b1.quiz} quiz`);
  if (b0.kurser !== 333 || b1.quiz !== 8211 || b0.kapitel !== b1.kapitel) { console.error('STRUKTURAVVIKELSE — avbryter'); process.exit(1); }
  const ut = Object.fromEntries(Object.entries(stat).map(([id, v]) => [id, { antal: v.antal, kurser: [...v.kurser], platser: v.platser }]));
  fs.writeFileSync(path.join(TMP, 'fix-statistik.json'), JSON.stringify(ut, null, 2));
  console.log('\n=== Utförda ersättningar ===');
  for (const [id, v] of Object.entries(ut)) if (v.antal > 0) console.log(`${String(v.antal).padStart(5)}  ${id}  [${v.kurser.length} kurser]`);
}
function ersättRec(nod, r, statObj, kursSlug, sökväg) {
  let ändrad = false;
  if (typeof nod === 'string') {
    r.re.lastIndex = 0;
    const antal = (nod.match(r.re) || []).length;
    if (antal > 0) {
      r.re.lastIndex = 0;
      const ny = nod.replace(r.re, r.ers);
      statObj.antal += antal;
      statObj.kurser.add(kursSlug);
      if (statObj.platser.length < 30) statObj.platser.push(`${kursSlug} ${sökväg}`);
      return ny;
    }
    return nod;
  }
  if (Array.isArray(nod)) {
    for (let i = 0; i < nod.length; i++) {
      const ny = ersättRec(nod[i], r, statObj, kursSlug, `${sökväg}[${i}]`);
      if (ny !== nod[i]) { nod[i] = ny; ändrad = true; }
    }
    return ändrad ? nod : nod;
  }
  if (nod && typeof nod === 'object') {
    for (const k of Object.keys(nod)) {
      if (k === 'slug') continue; // REGEL 2: identifierare (slug) får ALDRIG ändras
      const ny = ersättRec(nod[k], r, statObj, kursSlug, `${sökväg}.${k}`);
      if (ny !== nod[k]) { nod[k] = ny; ändrad = true; }
    }
    return nod;
  }
  return nod; // primitiver (number/boolean/null) returneras OFÖRÄNDRADE — aldrig undefined!
}

// -------------------------------------------------------------------- VERIFY
function verify() {
  const { d, rå } = läsin();
  const b = sträck(d);
  console.log(`Verifiering: JSON.parse OK · ${b.kurser} kurser · ${b.kapitel} kapitel · ${b.quiz} quiz`);
  const fel = [];
  if (b.kurser !== 333) fel.push(`kursantal ${b.kurser} ≠ 333`);
  if (b.quiz !== 8211) fel.push(`quizantal ${b.quiz} ≠ 8211`);
  if (b.kapitel !== 2916) fel.push(`kapitelantal ${b.kapitel} ≠ 2916`);
  // kvarvarande träffar på AUTO-mönster (endast strängar som VERKLIGEN skulle
  // ändras räknas — idempventa ersättare kan träffa rättad text utan förändring)
  const { d: dd } = läsin();
  const strLista = [];
  // slug-fält (identifierare) exkluderas — de får aldrig räknas som rättbara text
  for (const ck of Object.keys(dd)) {
    const kopia = { ...dd[ck] }; delete kopia.slug; samlaSträngar(kopia, strLista);
  }
  for (const r of AUTO) {
    let n = 0;
    for (const s of strLista) {
      r.re.lastIndex = 0;
      if (s.replace(r.re, r.ers) !== s) n++;
    }
    if (n > 0) fel.push(`${n} strängar med kvarvarande: ${r.id}`);
  }
  // identifierar-integritet: nyckel och slug ska överensstämma
  for (const k of Object.keys(dd)) if (dd[k].slug !== k) fel.push(`nyckel≠slug: ${k} ↔ ${dd[k].slug}`);
  // CJK/kyrilliskt
  const cjk = rå.match(/[\u2e80-\u2eff\u3000-\u303f\u3040-\u30ff\u3130-\u318f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef\u0400-\u04ff]/g);
  if (cjk) fel.push(`${cjk.length} icke-latinska tecken kvar: ${[...new Set(cjk)].join(' ')}`);
  // förstörda sasongs-block
  const sas = (rå.match(/sasongs/g) || []).length;
  if (sas > 0) fel.push(`${sas} kvarvarande "sasongs"-block`);
  console.log(fel.length === 0 ? 'ALLT GRÖNT: 0 kvarvarande mönsterträffar, 0 icke-latinska tecken.' : 'FEL KVAR:\n' + fel.join('\n'));
  process.exit(fel.length === 0 ? 0 : 2);
}

// -------------------------------------------------------------------- RESCUE
// STEG 3 — dataräddning: förstörda "sasongs"-block (type="visuell") ersätts med
// ärlig platsmarkör. Originalexten kan ej återskapas; varje plats loggas.
function rescue() {
  const { d } = läsin();
  const b0 = sträck(d);
  const PLATS = 'Detta stycke skadades i en tidigare databearbetning och ska återskapas — se data/rapporter/pass2-mönsterbank för spår.';
  const platser = [];
  for (const ck of Object.keys(d)) {
    const c = d[ck];
    (c.chapters || []).forEach((ch, ci) => {
      (ch.blocks || []).forEach((bl, bi) => {
        if (typeof bl.content === 'string' && bl.content.includes('sasongs')) {
          platser.push(`${c.slug || ck} chapters[${ci}].blocks[${bi}] (kapitel "${ch.title || ''}") — gammalt innehåll: ${JSON.stringify(bl.content)}`);
          bl.content = PLATS;
        }
      });
    });
  }
  if (platser.length === 0) { console.log('Inga sasongs-block hittades — inget att återskapa.'); return; }
  fs.writeFileSync(FIL, JSON.stringify(d, null, 2) + '\n');
  const b1 = sträck(JSON.parse(fs.readFileSync(FIL, 'utf8')));
  console.log(`Platsmarkörer insatta: ${platser.length}`);
  for (const p of platser) console.log('  ' + p);
  console.log(`Före: ${b0.kurser}/${b0.kapitel}/${b0.quiz} · Efter: ${b1.kurser}/${b1.kapitel}/${b1.quiz}`);
  if (b1.kurser !== 333 || b1.quiz !== 8211 || b1.kapitel !== b0.kapitel) { console.error('STRUKTURAVVIKELSE — avbryter'); process.exit(1); }
  fs.writeFileSync(path.join(TMP, 'rescue-logg.json'), JSON.stringify({ platsmarkörText: PLATS, platser }, null, 2));
}

const läge = process.argv[2];
if (läge === 'scan') scan();
else if (läge === 'fix') fix();
else if (läge === 'rescue') rescue();
else if (läge === 'verify') verify();
else { console.log('Använd: node verktyg/pass2-mönster.mjs scan|fix|rescue|verify'); process.exit(1); }

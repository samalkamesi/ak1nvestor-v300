// Sond för s5-u2 omgång 26 (manifest auto-s5-1789989925484): kandidat-ämnen mot hela registret.
// Räknar träffar i ALLA textfält per kurs; en "ägare" = kurs vars kärna (titel/summary/why/learn) bär termen.
import { readFileSync } from 'node:fs';

const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const kurser = Object.values(reg);

const TERMER = {
  'st-07 skuggskuld/borgen': ['borgen', 'borgensåtagande', 'garantiåtagande', 'borgen för', 'skuggskuld', 'utanför balansräkningen'],
  'st-07 kontantströmsbörden': ['förbindelse', 'åtagandena', 'beställningsstock', 'oskyddade'],
  'kt-10 avknoppning/spin-off': ['avknoppning', 'avknoppas', 'spin-off', 'spin off', 'splittas', 'frigörandet'],
  'ks-09 konvertibel': ['konvertibel', 'konvertibler', 'växelkedja', 'omvandlingspremie'],
  'pe-08 avgiftsmaskin 2/20': ['carried interest', 'hurdle', 'waterfall', 'två och tjugo', '2/20', 'successionsavgift'],
  'pe-08 management fee': ['förvaltningsarvode', 'management fee', 'avgiftsmaskin'],
  'roic-06 finansiella bolag': ['riskvägt', 'bankernas lönsamhet', 'utlåningsmarginal', 'tier 1'],
  'ln-06 skattesats/uppskov': ['uppskjuten skatt', 'uppskovna skatter', 'effektiv skattesats', 'skatteskillnad', 'latent skatt'],
  'se-24 transport/logistik': ['logistik', 'frakt', 'rederi', 'container', 'godsjärnväg'],
  'se-24 flyg': ['flygbolag', 'luftfart', 'passagerare per', 'skeppnings'],
  'vr-10 krisvärdering': ['rekonstruktion', 'krisvärdering', 'obestånd', 'distressed', 'ackord'],
  'vm-12 ev/sales': ['ev/sales', 'ev sales', 'pris per omsättningskrona'],
  'bk-09 avsättningar': ['avsättning', 'avsättningar', 'omstruktureringsavsättning', 'garantiavsättning'],
  'am-10 handelsplatform/mörker': ['mörkpool', 'dark pool', 'orderflöde', 'betala för orderflöde'],
  'rk-17 likviditetsrisk': ['likviditetsrisk', 'likviditetsfällan', 'marknadslikviditet'],
  'ud-10 utdelningspolicy signal': ['utdelningspolicy', 'signaleffekten', 'utdelningsbesked'],
};

function textAv(kurs) {
  const delar = [kurs.title, kurs.summary, kurs.why, kurs.learn, kurs.lynchSection, kurs.grahamSection, kurs.ak1Section];
  if (Array.isArray(kurs.chapters_list)) delar.push(...kurs.chapters_list.flatMap(c => [c?.title, c?.text].filter(Boolean)));
  if (Array.isArray(kurs.chapters)) delar.push(...kurs.chapters.flatMap(c => [c?.title, c?.text, ...(c?.bullets || [])].filter(Boolean)));
  if (kurs.history) delar.push(JSON.stringify(kurs.history));
  return delar.filter(Boolean).join('\n').toLowerCase();
}

const rader = [];
for (const [amne, termer] of Object.entries(TERMER)) {
  for (const t of termer) {
    const agare = [];
    for (const k of kurser) {
      const txt = textAv(k);
      if (txt.includes(t.toLowerCase())) agare.push(k.slug || '?');
    }
    rader.push(`${amne} :: "${t}" => ${agare.length} träffar${agare.length ? ': ' + agare.slice(0, 6).join(', ') + (agare.length > 6 ? ' …' : '') : ' — RENT'}`);
  }
}
console.log(rader.join('\n'));
console.log('\n=== KATEGORI/NIVÅ FÖR KANDIDATFAMILJER ===');
for (const fam of ['st', 'kt', 'ks', 'pe', 'roic', 'ln', 'se', 'vr', 'vm', 'bk', 'am', 'rk', 'ud']) {
  const ks = Object.values(reg).filter(k => (k.slug || '').startsWith(fam + '-'));
  if (!ks.length) continue;
  console.log(`${fam}: kategori="${ks[0].category}" nivåer=[${ks.map(k => k.level).join(',')}] minuter=[${ks.map(k => k.minutes).join(',')}]`);
}

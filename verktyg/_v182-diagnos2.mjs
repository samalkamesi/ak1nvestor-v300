// kolla forbjudnaFraser: antal, \bkunder\b-regelns kontext, jämför med v166-granskarens 26
import { readFileSync } from 'node:fs';
const v = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/varumarke.json', 'utf8'));
const list = v.forbjudnaFraser || [];
console.log('forbjudnaFraser antal:', list.length);
list.forEach((f, i) => {
  const s = JSON.stringify(f);
  if (f.fran && /kunder|kund|elev/i.test(f.fran)) console.log(i, s.slice(0, 300));
});
// hur såg v166-listan ut? _r175 använde ALLA fran — men vilka? skriv antal + de med FEL-nivå
console.log('--- alla fran (index: mönster):');
list.forEach((f, i) => console.log(i, f.fran, '| nivå:', f.niva || f.namn || '?'));

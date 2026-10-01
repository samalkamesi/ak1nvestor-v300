// testa-desk-tangentbord — strukturtest för DESK-U31 (U24 GAP 6:
// mobil-tangentbordets tysta döda tangenter). Statiskt kontraktstest som
// läser desk-web-kopian och verifierar att
//   (a) kuren sitter i app/ui.js: keysymForInputChar översätter '\n'/'\r'
//       → XK_Return + '\t' → XK_Tab (kontrolltecknen under keysymdef:s
//       Latin-1-golv 0x20 föll innan ut i Unicode-fallbacken 0x01000000|u
//       som X-servern släpper tyst), och keyInput-skickloopen går via den,
//   (b) dedup-ankaret: keyEvent (touchKeyboard.onkeyevent) minns senaste
//       nedtryckta keysym, och keysymForInputChar stryker tecken som
//       keydown-vägen levererat inom 150 ms — input-vägen är FALLBACK,
//       aldrig tvilling (dubbel-Enter/-å-klassen på OSK med äkta keydown),
//   (c) svenska teckens mappning ORÖRD: å/ä/ö/Å/Ä/Ö ∈ Latin-1 (parsat ur
//       keysymdef.js egen intervallrad) går fortfarande via keysyms.lookup,
//   (d) core/ + vendor/ SHA-IDENTISKA med DESK-U31:s FÖRE-tillstånd
//       (manifestregeln — kuren är enbart i app-lagret) + ui.js = den
//       kurade DESK-U31-versionen (vakar mot tyst lost-update),
//   (e) rotens fortlevnad i core (bevisar KVARVARANDE protokollsgräns):
//       keyboard.js talar fortfarande 229-kommentarsspråk och keysymdef
//       saknar mappning för 10/9/13 — kvar att bota uppströms, vår kopia
//       kurar i app-lagret.
//
// Körs: node verktyg/testa-desk-tangentbord.mjs  (exit 0 = alla PASS)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROT = '/home/ak1a/desk-web';
const ui = readFileSync(`${ROT}/app/ui.js`, 'utf8');
const keysymdef = readFileSync(`${ROT}/core/input/keysymdef.js`, 'utf8');
const keysym = readFileSync(`${ROT}/core/input/keysym.js`, 'utf8');
const keyboard = readFileSync(`${ROT}/core/input/keyboard.js`, 'utf8');

// DESK-U31:s mätvärden (FÖRE-ingrepp 2026-10-01 ~12:10 UTC):
const CORE_VENDOR_SHA_FORE = '81f9a37a7647ab30fecac7db7144b744df1c8b1b514360a532746eebf3819c4d';
const UI_SHA_EFTER = 'ec56af9328f3958a147a16b688c59f7c33bc506b5d3831863f4060c45a948b0f';

let pass = 0, fail = 0;
function kontroll(id, villkor, beskrivning) {
    if (villkor) { pass++; console.log(`PASS ${id}: ${beskrivning}`); }
    else { fail++; console.log(`FAIL ${id}: ${beskrivning}`); }
}

// Rekonstruerar `find core vendor -type f | sort | xargs sha256sum | sha256sum`
// i ren node: relativa sökvägar i EN sortrad lista ("core/…" före
// "vendor/…"), sha256sum-rader på formatet "<hash>  <sökväg>\n", samlat
// till en hash — byteidentiskt med bash-mätningen i protokollet.
function samladShaCoreVendor() {
    const rel = [];
    for (const mapp of ['core', 'vendor']) {
        (function samla(bas) {
            for (const namn of readdirSync(bas).sort()) {
                const vag = join(bas, namn);
                if (statSync(vag).isDirectory()) samla(vag);
                else rel.push(vag.slice(ROT.length + 1));
            }
        })(`${ROT}/${mapp}`);
    }
    const filer = rel.sort();
    const rader = filer.map(v =>
        createHash('sha256').update(readFileSync(join(ROT, v))).digest('hex') + '  ' + v + '\n'
    ).join('');
    return createHash('sha256').update(rader).digest('hex');
}

function filSha(vag) {
    return createHash('sha256').update(readFileSync(vag)).digest('hex');
}

// A — kuren kopplad i app-lagret
kontroll('A1',
    /keysymForInputChar\(ch\)\s*\{\s*switch \(ch\)\s*\{\s*case '\\n':\s*case '\\r':\s*return \{ keysym: KeyTable\.XK_Return, code: "Enter" \};\s*case '\\t':\s*return \{ keysym: KeyTable\.XK_Tab, code: "Tab" \};/.test(ui),
    'ui.js: keysymForInputChar översätter \\n/\\r → XK_Return (code "Enter") och \\t → XK_Tab (code "Tab")');

kontroll('A2',
    /const par = UI\.keysymForInputChar\(newValue\.charAt\(i\)\);\s*\n\s*if \(par === null\) continue;\s*\n\s*UI\.rfb\.sendKey\(par\.keysym, par\.code\);/.test(ui) &&
    !/UI\.rfb\.sendKey\(keysyms\.lookup\(newValue\.charCodeAt\(i\)\)\)/.test(ui),
    'ui.js: keyInput-skickloopen går via keysymForInputChar med null-skip — den nakna lookup-raden är borta');

kontroll('A3',
    /keyEvent\(keysym, code, down\)\s*\{[\s\S]*?if \(down\) \{\s*\n\s*UI\._kbdSenastKeydown = \{ keysym: keysym, ts: Date\.now\(\) \};/.test(ui),
    'ui.js: keyEvent minns senaste NEDTRYCKTA keysym med tidsstämpel (dedup-ankaret — UI.keyEvent ägs enbart av touchKeyboard, rfb:s dokument-Keyboard berörs ej)');

kontroll('A4',
    /const senast = UI\._kbdSenastKeydown;\s*\n\s*if \(senast && senast\.keysym === keysym &&\s*\n\s*\(Date\.now\(\) - senast\.ts\) <= 150\) \{\s*\n\s*return null;/.test(ui),
    'ui.js: dedup-fönstret 150 ms matchar på keysym — tecken keydown-vägen LEVERERAT skickas aldrig av input-vägen ("left uncought"-principen i keyInput:s eget kontrakt)');

// B — rotens fortlevnad i core (varför app-lager-kur, och vad som återstår uppströms)
kontroll('B1',
    /if \(\(u >= 0x20\) && \(u <= 0xff\)\) \{\s*\n\s*return u;/.test(keysymdef) &&
    !/\n\s*(10|9|13): 0x/.test(keysymdef),
    'keysymdef.js: Latin-1-grenen börjar först vid 0x20 och codepoints-tabellen saknar 10/13/9 — Enter/CR/Tab får fortfarande Unicode-fallbacken i CORE (kuren nödvändig, sitter i app-lagret)');

kontroll('B2',
    keyboard.includes('229 is used for composition events'),
    'keyboard.js: 229/IME-kommentarsspråket orört — OSK-keydown (keyCode 229) når fortfarande inte Keyboard-vägen; input-vägen är telefonens enda levande stig');

kontroll('B3',
    /XK_Tab:\s+0xff09,/.test(keysym) && /XK_Return:\s+0xff0d,/.test(keysym),
    'keysym.js: XK_Return=0xff0d + XK_Tab=0xff09 — översättningarna pekar på X:s äkta tangenter som TigerVNC:s server känner');

// C — svenska tecken orörda (kärnkundfallet)
kontroll('C1',
    /const keysym = keysyms\.lookup\(ch\.charCodeAt\(0\)\);/.test(ui),
    'ui.js: övriga tecken går OFÖRÄNDRADE via keysyms.lookup — ingen ny mappningslogik för tryckta tecken');

kontroll('C2',
    (function () {
        if (!/u >= 0x20\) && \(u <= 0xff\)/.test(keysymdef)) return false;
        const svenska = [0xE5, 0xE4, 0xF6, 0xC5, 0xC4, 0xD6]; // å ä ö Å Ä Ö
        return svenska.every(cp => cp >= 0x20 && cp <= 0xff);
    })(),
    'keysymdef.js Latin-1-intervall (0x20–0xff, belagt ur källan) täcker å/ä/ö/Å/Ä/Ö — svenska tecken mappas identiskt med före kuren');

kontroll('C3',
    !/keysymForInputChar[\s\S]{0,600}case 'å'/.test(ui) &&
    /senast\.keysym === keysym/.test(ui),
    'dedup gäller ENDAST senaste keydown-keysym (ingen teckenfilterlista) — svenska tecken utan keydown-tvilling passerar alltid');

// D — manifestregeln: core/vendor SHA-identiska + ui.js = kurad U31-version
kontroll('D1',
    samladShaCoreVendor() === CORE_VENDOR_SHA_FORE,
    `core/+vendor/ samlad SHA identisk med FÖRE-tillståndet (81f9a37a… — noll uppströms-diff)`);

kontroll('D2',
    filSha(`${ROT}/app/ui.js`) === UI_SHA_EFTER,
    'app/ui.js = den kurade DESK-U31-versionen (ec56af93… — vakar mot tyst lost-update från syskon)');

// E — spårbarhet
kontroll('E1',
    ui.includes('DESK-U31'),
    'ui.js: DESK-U31-märkt kommentar vid kuren (protokollspårbarhet på källraderna)');

console.log(`\nSumma: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) { console.log('RESULTAT: ' + pass + '/' + (pass + fail) + ' — RÖT'); process.exit(1); }
console.log('RESULTAT: ' + pass + '/' + (pass + fail) + ' PASS');

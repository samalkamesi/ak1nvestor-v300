// testa-desk-nyp-vyzoom — strukturtest för DESK-U26 (nyp → vy-zoom,
// U24 GAP 1+2). Statiskt kontraktstest: läser desk-web-kopian och
// verifierar att (a) interceptorn sitter i app/ui.js med capture-fas +
// stopPropagation ENDAST för pinch, (b) stegningen återanvänder
// vy-zoom-familjen (VIEW_ZOOM_STEPS + save/apply/show — ingen egen
// display.scale-skrivning i gestvägen), (c) core/rfb.js:s pinch-gren
// fortfarande är den oprinciperade Ctrl+hjul-översättningen (bevis på
// att core/ inte grenats), (d) gesturehandlers dispatch-kontrakt
// (CustomEvent på target, utan bubbles — capture-fasens motivering),
// (e) dokumentationen (hjalp.html + vnc.html) synkad med beteendet.
//
// Körs: node verktyg/testa-desk-nyp-vyzoom.mjs  (exit 0 = alla PASS)

import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/desk-web';
const ui = readFileSync(`${ROT}/app/ui.js`, 'utf8');
const rfb = readFileSync(`${ROT}/core/rfb.js`, 'utf8');
const gest = readFileSync(`${ROT}/core/input/gesturehandler.js`, 'utf8');
const hjalp = readFileSync(`${ROT}/hjalp.html`, 'utf8');
const vnc = readFileSync(`${ROT}/vnc.html`, 'utf8');

let pass = 0, fail = 0;
function kontroll(id, villkor, beskrivning) {
    if (villkor) { pass++; console.log(`PASS ${id}: ${beskrivning}`); }
    else { fail++; console.log(`FAIL ${id}: ${beskrivning}`); }
}

// A — interceptorn kopplad: tre faser, capture=true
kontroll('A1',
    /addPinchZoomHandlers\(\)\s*\{[\s\S]*?for \(const fas of \['gesturestart', 'gesturemove', 'gestureend'\]\)\s*\{[\s\S]*?document\.addEventListener\(fas, UI\.handlePinchGesture, true\);/.test(ui),
    'ui.js: addPinchZoomHandlers lyssnar på alla tre gestfaserna på document i CAPTURE-läge');

// A2 — kopplas i init (efter orientationslyssnaren, samma block)
kontroll('A2',
    /UI\.addOrientationHandlers\(\);\s*\n\s*\/\/ AK1A \(DESK-U26\)[\s\S]*?UI\.addPinchZoomHandlers\(\);/.test(ui),
    'ui.js: init kopplar interceptorn (DESK-U26-kommentarmärkt anrop)');

// B — ENDAST pinch stoppas; övriga gester passerar till rfb.js
kontroll('B1',
    /handlePinchGesture\(ev\)\s*\{[\s\S]*?if \(!ev\.detail \|\| ev\.detail\.type !== 'pinch'\) return;/.test(ui),
    'ui.js: icke-pinch-gester (onetap/twotap/threetap/drag/longpress/twodrag) returnerar OSKADADE till uppströms');

// B2 — stopPropagation sker FÖR filtreringen av anslutningsstatus (alltid för pinch)
kontroll('B2',
    /ev\.detail\.type !== 'pinch'\) return;[\s\S]{0,200}ev\.stopPropagation\(\);/.test(ui),
    'ui.js: pinch stopPropagaras ALLTID (GAP 1-kuren) — oavsett anslutningsläge');

// C1 — stegningen går via vy-zoom-familjen
kontroll('C1',
    /VIEW_ZOOM_STEPS\[idx\] !== UI\.viewZoom[\s\S]*?UI\.viewZoom = VIEW_ZOOM_STEPS\[idx\];[\s\S]*?UI\.saveViewZoom\(\);[\s\S]*?UI\.applyViewZoom\(\);[\s\S]*?UI\.showViewZoomStatus\(\);/.test(ui),
    'ui.js: gesten stegar VIEW_ZOOM_STEPS och återanvänder save/apply/show — knappar och nyp delar trappa + minne');

// C2 — ingen direkt display.scale-skrivning i gestvägen
kontroll('C2',
    !/handlePinchGesture[\s\S]*?_display\.scale\s*=/.test(ui),
    'ui.js: gestvägen skriver ALDRIG _display.scale direkt (endast applyViewZoom äger primitiven)');

// C3 — clamp mot stegtrappans ändar
kontroll('C3',
    /Math\.min\(Math\.max\(UI\.nypStartIndex \+ steg, 0\),\s*\n?\s*VIEW_ZOOM_STEPS\.length - 1\)/.test(ui),
    'ui.js: stegindex clampas till trappans ändar (golv 85 %, tak 160 %)');

// D — core/rfb.js OFÖRÄNDRAD i pinch-grenen (bevis: Ctrl+hjul-mönstret kvar)
kontroll('D1',
    /case 'pinch':[\s\S]*?XK_Control_L[\s\S]*?0x8[\s\S]*?0x10[\s\S]*?GESTURE_ZOOMSENS/.test(rfb),
    'core/rfb.js: pinch-grenen är fortfarande uppströms Ctrl+hjul (core/ ej grenad — manifestregeln hel)');

// D2 — gesturehandlers dispatch-kontrakt: CustomEvent utan bubbles på target
kontroll('D2',
    /let gev = new CustomEvent\(type, \{ detail: detail \}\);\s*\n\s*this\._target\.dispatchEvent\(gev\);/.test(gest),
    'core/gesturehandler.js: gesthändelser dispatchas på canvas utan bubbles — capture-fasen på document är den enda förfadersvägen (interceptor-grunden)');

// D3 — rfb.js lyssnar på canvas (target-fas) => document-capture körs först
kontroll('D3',
    /this\._canvas\.addEventListener\("gesturestart", this\._eventHandlers\.handleGesture\);/.test(rfb),
    'core/rfb.js: gestlyssnarna sitter på canvas (target-fas) — interceptorns document-capture körs FÖRE dem');

// E — hjalp.html: varningen borta, nyp-instruktionen finns, Ctrl+0 kvar
kontroll('E1',
    !hjalp.includes('Varning: nypa inte'),
    'hjalp.html: GAMLA varningen "nypa inte med två fingrar" (GAP 1-beteendets dokumentation) är borta');

kontroll('E2',
    hjalp.includes('Nypa med två fingrar — ja tack!') && hjalp.includes('hela vyn'),
    'hjalp.html: nyp-kortet förklarar det nya beteendet (förstorar hela vyn, fasta steg)');

kontroll('E3',
    hjalp.includes('Nyp med två fingrar</b> inne i bilden') && hjalp.includes('minns storleken'),
    'hjalp.html: första kortet nämner nyp som snabbaste vägen + minnet');

kontroll('E4',
    hjalp.includes('Återställ zoom (Ctrl+0)'),
    'hjalp.html: Ctrl+0-rådet för appens EGEN zoom kvar (den vägen orörd av kuren)');

// F — vnc.html: panel-tooltips synkade
kontroll('F1',
    vnc.includes('Förstora vyn (ett steg per tryck eller nyp med två fingrar, tak 160 %)') &&
    vnc.includes('Förminska vyn (ett steg per tryck eller nyp ihop med två fingrar, golv 85 %)'),
    'vnc.html: zoom-knapparnas tooltips nämner nyp-gesten (dokumentation = beteende)');

// G — NYP_STEG_FAKTOR definierad och log-kvot används
kontroll('G1',
    /const NYP_STEG_FAKTOR = 1\.15;/.test(ui) &&
    /Math\.log\(ratio\) \/ Math\.log\(NYP_STEG_FAKTOR\)/.test(ui),
    'ui.js: NYP_STEG_FAKTOR (≈15 %/steg, speglar trappans 10–18 %-gap) + log-kvotsstegning');

console.log(`\nSumma: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) { console.log('RESULTAT: ' + pass + '/' + (pass + fail) + ' — RÖT'); process.exit(1); }
console.log('RESULTAT: ' + pass + '/' + (pass + fail) + ' PASS');

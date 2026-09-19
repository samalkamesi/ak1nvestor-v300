#!/usr/bin/env node
// ROND 106 — våg 211: SEO-guidernas översättningsomgång (manifest till fabrikskön, mönster auto-s2/B-serien)
import { writeFileSync, mkdirSync } from 'node:fs';
const PROD = '/home/ak1a/AK1';
const ARB = '/home/ak1a/agent/ak1';
const skapad = Date.now();
const id = `v211-oversattning-${skapad}`;

const prompt = (objekt, extra) => `Översätt SEO-guiderna till engelska: ${objekt}. Samma tal och räkneexempel som originalet — TAL-PARITET är KVD.

Spår 3 — SEO-GUIDER, översättningsomgången (SEO-GUIDER-2026-09.md § Översättningsomgången: "nästa lediga objekt i spåret = de kvarvarande -en-översättningarna i B-ordning, därefter arabiska"). Kontext: svenska original lever i data/blogg-utkast/ (ALDRIG data/blogg/ — utkast-status); översättningarna blir nya filer med slug = originalets + "-en" (BlogPost-formen saknar språkfält). Mall: exakt BlogPost (slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body) — disclaimer-sista-rad översatt med samma budskap. Sökordsdisciplin: originalets primära sökords BEGREPP översatt naturligt i H1 + ingress + 1 H2; title ≤ 60 tkn, OG-description ≤ 155 tkn.
KVD (våg 211): (1) TAL-PARITET — varje tal och räkneexempel bit-identiskt med originalet (mekanisk diff av talserier); (2) engelska UTBILDNINGSformuleringar — juridikgrinden (lagen 2007:528): "how the method works", ALDRIG råd om enskilda aktier/köp/sälj; (3) korslänkar ENBART originalets redan verifierade ytor (publicerade poster + kurser — inga nya länkar, så partiell publicering inte skapar 404:or); (4) varumärkesgrindens FEL-fraser 0 träffar (samma regexer som kontrolleraText); (5) inga påhittade fakta — originalets källor gäller. ${extra}
Leveranskriterier: konkreta filer i data/blogg-utkast/, \`node node_modules/typescript/bin/tsc --noEmit\` = 0 om kod berörs (ALDRIG bygge — detta är data-only), commit "studio: v211-u<N> <vad>", avsluta med LEVERANS:-rad.`;

const manifest = {
  id,
  titel: 'VÅG 211: Spår 3 — SEO-guider översättningsomgång en (5 guider, spårets egen B-ordning)',
  skapad,
  auto: false,
  spar: 3,
  uppgifter: [
    { id: 'v211-u1', titel: 'Våg 211 (byggare) 1/3: -en-översättning B18 livsmedel + B20 lyx', roll: 'byggare', filer: [], prompt: prompt('B18 livsmedelsaktier (data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json) + B20 lyxaktier (lyxaktier-sa-analyserar-du-lyxbolag.json)', 'B18:s avgränsningar mot B7/B13 och B20:s mot B7/B18 bevaras i översättningen.') },
    { id: 'v211-u2', titel: 'Våg 211 (byggare) 2/3: -en-översättning B21 logistik + B22 krypto', roll: 'byggare', filer: [], prompt: prompt('B21 logistikaktier (data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json) + B22 kryptoaktier (kryptoaktier-sa-analyserar-du-kryptobolag.json)', 'B22:s regleringsblock (MiCA, Skatteverket 30/70, DAC8, Fi-varningen) översatts med lagrum/namn INTAKTA — lagens namn översätts aldrig, bara förklarande text.') },
    { id: 'v211-u3', titel: 'Våg 211 (byggare) 3/3: -en-översättning B23 utbildning + första -ar i B-ordning', roll: 'byggare', filer: [], prompt: prompt('B23 utbildningsaktier (data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json) till -en, DÄREFTER nästa saknade -ar-översättning i B-ordning (kontrollera data/blogg-utkast/ mot B-listan i SEO-GUIDER-2026-09.md — hoppa befintliga; ar-slug = originalets + "-ar")', 'B23:s regleringsblock (Skolpeng/juridiska namn, Skolinspektionen, hemvistkrav, SOU 2025:37) med myndighetsnamn och lagrum INTAKTA.') },
  ],
};

const json = JSON.stringify(manifest, null, 2);
for (const rot of [PROD, ARB]) {
  mkdirSync(`${rot}/data/vakten/agentfabrik/ko`, { recursive: true });
  writeFileSync(`${rot}/data/vakten/agentfabrik/ko/${id}.json`, json + '\n');
}
console.log('MANIFEST SKRIVEN:', id, '(köar bakom v209 i prod)');

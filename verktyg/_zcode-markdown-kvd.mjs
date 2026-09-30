#!/usr/bin/env node
/**
 * _ZCODE-MARKDOWN-KVD — kvalitetsverifiering för v216-u2 (markdown-rendering
 * i /zcode-chatten). Läser KÄLLFILerna och extraherar de reguljära uttrycken
 * (SPRAK_JS/TS/PY/BASH, INLINE_MARKDOWN), grupparrayerna och språkkartan UR
 * KÄLLKODEN — testerna slår mot EXAKT det som levereras, inte en kopia.
 *
 * Läge "komponent" (arg): hoppar klient-wiring-kontrollerna — används när
 * syskonet v216-u3 fortfarande äger zcode-klient.tsx. Fullt läge (inget arg)
 * kräver wiring: import + assistant-gren + att user/fel förblir ren text.
 *
 * Körning: node verktyg/_zcode-markdown-kvd.mjs [komponent]
 * Utgång 0 = GRÖN, 1 = RÖD. Deterministisk — kör två gånger, samma tal.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KOMPONENT = readFileSync(join(ROT, "src/app/(huvud)/zcode/zcode-markdown.tsx"), "utf8");
const KLIENT_SOKVAG = join(ROT, "src/app/(huvud)/zcode/zcode-klient.tsx");
const KOMPONENT_LAGE = process.argv.includes("komponent");
const KLIENT = KOMPONENT_LAGE ? "" : readFileSync(KLIENT_SOKVAG, "utf8");

let pass = 0;
let fel = 0;
function kontroll(namn, ok, detalj = "") {
  if (ok) {
    pass += 1;
    console.log(`  PASS ${namn}`);
  } else {
    fel += 1;
    console.log(`  FEL  ${namn}${detalj ? " — " + detalj : ""}`);
  }
}

// ── Extrahering ur källan ────────────────────────────────────────────────────

/** Extraherar en regex-literal `const NAMN = /…/flaggor;` ur källan.
 *  Komponentens literaler är enradiga med ALLA inre snedstreck escapade —
 *  första oescapade "/" efter "=" avslutar monstret. */
function lasRegex(namn, kalla) {
  const start = kalla.indexOf(`const ${namn} =`);
  if (start < 0) throw new Error(`Hittar ej "const ${namn} =" i källan`);
  const oppnar = kalla.indexOf("/", kalla.indexOf("=", start));
  let i = oppnar + 1;
  let src = "";
  while (i < kalla.length) {
    const c = kalla[i];
    if (c === "\\") {
      src += kalla.slice(i, i + 2);
      i += 2;
      continue;
    }
    if (c === "/") break;
    src += c;
    i += 1;
  }
  const flaggor = kalla.slice(i + 1, i + 3).match(/^[a-z]+/);
  return new RegExp(src, flaggor ? flaggor[0] : "");
}

/** Extraherar en strängarray `const NAMN: Typ[] = ["a", "b"];` ur källan.
 *  Letar efter "= [" — typannotationens [] (TokenTyp[]) får ALDRIG stå för
 *  arrayen (det var KVD-bugg nr 1: tom array ⇒ alla token blev "ren"). */
function lasArray(namn, kalla) {
  const start = kalla.indexOf(`const ${namn}`);
  if (start < 0) throw new Error(`Hittar ej "const ${namn}" i källan`);
  const lika = kalla.indexOf("= [", start);
  if (lika < 0) throw new Error(`Hittar ej "= [" efter "const ${namn}"`);
  const fran = lika + 2;
  const till = kalla.indexOf("]", fran);
  return kalla
    .slice(fran + 1, till)
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter((s) => s.length > 0);
}

/** Antal fångstgrupper i en regex-källa (tom-alternativ-tricket: "|"+src
 *  matchar alltid tomt och bär alla grupper som undefined). */
function antalGrupper(monster) {
  const m = new RegExp("|" + monster.source).exec("x");
  return m !== null ? m.length - 1 : -1;
}

/** Tokeniserar med EXAKT komponentens monster+grupper (samma skann-logik
 *  som markeraKod: vänster-till-höger, fångad grupp ⇒ typ). */
function tokenisera(kod, monster, grupper) {
  monster.lastIndex = 0;
  const ut = [];
  let m;
  while ((m = monster.exec(kod)) !== null) {
    if (m[0] === "") {
      monster.lastIndex += 1;
      continue;
    }
    let typ = "ren";
    for (let g = 1; g <= grupper.length; g += 1) {
      if (m[g] !== undefined) {
        typ = grupper[g - 1];
        break;
      }
    }
    ut.push({ text: m[0], typ });
  }
  return ut;
}

/** Hittar en token med exakt text och ger dess typ (undefined = osedd). */
function typAv(token, text) {
  const t = token.find((x) => x.text === text);
  return t ? t.typ : undefined;
}

// ── Protokoll: FÖRE/EFTER (det kunden ser) ───────────────────────────────────

console.log("ZCODE-MARKDOWN-KVD — före/efter-protokoll");
console.log("==========================================");
console.log("FÖRE  (v216-u2): agentens markdown syntes som RÅTEXT —");
console.log('  "**viktigt**", "```js\\nconst x = 1\\n```", "[länk](https://…)"');
console.log("  renderades med syntax-tecknen synliga i en enda <p>-rad.");
console.log("EFTER: agent-svar (roll=assistant) tolkas som markdown —");
console.log("  # Rubrik            → <h1> (## → h2, ###+ → h3)");
console.log("  - punkt / 1. först  → <ul> punkt-lista / <ol> numrerad");
console.log("  **fet** *kursiv*    → <strong> respektive <em>");
console.log("  `npm run dev`       → inline-kod, accent-bakgrund (#58A6FF/10)");
console.log("  [AK1A](https://…)   → ZCode-blå länk #58A6FF, ny flik, noopener");
console.log("  ```js … ```         → kodblock: #010409-yta, språketikett,");
console.log("                       kopiera-knapp, syntaxfärger (js/ts/py/bash),");
console.log("                       horisontell scroll — koden lindas ALDRIG");
console.log("  user/fel-rader      → OFÖRÄNDRADE som ren text (eko av kunden)");
console.log("");

// ── 1. Extraktion: monstren ur källan ────────────────────────────────────────

console.log("1. Extraktion ur zcode-markdown.tsx");
let spraJs, spraTs, spraPy, spraBash, inline;
try {
  spraJs = lasRegex("SPRAK_JS", KOMPONENT);
  spraTs = lasRegex("SPRAK_TS", KOMPONENT);
  spraPy = lasRegex("SPRAK_PY", KOMPONENT);
  spraBash = lasRegex("SPRAK_BASH", KOMPONENT);
  inline = lasRegex("INLINE_MARKDOWN", KOMPONENT);
  kontroll("fem regex-literaler extraherade ur källan", true);
} catch (e) {
  kontroll("fem regex-literaler extraherade ur källan", false, String(e));
  console.log("KVD RÖD — extraheringen misslyckades, inga vidare kontroller körs.");
  process.exit(1);
}
const jsGrupper = lasArray("JS_GRUPPER", KOMPONENT);
const bashGrupper = lasArray("BASH_GRUPPER", KOMPONENT);
kontroll(
  "JS_GRUPPER = 5 grupper = antalet i SPRAK_JS",
  jsGrupper.length === 5 && antalGrupper(spraJs) === 5,
  `array ${jsGrupper.length} mot monster ${antalGrupper(spraJs)}`,
);
kontroll(
  "JS_GRUPPER = 5 grupper = antalet i SPRAK_TS",
  antalGrupper(spraTs) === 5,
  `monster ${antalGrupper(spraTs)}`,
);
kontroll(
  "JS_GRUPPER = 5 grupper = antalet i SPRAK_PY",
  antalGrupper(spraPy) === 5,
  `monster ${antalGrupper(spraPy)}`,
);
kontroll(
  "BASH_GRUPPER = 6 grupper = antalet i SPRAK_BASH",
  bashGrupper.length === 6 && antalGrupper(spraBash) === 6,
  `array ${bashGrupper.length} mot monster ${antalGrupper(spraBash)}`,
);
kontroll("INLINE_MARKDOWN bär exakt 1 fångstgrupp", antalGrupper(inline) === 1);

// ── 2. JavaScript ────────────────────────────────────────────────────────────

console.log("2. Syntaxfärger — JavaScript");
{
  const t = tokenisera('const GRANS = 100; // tak\nfunction rakna(xs) { return xs.length; }', spraJs, jsGrupper);
  kontroll("js: const ⇒ nyckelord", typAv(t, "const") === "nyckelord");
  kontroll("js: 100 ⇒ tal", typAv(t, "100") === "tal");
  kontroll("js: '// tak' ⇒ kommentar (hela raden)", typAv(t, "// tak") === "kommentar");
  kontroll("js: function ⇒ nyckelord", typAv(t, "function") === "nyckelord");
  kontroll("js: rakna( ⇒ funktion", typAv(t, "rakna") === "funktion");
  kontroll("js: return ⇒ nyckelord", typAv(t, "return") === "nyckelord");
}
{
  const t = tokenisera('const u = "https://x.se/a"; const v = \'c\'; const w = `t ${x} k`;', spraJs, jsGrupper);
  kontroll("js: url-sträng förblir STRÄNG (// inom citat ⇒ ej kommentar)", typAv(t, '"https://x.se/a"') === "strang" && !t.some((x) => x.typ === "kommentar"));
  kontroll("js: enkelflöjts-sträng", typAv(t, "'c'") === "strang");
  kontroll("js: template-sträng", typAv(t, "`t ${x} k`") === "strang");
}
{
  const t = tokenisera("const farg = 0xFF; const n = 3.5e2; if (x) { y(); }", spraJs, jsGrupper);
  kontroll("js: hexadecimalt tal", typAv(t, "0xFF") === "tal");
  kontroll("js: exponenttal", typAv(t, "3.5e2") === "tal");
  kontroll("js: 'if' är nyckelord, INTE funktion trots '('", typAv(t, "if") === "nyckelord" && typAv(t, "y") === "funktion");
}

// ── 3. TypeScript ────────────────────────────────────────────────────────────

console.log("3. Syntaxfärger — TypeScript");
{
  const t = tokenisera("interface Kaka { pris: number; aktiv: boolean }", spraTs, jsGrupper);
  kontroll("ts: interface ⇒ nyckelord", typAv(t, "interface") === "nyckelord");
  kontroll("ts: number/boolean ⇒ nyckelord", typAv(t, "number") === "nyckelord" && typAv(t, "boolean") === "nyckelord");
  kontroll("ts: typnamn före '{' förblir OFÄRGAT (ej funktion)", typAv(t, "Kaka") === undefined);
}
{
  const t = tokenisera('export default async function hamta(): Promise<void> {}', spraTs, jsGrupper);
  kontroll("ts: export/default/async ⇒ nyckelord", typAv(t, "export") === "nyckelord" && typAv(t, "default") === "nyckelord" && typAv(t, "async") === "nyckelord");
  kontroll("ts: hamta( ⇒ funktion", typAv(t, "hamta") === "funktion");
  kontroll("ts: void ⇒ nyckelord", typAv(t, "void") === "nyckelord");
}

// ── 4. Python ────────────────────────────────────────────────────────────────

console.log("4. Syntaxfärger — Python");
{
  const t = tokenisera('def berakna(pris, moms):\n    return f"{pris} kr"  # summera', spraPy, jsGrupper);
  kontroll("py: def ⇒ nyckelord", typAv(t, "def") === "nyckelord");
  kontroll("py: berakna( ⇒ funktion", typAv(t, "berakna") === "funktion");
  kontroll("py: f-sträng ⇒ sträng", typAv(t, 'f"{pris} kr"') === "strang");
  kontroll("py: '# summera' ⇒ kommentar", typAv(t, "# summera") === "kommentar");
  kontroll("py: return ⇒ nyckelord", typAv(t, "return") === "nyckelord");
}
{
  const t = tokenisera('if namn is None or not vals:\n    """doc"""\n    pass', spraPy, jsGrupper);
  kontroll("py: is/None/or/not/pass ⇒ nyckelord", typAv(t, "is") === "nyckelord" && typAv(t, "None") === "nyckelord" && typAv(t, "or") === "nyckelord" && typAv(t, "not") === "nyckelord" && typAv(t, "pass") === "nyckelord");
  kontroll("py: trippelcitat ⇒ sträng", typAv(t, '"""doc"""') === "strang");
}

// ── 5. Bash ──────────────────────────────────────────────────────────────────

console.log("5. Syntaxfärger — Bash");
{
  const t = tokenisera('export NODE_ENV="prod" # miljö', spraBash, bashGrupper);
  kontroll("bash: export ⇒ nyckelord", typAv(t, "export") === "nyckelord");
  kontroll("bash: citat-sträng", typAv(t, '"prod"') === "strang");
  kontroll("bash: '# miljö' ⇒ kommentar", typAv(t, "# miljö") === "kommentar");
}
{
  const t = tokenisera('cd /home/ak1a/AK1 && pm2 restart ak1a', spraBash, bashGrupper);
  kontroll("bash: cd ⇒ nyckelord", typAv(t, "cd") === "nyckelord");
  kontroll("bash: pm2 ⇒ kommando (funktionsfärg)", typAv(t, "pm2") === "funktion");
  kontroll("bash: subargument 'restart' förblir ofärgat", typAv(t, "restart") === undefined);
}
{
  const t = tokenisera('if [ -f "$HOME/.zshrc" ]; then echo "ja"; fi; sista=$?', spraBash, bashGrupper);
  kontroll("bash: if/then/echo/fi ⇒ nyckelord", typAv(t, "if") === "nyckelord" && typAv(t, "then") === "nyckelord" && typAv(t, "echo") === "nyckelord" && typAv(t, "fi") === "nyckelord");
  kontroll("bash: '$HOME/.zshrc' i citat ⇒ sträng (citatet vinner)", typAv(t, '"$HOME/.zshrc"') === "strang");
  kontroll("bash: $? ⇒ variabel", typAv(t, "$?") === "variabel");
  kontroll("bash: ingen token klassas som kommentar i raden", !t.some((x) => x.typ === "kommentar"));
}
{
  const t = tokenisera('echo "# inte kommentar" && npm run build', spraBash, bashGrupper);
  kontroll("bash: '#…' i citat ⇒ sträng, ej kommentar", typAv(t, '"# inte kommentar"') === "strang" && !t.some((x) => x.typ === "kommentar"));
  kontroll("bash: npm ⇒ kommando", typAv(t, "npm") === "funktion");
}

// ── 6. Inline-markdown-delningen ─────────────────────────────────────────────

console.log("6. Inline-markdown");
{
  const delar = "Se [AK1A](https://ak1nvestor.com) och `npm` nu".split(inline);
  kontroll("länksegment isoleras", delar.includes("[AK1A](https://ak1nvestor.com)"));
  kontroll("inline-kodsegment isoleras", delar.includes("`npm`"));
}
{
  const delar = "**fet** *kursiv* ***båda*** _under streck_".split(inline);
  kontroll("fet kursiv (**) isoleras", delar.includes("***båda***"));
  kontroll("fet (*) isoleras", delar.includes("**fet**"));
  kontroll("kursiv (*) isoleras", delar.includes("*kursiv*"));
  kontroll("kursiv (_) isoleras (flerordig — enkelord skyddas mot snake_case)", delar.includes("_under streck_"));
}
{
  const delar = "snake_case_namn och _enbart_under_ här".split(inline);
  kontroll(
    "snake_case/ordnära understreck delas INTE om (intraword-skydd)",
    delar.length >= 1 && delar.some((d) => d.includes("snake_case_namn")) && delar.some((d) => d.includes("_enbart_under_")),
  );
  const ord = "Kolla _det här är viktigt_ i texten".split(inline);
  kontroll("flerordig _kursiv_ isoleras fortfarande", ord.includes("_det här är viktigt_"));
}

// ── 7. Språkkartan ───────────────────────────────────────────────────────────

console.log("7. Språkkartan (etikett → regelverk)");
function lasKarta() {
  const start = KOMPONENT.indexOf("const SPRAK_KARTA");
  const slut = KOMPONENT.indexOf("};", start);
  const kropp = KOMPONENT.slice(start, slut);
  const karta = {};
  for (const m of kropp.matchAll(/"?([A-Za-z0-9#+_-]+)"?\s*:\s*"(js|ts|py|bash)"/g)) {
    karta[m[1]] = m[2];
  }
  return karta;
}
{
  const karta = lasKarta();
  kontroll("tsx ⇒ ts", karta.tsx === "ts");
  kontroll("typescript ⇒ ts", karta.typescript === "ts");
  kontroll("javascript/jsx/mjs ⇒ js", karta.javascript === "js" && karta.jsx === "js" && karta.mjs === "js");
  kontroll("python3 ⇒ py", karta.python3 === "py");
  kontroll("sh/shell-script/console ⇒ bash", karta.sh === "bash" && karta["shell-script"] === "bash" && karta.console === "bash");
  kontroll("okänd etikett (rust) saknas i kartan ⇒ ofärgad", karta.rust === undefined);
}

// ── 8. Klient-wiring (endast fullt läge) ─────────────────────────────────────

if (!KOMPONENT_LAGE) {
  console.log("8. Klient-wiring (zcode-klient.tsx)");
  kontroll(
    "klient importerar ZcodeMarkdown",
    KLIENT.includes('import { ZcodeMarkdown } from "./zcode-markdown"'),
  );
  kontroll(
    "assistant-poster renderas med <ZcodeMarkdown text={post.text} />",
    KLIENT.includes("<ZcodeMarkdown text={post.text} />"),
  );
  kontroll(
    "user/fel förblir ren text (whitespace-pre-wrap kvar för dem)",
    KLIENT.includes('post.roll === "fel" ? "text-[#F85149]"'),
  );
  kontroll(
    "kodblock-scroll: pre har overflow-x-auto + touch-momentum",
    KOMPONENT.includes("overflow-x-auto p-3 [-webkit-overflow-scrolling:touch]"),
  );
  kontroll(
    "kopiera-knapp finns (KopieraKnapp + urklipp)",
    KOMPONENT.includes("navigator.clipboard") && KOMPONENT.includes('aria-label="Kopiera koden"'),
  );
  kontroll(
    "länkar: ny flik + noopener noreferrer",
    KOMPONENT.includes('target="_blank"') && KOMPONENT.includes('rel="noopener noreferrer"'),
  );
  kontroll(
    "href-filter mot javascript:-länkar (SAKER_HREF)",
    KOMPONENT.includes("SAKER_HREF"),
  );
}

// ── Sammanställning ──────────────────────────────────────────────────────────

console.log("");
console.log(`KVD ${fel === 0 ? "GRÖN" : "RÖD"}: ${pass} PASS, ${fel} FEL${KOMPONENT_LAGE ? " (komponentläge — wiring ej kontrollerad)" : ""}`);
process.exit(fel === 0 ? 0 : 1);

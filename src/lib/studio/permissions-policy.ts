import { existsSync } from "node:fs";

/**
 * PERMISSIONS-AUTOPOLICY — VÅG 94 B (molnutvecklingens lås upp).
 *
 * PROBLEMET (bevisat på prod): agentens Write/Bash-skärningar triggar
 * protokollets interaction/requestPermission → transporten väntar på ett
 * webbläsarsvar → headless/mål-läge/bakgrundsarbete får "inget klient-svar
 * inom 30 s" → eskalerat/nekat. Kundens upplevelse: agenten STANNAR vid
 * varje skrivning. Styrelsens dialogpolicy (styrelse.ts besvaraRollDialog:
 * "allow_once låg/medel risk, deny hög/kritisk") är samma ande — en
 * SNABBVENTIL som aldrig låter en dialog blocka — men den risk-grova
 * indelningen nekade även harmlösa filskrivningar i den egna arbetsytan.
 *
 * DENNA modul är den serversideska snabbventilen: en REN, deterministisk
 * funktion som besvarar permission-requests UTAN webbläsare när anropet
 * med säkerhet kan bedömas maskinellt:
 *
 *   allow — Write/Edit/MultiEdit INOM agentens arbetsyta (rot-prefixkontroll,
 *           Mimosa-receptet: REN "/"-STRÄNGKONKAT, ALDRIG path.join med
 *           variabel) · Read/Glob/Grep/LS/Task/Agent · Bash-kommandon där
 *           VARJE led (splittrat på && ; | och radbrytningar) matchar en
 *           vitlista (git-läs/skriv-flöden, npm, npx tsc, node, ls/cat/pwd/
 *           date/mkdir/wc/head/tail/grep, cp/mv INOM arbetsytan, python3/
 *           pytest, pm2 list/restart ak1a, curl till localhost/
 *           lab.ak1nvestor.com).
 *   deny  — hårt nekade mönster med skäl: rm -rf på absoluta rot-sökvägar,
 *           sudo, skrivning/röring av .env-filer, id_rsa, .pem-certifikat,
 *           authorized_keys, crontab/systemctl, curl|sh-mönster, chmod 777,
 *           dd, mkfs, ":(){"-forkbomb, git push --force mot origin.
 *   frag  — allt annat: befintligt dialogflöde till webbläsaren (pending
 *           interaktion + 30 s-default). null = policyn har ingen åsikt
 *           (okänd metod etc.) — också befintligt flöde.
 *
 * ENV: STUDIO_AUTO_POLICY — default PÅ; "av" (alias off/false/0/nej) ⇒
 * ALLT blir frag (dialogflödet råder ostört). Testbart genom att sätta/
 * ta bort env FÖRE anropet — funktionen läser miljön vid VARJE anrop.
 *
 * Modulen är MEDVETELT fri från importer utöver node:fs (rotens reserv-
 * kandidat) — den skall gå att testa RENT (verktyg/testa-permissions-
 * policy.mjs) utan server, transport eller Next-kontext.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Policyns beslut-form: allow = auto-tillåt, deny = auto-neka (med skäl), frag = fråga användaren. */
export type AutoPolicySvar = { beslut: "allow" | "deny" | "frag"; skal?: string };

/** Max längd på skäl-strängen (SSE-event skall hållas små). */
const MAX_SKAL_TEEKEN = 160;

/** Känsliga filnamn som ALDRIG får röras (skrivas ELLER läsas/cat:as). */
const KANSLIGA_FILMONSTER: RegExp[] = [
  /(^|\/)\.env(\.[^\/]+)?$/i, // .env, .env.local, .env.production …
  /(^|\/)id_rsa(\.[^\/]+)?$/i, // SSH-privatnycklar (även .pub — rör ej)
  /(^|\/)[^\/]+\.pem$/i, // certifikat/nycklar
  /(^|\/)authorized_keys$/i,
  /(^|\/)\.?ssh\/[^\/]+$/i, // ~/.ssh-katalogen i sin helhet
];

/** Känsliga KOMMANDON (första ordet i ett Bash-led) som nekas hårt. */
const KANSLIGA_KOMMANDON = new Set(["sudo", "systemctl", "crontab", "dd", "mkfs", "chmod", "chown"]);

/** pm2: endast list + restart av JUST ak1a (prod-processen). */
const PM2_TJANSTER = new Set(["ak1a"]);

/** curl-värdnamn som får anropas (egna ytor). */
const CURL_VARDNAMN = new Set(["localhost", "127.0.0.1", "[::1]", "lab.ak1nvestor.com"]);

/** git-subkommandon som är tillåtna (läs + normala flöden; push UTAN force). */
const GIT_SUB = new Set(["status", "add", "commit", "push", "pull", "diff", "log", "show", "checkout", "revert"]);

/**
 * npm-subkommandon som är tillåtna.
 *
 * VÅG 162 (incidentrot 2026-09-15 01:23): `npm ci|install` raderar node_modules
 * och `npm run build` bygger utan deploylås — ett agentbarn som råkade köra dem
 * mitt i en deploy-omstart tog ner prod i 5 minuter (kraschvakten räddade).
 * Installation och byggen ägs ENDAV prod-synken/kraschvakten under
 * /tmp/ak1a-deploy.lock; agenten når dem via `node verktyg/prod-synk.mjs`.
 * Kvar: `npm test` (och npm-executan via npx).
 */
const NPM_SUB = new Set(["test"]);

/** Bash-grundkommandon som alltid är säkra (args vaktas separat mot känsliga filer). */
const GRUND_KOMMANDON = new Set(["node", "ls", "cat", "pwd", "date", "mkdir", "wc", "head", "tail", "grep", "python3", "pytest"]);

/** Verktyg som (med undantag för känsliga sökvägar) alltid tillåts. */
const LAS_VERKTYG = new Set(["read", "glob", "grep", "ls", "task", "agent", "websearch", "list"]);

/** Skrivverktyg som kräver rot-prefixkontroll. */
const SKRIV_VERKTYG = new Set(["write", "edit", "multiedit"]);

/**
 * STUDIO_AUTO_POLICY-kontroll — default PÅ. "av"/"off"/"false"/"0"/"nej"
 * (okända värden läses som PÅ — en felskriven env skall aldrig gifta
 * säkerhetsventilen, den kan bara stänga AV automationen → dialog).
 */
export function autoPolicyAktiv(): boolean {
  const v = (process.env.STUDIO_AUTO_POLICY ?? "").trim().toLowerCase();
  return !(v === "av" || v === "off" || v === "false" || v === "0" || v === "nej");
}

/**
 * Policyns arbetsyta-rot — SAMMA sanningskälla/samma ordning som
 * studioArbetsyta() i studio-transport.ts (STUDIO_WORKSPACE → Contabo-hem
 * → cwd), men UTAN att importera transporten (renhet). Transporten skickar
 * ÄNDÅ med sin redan lösta rot som argument — detta är reserven när
 * anroparen inte har en (t.ex. rena modultester).
 */
export function policyArbetsyta(): string {
  const hem = "/home/ak1a/agent/ak1";
  return process.env.STUDIO_WORKSPACE || (existsSync(hem) ? hem : process.cwd());
}

/** Korta ett skäl till SSE-vänlig längd. */
function kortSkal(text: string): string {
  const rent = text.replace(/\s+/g, " ").trim();
  return rent.length > MAX_SKAL_TEEKEN ? `${rent.slice(0, MAX_SKAL_TEEKEN)}…` : rent;
}

/** Normalisera en sökväg för jämförelse: backslash → "/", kollapsa dubbla. */
function normaliseraSokvag(sokvag: string): string {
  return sokvag.trim().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
}

/**
 * Rot-prefixkontroll — MIMOSA-RECEPTET (våg 91/92, bevisat i styrelse.ts
 * och bilageSokvagIArbetsyta): REN "/"-STRÄNGKONKAT, ALDRIG path.join/
 * path.resolve med variabel. `sokvag` är INSIDE `rot` endast när den efter
 * normalisering är rotens exakta sträng ELLER börjar på rot+"/" — och
 * resten efter roten INTE innehåller ".." (traverseringsförsäkran).
 * Relativa sökvägar räknas som inside när de är "ärligt relativa": inga
 * "..", ingen ledande "/", ingen enhetsbokstav (barnet kör med arbetsytan
 * som cwd — ett relativt mål hamnar DÄR).
 */
export function arIArbetsyta(rot: string, sokvag: string): boolean {
  const s = normaliseraSokvag(sokvag);
  if (!s || s.includes("\0")) return false;
  if (/^[a-zA-Z]:/i.test(s) || s.startsWith("/")) {
    // Absolut (eller Windows-enhet): ren prefixmatchning mot roten.
    const rotRen = normaliseraSokvag(rot).replace(/\/+$/, "");
    if (!rotRen || rotRen.includes("..")) return false;
    if (s === rotRen) return true;
    if (!s.startsWith(`${rotRen}/`)) return false;
    return !s.slice(rotRen.length + 1).includes(".."); // traverseringsförsäkran
  }
  // Relativ: inside så länge den inte kliver UT (..) eller bär rot-trick.
  return !s.split("/").includes("..");
}

/** Sant när sökvägen/strängen rör en känslig fil (env/nycklar/certifikat). */
export function roKansligFil(text: string): boolean {
  if (!text) return false;
  const s = normaliseraSokvag(text);
  if (s.includes("\0")) return true;
  return KANSLIGA_FILMONSTER.some((m) => m.test(s));
}

/** Dra ut ett sökvägsfält ur ett (opakt) verktygs-input — file_path > path > sokvag. */
function sokvagUrInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  for (const nyckel of ["file_path", "path", "sokvag", "sökväg"]) {
    const v = o[nyckel];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Dra ut Bash-kommandot ur ett (opakt) verktygs-input — command > cmd > kommando. */
function kommandoUrInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  for (const nyckel of ["command", "cmd", "kommando"]) {
    const v = o[nyckel];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

// ── Bash-analys ──────────────────────────────────────────────────────────────

/** Tokenisera ett Bash-led på whitespace (citat respekteras ej — grovt men säkert: okända led blir frag). */
function tokenisera(led: string): string[] {
  return led.trim().split(/\s+/).filter((t) => t.length > 0);
}

/** Sant när ledet RÖR en känslig fil (någon token matchar känsliga mönster). */
function ledRorKansligFil(tokens: string[]): boolean {
  return tokens.some((t) => roKansligFil(t));
}

/** Hårdnekande mönster i ETT led. Returnerar skäl eller null. */
function ledNekat(led: string): string | null {
  const tokens = tokenisera(led);
  if (tokens.length === 0) return null;
  const cmd = tokens[0].toLowerCase();

  // sudo / systemctl / crontab / dd / mkfs / chmod / chown — känsliga
  // kommandon i sig (chmod 777 och dd/mkfs är destruktiva; övriga chmod/
  // chown-värden är lika förbjudna av listan — hellre nek än frag).
  if (KANSLIGA_KOMMANDON.has(cmd)) {
    return `${cmd} är förbjudet (auto-policy): ${kortSkal(led)}`;
  }

  // rm -rf på absoluta rot-sökvägar: "/", "/*" (även ~/rotvarianter).
  if (cmd === "rm") {
    const flaggor = tokens.slice(1).filter((t) => t.startsWith("-")).join("");
    const mal = tokens.slice(1).filter((t) => !t.startsWith("-"));
    if (flaggor.includes("r") && flaggor.includes("f") && mal.some((m) => m === "/" || m === "/*" || m === "/*/" || m === "~" || m === "~/*")) {
      return `rm -rf mot rot-sökväg är förbjudet: ${kortSkal(led)}`;
    }
  }

  // git push --force (även -f) mot origin — prod-push UTAN force är OK.
  if (cmd === "git" && tokens[1]?.toLowerCase() === "push") {
    const resten = tokens.slice(2).join(" ");
    if (/\s--force\b|^--force\b|(^|\s)-f(\s|$)/.test(` ${resten} `)) {
      return "git push --force mot origin är förbjudet (prod-push utan force är OK)";
    }
  }

  // Känslig fil i ledet (cat .env, touch id_rsa, cp x server.pem …).
  if (ledRorKansligFil(tokens)) {
    return `rör känslig fil (env/nycklar/certifikat): ${kortSkal(led)}`;
  }

  return null;
}

/** Hela-kommandot-mönster som spänner över flera led (curl|sh m.m.). */
function helaKommandotNekat(kommando: string): string | null {
  // curl|sh-familjen: curl/wget ... | sh|bash|zsh|python — nedladdad kod kör ALDRIG.
  if (/(^|[;&|\s])(curl|wget)\b[^|;&]*\|\s*(sudo\s+)?(sh|bash|zsh|python3?|perl)\b/i.test(kommando)) {
    return "curl|rör till tolk (nedladdad kod) är förbjudet";
  }
  // Forkbomb ":(){ :|:& };:" — känns igen på signaturen ":(){".
  if (kommando.includes(":(){")) {
    return "forkbomb är förbjuden";
  }
  return null;
}

/** URL-värdnamn ur en curl-token ("http://host:x/väg", "localhost:3000"). */
function vardnamnUrToken(token: string): string | null {
  const medSchema = /^https?:\/\/\[?([^/:?\s]+)\]?/i.exec(token);
  if (medSchema) return medSchema[1].toLowerCase();
  const barVard = /^[a-z0-9.\-]+:\d{2,5}/i.exec(token);
  if (barVard) return barVard[0].split(":")[0].toLowerCase();
  return null;
}

/** Sant när ett led är ett SÄKERT curl-anrop (endast egna värdnamn). */
function arSakerCurl(tokens: string[]): boolean {
  // Värdelösande flaggor: -H/-d/-X/-u m.m. konsumerar NÄSTA token.
  const vardelosande = new Set(["-H", "-d", "--data", "--header", "-X", "--request", "--url", "-u", "--user", "-o", "--output", "-A", "--user-agent", "-e", "--referer", "-b", "--cookie", "-T", "--upload-file", "--data-raw", "--data-binary"]);
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.startsWith("-")) {
      // --flagga=värde bär värdet INLINE (kontrollera om värdet är en URL).
      if (t.startsWith("--") && t.includes("=")) {
        const varde = t.slice(t.indexOf("=") + 1);
        const vard = vardnamnUrToken(varde);
        if (vard !== null && !CURL_VARDNAMN.has(vard)) return false;
      }
      if (vardelosande.has(t) || vardelosande.has(t.split("=")[0])) i++; // hoppa över värdet
      continue;
    }
    const vard = vardnamnUrToken(t);
    if (vard !== null && !CURL_VARDNAMN.has(vard)) return false;
  }
  return true;
}

/** Sant när cp/mv-ledets alla sökvägs-argument ligger INOM arbetsytan. */
function arCpMvIArbetsyta(tokens: string[], rot: string): boolean {
  for (const t of tokens.slice(1)) {
    if (t.startsWith("-")) continue; // flaggor
    if (!arIArbetsyta(rot, t)) return false;
  }
  return true;
}

/** Sant när ETT led är vitlistat (säkert mönster). */
function ledArSakert(led: string, rot: string): boolean {
  const tokens = tokenisera(led);
  if (tokens.length === 0) return false;
  const cmd = tokens[0].toLowerCase();
  const sub = tokens[1]?.toLowerCase() ?? "";

  if (cmd === "git") return GIT_SUB.has(sub);
  if (cmd === "npm") return NPM_SUB.has(sub);
  if (cmd === "npx") return sub === "tsc";
  if (cmd === "pm2") {
    if (sub === "list" || sub === "status" || sub === "jlist") return true;
    if (sub === "restart" || sub === "reload" || sub === "start") {
      return tokens.slice(2).every((t) => PM2_TJANSTER.has(t)); // ENDAST ak1a
    }
    return false;
  }
  if (cmd === "curl" || cmd === "wget") return arSakerCurl(tokens);
  if (cmd === "cp" || cmd === "mv") return arCpMvIArbetsyta(tokens, rot);
  if (GRUND_KOMMANDON.has(cmd)) return true;
  return false;
}

/**
 * Policy-beslut för ett permission-anrop.
 *
 * @param metod     protokollmetoden ("interaction/requestPermission") ELLER
 *                  ett barverktygsnamn ("Write", "Bash", … — läsbart för
 *                  rena modultester).
 * @param parametrar permission-params ({toolName, input, …}) ELLER direkt
 *                  verktygs-input ({file_path…} / {command…}).
 * @param rot       agentens arbetsyta (transporten skickar sin lösta rot);
 *                  utelämnas ⇒ policyArbetsyta().
 * @returns beslut-form, eller null = policyn har ingen åsikt (befintligt
 *          dialogflöde råder).
 */
export function autoPolicySvar(metod: string, parametrar: unknown, rot?: string): AutoPolicySvar | null {
  if (typeof metod !== "string" || !metod.trim()) return null;

  // Avstängd policy ⇒ ALLTID frag — webbläsardialogen råder ostört.
  if (!autoPolicyAktiv()) return { beslut: "frag", skal: "auto-policy avstängd (STUDIO_AUTO_POLICY)" };

  const metodRen = metod.trim().toLowerCase();
  let verktyg = metodRen;
  let input: unknown = parametrar;
  if (metodRen === "interaction/requestpermission") {
    const p = (parametrar ?? {}) as { toolName?: unknown; input?: unknown };
    verktyg = typeof p.toolName === "string" ? p.toolName.trim().toLowerCase() : "";
    input = p.input;
  }

  const rotRen = typeof rot === "string" && rot.trim() ? rot.trim() : policyArbetsyta();

  // ── Skrivverktyg: Write/Edit/MultiEdit ───────────────────────────────────
  if (SKRIV_VERKTYG.has(verktyg)) {
    const sokvag = sokvagUrInput(input);
    if (!sokvag) return { beslut: "frag", skal: `${verktyg} utan läsbar målsökväg` };
    if (roKansligFil(sokvag)) {
      return { beslut: "deny", skal: `${verktyg} mot känslig fil: ${kortSkal(sokvag)}` };
    }
    if (arIArbetsyta(rotRen, sokvag)) {
      return { beslut: "allow", skal: `${verktyg} inom arbetsytan` };
    }
    return { beslut: "frag", skal: `${verktyg} utanför arbetsytan: ${kortSkal(sokvag)}` };
  }

  // ── Läs-/sök-/delegeringsverktyg: Read/Glob/Grep/LS/Task/Agent … ────────
  if (LAS_VERKTYG.has(verktyg)) {
    const sokvag = sokvagUrInput(input);
    if (sokvag && roKansligFil(sokvag)) {
      return { beslut: "deny", skal: `${verktyg} mot känslig fil: ${kortSkal(sokvag)}` };
    }
    return { beslut: "allow", skal: `${verktyg} är läsbart verktyg` };
  }

  // ── Bash: hel kommandoanalys ────────────────────────────────────────────
  if (verktyg === "bash") {
    const kommando = kommandoUrInput(input);
    if (!kommando) return { beslut: "frag", skal: "Bash utan läsbart kommando" };

    // Hela-kommandot-mönster först (curl|sh, forkbomb).
    const helt = helaKommandotNekat(kommando);
    if (helt) return { beslut: "deny", skal: helt };

    // Splittra på && ; | och radbrytningar — VARJE led kontrolleras.
    const led = kommando
      .split(/&&|\|\||;|\||\n|\r/g)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (led.length === 0) return { beslut: "frag", skal: "Bash-kommandot är tomt" };

    for (const l of led) {
      const nekats = ledNekat(l);
      if (nekats) return { beslut: "deny", skal: nekats };
    }
    for (const l of led) {
      if (!ledArSakert(l, rotRen)) {
        return { beslut: "frag", skal: `Bash-led ej vitlistat: ${kortSkal(l)}` };
      }
    }
    return { beslut: "allow", skal: `Bash: ${led.length} led inom vitlistan` };
  }

  // Okänt/annat verktyg — policyn har ingen åsikt: befintligt dialogflöde.
  return null;
}

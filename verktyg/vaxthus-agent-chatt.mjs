#!/usr/bin/env node
// vaxthus-agent-chatt.mjs — Växthuset Fas 1 (r285): hyresgästens agent-runner.
// Anropas AV chatt-API:t (avgrepad, aldrig i request-tråden): kör zcode -p i
// hyresgästens yta med konversationshistoriken + kontraktspåminnelsen, och
// loggar kund+agent-rader till chatt/logg.jsonl (UI:t läser den filen).
// Säkerhetskontrakt (Mimosa): NOLL argument — allt går via filer i
// tenants-rotens chatt/jobb.txt: rad 1 = slug (omvalsvaliderad här: regex +
// katalogexistens), rad 2+ = kundmeddelandet. Tolk-argv bär aldrig data.
// Användning: node vaxthus-agent-chatt.mjs
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const ZCODE = path.join(process.env.HOME ?? "/home/ak1a", ".npm-global", "bin", "zcode");
const TENANTER = path.join(process.env.HOME ?? "/home/ak1a", "tenants");
const JOBB_FIL = path.join(TENANTER, "chatt-jobb.txt");

let slug = "";
let meddelande = "";
try {
  const rader = fs.readFileSync(JOBB_FIL, "utf8").split("\n");
  fs.rmSync(JOBB_FIL);
  slug = (rader[0] ?? "").trim();
  meddelande = rader.slice(1).join("\n").trim();
} catch {
  process.exit(0); // inget jobb ⇒ avsluta tyst
}
if (!/^[a-z0-9-]+$/.test(slug)) process.exit(2);
const yta = path.join(TENANTER, slug);
if (!fs.existsSync(yta) || !meddelande) process.exit(2);
const chattKatalog = path.join(yta, "chatt");
fs.mkdirSync(chattKatalog, { recursive: true });
const loggFil = path.join(chattKatalog, "logg.jsonl");
const flagga = path.join(chattKatalog, "paagar.flagga");

const appendRad = (rad) => fs.appendFileSync(loggFil, JSON.stringify(rad) + "\n");
const lasHistorik = (n) => {
  try {
    return fs
      .readFileSync(loggFil, "utf8")
      .split("\n")
      .filter(Boolean)
      .slice(-n)
      .map((r) => {
        try {
          return JSON.parse(r);
        } catch {
          return null;
        }
      })
      .filter((r) => r && typeof r.text === "string");
  } catch {
    return [];
  }
};

fs.writeFileSync(flagga, JSON.stringify({ start: Date.now(), pid: process.pid }));
appendRad({ ts: new Date().toISOString(), roll: "kund", text: meddelande });

const historik = lasHistorik(20); // inkluderar raden som just skrevs
const konversation = historik
  .map((r) => (r.roll === "kund" ? `[Kunden]: ${r.text}` : `[Byggagenten]: ${r.text}`))
  .join("\n");

const prompt = [
  "Du är den här hyresgästens byggagent och arbetar i hyresgästens yta.",
  "Läs TENANT-AGENTS.md först — ditt kontrakt står där (ENBARA innehall/site.json,",
  "validera med node verktyg/kolla-site.mjs, committa, ALDRIG hitta på fakta,",
  "ALDRIG påstå publicerat — förhandsvisningen uppdateras automatiskt).",
  "",
  "Tidigare konversation (äldst först, din senaste replik sist):",
  konversation,
  "",
  "Kundens nya meddelande står som sista [Kunden]-raden ovan. Svara kunden kort",
  "och konkret på svenska: vad du gör/gjort + be om uppgifter som saknas.",
  "Om meddelandet kräver ändringar: gör dem NU (redigera, validera, committa)",
  "innan du svarar, och berätta vilka. Avsluta med raden ÄNDRINGAR: <fil> eller",
  "ÄNDRINGAR: inga.",
].join("\n");

const svar = await new Promise((lyckas) => {
  execFile(ZCODE, ["-p", prompt], { cwd: yta, timeout: 600_000, maxBuffer: 4 * 1024 * 1024 }, (fel, ut) => {
    lyckas(fel ? `Agentkörningen föll: ${String(fel.message).slice(0, 200)}` : String(ut).trim());
  });
});

appendRad({ ts: new Date().toISOString(), roll: "agent", text: String(svar).slice(0, 4000) });
try {
  fs.rmSync(flagga);
} catch {
  /* nästa körning rensar */
}
console.log(String(svar).slice(0, 500));

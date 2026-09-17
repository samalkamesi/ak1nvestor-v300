// s8-u3 vakt: postar EN märkt testaktivitet med lång section-text —
// återskapar gränsnittsvaktens 22 admin-fynd (granssnitt-2026-09-17T1725)
// deterministiskt: ActivityRow renderar "/blogg/<slug>" med shrink-0 i en
// flex-rad på 390px. POST /api/admin/activity är sajten öppna, sanerade,
// append-only loggkanal (samma väg use-activity-logger använder).
const SIDA = process.argv[2] || "/blogg/sa-laser-du-en-balansrakning-pa-15-minuter";
const res = await fetch("http://localhost:3000/api/admin/activity", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId: "s8u3-vaktkontroll",
    action: "section_visit",
    section: SIDA.replace(/^\//, "").split("?")[0],
    metadata: { test: "s8u3-vaktkontroll — rotorsaksbevis, tas ej bort" },
  }),
});
console.log("POST status:", res.status, "→ section:", SIDA);

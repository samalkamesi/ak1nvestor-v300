#!/usr/bin/env node
// ROND 107 — säkerhetsprob: fel admin-lösenord MÅSTE avvisas av prod-studion.
const BAS = "http://localhost:3000";
const prober = async (pass) => {
  const r = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: { "x-admin-password": pass, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "sond" }),
    signal: AbortSignal.timeout(15_000),
  });
  return r.status;
};
console.log("fel-lösenord →", await prober("FEL-LÖSENORD-SOND-R107"));
console.log("halsa (publik) →", (await fetch(`${BAS}/api/studio/halsa`, { signal: AbortSignal.timeout(10_000) })).status);

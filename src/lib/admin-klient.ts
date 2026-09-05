"use client";

/**
 * ADMIN-KLIENT — förvarar admin-lösenordet under pågående session (VÅG 63
 * bygg-1, O4-robusthet §5). Serverns requireAdmin (src/lib/admin-auth.ts)
 * kräver "x-admin-password" på skyddade /api/admin- och /api/pro/admin-
 * anrop; denna hjälp ser till att admin-UI:ts fetch-anrop bär headern.
 *
 * sessionStorage (inte localStorage): rensas när fliken stängs — lösenordet
 * lämnar aldrig adminens egen browser-session. Admin-sidan sparar vid
 * inloggning (POST /api/admin/auth OK) och rensar vid utloggning.
 */

const NYCKEL = "ak1a-admin-losenord";

/** Spara lösenordet efter lyckad inloggning (tyst vid otillgång). */
export function sparaAdminLosenord(losenord: string): void {
  try {
    sessionStorage.setItem(NYCKEL, losenord);
  } catch {
    // sessionStorage otillgänglig (t.ex. privat läge) — admin får logga in igen
  }
}

/** Rensa lösenordet vid utloggning (tyst vid otillgång). */
export function rensaAdminLosenord(): void {
  try {
    sessionStorage.removeItem(NYCKEL);
  } catch {
    // tyst
  }
}

/** Headers för skyddade admin-anrop — tomt objekt när inget lösenord finns. */
export function adminHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const losenord = sessionStorage.getItem(NYCKEL);
    return losenord ? { "x-admin-password": losenord } : {};
  } catch {
    return {};
  }
}

/** JSON-headers + admin-header i ett svep för POST/PATCH/PUT med body. */
export function adminJsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...adminHeaders() };
}

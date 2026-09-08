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
 *
 * VÅG 83 §A (sessioner + roller): loggaIn/loggaUt/lasRoll mot
 * /api/admin/login + /api/admin/logout. Vid session-inloggning sätter
 * servern httpOnly-cookien ak1a_admin — då skickas lösenordet ALDRIG vidare
 * (eventuellt sparat lösenord rensas) och rollen sparas i sessionStorage
 * som UI-indikation. Utan SESSION_SECRET svarar login-ruten 503 och
 * lösenordsläget (x-admin-password) gäller oförändrat som fallback.
 */

const NYCKEL = "ak1a-admin-losenord";
const ROLL_NYCKEL = "ak1a-admin-roll";

/** Roll från sessionsinloggning (våg 83 §A) — lösenordsläget motsvarar "admin". */
export type AdminRoll = "admin" | "redaktor";

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

/** Spara senaste roll för UI:t (sessionStorage — rensas när fliken stängs). */
export function sparaRoll(roll: AdminRoll): void {
  try {
    sessionStorage.setItem(ROLL_NYCKEL, roll);
  } catch {
    // tyst
  }
}

/** Rensa rollen (vid utloggning). */
export function rensaRoll(): void {
  try {
    sessionStorage.removeItem(ROLL_NYCKEL);
  } catch {
    // tyst
  }
}

/** Senaste sparade roll — null när okänd (SSR, rensad storage, lösenordsläge). */
export function lasRoll(): AdminRoll | null {
  if (typeof window === "undefined") return null;
  try {
    const roll = sessionStorage.getItem(ROLL_NYCKEL);
    return roll === "admin" || roll === "redaktor" ? roll : null;
  } catch {
    return null;
  }
}

/**
 * Session-inloggning (våg 83 §A): POST /api/admin/login {losenord}.
 * Vid 200 sätter servern cookien ak1a_admin (httpOnly — browsern sköter den
 * automatiskt) och svarar {roll}. Session-läge råder då: lösenordet skickas
 * ALDRIG i efterföljande anrop, så eventuellt sparat lösenord rensas här och
 * rollen sparas för UI:t. Utan SESSION_SECRET svarar ruten 503 {fel} —
 * sessionsvägen är av och anroparen faller tillbaka på lösenordsläget.
 */
export async function loggaIn(losenord: string): Promise<{ roll?: AdminRoll; fel?: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ losenord }),
    });
    const data = (await res.json().catch(() => ({}))) as { roll?: string; fel?: string };
    if (res.ok && (data.roll === "admin" || data.roll === "redaktor")) {
      rensaAdminLosenord(); // session-läge: inget lösenord lagras/skickas vidare
      sparaRoll(data.roll);
      return { roll: data.roll };
    }
    return { fel: data.fel || "Fel lösenord." };
  } catch {
    return { fel: "Nätverksfel — försök igen." };
  }
}

/**
 * Logga ut (våg 83 §A): POST /api/admin/logout tömmer session-cookien på
 * servern; därefter rensas lösenord + roll lokalt — även vid nätverksfel,
 * så UI:t aldrig fastnar i en inloggad bild.
 */
export async function loggaUt(): Promise<void> {
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } catch {
    // offline — det lokala läget rensas ändå
  }
  rensaAdminLosenord();
  rensaRoll();
}

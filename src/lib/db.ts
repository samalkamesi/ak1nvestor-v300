/**
 * DEPRECATED — används INTE längre av src/-koden (alla routes går via
 * @/lib/supabase-rest mot Supabase REST, se t.ex. src/app/api/styrelse/beslut).
 *
 * Filen behålls endast för att legacy-scripts under scripts/ fortfarande
 * importerar den: scripts/seed.ts, scripts/seed-cases-combinations.ts,
 * scripts/save-blueocean-tasks.ts, scripts/save-mega-tasks.ts.
 * Dessa scripts är själva trasiga tills de migreras — importera ALDRIG
 * denna modul i ny kod.
 */

/** Minimal Prisma-form som legacy-scripts typar mot — runtime är alltid null. */
type LegacyDelegate = Record<
  "findFirst" | "upsert" | "create" | "update" | "count",
  (args?: unknown) => Promise<any>
>;

export interface LegacyPrismaClient {
  megaTask: LegacyDelegate;
  meetingProtocol: LegacyDelegate;
  ak1Indicator: LegacyDelegate;
  caseStudy: LegacyDelegate;
  indicatorCombination: LegacyDelegate;
  $disconnect: () => Promise<void>;
}

export const db: LegacyPrismaClient | null = null;

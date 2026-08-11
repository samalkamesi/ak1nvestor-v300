// AK1A Research Lab — Database client
// Vercel: null — APIs use Supabase REST or JSON files
// Sandbox: Prisma + SQLite

/* eslint-disable @typescript-eslint/no-require-imports */

let db: any = null;

const isVercel = Boolean(
  typeof process !== "undefined" &&
    (process.env.VERCEL || process.env.NOW_REGION)
);

if (!isVercel) {
  try {
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = globalThis as unknown as { prisma: any };
    db = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
  } catch {
    // db stays null on Vercel or if Prisma not available
  }
}

export { db };

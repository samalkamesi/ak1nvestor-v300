// AK1A Research Lab — Database client
// Vercel: null (APIs use Supabase REST or JSON)
// Sandbox: Prisma + SQLite

import { PrismaClient } from "@prisma/client";

let db: any = null;

// Only create PrismaClient on local sandbox (not Vercel)
// Vercel sets VERCEL env var automatically
const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);

try {
  if (!isVercel && process.env.DATABASE_URL?.startsWith("file:")) {
    const globalForPrisma = globalThis as unknown as { prisma: any };
    db = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
  }
} catch {
  // db stays null on Vercel
}

export { db };

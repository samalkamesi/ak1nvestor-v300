// AK1A Research Lab — Database client
// On Vercel production: returns null (APIs use Supabase REST or JSON)
// On sandbox: Prisma + SQLite

import { PrismaClient } from "@prisma/client";

let db: any = null;

try {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    const globalForPrisma = globalThis as unknown as { prisma: any };
    db = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
  }
} catch {
  // db stays null on Vercel — APIs use Supabase REST or JSON
}

export { db };

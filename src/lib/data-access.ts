import { db } from "@/lib/db";

export async function getIndicators() {
  return db.ak1Indicator.findMany({ orderBy: { num: "asc" } });
}

export async function getCases(filters: { type?: string; sector?: string; search?: string; limit?: number }) {
  const limit = filters.limit || 100;
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.sector) where.sector = filters.sector;
  if (filters.search) {
    where.OR = [
      { company: { contains: filters.search } },
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { ticker: { contains: filters.search } },
    ];
  }
  return db.caseStudy.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
}

export async function getCombinations(filters: { verdict?: string; indicator?: string; limit?: number }) {
  const limit = filters.limit || 100;
  const where: any = {};
  if (filters.verdict) where.verdict = filters.verdict;
  if (filters.indicator) {
    where.OR = [{ indicatorAId: filters.indicator }, { indicatorBId: filters.indicator }];
  }
  return db.indicatorCombination.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
}

export async function getProtocols() {
  return db.meetingProtocol.findMany({ orderBy: { timestamp: "desc" }, take: 50 });
}

export async function saveProtocol(data: any) {
  return db.meetingProtocol.upsert({
    where: { meetingId: data.meetingId },
    create: {
      meetingId: data.meetingId,
      agenda: data.agenda,
      viewpoints: JSON.stringify(data.viewpoints || []),
      decision: JSON.stringify(data.decision),
      decisionTitle: data.decisionTitle || data.decision?.title || "",
      confidence: data.confidence || data.decision?.confidence || "MEDEL",
      passed: data.passed ?? true,
      signatures: JSON.stringify(data.signatures || data.decision?.signatures || []),
    },
    update: {},
  });
}

export async function getTasks() {
  return db.megaTask.findMany({ orderBy: { num: "asc" } });
}

export function getBackendStatus() {
  return {
    backend: "prisma-sqlite",
    isSupabase: false,
    isPrisma: true,
    message: "Prisma SQLite — stabil lokalt",
    supabaseUrl: null,
  };
}

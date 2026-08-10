/**
 * Sparar analysdata från data/analyses/*.json till databasen (SystemEvent + CaseStudy).
 * Körs med: bun run scripts/save-analyses-to-db.ts
 *
 * Detta är en mellanlagring — när Supabase är konfigurerat kan samma data
 * migreras dit via scripts/migrate-to-supabase.ts (skapa vid behov).
 */
import { db } from "../src/lib/db";
import { readFile, readdir } from "fs/promises";
import path from "path";

async function main() {
  const analysesDir = path.join(process.cwd(), "data", "analyses");
  const files = await readdir(analysesDir).catch(() => [] as string[]);

  console.log(`Hittade ${files.length} analysfiler:`, files);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const ticker = file.replace(".json", "");
    const filePath = path.join(analysesDir, file);
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw);

    console.log(`Sparar ${ticker}...`);

    // Spara som SystemEvent för spårbarhet
    await db.systemEvent.create({
      data: {
        type: "analysis_saved",
        severity: "info",
        message: `Analys sparad: ${data.company} (${ticker}) — ${data.recommendation?.main || data.cover?.recommendation || "N/A"}`,
        details: JSON.stringify({
          ticker,
          company: data.company,
          akm1Score: data.akm1?.score,
          akm1Tier: data.akm1?.tier,
          recommendation: data.recommendation?.main || data.cover?.recommendation,
          verified: data.verified,
          analysisDate: data.analysisDate,
        }),
        source: "save-analyses-script",
      },
    });

    // Spara som CaseStudy för arkiv
    const existingCase = await db.caseStudy.findFirst({
      where: { ticker },
    });

    if (existingCase) {
      await db.caseStudy.update({
        where: { id: existingCase.id },
        data: {
          company: data.company,
          ticker,
          title: `${data.company} — ${data.cover?.recommendation || "Analys"}`,
          description: data.cover?.quickConclusion || data.princip?.body || "",
          akm1Score: data.akm1?.score,
          sector: data.sector,
          outcome: data.recommendation?.main,
          lesson: data.cover?.quickConclusionMeta,
          isIllustrative: true,
        },
      });
      console.log(`  → Uppdaterade CaseStudy ${existingCase.id}`);
    } else {
      await db.caseStudy.create({
        data: {
          type: "success",
          company: data.company,
          ticker,
          title: `${data.company} — ${data.cover?.recommendation || "Analys"}`,
          description: data.cover?.quickConclusion || data.princip?.body || "",
          akm1Score: data.akm1?.score,
          decisiveVars: data.waveSummary?.impulse?.join(",") || "",
          sector: data.sector,
          outcome: data.recommendation?.main,
          lesson: data.cover?.quickConclusionMeta,
          isIllustrative: true,
        },
      });
      console.log(`  → Skapade ny CaseStudy`);
    }
  }

  console.log("Klar!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

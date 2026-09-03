/**
 * Sparar Blue Ocean Purity-uppgifter (150) i databasen.
 * Läser från strategy/blue-ocean-purity.md Del 5 och sparar som MegaTasks.
 */
import { db } from "../src/lib/db";
import { readFileSync } from "fs";
import path from "path";

interface TaskRow {
  num: number;
  title: string;
  organ: string;
  metric: string;
  deadline: string;
  category: string;
}

function parseTasks(): TaskRow[] {
  const filePath = path.join(process.cwd(), "strategy", "blue-ocean-purity.md");
  const content = readFileSync(filePath, "utf-8");

  const tasks: TaskRow[] = [];
  const lines = content.split("\n");

  let currentCategory = "";
  let taskCounter = 0;

  // Kategori-mappning baserat på sektion
  const categoryMap: Record<string, string> = {
    "INNEHÅLL": "innehåll",
    "BRANDING": "branding",
    "KUNDUPPLEVELSE": "kundupplevelse",
    "MARKNADSFÖRING": "marknadsföring",
    "PEDAGOGIK": "pedagogik",
    "PRODUKT": "produkt",
    "VISION": "vision",
    "TVÄRGÅENDE": "integration",
  };

  for (const line of lines) {
    // Matcha sektion-rubriker
    const sectionMatch = line.match(/### 5\.\d+–5\.\d+ — ([A-ZÅÄÖ]+)/);
    if (sectionMatch) {
      const cat = sectionMatch[1];
      currentCategory = categoryMap[cat] || cat.toLowerCase();
      continue;
    }

    // Matcha tabellrader: | # | titel | organ | metric | deadline |
    const rowMatch = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(Σ|α|Δ|Ω|Φ|Θ|Μ|Ψ|Σ\+α|multi)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (rowMatch) {
      const num = parseInt(rowMatch[1]);
      const title = rowMatch[2].trim();
      const organ = rowMatch[3].trim();
      const metric = rowMatch[4].trim();
      const deadline = rowMatch[5].trim();

      if (title && !title.includes("---")) {
        taskCounter++;
        tasks.push({
          num: 1000 + num, // Offset från befintliga 48 uppgifter
          title,
          organ,
          metric,
          deadline,
          category: currentCategory,
        });
      }
    }
  }

  return tasks;
}

async function main() {
  const tasks = parseTasks();
  console.log(`Parsed ${tasks.length} Blue Ocean Purity-uppgifter`);

  let created = 0;
  let updated = 0;

  for (const t of tasks) {
    const existing = await db.megaTask.findFirst({ where: { num: t.num } });

    const payload = {
      num: t.num,
      title: t.title,
      description: `Blue Ocean Purity-uppgift\nOrgan: ${t.organ}\nMetric (MÄTT): ${t.metric}\nDeadline: ${t.deadline}\nKategori: ${t.category}`,
      category: t.category,
      priority: "HÖG",
      status: "pending",
      organOwner: t.organ,
    };

    if (existing) {
      await db.megaTask.update({ where: { id: existing.id }, data: payload });
      updated++;
    } else {
      await db.megaTask.create({ data: payload });
      created++;
    }
  }

  console.log(`✓ Created ${created}, updated ${updated} Blue Ocean Purity-uppgifter (total: ${tasks.length})`);
  console.log(`Total mega-tasks i databasen: ${(await db.megaTask.count())}`);
}

main().finally(() => db.$disconnect());

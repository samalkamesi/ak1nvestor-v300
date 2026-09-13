import { db } from "../src/lib/db";
import { readFileSync } from "fs";

const tasks = JSON.parse(readFileSync("./strategy/mega-tasks.json", "utf-8")).tasks;

async function main() {
  if (!db) {
    console.error("LEGACY-SCRIPT: src/lib/db.ts är null sedan Supabase-migreringen — migrera till @/lib/supabase-rest innan detta script körs.");
    process.exit(1);
  }
  let created = 0;
  let updated = 0;
  for (const t of tasks) {
    const existing = await db.megaTask.findFirst({ where: { num: t.num } });
    const payload = {
      num: t.num,
      title: t.title,
      description:
        t.description +
        "\n\nRationale: " + t.rationale +
        "\nFramework: " + t.frameworkSource +
        "\nSuccess metric: " + t.successMetric,
      category: t.category,
      priority: t.priority,
      status: "pending",
      organOwner: t.organOwner,
    };
    if (existing) {
      await db.megaTask.update({ where: { id: existing.id }, data: payload });
      updated++;
    } else {
      await db.megaTask.create({ data: payload });
      created++;
    }
  }
  console.log(`Created ${created}, updated ${updated} mega tasks (total: ${tasks.length})`);
}

main().finally(() => db?.$disconnect());

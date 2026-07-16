/**
 * BiteBook migration, step 2: push the local export into the Apps Script
 * backend (Google Sheets + Drive).
 *
 * Reads ./migration/recipes.json (+ images) produced by export-supabase.mjs
 * and upserts each recipe by id — safe to re-run; failed items can be retried.
 *
 * Usage:
 *   node scripts/import-to-apps-script.mjs <WEB_APP_URL> <API_SECRET>
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [url, secret] = process.argv.slice(2);
if (!url || !secret) {
  console.error(
    "Usage: node scripts/import-to-apps-script.mjs <WEB_APP_URL> <API_SECRET>",
  );
  process.exit(1);
}

const OUT_DIR = "migration";

const contentTypeFor = (file) =>
  file.endsWith(".png") ? "image/png"
  : file.endsWith(".webp") ? "image/webp"
  : "image/jpeg";

async function importOne(recipe) {
  const body = { secret, action: "import", recipe: { ...recipe } };
  delete body.recipe._local_image;

  if (recipe._local_image) {
    const buf = await readFile(path.join(OUT_DIR, "images", recipe._local_image));
    body.imageBase64 = buf.toString("base64");
    body.imageContentType = contentTypeFor(recipe._local_image);
    delete body.recipe.image_url; // replaced by the new Drive URL
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
    redirect: "follow",
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return result;
}

async function main() {
  const recipes = JSON.parse(
    await readFile(path.join(OUT_DIR, "recipes.json"), "utf8"),
  );
  console.log(`Importing ${recipes.length} recipes…`);

  const report = [];
  for (const [i, recipe] of recipes.entries()) {
    process.stdout.write(`  [${i + 1}/${recipes.length}] ${recipe.title} … `);
    try {
      const saved = await importOne(recipe);
      console.log("ok");
      report.push({ id: recipe.id, title: recipe.title, status: "ok", image_url: saved.image_url });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      report.push({ id: recipe.id, title: recipe.title, status: "failed", error: err.message });
    }
  }

  await writeFile(
    path.join(OUT_DIR, "import-report.json"),
    JSON.stringify(report, null, 2),
  );

  const failed = report.filter((r) => r.status === "failed").length;
  console.log(
    `\nDone: ${report.length - failed} imported, ${failed} failed.` +
      `\nReport: ${OUT_DIR}/import-report.json`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

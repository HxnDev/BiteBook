/**
 * BiteBook migration, step 1: export everything from Supabase.
 *
 * Downloads all recipe rows and all recipe photos to ./migration/.
 * Read-only against Supabase; safe to re-run (overwrites the local export).
 *
 * Usage:  node scripts/export-supabase.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = "https://vgwmrzoffyqerbrrzbzw.supabase.co";
const ANON_KEY = "sb_publishable_5ROb2ZTl8lvDeCeCVsN21A_VWUdr5qG";

const OUT_DIR = "migration";
const IMG_DIR = path.join(OUT_DIR, "images");

async function main() {
  await mkdir(IMG_DIR, { recursive: true });

  console.log("Fetching recipes…");
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/recipes?select=*&order=created_at.asc`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
  );
  if (!res.ok) {
    throw new Error(
      `Supabase responded ${res.status} ${res.statusText} — is the project restored/active?`,
    );
  }
  const recipes = await res.json();
  console.log(`  ${recipes.length} recipes`);

  const report = [];
  for (const recipe of recipes) {
    if (!recipe.image_url) {
      report.push({ id: recipe.id, title: recipe.title, image: "none" });
      continue;
    }
    const filename = decodeURIComponent(
      new URL(recipe.image_url).pathname.split("/").pop(),
    );
    const localName = `${recipe.id}${path.extname(filename) || ".jpg"}`;
    process.stdout.write(`  downloading ${localName} … `);
    const imgRes = await fetch(recipe.image_url);
    if (!imgRes.ok) {
      console.log(`FAILED (${imgRes.status})`);
      report.push({
        id: recipe.id,
        title: recipe.title,
        image: "FAILED",
        url: recipe.image_url,
      });
      continue;
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    await writeFile(path.join(IMG_DIR, localName), buf);
    console.log(`${(buf.length / 1024).toFixed(0)} KB`);
    recipe._local_image = localName;
    report.push({ id: recipe.id, title: recipe.title, image: localName });
  }

  await writeFile(
    path.join(OUT_DIR, "recipes.json"),
    JSON.stringify(recipes, null, 2),
  );
  await writeFile(
    path.join(OUT_DIR, "export-report.json"),
    JSON.stringify(report, null, 2),
  );

  const failed = report.filter((r) => r.image === "FAILED").length;
  console.log(
    `\nDone. ${recipes.length} recipes exported to ${OUT_DIR}/recipes.json` +
      `\nImages: ${report.filter((r) => r.image !== "none" && r.image !== "FAILED").length} downloaded, ${failed} failed, ${report.filter((r) => r.image === "none").length} without photo.` +
      `\nReport: ${OUT_DIR}/export-report.json`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

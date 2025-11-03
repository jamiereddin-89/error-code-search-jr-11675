import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jhvrmyxbljglxlqrrwih.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE env var. Exiting.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DATA_DIR = path.join(process.cwd(), "src", "data", "error-codes");
const BACKUP_DIR = path.join(process.cwd(), "backups", `error-codes-${Date.now()}`);

const BRANDS = [
  "Joule",
  "DeDietrich",
  "LG",
  "Hitachi",
  "Panasonic",
  "Grant",
  "Itec",
];

const MODELS = [
  "Victorum",
  "Samsung",
  "Modular Air",
  "Strateo",
  "Thermia",
  "Yutaki",
  "Aquarea",
  "Areona",
];

const CATEGORIES = ["Heating", "Hot water", "Power", "Leak"];
const TAGS = ["Heating", "Hot water", "Power", "Leak"];

async function tableExists(table) {
  try {
    const { data, error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      // If relation does not exist, error.message will contain "relation \"table\" does not exist"
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

function filenameToBrandModel(filename) {
  // filename like "joule-victorum.json" or "dedietrich-strateo.json"
  const base = path.basename(filename, ".json");
  const parts = base.split("-");
  // assume first part is brand, rest join for model
  const brandRaw = parts[0];
  const modelParts = parts.slice(1);
  const brand = brandRaw
    .split(/[^a-zA-Z0-9]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("")
    .replace("Dedietrich", "DeDietrich");
  const model = modelParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return { brand, model };
}

async function backupFiles() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    fs.copyFileSync(path.join(DATA_DIR, f), path.join(BACKUP_DIR, f));
  }
  console.log("Backed up files to", BACKUP_DIR);
}

async function insertBrands() {
  if (!(await tableExists("brands"))) {
    console.warn("Table 'brands' not found, skipping brands insertion.");
    return;
  }
  const rows = BRANDS.map((b) => ({ name: b }));
  const { error } = await supabase.from("brands").upsert(rows, { onConflict: "name" });
  if (error) console.error("Error upserting brands:", error.message);
  else console.log("Brands upserted");
}

async function insertModels() {
  if (!(await tableExists("models"))) {
    console.warn("Table 'models' not found, skipping models insertion.");
    return;
  }
  for (const modelName of MODELS) {
    // naive mapping: try to find a brand that contains model name in known combos
    // We'll assign to Joule for generic ones unless a mapping exists
    let brandName = "Joule";
    if (modelName.toLowerCase().includes("victorum")) brandName = "Joule";
    if (modelName.toLowerCase().includes("samsung")) brandName = "Joule";
    if (modelName.toLowerCase().includes("modular")) brandName = "Joule";
    if (modelName.toLowerCase().includes("strateo")) brandName = "DeDietrich";
    if (modelName.toLowerCase().includes("thermia")) brandName = "LG";
    if (modelName.toLowerCase().includes("yutaki")) brandName = "Hitachi";
    if (modelName.toLowerCase().includes("aquarea")) brandName = "Panasonic";
    if (modelName.toLowerCase().includes("areona")) brandName = "Grant";

    const { data: brandData, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("name", brandName)
      .limit(1)
      .maybeSingle();
    if (brandError || !brandData) {
      console.warn(`Brand ${brandName} not found, skipping model ${modelName}`);
      continue;
    }
    const rows = [{ name: modelName, brand_id: brandData.id }];
    const { error } = await supabase.from("models").upsert(rows, { onConflict: ["brand_id", "name"] });
    if (error) console.error("Error upserting model:", modelName, error.message);
    else console.log("Upserted model:", modelName);
  }
}

async function insertCategoriesAndTags() {
  if (await tableExists("categories")) {
    const rows = CATEGORIES.map((c) => ({ name: c }));
    const { error } = await supabase.from("categories").upsert(rows, { onConflict: "name" });
    if (error) console.error("Error upserting categories:", error.message);
    else console.log("Categories upserted");
  } else {
    console.warn("Table 'categories' not found, skipping categories");
  }

  if (await tableExists("tags")) {
    const rows = TAGS.map((t) => ({ name: t }));
    const { error } = await supabase.from("tags").upsert(rows, { onConflict: "name" });
    if (error) console.error("Error upserting tags:", error.message);
    else console.log("Tags upserted");
  } else {
    console.warn("Table 'tags' not found, skipping tags");
  }
}

async function migrateErrorCodes() {
  if (!(await tableExists("error_codes"))) {
    console.warn("Table 'error_codes' not found, skipping error codes migration.");
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  let allInserted = 0;
  for (const f of files) {
    const filePath = path.join(DATA_DIR, f);
    const raw = fs.readFileSync(filePath, "utf-8");
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse", f);
      continue;
    }
    const { brand, model } = filenameToBrandModel(f);
    const rows = Object.values(parsed).map((entry) => ({
      brand,
      model,
      code: entry.code || entry.id || String(entry.index || ""),
      meaning: entry.meaning || entry.description || "",
      solution: entry.solution || entry.fix || "",
      raw: entry,
    }));
    if (rows.length === 0) continue;
    const { error, data } = await supabase.from("error_codes").upsert(rows, { onConflict: ["brand", "model", "code"] });
    if (error) {
      console.error("Error inserting error codes from", f, error.message);
    } else {
      allInserted += rows.length;
      console.log(`Inserted/updated ${rows.length} codes from ${f}`);
    }
  }
  console.log(`Total codes processed: ${allInserted}`);
}

(async function main() {
  console.log("Starting migration...");
  await backupFiles();
  await insertBrands();
  await insertCategoriesAndTags();
  await insertModels();
  await migrateErrorCodes();
  console.log("Migration complete.");
})();

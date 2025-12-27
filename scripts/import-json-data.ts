import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { getPool } from "../src/db";
import { readFileSync } from "fs";

// Загружаем переменные окружения
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

const envFileToLoad = existsSync(envLocalPath) ? envLocalPath : envPath;
if (envFileToLoad && existsSync(envFileToLoad)) {
  config({ path: envFileToLoad });
}

interface PartnerData {
  id: string;
  name: string;
  image: string;
  cooperation_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface CatalogData {
  id: string;
  name: string;
  category: string;
  min_order: string;
  delivery_time: string;
  icon_name: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ItemData {
  id: string;
  catalog_id: string;
  name: string;
  price: string;
  ves: string;
  date: string;
  created_at: string;
  updated_at: string;
}

async function importData() {
  const pool = getPool();

  try {
    console.log("🚀 Начало импорта данных из JSON файлов...\n");

    // 1. Импорт catalog (сначала, так как items зависит от catalog)
    console.log("📦 Импорт каталога (catalog)...");
    const catalogPath = resolve(process.cwd(), "catalog.json");
    const catalogData: CatalogData[] = JSON.parse(
      readFileSync(catalogPath, "utf-8")
    );

    for (const item of catalogData) {
      await pool.query(
        `INSERT INTO catalog (
          id, name, category, min_order, delivery_time, 
          icon_name, description, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          min_order = EXCLUDED.min_order,
          delivery_time = EXCLUDED.delivery_time,
          icon_name = EXCLUDED.icon_name,
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at`,
        [
          item.id,
          item.name,
          item.category,
          item.min_order,
          item.delivery_time,
          item.icon_name || null,
          item.description,
          item.created_at,
          item.updated_at,
        ]
      );
    }
    console.log(`✅ Загружено ${catalogData.length} записей в catalog\n`);

    // 2. Импорт items (после catalog)
    console.log("🛍️ Импорт товаров (items)...");
    const itemsPath = resolve(process.cwd(), "items.json");
    const itemsData: ItemData[] = JSON.parse(readFileSync(itemsPath, "utf-8"));

    for (const item of itemsData) {
      await pool.query(
        `INSERT INTO items (
          id, catalog_id, name, price, ves, date, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          catalog_id = EXCLUDED.catalog_id,
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          ves = EXCLUDED.ves,
          date = EXCLUDED.date,
          updated_at = EXCLUDED.updated_at`,
        [
          item.id,
          item.catalog_id,
          item.name,
          item.price,
          item.ves,
          item.date,
          item.created_at,
          item.updated_at,
        ]
      );
    }
    console.log(`✅ Загружено ${itemsData.length} записей в items\n`);

    // 3. Импорт partners
    console.log("🤝 Импорт партнеров (partners)...");
    const partnersPath = resolve(process.cwd(), "partners.json");
    const partnersData: PartnerData[] = JSON.parse(
      readFileSync(partnersPath, "utf-8")
    );

    for (const partner of partnersData) {
      await pool.query(
        `INSERT INTO partners (
          id, name, image, cooperation_date, description, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          cooperation_date = EXCLUDED.cooperation_date,
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at`,
        [
          partner.id,
          partner.name,
          partner.image,
          partner.cooperation_date,
          partner.description,
          partner.created_at,
          partner.updated_at,
        ]
      );
    }
    console.log(`✅ Загружено ${partnersData.length} записей в partners\n`);

    console.log("🎉 Импорт данных завершен успешно!");
  } catch (error) {
    console.error("❌ Ошибка при импорте данных:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запуск импорта
importData();

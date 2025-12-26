import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Загружаем переменные окружения из .env.local или .env ПЕРЕД импортом db
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (existsSync(envPath)) {
  config({ path: envPath });
}

async function seedCatalog() {
  // Динамический импорт после загрузки переменных окружения
  const { db, pool } = await import("../src/db");
  const { catalog } = await import("../src/db/schema");

  try {
    console.log("📦 Заполнение таблицы Catalog...\n");

    // Данные из CatalogSection.tsx, иконки заменены на названия
    const catalogItems = [
      {
        name: "Магнит",
        category: "food",
        minOrder: "499 ₽",
        deliveryTime: "7–15 мин",
        iconName: "shopping-cart",
        description: "Dark store на Николая Островского",
      },
      {
        name: "Додо Пицца",
        category: "rest",
        minOrder: "399 ₽",
        deliveryTime: "10–18 мин",
        iconName: "pizza",
        description: "Только горячее! Термоконтейнер",
      },
      {
        name: "Аптека 36 и 6",
        category: "med",
        minOrder: "0 ₽",
        deliveryTime: "5–12 мин",
        iconName: "pill",
        description: "Срочная доставка лекарств",
      },
      {
        name: "ВкусВилл",
        category: "food",
        minOrder: "799 ₽",
        deliveryTime: "10–20 мин",
        iconName: "leaf",
        description: "Премиум-ассортимент",
      },
      {
        name: "Почта России",
        category: "other",
        minOrder: "50 ₽",
        deliveryTime: "15–30 мин",
        iconName: "package",
        description: "Документы и посылки до 5 кг",
      },
      {
        name: "Теремок",
        category: "rest",
        minOrder: "299 ₽",
        deliveryTime: "8–15 мин",
        iconName: "pancake",
        description: "Блины в термосумке",
      },
    ];

    // Очищаем таблицу перед заполнением
    console.log("🗑️  Очистка существующих данных...");
    await pool.query("DELETE FROM catalog");
    console.log("✅ Таблица очищена\n");

    // Вставляем данные
    console.log("📝 Добавление записей в каталог...");
    for (const item of catalogItems) {
      await db.insert(catalog).values(item);
      console.log(`   ✅ ${item.name} добавлен`);
    }

    console.log(`\n✨ Успешно добавлено ${catalogItems.length} записей в каталог!`);

    // Проверяем результат
    const result = await pool.query("SELECT COUNT(*) as count FROM catalog");
    console.log(`\n📊 Всего записей в каталоге: ${result.rows[0].count}`);

    // Закрываем пул соединений
    await pool.end();
    process.exit(0);
  } catch (error: unknown) {
    console.error("❌ Ошибка при заполнении каталога:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack}`);
      }
    } else {
      console.error(`   ${String(error)}`);
    }
    process.exit(1);
  }
}

seedCatalog().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});


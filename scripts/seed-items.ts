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

async function seedItems() {
  // Динамический импорт после загрузки переменных окружения
  const { db, getPool } = await import("../src/db");
  const { items, catalog } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    console.log("📦 Заполнение таблицы Items...\n");

    const pool = getPool();

    // Получаем ID партнеров из каталога
    console.log("🔍 Поиск партнеров в каталоге...");
    const catalogResult = await pool.query(
      `SELECT id, name FROM catalog ORDER BY name`
    );

    const catalogMap: Record<string, string> = {};
    catalogResult.rows.forEach((row: { id: string; name: string }) => {
      catalogMap[row.name] = row.id;
    });

    console.log("✅ Найдено партнеров:", Object.keys(catalogMap).length);
    console.log("   Партнеры:", Object.keys(catalogMap).join(", "));
    console.log();

    // Данные товаров по партнерам
    const itemsData: Array<{
      catalogName: string;
      name: string;
      price: number;
      ves: string;
    }> = [
      // Додо Пицца
      { catalogName: "Додо Пицца", name: "Пепперони, 30 см", price: 499, ves: "850" },
      { catalogName: "Додо Пицца", name: "Маргарита, 30 см", price: 399, ves: "780" },
      { catalogName: "Додо Пицца", name: "Кола 0.5л", price: 89, ves: "550" },
      { catalogName: "Додо Пицца", name: "Салат Цезарь", price: 249, ves: "320" },
      { catalogName: "Додо Пицца", name: "Десерт: Чизкейк", price: 199, ves: "250" },
      {
        catalogName: "Додо Пицца",
        name: "Комбо «Семейный» (2 пиццы + 2 напитка)",
        price: 999,
        ves: "2100",
      },
      { catalogName: "Додо Пицца", name: "Соус чесночный (доп.)", price: 39, ves: "120" },

      // Магнит
      { catalogName: "Магнит", name: "Хлеб «Бородинский»", price: 49, ves: "500" },
      { catalogName: "Магнит", name: "Молоко 3.2%, 1л", price: 89, ves: "1030" },
      { catalogName: "Магнит", name: "Яйца куриные, 10 шт.", price: 119, ves: "650" },
      { catalogName: "Магнит", name: "Сыр «Российский», 200г", price: 129, ves: "210" },
      { catalogName: "Магнит", name: "Шоколад «Аленка»", price: 89, ves: "90" },
      { catalogName: "Магнит", name: "Салфетки бумажные, 100 шт.", price: 59, ves: "120" },
      { catalogName: "Магнит", name: "Бутылка воды «Вкусная», 1.5л", price: 69, ves: "1530" },

      // ВкусВилл
      { catalogName: "ВкусВилл", name: "Салат «Греческий»", price: 299, ves: "350" },
      { catalogName: "ВкусВилл", name: "Креветки тигровые, 200г", price: 499, ves: "210" },
      { catalogName: "ВкусВилл", name: "Говядина для стейка, 300г", price: 599, ves: "310" },
      { catalogName: "ВкусВилл", name: "Авокадо, 1 шт.", price: 129, ves: "250" },
      { catalogName: "ВкусВилл", name: "Йогурт греческий, 200г", price: 149, ves: "210" },
      { catalogName: "ВкусВилл", name: "Оливковое масло, 500мл", price: 299, ves: "510" },
      {
        catalogName: "ВкусВилл",
        name: "Фруктовый набор (банан+яблоко+апельсин)",
        price: 199,
        ves: "650",
      },

      // Почта России
      { catalogName: "Почта России", name: "Отправка документа (до 100г)", price: 50, ves: "100" },
      { catalogName: "Почта России", name: "Посылка до 1 кг", price: 199, ves: "1000" },
      { catalogName: "Почта России", name: "Упаковка картонная (до 5 кг)", price: 49, ves: "120" },
      { catalogName: "Почта России", name: "Доставка с описью вложения", price: 79, ves: "0" },
      { catalogName: "Почта России", name: "Уведомление о вручении", price: 29, ves: "0" },
      { catalogName: "Почта России", name: "Страхование на сумму до 5000₽", price: 99, ves: "0" },
      { catalogName: "Почта России", name: "Экспресс-доставка (до 2 часов)", price: 299, ves: "500" },

      // Теремок
      { catalogName: "Теремок", name: "Блин с ветчиной и сыром", price: 199, ves: "250" },
      { catalogName: "Теремок", name: "Блин со сметаной", price: 129, ves: "200" },
      { catalogName: "Теремок", name: "Кофе американо", price: 149, ves: "350" },
      { catalogName: "Теремок", name: "Сок апельсиновый, 0.3л", price: 99, ves: "320" },
      { catalogName: "Теремок", name: "Блин с творожной начинкой", price: 179, ves: "230" },
      { catalogName: "Теремок", name: "Комбо «Завтрак» (блин + кофе)", price: 299, ves: "550" },
      { catalogName: "Теремок", name: "Десерт: блин с шоколадом", price: 159, ves: "220" },

      // Аптека 36 и 6
      { catalogName: "Аптека 36 и 6", name: "Анальгин, 10 шт.", price: 49, ves: "20" },
      { catalogName: "Аптека 36 и 6", name: "Лоратадин, 10 шт.", price: 129, ves: "15" },
      { catalogName: "Аптека 36 и 6", name: "Средство от кашля «Геделикс»", price: 299, ves: "120" },
      { catalogName: "Аптека 36 и 6", name: "Бандаж эластичный", price: 199, ves: "80" },
      { catalogName: "Аптека 36 и 6", name: "Тест на беременность", price: 399, ves: "30" },
      { catalogName: "Аптека 36 и 6", name: "Витамины C, 30 шт.", price: 149, ves: "25" },
      { catalogName: "Аптека 36 и 6", name: "Рецептурный препарат (по запросу)", price: 500, ves: "50" },
    ];

    // Очищаем таблицу перед заполнением
    console.log("🗑️  Очистка существующих данных...");
    await pool.query("DELETE FROM items");
    console.log("✅ Таблица очищена\n");

    // Вставляем данные
    console.log("📝 Добавление товаров...");
    let addedCount = 0;
    let skippedCount = 0;

    for (const item of itemsData) {
      const catalogId = catalogMap[item.catalogName];

      if (!catalogId) {
        console.log(`   ⚠️  Пропущено: ${item.name} (партнер "${item.catalogName}" не найден)`);
        skippedCount++;
        continue;
      }

      await db.insert(items).values({
        catalogId,
        name: item.name,
        price: item.price.toString(),
        ves: item.ves,
      });

      addedCount++;
      console.log(`   ✅ ${item.name} (${item.catalogName}) - ₽${item.price}, ${item.ves}г`);
    }

    console.log(`\n✨ Успешно добавлено ${addedCount} товаров!`);
    if (skippedCount > 0) {
      console.log(`⚠️  Пропущено ${skippedCount} товаров (партнеры не найдены)`);
    }

    // Проверяем результат
    const result = await pool.query("SELECT COUNT(*) as count FROM items");
    console.log(`\n📊 Всего товаров в таблице: ${result.rows[0].count}`);

    // Статистика по партнерам
    const statsResult = await pool.query(`
      SELECT c.name, COUNT(i.id) as items_count
      FROM catalog c
      LEFT JOIN items i ON c.id = i.catalog_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);

    console.log("\n📈 Статистика по партнерам:");
    statsResult.rows.forEach((row: { name: string; items_count: string }) => {
      console.log(`   ${row.name}: ${row.items_count} товаров`);
    });

    // Закрываем пул соединений
    await pool.end();
    process.exit(0);
  } catch (error: unknown) {
    console.error("❌ Ошибка при заполнении товаров:");
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

seedItems().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});


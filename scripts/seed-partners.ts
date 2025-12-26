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

async function seedPartners() {
  // Динамический импорт после загрузки переменных окружения
  const { db } = await import("../src/db");
  const { partners } = await import("../src/db/schema");
  try {
    console.log("🤝 Заполнение таблицы партнеров...\n");

    // Данные партнеров
    const partnersData = [
      {
        name: "TechCorp Solutions",
        image:
          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
        cooperationDate: new Date("2022-01-15"),
        description: "Ведущий поставщик IT-решений и облачных сервисов",
      },
      {
        name: "Global Logistics",
        image:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=200&fit=crop",
        cooperationDate: new Date("2021-06-20"),
        description: "Международная логистическая компания с сетью складов",
      },
      {
        name: "Digital Marketing Pro",
        image:
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop",
        cooperationDate: new Date("2023-03-10"),
        description: "Агентство цифрового маркетинга и рекламы",
      },
      {
        name: "Green Energy Systems",
        image:
          "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200&h=200&fit=crop",
        cooperationDate: new Date("2022-09-05"),
        description:
          "Разработка и внедрение экологичных энергетических решений",
      },
      {
        name: "Smart Finance Group",
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop",
        cooperationDate: new Date("2021-11-12"),
        description: "Финансовые услуги и консалтинг для бизнеса",
      },
      {
        name: "CloudNet Services",
        image:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop",
        cooperationDate: new Date("2023-07-18"),
        description: "Облачные вычисления и хостинг-решения",
      },
      {
        name: "EcoDelivery Express",
        image:
          "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200&h=200&fit=crop",
        cooperationDate: new Date("2022-04-22"),
        description: "Экологичная доставка с использованием электромобилей",
      },
      {
        name: "InnovateLab",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop",
        cooperationDate: new Date("2023-01-30"),
        description: "Исследования и разработка инновационных технологий",
      },
      {
        name: "SecureNet Security",
        image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=200&fit=crop",
        cooperationDate: new Date("2021-08-14"),
        description: "Кибербезопасность и защита данных",
      },
      {
        name: "DataAnalytics Pro",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop",
        cooperationDate: new Date("2022-12-08"),
        description: "Аналитика больших данных и бизнес-интеллект",
      },
    ];

    // Проверяем, есть ли уже партнеры в таблице
    const existingPartners = await db.select().from(partners).limit(1);

    if (existingPartners.length > 0) {
      console.log("⚠️  В таблице уже есть партнеры!");
      console.log(`   Найдено записей: ${existingPartners.length}`);
      console.log("   Пропускаем заполнение...\n");
      process.exit(0);
    }

    // Вставляем партнеров
    console.log("📝 Добавление партнеров в БД...");
    const insertedPartners = await db
      .insert(partners)
      .values(partnersData)
      .returning();

    console.log(`✅ Успешно добавлено ${insertedPartners.length} партнеров!\n`);

    // Выводим информацию о добавленных партнерах
    console.log("📋 Список добавленных партнеров:");
    insertedPartners.forEach((partner, index) => {
      console.log(`\n${index + 1}. ${partner.name}`);
      console.log(
        `   Дата сотрудничества: ${partner.cooperationDate.toLocaleDateString(
          "ru-RU"
        )}`
      );
      console.log(`   Описание: ${partner.description}`);
      console.log(`   ID: ${partner.id}`);
    });

    console.log("\n✨ Таблица партнеров успешно заполнена!");
    process.exit(0);
  } catch (error: unknown) {
    console.error("❌ Ошибка при заполнении таблицы партнеров:");
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

seedPartners().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});

import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { sql } from "drizzle-orm";

// Загружаем переменные окружения из .env.local или .env ПЕРЕД импортом db
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (existsSync(envPath)) {
  config({ path: envPath });
}

async function testConnection() {
  // Динамический импорт после загрузки переменных окружения
  const { db } = await import("../src/db");
  const { users } = await import("../src/db/schema");
  try {
    console.log("🔍 Проверка подключения к базе данных...\n");

    // Проверка подключения
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log("✅ Подключение к БД успешно!");
    console.log(`   Время сервера: ${result.rows[0]?.current_time}\n`);

    // Проверка существования таблицы users
    const tablesResult = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`
    );

    if (tablesResult.rows.length > 0) {
      console.log("✅ Таблица 'users' существует\n");

      // Проверка структуры таблицы
      const columnsResult = await db.execute(
        sql`SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position`
      );

      console.log("📋 Структура таблицы 'users':");
      columnsResult.rows.forEach((col: any) => {
        console.log(
          `   - ${col.column_name}: ${col.data_type} ${
            col.is_nullable === "NO" ? "(NOT NULL)" : ""
          }`
        );
      });
      console.log();

      // Проверка существующих пользователей
      const usersCount = await db.select().from(users);
      console.log(`👥 Количество пользователей в БД: ${usersCount.length}`);
      if (usersCount.length > 0) {
        console.log("\n📝 Существующие пользователи:");
        usersCount.forEach((user, index) => {
          console.log(
            `   ${index + 1}. ${user.email} (ID: ${user.id})${
              user.name ? ` - ${user.name}` : ""
            }`
          );
        });
      }
    } else {
      console.log("❌ Таблица 'users' не найдена!");
      console.log("   Необходимо выполнить миграции: npm run db:migrate\n");
    }

    // Проверка других таблиц NextAuth
    const nextAuthTables = ["accounts", "sessions", "verification_tokens"];
    console.log("\n🔐 Проверка таблиц NextAuth:");
    for (const tableName of nextAuthTables) {
      const tableCheck = await db.execute(
        sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName}`
      );
      if (tableCheck.rows.length > 0) {
        console.log(`   ✅ ${tableName} - существует`);
      } else {
        console.log(`   ❌ ${tableName} - не найдена`);
      }
    }

    console.log("\n✨ Проверка завершена!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Ошибка при проверке подключения:");
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Код ошибки: ${error.code}`);
    }
    process.exit(1);
  }
}

testConnection().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});

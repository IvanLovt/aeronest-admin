import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Загружаем переменные окружения из .env.local или .env ПЕРЕД импортом db
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (existsSync(envPath)) {
  config({ path: envPath });
}

async function testAdminLogin() {
  // Динамический импорт после загрузки переменных окружения
  const { db } = await import("../src/db");
  const { users } = await import("../src/db/schema");
  try {
    console.log("🧪 Тест входа администратора...\n");

    const email = "admin@example.com";
    const password = "qweasd";

    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Пароль: ${password}\n`);

    // Ищем пользователя
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log("❌ Пользователь не найден!");
      process.exit(1);
    }

    const user = userResult[0];
    console.log("✅ Пользователь найден:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Имя: ${user.name}`);
    console.log(`   Пароль захеширован: ${user.passwordHash ? "Да" : "Нет"}\n`);

    if (!user.passwordHash) {
      console.log("❌ У пользователя нет пароля!");
      process.exit(1);
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      console.log("✅ Пароль проверен - совпадает!");
      console.log("\n✨ Вход должен работать корректно!");
    } else {
      console.log("❌ Пароль не совпадает!");
      console.log("   Возможно, пароль был изменен.");
    }

    process.exit(0);
  } catch (error: unknown) {
    console.error("❌ Ошибка при тестировании:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${String(error)}`);
    }
    process.exit(1);
  }
}

testAdminLogin().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});

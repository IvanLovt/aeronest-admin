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

async function testRegistration() {
  // Динамический импорт после загрузки переменных окружения
  const { db } = await import("../src/db");
  const { users } = await import("../src/db/schema");
  try {
    console.log("🧪 Тест регистрации нового пользователя...\n");

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "testpassword123";
    const testName = "Тестовый Пользователь";

    console.log(`📧 Email: ${testEmail}`);
    console.log(`👤 Имя: ${testName}`);
    console.log(`🔒 Пароль: ${testPassword}\n`);

    // Проверяем, что пользователя нет
    const existingUserResult = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (existingUserResult.length > 0) {
      console.log("⚠️  Пользователь с таким email уже существует, удаляем...");
      await db.delete(users).where(eq(users.id, existingUserResult[0].id));
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(testPassword, 10);
    console.log("✅ Пароль захеширован\n");

    // Создаем пользователя
    console.log("📝 Создание пользователя в БД...");
    const [newUser] = await db
      .insert(users)
      .values({
        email: testEmail,
        passwordHash,
        name: testName,
      })
      .returning();

    console.log("✅ Пользователь успешно создан!");
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Имя: ${newUser.name || "не указано"}`);
    console.log(`   Баланс: ${newUser.balance}`);
    console.log(`   Создан: ${newUser.createdAt}\n`);

    // Проверяем, что можем найти пользователя
    const foundUserResult = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (foundUserResult.length > 0) {
      const foundUser = foundUserResult[0];
      console.log("✅ Пользователь найден в БД!");

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(
        testPassword,
        foundUser.passwordHash || ""
      );

      if (isPasswordValid) {
        console.log("✅ Пароль проверен - совпадает!\n");
      } else {
        console.log("❌ Пароль не совпадает!\n");
      }
    } else {
      console.log("❌ Пользователь не найден в БД!\n");
    }

    // Очистка - удаляем тестового пользователя
    console.log("🧹 Удаление тестового пользователя...");
    await db.delete(users).where(eq(users.id, newUser.id));
    console.log("✅ Тестовый пользователь удален\n");

    console.log("✨ Тест регистрации пройден успешно!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Ошибка при тестировании регистрации:");
    console.error(`   ${error.message}`);
    if (error.code) {
      console.error(`   Код ошибки: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Детали: ${error.detail}`);
    }
    process.exit(1);
  }
}

testRegistration().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});

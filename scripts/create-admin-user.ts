import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

// Загружаем переменные окружения из .env.local или .env ПЕРЕД импортом db
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (existsSync(envPath)) {
  config({ path: envPath });
}

async function createAdminUser() {
  // Динамический импорт после загрузки переменных окружения
  const { pool } = await import("../src/db");
  try {
    console.log("👤 Создание пользователя Admin напрямую в Neon...\n");

    const email = "admin@example.com";
    const password = "qweasd";
    const name = "Admin";

    // Проверяем, существует ли пользователь (прямой SQL запрос к Neon)
    console.log("🔍 Проверка существующего пользователя...");
    const existingUserResult = await pool.query(
      `SELECT id, email, name, password_hash, created_at 
       FROM users 
       WHERE email = $1 
       LIMIT 1`,
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      console.log("⚠️  Пользователь с таким email уже существует!");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Имя: ${existingUser.name || "не указано"}`);
      console.log(`   Создан: ${existingUser.created_at}\n`);

      console.log("🗑️  Удаление существующего пользователя...");
      await pool.query(`DELETE FROM users WHERE id = $1`, [existingUser.id]);
      console.log("✅ Пользователь удален!\n");
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("✅ Пароль захеширован\n");

    // Генерируем ID для пользователя
    const userId = createId();
    console.log(`📋 Создаем пользователя с ID: ${userId}`);

    // Создаем пользователя напрямую в Neon через SQL
    console.log("📝 Создание пользователя в Neon...");
    const insertResult = await pool.query(
      `INSERT INTO users (id, email, password_hash, name, balance, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, name, balance, created_at`,
      [userId, email, passwordHash, name, 0]
    );

    const newUser = insertResult.rows[0];

    console.log("✅ Пользователь успешно создан в Neon!");
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Имя: ${newUser.name}`);
    console.log(`   Баланс: ${newUser.balance}`);
    console.log(`   Создан: ${newUser.created_at}\n`);

    // Проверяем, что можем найти пользователя (прямой SQL запрос)
    console.log("🔍 Проверка созданного пользователя...");
    const foundUserResult = await pool.query(
      `SELECT id, email, name, password_hash 
       FROM users 
       WHERE email = $1 
       LIMIT 1`,
      [email]
    );

    if (foundUserResult.rows.length > 0) {
      const foundUser = foundUserResult.rows[0];
      console.log("✅ Пользователь найден в Neon!");

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.password_hash || ""
      );

      if (isPasswordValid) {
        console.log("✅ Пароль проверен - совпадает!\n");
      } else {
        console.log("❌ Пароль не совпадает!\n");
      }
    } else {
      console.log("❌ Пользователь не найден в Neon!\n");
    }

    console.log("✨ Пользователь Admin создан успешно в Neon!");
    console.log("\n📋 Данные для входа:");
    console.log(`   Email: ${email}`);
    console.log(`   Пароль: ${password}\n`);

    // Закрываем пул соединений
    await pool.end();
    process.exit(0);
  } catch (error: unknown) {
    console.error("❌ Ошибка при создании пользователя:");
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

createAdminUser().catch((error) => {
  console.error("❌ Неожиданная ошибка:", error);
  process.exit(1);
});

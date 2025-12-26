// Next.js автоматически загружает переменные окружения из .env.local и .env
// Не нужно использовать dotenv/config в Next.js
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Получаем DATABASE_URL из переменных окружения
// Next.js автоматически загружает переменные из .env.local и .env
function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!url) {
    console.error("❌ DATABASE_URL не найден в переменных окружения!");
    console.error(
      "   Доступные переменные:",
      Object.keys(process.env).filter(
        (k) => k.includes("DATABASE") || k.includes("POSTGRES")
      )
    );
    throw new Error(
      "DATABASE_URL is required. Please set it in your .env.local or .env file and restart the server."
    );
  }

  return url;
}

const databaseUrl = getDatabaseUrl();

// Логируем только начало URL для безопасности
const urlPreview =
  databaseUrl.length > 30 ? databaseUrl.substring(0, 30) + "..." : "***";
console.log("🔌 Подключение к БД через Neon (node-postgres):", urlPreview);

// Определяем, нужен ли SSL (для Neon и других облачных БД)
const needsSSL =
  databaseUrl.includes("neon.tech") ||
  databaseUrl.includes("vercel") ||
  databaseUrl.includes("supabase") ||
  databaseUrl.includes("railway") ||
  databaseUrl.includes("render.com");

// Создаем пул соединений для Neon
// Используем node-postgres вместо neon-serverless для совместимости с Drizzle
const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Включаем SSL для облачных БД
  ...(needsSSL && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

// Обработка ошибок подключения
pool.on("error", (err) => {
  console.error("❌ Ошибка подключения к БД:", err);
});

// Создаем Drizzle instance с пулом соединений
export const db = drizzle(pool, { schema });

// Экспортируем пул для прямых SQL запросов
export { pool };

export default db;

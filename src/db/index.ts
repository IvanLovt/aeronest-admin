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
    // Во время билда не выбрасываем ошибку, только предупреждаем
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("⚠️ DATABASE_URL не найден во время билда. Это нормально, если переменные установлены в среде выполнения.");
      return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
    }
    
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

// Ленивая инициализация для избежания ошибок при билде
let databaseUrl: string | null = null;
let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
  if (dbInstance) return dbInstance;

  databaseUrl = getDatabaseUrl();

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
  pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Для serverless БД уменьшаем время жизни соединения
    statement_timeout: 30000,
    query_timeout: 30000,
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
    // При ошибке соединения сбрасываем пул для переподключения
    if (err.message.includes("terminated") || err.message.includes("closed")) {
      console.log("🔄 Попытка переподключения к БД...");
      pool = null;
      dbInstance = null;
    }
  });
  
  // Обработка события 'connect' для отслеживания подключений
  pool.on("connect", () => {
    console.log("✅ Подключение к БД установлено");
  });

  // Создаем Drizzle instance с пулом соединений
  dbInstance = drizzle(pool, { schema });
  return dbInstance;
}

// Ленивая инициализация - БД будет подключена при первом использовании
// Это позволяет избежать ошибок при билде Next.js, когда DATABASE_URL может быть недоступен
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!dbInstance) {
      dbInstance = initializeDatabase();
    }
    const value = dbInstance[prop as keyof typeof dbInstance];
    if (typeof value === "function") {
      return value.bind(dbInstance);
    }
    return value;
  },
});

// Экспортируем функцию для получения пула с автоматическим переподключением
export const getPool = () => {
  // Проверяем наличие DATABASE_URL перед инициализацией
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!url) {
    const errorMessage =
      "DATABASE_URL is required. Please set it in your environment variables.";
    console.error("❌", errorMessage);
    console.error(
      "   Available env vars:",
      Object.keys(process.env)
        .filter((k) => k.includes("DATABASE") || k.includes("POSTGRES"))
        .join(", ") || "none"
    );
    throw new Error(errorMessage);
  }

  if (!pool) {
    initializeDatabase();
  }
  if (!pool) {
    throw new Error("Failed to initialize database pool");
  }
  
  // Проверяем, что пул еще активен
  if (pool.ended) {
    console.log("🔄 Пул соединений закрыт, переинициализация...");
    pool = null;
    dbInstance = null;
    initializeDatabase();
    if (!pool) {
      throw new Error("Failed to reinitialize database pool");
    }
  }
  
  return pool;
};

// Экспортируем пул для обратной совместимости
export { getPool as pool };

export default db;

import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

// Загружаем переменные окружения из .env.local или .env файла
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

// Сначала пробуем .env.local, затем .env
const envFileToLoad = existsSync(envLocalPath) ? envLocalPath : envPath;

if (envFileToLoad && existsSync(envFileToLoad)) {
  const result = config({ path: envFileToLoad });
  if (result.error) {
    console.warn(`Warning: Could not load ${envFileToLoad} file via dotenv:`, result.error);
  }

  // Если dotenv не загрузил, читаем вручную
  if (!process.env.DATABASE_URL) {
    try {
      const envContent = readFileSync(envFileToLoad, "utf-8");
      const envLines = envContent.split("\n");

      for (const line of envLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("DATABASE_URL=")) {
          const value = trimmed
            .replace(/^DATABASE_URL=/, "")
            .replace(/^["']|["']$/g, "");
          process.env.DATABASE_URL = value;
          break;
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${envFileToLoad} file manually:`, error);
    }
  }
}

// Получаем DATABASE_URL из переменных окружения
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Please set it in your .env file or environment variables."
  );
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;

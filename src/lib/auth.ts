import { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getPool } from "@/db";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

// Проверяем наличие AUTH_SECRET (только во время выполнения, не во время билда)
if (!process.env.AUTH_SECRET && process.env.NODE_ENV !== "production") {
  console.warn("⚠️ AUTH_SECRET не установлен в переменных окружения!");
}

export const authOptions = {
  secret: process.env.AUTH_SECRET || "development-secret-key-change-in-production",
  // Адаптер не нужен при использовании JWT стратегии и CredentialsProvider
  // Адаптер используется только для database sessions
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Отсутствуют email или пароль");
            return null;
          }

          console.log(`🔍 Поиск пользователя: ${credentials.email}`);

          // Прямой SQL запрос к Neon для проверки пользователя
          // Используем прямой запрос, чтобы проверить данные напрямую в БД
          const pool = getPool();
          const queryResult = await pool.query(
            `SELECT id, email, name, password_hash, image 
             FROM users 
             WHERE email = $1 
             LIMIT 1`,
            [credentials.email as string]
          );

          const userRow = queryResult.rows[0];

          if (!userRow) {
            console.log(`❌ Пользователь не найден: ${credentials.email}`);
            return null;
          }

          if (!userRow.password_hash) {
            console.log(`❌ У пользователя нет пароля: ${credentials.email}`);
            return null;
          }

          console.log(`✅ Пользователь найден в Neon: ${userRow.email}`);
          console.log(`   ID: ${userRow.id}`);
          console.log(`   Имя: ${userRow.name || "не указано"}`);

          // Проверяем пароль
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            userRow.password_hash
          );

          if (!isPasswordValid) {
            console.log(`❌ Неверный пароль для: ${credentials.email}`);
            return null;
          }

          console.log(`✅ Авторизация успешна: ${userRow.email}`);

          // NextAuth требует определенный формат объекта пользователя
          const userData = {
            id: userRow.id,
            email: userRow.email,
            name: userRow.name || userRow.email.split("@")[0], // Если имени нет, используем часть email
            image: userRow.image || null,
          };

          console.log("📤 Возвращаем данные пользователя:", {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            hasImage: !!userData.image,
          });

          // Убеждаемся, что все обязательные поля присутствуют
          if (!userData.id || !userData.email) {
            console.error("❌ Неполные данные пользователя:", userData);
            return null;
          }

          return userData;
        } catch (error) {
          console.error("❌ Ошибка в authorize:", error);
          if (error instanceof Error) {
            console.error("   Message:", error.message);
            console.error("   Stack:", error.stack);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/api/auth/error",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      try {
        if (user) {
          console.log("🔑 JWT callback - получен user:", {
            id: user.id,
            email: user.email,
            name: user.name,
          });
          token.id = user.id;
          token.email = user.email;
          token.name = user.name || user.email?.split("@")[0] || undefined;
        }
        return token;
      } catch (error) {
        console.error("❌ Ошибка в jwt callback:", error);
        return token;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      try {
        if (session.user && token) {
          if (token.id) {
            session.user.id = token.id as string;
          }
          if (token.email) {
            session.user.email = token.email as string;
          }
          if (token.name) {
            session.user.name = token.name as string;
          }
        }
        return session;
      } catch (error) {
        console.error("❌ Ошибка в session callback:", error);
        return session;
      }
    },
  },
};

// Экспортируем функцию auth для использования в API routes
import NextAuth from "next-auth";
export const { auth } = NextAuth(authOptions as any);

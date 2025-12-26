import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("🔧 Инициализация NextAuth...");
console.log(
  "   AUTH_SECRET:",
  process.env.AUTH_SECRET ? "✅ Установлен" : "❌ Отсутствует"
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { handlers } = NextAuth(authOptions as any);

console.log("✅ NextAuth инициализирован успешно");

export const { GET, POST } = handlers;

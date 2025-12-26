import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Неверный формат данных запроса" },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Неверный формат email адреса" },
        { status: 400 }
      );
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен содержать минимум 6 символов" },
        { status: 400 }
      );
    }

    console.log(`📝 Регистрация нового пользователя: ${email}`);

    // Проверяем, существует ли пользователь
    console.log("🔍 Проверка существующего пользователя...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`❌ Пользователь уже существует: ${email}`);
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }

    console.log("✅ Пользователь не найден, создаем нового...");

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("✅ Пароль захеширован");

    // Генерируем ID для пользователя
    const userId = createId();
    console.log(`📋 Создаем пользователя с ID: ${userId}`);

    // Создаем пользователя
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        passwordHash,
        name: name || null,
      })
      .returning();

    console.log(`✅ Пользователь успешно создан: ${newUser.email}`);

    return NextResponse.json(
      {
        message: "Пользователь успешно зарегистрирован",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Детальное логирование ошибки
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Обработка специфичных ошибок базы данных
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Обработка ошибок уникальности email
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("unique")
    ) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }

    // Возвращаем более детальную ошибку в режиме разработки
    const errorMessage =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Произошла ошибка при регистрации. Попробуйте позже.";

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && error instanceof Error
          ? { details: error.stack }
          : {}),
      },
      { status: 500 }
    );
  }
}

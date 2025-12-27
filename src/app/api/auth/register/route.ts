import { NextRequest, NextResponse } from "next/server";
import { db, getPool } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import {
  registerSchema,
  validateAndSanitize,
  sanitizeString,
} from "@/lib/security/validation";
import { getClientIP } from "@/lib/security/rateLimit";
import { logSecurityEvent, SecurityEventType } from "@/lib/security/logger";

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      logSecurityEvent({
        type: SecurityEventType.INVALID_INPUT,
        ip: clientIP,
        userAgent,
        path: request.nextUrl.pathname,
        details: { error: "Invalid JSON" },
      });
      return NextResponse.json(
        { error: "Неверный формат данных запроса" },
        { status: 400 }
      );
    }

    // Валидация и санитизация входных данных
    const validation = validateAndSanitize(registerSchema, body);
    if (!validation.success) {
      logSecurityEvent({
        type: SecurityEventType.INVALID_INPUT,
        ip: clientIP,
        userAgent,
        path: request.nextUrl.pathname,
        details: { error: validation.error },
      });
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, name, referralCode } = validation.data;

    // Дополнительная санитизация
    const sanitizedName = name ? sanitizeString(name) : null;

    // Проверка реферального кода (обязателен для регистрации)
    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json(
        { error: "Реферальный код обязателен для регистрации" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const refCodeUpper = referralCode.trim().toUpperCase();

    try {
      // Ищем реферальный код в таблице
      const referralResult = await pool.query(
        `SELECT id, user_id, referred_user_id, max_uses 
         FROM referrals 
         WHERE ref_code = $1`,
        [refCodeUpper]
      );

      if (referralResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Реферальный код "${refCodeUpper}" не найден` },
          { status: 400 }
        );
      }

      const referral = referralResult.rows[0];

      // Проверяем количество использований
      const usesCountResult = await pool.query(
        `SELECT COUNT(*) as count 
         FROM referral_uses 
         WHERE referral_id = $1`,
        [referral.id]
      );

      const usesCount = parseInt(usesCountResult.rows[0].count || "0", 10);
      const maxUses = referral.max_uses
        ? parseInt(referral.max_uses, 10)
        : null;

      // Проверяем, не превышен ли лимит использований
      if (maxUses !== null && usesCount >= maxUses) {
        return NextResponse.json(
          {
            error: `Реферальный код "${refCodeUpper}" достиг максимального количества использований (${maxUses})`,
          },
          { status: 400 }
        );
      }

      console.log(
        `✅ Реферальный код ${refCodeUpper} найден и валиден (использований: ${usesCount}${
          maxUses ? `/${maxUses}` : "/∞"
        })`
      );
    } catch (refError) {
      console.error("❌ Ошибка при проверке реферального кода:", refError);
      return NextResponse.json(
        { error: "Ошибка при проверке реферального кода. Попробуйте позже." },
        { status: 500 }
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
        name: sanitizedName,
      })
      .returning();

    console.log(`✅ Пользователь успешно создан: ${newUser.email}`);

    // Обработка реферального кода
    if (referralCode && referralCode.trim()) {
      try {
        const pool = getPool();
        const refCodeUpper = referralCode.trim().toUpperCase();

        // Ищем реферальный код
        const referralResult = await pool.query(
          `SELECT id, user_id, referred_user_id, max_uses 
           FROM referrals 
           WHERE ref_code = $1`,
          [refCodeUpper]
        );

        if (referralResult.rows.length > 0) {
          const referral = referralResult.rows[0];

          // Проверяем количество использований перед добавлением нового
          const usesCountResult = await pool.query(
            `SELECT COUNT(*) as count 
             FROM referral_uses 
             WHERE referral_id = $1`,
            [referral.id]
          );

          const currentUses = parseInt(
            usesCountResult.rows[0].count || "0",
            10
          );
          const maxUses = referral.max_uses
            ? parseInt(referral.max_uses, 10)
            : null;

          // Проверяем лимит использований
          if (maxUses !== null && currentUses >= maxUses) {
            console.log(
              `⚠️ Реферальный код ${refCodeUpper} достиг лимита использований`
            );
          } else {
            // Добавляем запись об использовании в таблицу referral_uses
            const { createId } = await import("@paralleldrive/cuid2");
            const useId = createId();

            await pool.query(
              `INSERT INTO referral_uses (id, referral_id, user_id)
               VALUES ($1, $2, $3)`,
              [useId, referral.id, newUser.id]
            );

            // Для обратной совместимости обновляем referred_user_id, если он еще не установлен
            if (!referral.referred_user_id) {
              await pool.query(
                `UPDATE referrals 
                 SET referred_user_id = $1, date = NOW() 
                 WHERE id = $2`,
                [newUser.id, referral.id]
              );
            }

            console.log(
              `✅ Реферальный код ${refCodeUpper} применен для пользователя ${
                newUser.id
              } (использований: ${currentUses + 1}${
                maxUses ? `/${maxUses}` : "/∞"
              })`
            );
          }
        } else {
          console.log(`⚠️ Реферальный код ${refCodeUpper} не найден`);
        }
      } catch (refError) {
        // Логируем ошибку, но не прерываем регистрацию
        console.error("❌ Ошибка при обработке реферального кода:", refError);
      }
    }

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

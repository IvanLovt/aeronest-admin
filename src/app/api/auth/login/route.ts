import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import { getPool } from "@/db";
import bcrypt from "bcryptjs";
import { loginSchema, validateAndSanitize } from "@/lib/security/validation";
import { getClientIP } from "@/lib/security/rateLimit";
import {
  checkBruteForce,
  recordFailedAttempt,
  recordSuccess,
} from "@/lib/security/bruteForce";
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

    // Валидация входных данных
    const validation = validateAndSanitize(loginSchema, body);
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

    const { email, password } = validation.data;

    // Проверка защиты от brute force
    const bruteForceCheck = checkBruteForce(clientIP);
    if (!bruteForceCheck.allowed) {
      logSecurityEvent({
        type: SecurityEventType.BRUTE_FORCE,
        ip: clientIP,
        userAgent,
        path: request.nextUrl.pathname,
        details: {
          email,
          blockedUntil: bruteForceCheck.blockedUntil,
        },
      });

      const waitTime = bruteForceCheck.blockedUntil
        ? Math.ceil((bruteForceCheck.blockedUntil - Date.now()) / 1000 / 60)
        : 0;

      return NextResponse.json(
        {
          error: `Слишком много неудачных попыток. Попробуйте через ${waitTime} минут.`,
        },
        { status: 429 }
      );
    }

    // Проверка пользователя в базе данных
    const pool = getPool();
    const queryResult = await pool.query(
      `SELECT id, email, name, password_hash, image 
       FROM users 
       WHERE email = $1 
       LIMIT 1`,
      [email]
    );

    const userRow = queryResult.rows[0];

    if (!userRow || !userRow.password_hash) {
      // Записываем неудачную попытку
      recordFailedAttempt(clientIP);
      logSecurityEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        ip: clientIP,
        userAgent,
        path: request.nextUrl.pathname,
        details: { email, reason: "User not found" },
      });

      // Не раскрываем, существует ли пользователь
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);

    if (!isPasswordValid) {
      // Записываем неудачную попытку
      recordFailedAttempt(clientIP);
      logSecurityEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        ip: clientIP,
        userAgent,
        path: request.nextUrl.pathname,
        details: { email, reason: "Invalid password" },
      });

      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Успешная авторизация
    recordSuccess(clientIP);

    // Используем NextAuth для создания сессии
    // В Next.js 13+ App Router используем серверный signIn
    return NextResponse.json({
      success: true,
      message: "Авторизация успешна",
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ip: clientIP,
      userAgent,
      path: request.nextUrl.pathname,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    });

    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 }
    );
  }
}


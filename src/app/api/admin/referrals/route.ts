import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";

// GET - получение всех реферальных кодов
export async function GET() {
  try {
    // Получаем сессию пользователя
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь - админ
    if (session.user.email !== "admin@example.com") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const pool = getPool();

    // Получаем все реферальные коды с информацией о пользователях и количеством использований
    const result = await pool.query(
      `SELECT 
        r.id,
        r.ref_code,
        r.user_id,
        r.referred_user_id,
        r.date,
        r.conditions,
        r.max_uses,
        r.created_at,
        r.updated_at,
        u1.email as owner_email,
        u1.name as owner_name,
        u2.email as referred_email,
        u2.name as referred_name,
        COUNT(ru.id) as uses_count
      FROM referrals r
      LEFT JOIN users u1 ON r.user_id = u1.id
      LEFT JOIN users u2 ON r.referred_user_id = u2.id
      LEFT JOIN referral_uses ru ON r.id = ru.referral_id
      GROUP BY r.id, r.ref_code, r.user_id, r.referred_user_id, r.date, r.conditions, r.max_uses, r.created_at, r.updated_at, u1.email, u1.name, u2.email, u2.name
      ORDER BY r.created_at DESC`,
      []
    );

    const referrals = result.rows.map((row) => ({
      id: row.id,
      refCode: row.ref_code,
      userId: row.user_id,
      referredUserId: row.referred_user_id,
      date: row.date,
      conditions: row.conditions,
      maxUses: row.max_uses,
      usesCount: parseInt(row.uses_count || "0", 10),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ownerEmail: row.owner_email,
      ownerName: row.owner_name,
      referredEmail: row.referred_email,
      referredName: row.referred_name,
    }));

    return NextResponse.json({
      success: true,
      referrals,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении реферальных кодов:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - создание нового реферального кода
export async function POST(request: Request) {
  try {
    // Получаем сессию пользователя
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь - админ
    if (session.user.email !== "admin@example.com") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { refCode, userId, conditions, maxUses } = body;

    // Валидация
    if (!refCode || !userId) {
      return NextResponse.json(
        { success: false, error: "refCode и userId обязательны" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Проверяем, что пользователь существует
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверяем, что refCode уникален
    const codeCheck = await pool.query(
      `SELECT id FROM referrals WHERE ref_code = $1`,
      [refCode]
    );

    if (codeCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Реферальный код уже существует" },
        { status: 400 }
      );
    }

    // Создаем новый реферальный код
    const { createId } = await import("@paralleldrive/cuid2");
    const referralId = createId();

    // Валидация maxUses
    let maxUsesValue = null;
    if (maxUses !== undefined && maxUses !== null && maxUses !== "") {
      const maxUsesNum = parseInt(maxUses, 10);
      if (isNaN(maxUsesNum) || maxUsesNum < 1) {
        return NextResponse.json(
          { success: false, error: "maxUses должно быть положительным числом" },
          { status: 400 }
        );
      }
      maxUsesValue = maxUsesNum.toString();
    }

    await pool.query(
      `INSERT INTO referrals (id, ref_code, user_id, conditions, max_uses)
       VALUES ($1, $2, $3, $4, $5)`,
      [referralId, refCode, userId, conditions || null, maxUsesValue]
    );

    // Получаем созданную запись с информацией о пользователе
    const newReferral = await pool.query(
      `SELECT 
        r.id,
        r.ref_code,
        r.user_id,
        r.referred_user_id,
        r.date,
        r.conditions,
        r.max_uses,
        r.created_at,
        r.updated_at,
        u1.email as owner_email,
        u1.name as owner_name,
        u2.email as referred_email,
        u2.name as referred_name,
        COUNT(ru.id) as uses_count
      FROM referrals r
      LEFT JOIN users u1 ON r.user_id = u1.id
      LEFT JOIN users u2 ON r.referred_user_id = u2.id
      LEFT JOIN referral_uses ru ON r.id = ru.referral_id
      WHERE r.id = $1
      GROUP BY r.id, r.ref_code, r.user_id, r.referred_user_id, r.date, r.conditions, r.max_uses, r.created_at, r.updated_at, u1.email, u1.name, u2.email, u2.name`,
      [referralId]
    );

    const referral = {
      id: newReferral.rows[0].id,
      refCode: newReferral.rows[0].ref_code,
      userId: newReferral.rows[0].user_id,
      referredUserId: newReferral.rows[0].referred_user_id,
      date: newReferral.rows[0].date,
      conditions: newReferral.rows[0].conditions,
      maxUses: newReferral.rows[0].max_uses,
      usesCount: parseInt(newReferral.rows[0].uses_count || "0", 10),
      createdAt: newReferral.rows[0].created_at,
      updatedAt: newReferral.rows[0].updated_at,
      ownerEmail: newReferral.rows[0].owner_email,
      ownerName: newReferral.rows[0].owner_name,
      referredEmail: newReferral.rows[0].referred_email,
      referredName: newReferral.rows[0].referred_name,
    };

    return NextResponse.json({
      success: true,
      referral,
    });
  } catch (error) {
    console.error("❌ Ошибка при создании реферального кода:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


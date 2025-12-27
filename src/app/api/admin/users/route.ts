import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";

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

    // Получаем всех пользователей с их статистикой
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.balance,
        u.created_at,
        COUNT(o.id) as orders_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.email, u.name, u.balance, u.created_at
      ORDER BY u.created_at DESC`,
      []
    );

    const users = result.rows.map((row) => {
      // Рассчитываем уровень пользователя на основе количества заказов
      const ordersCount = parseInt(row.orders_count || "0", 10);
      const userLevel = 1 + Math.floor(ordersCount / 8);

      // Определяем роль на основе email (если админ) или уровня
      let role = "USER";
      if (row.email === "admin@example.com") {
        role = "ADMIN";
      } else if (userLevel >= 5) {
        role = "VIP";
      }

      return {
        id: row.id,
        email: row.email,
        name: row.name || row.email.split("@")[0],
        balance: parseFloat(row.balance || "0"),
        ordersCount,
        userLevel,
        role,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении пользователей:", error);
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


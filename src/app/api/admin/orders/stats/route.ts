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

    // Получаем количество заказов со статусом CONFIRMED
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM orders 
       WHERE status = 'CONFIRMED'`,
      []
    );

    const confirmedCount = parseInt(result.rows[0]?.count || "0", 10);

    return NextResponse.json({
      success: true,
      confirmedCount,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении статистики заказов:", error);
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

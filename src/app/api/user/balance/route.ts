import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";

export async function GET() {
  try {
    // Получаем сессию пользователя через NextAuth v5
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Получаем баланс из БД
    const pool = getPool();
    const result = await pool.query(
      `SELECT balance FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const balance = result.rows[0].balance || "0";

    return NextResponse.json({
      success: true,
      balance: balance,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении баланса:", error);
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

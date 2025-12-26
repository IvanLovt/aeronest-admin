import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";

export async function POST(request: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { amount } = body;

    // Валидация суммы
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Неверная сумма для списания" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Получаем текущий баланс
    const balanceResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(balanceResult.rows[0].balance || "0");

    // Проверяем достаточность средств
    if (currentBalance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Недостаточно средств",
          currentBalance,
          requiredAmount: amount,
        },
        { status: 400 }
      );
    }

    // Списание средств
    const newBalance = currentBalance - amount;
    await pool.query(
      `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2`,
      [newBalance.toString(), userId]
    );

    return NextResponse.json({
      success: true,
      newBalance: newBalance.toString(),
      deductedAmount: amount,
    });
  } catch (error) {
    console.error("❌ Ошибка при списании баланса:", error);
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

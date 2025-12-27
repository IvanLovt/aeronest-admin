import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";

// Валидные статусы заказа
const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_FLIGHT",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем параметры маршрута
    const { id: orderId } = await params;

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

    // Получаем данные из тела запроса
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Статус не указан" },
        { status: 400 }
      );
    }

    // Проверяем, что статус валидный
    const normalizedStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Неверный статус. Допустимые: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Проверяем, что заказ существует
    const checkResult = await pool.query(
      `SELECT id, status FROM orders WHERE id = $1`,
      [orderId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Заказ не найден" },
        { status: 404 }
      );
    }

    // Обновляем статус заказа
    const updateResult = await pool.query(
      `UPDATE orders 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, status, amount, created_at`,
      [normalizedStatus, orderId]
    );

    console.log(
      `✅ Статус заказа ${orderId} изменен на ${normalizedStatus}`
    );

    return NextResponse.json({
      success: true,
      order: {
        id: updateResult.rows[0].id,
        status: updateResult.rows[0].status,
        amount: parseFloat(updateResult.rows[0].amount),
        createdAt: updateResult.rows[0].created_at,
      },
      message: "Статус заказа успешно обновлен",
    });
  } catch (error) {
    console.error("❌ Ошибка при обновлении статуса заказа:", error);
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


import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем параметры маршрута
    const { id: addressId } = await params;

    console.log("🗑️ Попытка удаления адреса:", addressId);

    // Получаем сессию пользователя
    const session = await auth();

    if (!session?.user?.id) {
      console.log("❌ Пользователь не авторизован");
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("👤 ID пользователя:", userId);

    const pool = getPool();

    // Проверяем, что адрес принадлежит пользователю
    const checkResult = await pool.query(
      `SELECT id FROM delivery_addresses 
       WHERE id = $1 AND user_id = $2`,
      [addressId, userId]
    );

    console.log(
      "🔍 Результат проверки адреса:",
      checkResult.rows.length > 0 ? "найден" : "не найден"
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Адрес не найден или не принадлежит вам" },
        { status: 404 }
      );
    }

    // Проверяем, есть ли активные заказы (не DELIVERED), использующие этот адрес
    const activeOrdersCheck = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE address_id = $1 AND status != 'DELIVERED'`,
      [addressId]
    );

    const activeOrdersCount = parseInt(
      activeOrdersCheck.rows[0]?.count || "0",
      10
    );
    console.log(
      "📦 Количество активных заказов с этим адресом:",
      activeOrdersCount
    );

    if (activeOrdersCount > 0) {
      // Получаем общее количество заказов для информативного сообщения
      const allOrdersCheck = await pool.query(
        `SELECT COUNT(*) as count FROM orders 
         WHERE address_id = $1`,
        [addressId]
      );
      const allOrdersCount = parseInt(allOrdersCheck.rows[0]?.count || "0", 10);

      return NextResponse.json(
        {
          success: false,
          error: `Невозможно удалить адрес: он используется в ${activeOrdersCount} активн${
            activeOrdersCount === 1
              ? "ом заказе"
              : activeOrdersCount < 5
              ? "ых заказах"
              : "ых заказах"
          } (всего заказов: ${allOrdersCount}). Дождитесь завершения заказа и попробуйте снова.`,
        },
        { status: 400 }
      );
    }

    // Удаляем адрес
    // Благодаря миграции, ограничение внешнего ключа теперь использует ON DELETE SET NULL,
    // поэтому доставленные заказы автоматически получат address_id = NULL при удалении адреса
    // Активные заказы уже проверены выше и блокируют удаление
    const deleteResult = await pool.query(
      `DELETE FROM delivery_addresses 
       WHERE id = $1 AND user_id = $2`,
      [addressId, userId]
    );

    console.log("✅ Адрес удален. Затронуто строк:", deleteResult.rowCount);

    return NextResponse.json({
      success: true,
      message: "Адрес успешно удален",
    });
  } catch (error) {
    console.error("❌ Ошибка при удалении адреса:", error);
    console.error(
      "Детали ошибки:",
      error instanceof Error ? error.stack : error
    );
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

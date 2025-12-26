import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/db";
import { createId } from "@paralleldrive/cuid2";

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
    const { address, items, amount } = body;

    // Валидация
    if (!address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Неверные данные заказа" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Неверная сумма заказа" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Создаем или находим адрес доставки
    // Сначала проверяем, есть ли уже такой адрес у пользователя
    const addressResult = await pool.query(
      `SELECT id FROM delivery_addresses 
       WHERE user_id = $1 AND street = $2 
       LIMIT 1`,
      [userId, address]
    );

    let addressId: string;

    if (addressResult.rows.length > 0) {
      // Используем существующий адрес
      addressId = addressResult.rows[0].id;
    } else {
      // Создаем новый адрес доставки
      addressId = createId();
      await pool.query(
        `INSERT INTO delivery_addresses 
         (id, user_id, title, street, is_default, coords) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          addressId,
          userId,
          "Адрес доставки",
          address,
          false,
          "[]", // Пустые координаты, можно будет обновить позже
        ]
      );
    }

    // Создаем заказ
    const orderId = createId();
    const orderItems = JSON.stringify(items);

    await pool.query(
      `INSERT INTO orders 
       (id, user_id, address_id, amount, status, items) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        orderId,
        userId,
        addressId,
        amount.toString(),
        "CONFIRMED", // Статус "в сборке" после оплаты
        orderItems,
      ]
    );

    return NextResponse.json({
      success: true,
      orderId,
      message: "Заказ успешно создан",
    });
  } catch (error) {
    console.error("❌ Ошибка при создании заказа:", error);
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

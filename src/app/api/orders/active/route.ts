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

    const userId = session.user.id;
    const pool = getPool();

    // Получаем активный заказ пользователя (статус не DELIVERED и не CANCELLED)
    const result = await pool.query(
      `SELECT 
        o.id,
        o.amount,
        o.status,
        o.items,
        o.created_at,
        da.street as address
      FROM orders o
      LEFT JOIN delivery_addresses da ON o.address_id = da.id
      WHERE o.user_id = $1 
        AND o.status NOT IN ('DELIVERED', 'CANCELLED')
      ORDER BY o.created_at DESC
      LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        order: null,
      });
    }

    const order = {
      id: result.rows[0].id,
      amount: parseFloat(result.rows[0].amount),
      status: result.rows[0].status,
      items:
        typeof result.rows[0].items === "string"
          ? JSON.parse(result.rows[0].items)
          : result.rows[0].items,
      createdAt: result.rows[0].created_at,
      address: result.rows[0].address || "Адрес не указан",
    };

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении активного заказа:", error);
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

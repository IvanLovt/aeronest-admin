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

    // Получаем заказы пользователя с информацией об адресе
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
      ORDER BY o.created_at DESC
      LIMIT 50`,
      [userId]
    );

    const orders = result.rows.map((row) => ({
      id: row.id,
      amount: parseFloat(row.amount),
      status: row.status,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
      createdAt: row.created_at,
      address: row.address || "Адрес не указан",
    }));

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении заказов:", error);
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


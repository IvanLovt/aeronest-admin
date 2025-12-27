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

    // Получаем последние 10 заказов с информацией о пользователе и адресе
    const result = await pool.query(
      `SELECT 
        o.id,
        o.amount,
        o.status,
        o.items,
        o.created_at,
        u.email as user_email,
        u.name as user_name,
        da.street,
        da.building,
        da.entrance,
        da.floor,
        da.apartment,
        da.title as address_title
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN delivery_addresses da ON o.address_id = da.id
      ORDER BY o.created_at DESC
      LIMIT 10`,
      []
    );

    const orders = result.rows.map((row) => {
      // Формируем адрес
      const addressParts = [row.street];
      if (row.building) addressParts.push(`д. ${row.building}`);
      if (row.entrance) addressParts.push(`подъезд ${row.entrance}`);
      if (row.floor) addressParts.push(`эт. ${row.floor}`);
      if (row.apartment) addressParts.push(`кв. ${row.apartment}`);
      const fullAddress = addressParts.join(", ") || "Адрес не указан";

      // Форматируем дату
      const createdAt = new Date(row.created_at);
      const time = createdAt.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: row.id,
        amount: parseFloat(row.amount),
        status: row.status,
        items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
        createdAt: row.created_at,
        user: row.user_name || row.user_email || "Неизвестный пользователь",
        userEmail: row.user_email,
        address: fullAddress,
        addressTitle: row.address_title || "Адрес",
        time,
      };
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении последних заказов:", error);
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


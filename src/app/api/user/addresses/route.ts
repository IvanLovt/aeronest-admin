import { NextResponse, NextRequest } from "next/server";
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

    const {
      title,
      street,
      building,
      entrance,
      floor,
      apartment,
      comment,
      coords,
      isDefault,
    } = body;

    // Валидация обязательных полей
    if (!title || !street) {
      return NextResponse.json(
        {
          success: false,
          error: "Название и улица обязательны для заполнения",
        },
        { status: 400 }
      );
    }

    // Валидация координат (должны быть массивом [lat, lng] или строкой JSON)
    let coordsValue = coords;
    if (coords && typeof coords === "object" && Array.isArray(coords)) {
      coordsValue = JSON.stringify(coords);
    } else if (!coords) {
      // Если координаты не указаны, используем дефолтные (можно будет улучшить с геокодингом)
      coordsValue = JSON.stringify([0, 0]);
    }

    const pool = getPool();

    // Если новый адрес помечен как адрес по умолчанию, снимаем флаг с других адресов
    if (isDefault) {
      await pool.query(
        `UPDATE delivery_addresses 
         SET is_default = false 
         WHERE user_id = $1`,
        [userId]
      );
    }

    // Генерируем ID для нового адреса
    const addressId = createId();

    // Создаем новый адрес
    const result = await pool.query(
      `INSERT INTO delivery_addresses 
       (id, user_id, title, street, building, entrance, floor, apartment, comment, coords, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, street, building, entrance, floor, apartment, comment, coords, is_default, created_at`,
      [
        addressId,
        userId,
        title,
        street,
        building || null,
        entrance || null,
        floor || null,
        apartment || null,
        comment || null,
        coordsValue,
        isDefault || false,
      ]
    );

    const newAddress = result.rows[0];

    return NextResponse.json({
      success: true,
      address: {
        id: newAddress.id,
        title: newAddress.title,
        street: newAddress.street,
        building: newAddress.building || null,
        entrance: newAddress.entrance || null,
        floor: newAddress.floor || null,
        apartment: newAddress.apartment || null,
        comment: newAddress.comment || null,
        coords:
          typeof newAddress.coords === "string"
            ? JSON.parse(newAddress.coords)
            : newAddress.coords,
        isDefault: newAddress.is_default,
        createdAt: newAddress.created_at,
      },
      message: "Адрес успешно добавлен",
    });
  } catch (error) {
    console.error("❌ Ошибка при создании адреса:", error);
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

    // Получаем адреса пользователя
    const result = await pool.query(
      `SELECT 
        id,
        title,
        street,
        building,
        entrance,
        floor,
        apartment,
        comment,
        coords,
        is_default,
        created_at
      FROM delivery_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    const addresses = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      street: row.street,
      building: row.building || null,
      entrance: row.entrance || null,
      floor: row.floor || null,
      apartment: row.apartment || null,
      comment: row.comment || null,
      coords:
        typeof row.coords === "string" ? JSON.parse(row.coords) : row.coords,
      isDefault: row.is_default,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении адресов:", error);
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

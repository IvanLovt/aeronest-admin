import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const catalogId = searchParams.get("catalogId");

    if (!catalogId) {
      return NextResponse.json(
        { success: false, error: "catalogId обязателен" },
        { status: 400 }
      );
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT id, name, price, ves, date, created_at, updated_at 
       FROM items 
       WHERE catalog_id = $1 
       ORDER BY name`,
      [catalogId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Ошибка при получении товаров:", error);
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


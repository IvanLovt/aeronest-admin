import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

interface PartnerRow {
  id: string;
  name: string;
  image: string;
  cooperation_date: Date | string;
  description: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  return url;
}

export async function GET() {
  try {
    // Используем прямой вызов Neon без drizzle для обхода проблемы с форматом запросов
    const databaseUrl = getDatabaseUrl();
    const sql = neon(databaseUrl);

    // Выполняем прямой SQL запрос через Neon (без drizzle)
    const partnersList = await sql`
      SELECT id, name, image, cooperation_date, description, created_at, updated_at 
      FROM partners 
      ORDER BY cooperation_date DESC
    `;

    // Преобразуем результат в нужный формат
    const formattedPartners = (partnersList as unknown as PartnerRow[]).map(
      (row) => ({
        id: row.id,
        name: row.name,
        image: row.image,
        cooperationDate: row.cooperation_date,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );

    console.log("Загружено партнеров:", formattedPartners.length);

    return NextResponse.json({
      success: true,
      partners: formattedPartners,
    });
  } catch (error) {
    console.error("Ошибка при получении партнеров:", error);
    if (error instanceof Error) {
      console.error("Детали ошибки:", error.message);
      console.error("Stack:", error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        error: "Не удалось загрузить партнеров",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

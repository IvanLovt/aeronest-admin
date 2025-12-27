import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: userId } = await params;

    // Проверяем, что пользователь не удаляет сам себя
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Нельзя удалить самого себя" },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь не админ
    const userToDelete = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    if (userToDelete[0].email === "admin@example.com") {
      return NextResponse.json(
        { success: false, error: "Нельзя удалить администратора" },
        { status: 400 }
      );
    }

    // Удаляем пользователя (каскадное удаление обработается автоматически)
    await db.delete(users).where(eq(users.id, userId));

    console.log(`✅ Пользователь ${userId} успешно удален`);

    return NextResponse.json({
      success: true,
      message: "Пользователь успешно удален",
    });
  } catch (error) {
    console.error("❌ Ошибка при удалении пользователя:", error);
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


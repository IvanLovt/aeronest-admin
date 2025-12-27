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

    // 1. Активные заказы (CONFIRMED или IN_FLIGHT)
    const activeOrdersResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE status IN ('CONFIRMED', 'IN_FLIGHT')`,
      []
    );
    const activeOrders = parseInt(activeOrdersResult.rows[0]?.count || "0", 10);

    // 2. Активные пользователи (создали заказы за последние 7 дней)
    const activeUsersResult = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '7 days'`,
      []
    );
    const activeUsers = parseInt(activeUsersResult.rows[0]?.count || "0", 10);

    // 3. Процент успешных доставок
    const deliveryStatsResult = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'DELIVERED') as delivered,
         COUNT(*) FILTER (WHERE status IN ('DELIVERED', 'CANCELLED')) as total
       FROM orders
       WHERE status IN ('DELIVERED', 'CANCELLED')`,
      []
    );
    const delivered = parseInt(
      deliveryStatsResult.rows[0]?.delivered || "0",
      10
    );
    const totalCompleted = parseInt(
      deliveryStatsResult.rows[0]?.total || "0",
      10
    );
    const successRate =
      totalCompleted > 0 ? ((delivered / totalCompleted) * 100).toFixed(1) : "0";

    // 4. Выручка за последние 24 часа
    const revenue24hResult = await pool.query(
      `SELECT COALESCE(SUM(amount::numeric), 0) as total
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '24 hours'`,
      []
    );
    const revenue24h = parseFloat(
      revenue24hResult.rows[0]?.total || "0"
    );

    // 5. Выручка за предыдущие 24 часа (для сравнения)
    const revenuePrev24hResult = await pool.query(
      `SELECT COALESCE(SUM(amount::numeric), 0) as total
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '48 hours'
         AND created_at < NOW() - INTERVAL '24 hours'`,
      []
    );
    const revenuePrev24h = parseFloat(
      revenuePrev24hResult.rows[0]?.total || "0"
    );

    // Рассчитываем процент изменения выручки
    const revenueChangeValue =
      revenuePrev24h > 0
        ? ((revenue24h - revenuePrev24h) / revenuePrev24h) * 100
        : 0;
    const revenueChange = revenueChangeValue.toFixed(0);

    // 6. Активные заказы за последние 10 минут (для тренда)
    const recentActiveOrdersResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE status IN ('CONFIRMED', 'IN_FLIGHT')
         AND created_at >= NOW() - INTERVAL '10 minutes'`,
      []
    );
    const recentActiveOrders = parseInt(
      recentActiveOrdersResult.rows[0]?.count || "0",
      10
    );

    // 7. Новые пользователи сегодня
    const newUsersTodayResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM users
       WHERE created_at >= CURRENT_DATE`,
      []
    );
    const newUsersToday = parseInt(
      newUsersTodayResult.rows[0]?.count || "0",
      10
    );

    // 8. Всего доставок
    const totalDeliveredResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE status = 'DELIVERED'`,
      []
    );
    const totalDelivered = parseInt(
      totalDeliveredResult.rows[0]?.count || "0",
      10
    );

    return NextResponse.json({
      success: true,
      stats: {
        activeOrders,
        activeUsers,
        successRate: `${successRate}%`,
        revenue24h,
        revenueChange: revenueChange !== "0" ? `${revenueChangeValue > 0 ? "+" : ""}${revenueChange}% к вчера` : "Нет данных",
        recentActiveOrders: recentActiveOrders > 0 ? `+${recentActiveOrders} за 10 мин` : "Без изменений",
        newUsersToday: newUsersToday > 0 ? `+${newUsersToday} сегодня` : "0 сегодня",
        totalDelivered: `${totalDelivered.toLocaleString("ru-RU")} всего`,
      },
    });
  } catch (error) {
    console.error("❌ Ошибка при получении статистики:", error);
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


// Простой in-memory rate limiter
// В продакшене рекомендуется использовать Redis или другой внешний сервис

import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Время окна в миллисекундах
  maxRequests: number; // Максимальное количество запросов
  message?: string; // Сообщение об ошибке
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const { windowMs, maxRequests } = options;
  const now = Date.now();
  const key = identifier;

  // Получаем или создаем запись
  let record = store[key];

  // Если записи нет или время истекло, создаем новую
  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + windowMs,
    };
    store[key] = record;
  }

  // Увеличиваем счетчик
  record.count++;

  const remaining = Math.max(0, maxRequests - record.count);
  const allowed = record.count <= maxRequests;

  return {
    allowed,
    remaining,
    resetTime: record.resetTime,
  };
}

// Получить IP адрес из запроса
export function getClientIP(request: NextRequest): string {
  // Проверяем заголовки прокси
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback на connection remoteAddress (не работает в serverless)
  return "unknown";
}

// Предустановленные конфигурации
export const rateLimitConfigs = {
  // Строгий лимит для авторизации (5 попыток в 15 минут)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 минут
    maxRequests: 5,
    message: "Слишком много попыток. Попробуйте позже.",
  },
  // Лимит для регистрации (3 попытки в час)
  registration: {
    windowMs: 60 * 60 * 1000, // 1 час
    maxRequests: 3,
    message: "Слишком много попыток регистрации. Попробуйте позже.",
  },
  // Общий лимит для API (100 запросов в минуту)
  api: {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 100,
    message: "Слишком много запросов. Попробуйте позже.",
  },
  // Лимит для админ-панели (200 запросов в минуту)
  admin: {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 200,
    message: "Превышен лимит запросов.",
  },
};


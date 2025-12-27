import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders } from "@/lib/security/headers";
import { rateLimit, getClientIP, rateLimitConfigs } from "@/lib/security/rateLimit";

export function middleware(request: NextRequest) {
  // Применяем безопасные заголовки
  let response = securityHeaders(request);

  // Rate limiting для API routes
  const pathname = request.nextUrl.pathname;

  // Определяем конфигурацию rate limit в зависимости от пути
  let config = rateLimitConfigs.api;

  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
    config = pathname.includes("register")
      ? rateLimitConfigs.registration
      : rateLimitConfigs.auth;
  } else if (pathname.startsWith("/api/admin")) {
    config = rateLimitConfigs.admin;
  }

  // Получаем идентификатор клиента
  const clientIP = getClientIP(request);
  const identifier = `${clientIP}:${pathname}`;

  // Проверяем rate limit
  const limitResult = rateLimit(identifier, config);

  if (!limitResult.allowed) {
    // Логируем превышение лимита
    console.warn(`⚠️ Rate limit exceeded: ${clientIP} on ${pathname}`);

    return NextResponse.json(
      {
        error: config.message || "Слишком много запросов",
        retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limitResult.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": String(limitResult.remaining),
          "X-RateLimit-Reset": String(limitResult.resetTime),
        },
      }
    );
  }

  // Добавляем заголовки rate limit в ответ
  response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(limitResult.remaining));
  response.headers.set("X-RateLimit-Reset", String(limitResult.resetTime));

  return response;
}

// Применяем middleware только к API routes
export const config = {
  matcher: [
    "/api/:path*",
    // Можно добавить другие пути, если нужно
  ],
};


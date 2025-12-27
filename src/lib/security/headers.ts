import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Безопасные заголовки HTTP для защиты от различных атак
export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // X-Content-Type-Options - предотвращает MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-Frame-Options - защита от clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // X-XSS-Protection - защита от XSS (для старых браузеров)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy - контроль передачи referrer
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy - контроль доступа к API браузера
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()"
  );

  // Strict-Transport-Security (HSTS) - только для HTTPS
  if (request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}


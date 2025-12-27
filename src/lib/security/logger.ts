// Логирование подозрительной активности для мониторинга безопасности

export enum SecurityEventType {
  BRUTE_FORCE = "BRUTE_FORCE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_INPUT = "INVALID_INPUT",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  ip: string;
  userAgent?: string;
  path?: string;
  details?: Record<string, unknown>;
}

// In-memory хранилище для логов (в продакшене использовать внешний сервис)
const securityLogs: SecurityEvent[] = [];
const MAX_LOGS = 1000; // Максимальное количество логов в памяти

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
  };

  securityLogs.push(fullEvent);

  // Ограничиваем размер массива
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.shift();
  }

  // В продакшене здесь должна быть отправка в внешний сервис мониторинга
  console.warn("🔒 Security Event:", {
    type: fullEvent.type,
    ip: fullEvent.ip,
    path: fullEvent.path,
    details: fullEvent.details,
  });
}

// Получить последние логи
export function getRecentLogs(limit: number = 100): SecurityEvent[] {
  return securityLogs.slice(-limit).reverse();
}

// Получить логи по типу
export function getLogsByType(type: SecurityEventType): SecurityEvent[] {
  return securityLogs.filter((log) => log.type === type).reverse();
}

// Очистить логи
export function clearLogs(): void {
  securityLogs.length = 0;
}


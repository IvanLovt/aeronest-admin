// Защита от brute force атак
// Отслеживает неудачные попытки входа

interface FailedAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil: number;
}

const failedAttempts: Map<string, FailedAttempt> = new Map();

// Очистка старых записей каждые 10 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of failedAttempts.entries()) {
    if (attempt.blockedUntil < now && attempt.count === 0) {
      failedAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface BruteForceOptions {
  maxAttempts: number; // Максимальное количество попыток
  windowMs: number; // Время окна в миллисекундах
  blockDurationMs: number; // Время блокировки в миллисекундах
}

const defaultOptions: BruteForceOptions = {
  maxAttempts: 50,
  windowMs: 15 * 60 * 1000, // 15 минут
  blockDurationMs: 30 * 60 * 1000, // 30 минут блокировки
};

export function checkBruteForce(
  identifier: string,
  options: BruteForceOptions = defaultOptions
): { allowed: boolean; remainingAttempts: number; blockedUntil?: number } {
  const now = Date.now();
  const attempt = failedAttempts.get(identifier);

  // Если нет записей, разрешаем
  if (!attempt) {
    return {
      allowed: true,
      remainingAttempts: options.maxAttempts,
    };
  }

  // Проверяем, не заблокирован ли пользователь
  if (attempt.blockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: attempt.blockedUntil,
    };
  }

  // Если время окна истекло, сбрасываем счетчик
  if (now - attempt.lastAttempt > options.windowMs) {
    failedAttempts.delete(identifier);
    return {
      allowed: true,
      remainingAttempts: options.maxAttempts,
    };
  }

  const remainingAttempts = Math.max(0, options.maxAttempts - attempt.count);

  return {
    allowed: attempt.count < options.maxAttempts,
    remainingAttempts,
  };
}

export function recordFailedAttempt(
  identifier: string,
  options: BruteForceOptions = defaultOptions
): void {
  const now = Date.now();
  const attempt = failedAttempts.get(identifier);

  if (!attempt) {
    failedAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
      blockedUntil: 0,
    });
    return;
  }

  // Если время окна истекло, сбрасываем
  if (now - attempt.lastAttempt > options.windowMs) {
    attempt.count = 1;
    attempt.lastAttempt = now;
    attempt.blockedUntil = 0;
  } else {
    attempt.count++;
    attempt.lastAttempt = now;

    // Если превышен лимит, блокируем
    if (attempt.count >= options.maxAttempts) {
      attempt.blockedUntil = now + options.blockDurationMs;
    }
  }

  failedAttempts.set(identifier, attempt);
}

export function recordSuccess(identifier: string): void {
  // При успешной попытке сбрасываем счетчик
  failedAttempts.delete(identifier);
}

// Получить информацию о блокировке
export function getBlockInfo(identifier: string): {
  isBlocked: boolean;
  blockedUntil?: number;
  attempts: number;
} {
  const attempt = failedAttempts.get(identifier);
  if (!attempt) {
    return { isBlocked: false, attempts: 0 };
  }

  const now = Date.now();
  return {
    isBlocked: attempt.blockedUntil > now,
    blockedUntil: attempt.blockedUntil > now ? attempt.blockedUntil : undefined,
    attempts: attempt.count,
  };
}

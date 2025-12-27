import { z } from "zod";

// Схемы валидации для различных входных данных

// Валидация email
export const emailSchema = z
  .string()
  .email("Неверный формат email")
  .min(5, "Email слишком короткий")
  .max(255, "Email слишком длинный")
  .toLowerCase()
  .trim();

// Валидация пароля
export const passwordSchema = z
  .string()
  .min(6, "Пароль должен содержать минимум 6 символов")
  .max(128, "Пароль слишком длинный")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру"
  );

// Валидация имени
export const nameSchema = z
  .string()
  .min(2, "Имя должно содержать минимум 2 символа")
  .max(100, "Имя слишком длинное")
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, "Имя может содержать только буквы, пробелы и дефисы")
  .trim();

// Валидация реферального кода
export const referralCodeSchema = z
  .string()
  .min(3, "Реферальный код слишком короткий")
  .max(50, "Реферальный код слишком длинный")
  .regex(/^[A-Z0-9]+$/, "Реферальный код может содержать только заглавные буквы и цифры")
  .toUpperCase()
  .trim();

// Схема для регистрации
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional(),
  referralCode: referralCodeSchema,
});

// Схема для входа
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Пароль обязателен"),
});

// Валидация ID (cuid2 формат)
export const idSchema = z
  .string()
  .min(20, "Неверный формат ID")
  .max(30, "Неверный формат ID")
  .regex(/^[a-z0-9]+$/, "ID может содержать только строчные буквы и цифры");

// Валидация суммы (для заказов)
export const amountSchema = z
  .number()
  .positive("Сумма должна быть положительной")
  .max(1000000, "Сумма слишком большая");

// Валидация адреса
export const addressSchema = z.object({
  title: z.string().min(1, "Название адреса обязательно").max(100),
  street: z.string().min(5, "Улица должна содержать минимум 5 символов").max(200),
  building: z.string().max(20).optional(),
  entrance: z.string().max(10).optional(),
  floor: z.string().max(10).optional(),
  apartment: z.string().max(20).optional(),
  comment: z.string().max(500).optional(),
  coords: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, "Неверный формат координат"),
});

// Функция для санитизации строк (защита от XSS)
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Удаляем угловые скобки
    .replace(/javascript:/gi, "") // Удаляем javascript: протокол
    .replace(/on\w+=/gi, "") // Удаляем обработчики событий
    .trim();
}

// Функция для валидации и санитизации
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Ошибка валидации",
      };
    }
    return { success: false, error: "Неизвестная ошибка валидации" };
  }
}


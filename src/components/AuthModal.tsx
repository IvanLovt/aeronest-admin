"use client";

import { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Очищаем ошибку при изменении режима
  useEffect(() => {
    setError("");
  }, [mode]);

  // Очищаем ошибку при открытии/закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        // Регистрация
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        // Проверяем, что ответ содержит данные
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            text || `Ошибка сервера: ${response.status} ${response.statusText}`
          );
        }

        let data;
        try {
          const responseText = await response.text();
          if (!responseText) {
            throw new Error("Пустой ответ от сервера");
          }
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Ошибка парсинга ответа: ${response.status} ${response.statusText}`
          );
        }

        if (!response.ok) {
          throw new Error(data.error || "Ошибка при регистрации");
        }

        // После регистрации автоматически входим
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(
            "Ошибка при входе после регистрации. Попробуйте войти вручную."
          );
        }

        // Успешная регистрация и вход
        onClose();
        await router.refresh();

        // Небольшая задержка для обновления сессии
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Проверяем, является ли пользователь админом
        if (email === "admin@example.com") {
          console.log(
            "🔐 Админ обнаружен после регистрации, редирект на /admin"
          );
          window.location.href = "/admin";
        } else if (onSuccess) {
          setTimeout(() => onSuccess(), 100);
        }
      } else {
        // Вход
        console.log("🔐 Попытка входа:", email);

        try {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          console.log("📋 Результат входа:", JSON.stringify(result, null, 2));

          if (result?.error) {
            console.error("❌ Ошибка входа:", result.error);
            throw new Error("Неверный email или пароль");
          }

          if (!result || result.error) {
            console.error("❌ Вход не удался:", result);
            throw new Error("Ошибка при входе. Попробуйте еще раз.");
          }

          console.log("✅ Вход успешен, обновление сессии...");

          // Успешный вход
          onClose();

          // Обновляем сессию
          router.refresh();

          // Проверяем, является ли пользователь админом
          if (email === "admin@example.com") {
            console.log("🔐 Админ обнаружен, редирект на /admin");
            // Используем setTimeout для надежного редиректа
            setTimeout(() => {
              window.location.href = "/admin";
            }, 500);
          } else if (onSuccess) {
            setTimeout(() => onSuccess(), 100);
          }
        } catch (signInError) {
          console.error("❌ Ошибка при вызове signIn:", signInError);
          throw signInError;
        }
      }
    } catch (err: unknown) {
      // Обрабатываем различные типы ошибок
      let errorMessage = "Произошла ошибка";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = err as {
          response?: { data?: { error?: string } };
        };
        if (errorResponse.response?.data?.error) {
          errorMessage = errorResponse.response.data.error;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#0D1B2A]">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <div className="relative">
                <UserIcon
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent outline-none transition-all"
                  placeholder="Введите ваше имя"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent outline-none transition-all"
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>

          {error && (
            <div
              className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-in fade-in slide-in-from-top-2 duration-300"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Ошибка
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                  aria-label="Закрыть ошибку"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A84FF] text-white py-3 rounded-lg font-semibold hover:bg-[#0971d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Обработка...</span>
              </>
            ) : mode === "login" ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>
                Нет аккаунта?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-[#0A84FF] font-semibold hover:underline"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-[#0A84FF] font-semibold hover:underline"
                >
                  Войти
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    console.log("🔴 Страница ошибки NextAuth:", error);
  }, [error]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "Проблема с конфигурацией сервера. Обратитесь к администратору.";
      case "AccessDenied":
        return "Доступ запрещен.";
      case "Verification":
        return "Ошибка верификации. Ссылка истекла или недействительна.";
      case "CredentialsSignin":
        return "Неверный email или пароль.";
      default:
        return "Произошла ошибка при входе. Попробуйте еще раз.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="text-red-500" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Ошибка входа
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {getErrorMessage(error)}
        </p>
        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#0A84FF] text-white rounded-lg font-semibold hover:bg-[#0971d1] transition-colors"
          >
            Вернуться на главную
          </a>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500">
              Код ошибки: <code className="font-mono">{error}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

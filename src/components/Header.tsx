"use client";

import { useState } from "react";
import { Navigation, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import GradientText from "./GradientText";
import AuthModal from "./AuthModal";

interface HeaderProps {
  isScrolled: boolean;
  setActiveTab?: (tab: string) => void;
  activeTab?: string;
  userName: string;
  useUrlNavigation?: boolean;
}

export default function Header({
  isScrolled,
  setActiveTab,
  activeTab,
  userName,
  useUrlNavigation = false,
}: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const displayName = session?.user?.name || userName;

  const handleNavigation = (tab: string) => {
    // Если пользователь авторизован, всегда используем URL-навигацию с его ID
    if (session?.user?.id) {
      if (tab === "home") {
        router.push("/");
      } else if (tab === "catalog") {
        router.push(`/${session.user.id}/catalog`);
      } else if (tab === "dashboard") {
        router.push(`/${session.user.id}/dashboard`);
      }
    } else if (useUrlNavigation) {
      // Если URL-навигация включена, но пользователь не авторизован
      if (tab === "home") {
        router.push("/");
      }
    } else if (setActiveTab) {
      // Используем старую логику с табами (только для неавторизованных на главной)
      setActiveTab(tab);
    }
  };
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleNavigation("home")}
        >
          <div className="w-10 h-10 bg-[#0A84FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Navigation className="rotate-45" size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0D1B2A]">
            Aero<span className="text-[#0A84FF]">Nest</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0D1B2A]/70">
          <button
            onClick={() => handleNavigation("home")}
            className={`hover:text-[#0A84FF] transition-colors ${
              (useUrlNavigation ? pathname === "/" : activeTab === "home")
                ? "text-[#0A84FF]"
                : ""
            }`}
          >
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              Главная
            </GradientText>
          </button>
          <button
            onClick={() => handleNavigation("catalog")}
            className={`hover:text-[#0A84FF] transition-colors ${
              (
                useUrlNavigation
                  ? pathname?.includes("/catalog")
                  : activeTab === "catalog"
              )
                ? "text-[#0A84FF]"
                : ""
            }`}
          >
            Каталог
          </button>
          <button
            onClick={() => (setActiveTab ? setActiveTab("busnes") : null)}
            className={`hover:text-[#0A84FF] transition-colors ${
              activeTab === "busnes" ? "text-[#0A84FF]" : ""
            }`}
          >
            Бизнесу
          </button>
          <button className="hover:text-[#0A84FF] transition-colors">
            Франшиза
          </button>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <button
                onClick={() => handleNavigation("dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-[#0A84FF] transition-all bg-white shadow-sm"
              >
                <User size={18} className="text-[#0A84FF]" />
                <span className="text-sm font-semibold text-[#0D1B2A]">
                  {displayName}
                </span>
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0A84FF] transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0A84FF] transition-colors"
              >
                Войти
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0A84FF] text-white rounded-lg font-semibold hover:bg-[#0971d1] transition-colors"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          if (useUrlNavigation && session?.user?.id) {
            router.push(`/${session.user.id}/dashboard`);
          } else if (setActiveTab) {
            setActiveTab("dashboard");
          }
        }}
      />
    </nav>
  );
}

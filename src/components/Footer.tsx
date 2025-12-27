"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Navigation,
  MessageCircle,
  Globe,
  Youtube,
  Twitter,
  Phone,
  Mail,
  ArrowRight,
  Users,
  Copy,
} from "lucide-react";

interface FooterProps {
  onNavigate?: (tab: string) => void;
  useUrlNavigation?: boolean;
}

export type { FooterProps };

const FooterSocialIcon = ({
  icon: Icon,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <a
    href="#"
    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#0A84FF] hover:border-[#0A84FF]/30 hover:bg-white/10 transition-all"
  >
    <Icon size={18} />
  </a>
);

export default function Footer({
  onNavigate,
  useUrlNavigation = false,
}: FooterProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [phoneHovered, setPhoneHovered] = useState(false);

  const handleNavigation = (tab: string) => {
    if (useUrlNavigation && session?.user?.id) {
      if (tab === "home") {
        router.push("/");
      } else if (tab === "catalog") {
        router.push(`/${session.user.id}/catalog`);
      }
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // В реальном приложении здесь будет уведомление об успешном копировании
    } catch {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <footer className="bg-[#0D1B2A] text-white pt-20 pb-10 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
        {/* Column 1: About */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
              <Navigation className="rotate-45 text-[#0A84FF]" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Aero<span className="text-[#0A84FF]">Link</span>
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-[240px]">
            Сверхбыстрая дрон-доставка для Астрахани и регионов. Грузы до 25 кг
            — за 7–30 минут.
          </p>
          <div className="flex items-center gap-4">
            <FooterSocialIcon icon={MessageCircle} />
            <FooterSocialIcon icon={Globe} />
            <FooterSocialIcon icon={Youtube} />
            <FooterSocialIcon icon={Twitter} />
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h3 className="text-lg font-bold mb-6">Сервисы</h3>
          <ul className="space-y-4">
            {[
              "Главная",
              "Каталог магазинов",
              "Для бизнеса",
              "Франшиза",
              "Карта полетов",
              "Вакансии",
            ].map((item) => (
              <li key={item}>
                <button
                  onClick={() =>
                    item === "Главная"
                      ? handleNavigation("home")
                      : item === "Каталог магазинов"
                      ? handleNavigation("catalog")
                      : null
                  }
                  className="text-white/60 text-sm hover:text-[#0A84FF] hover:underline decoration-2 underline-offset-4 transition-all"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h3 className="text-lg font-bold mb-6">Помощь</h3>
          <ul className="space-y-4 mb-6">
            {[
              "Как сделать заказ",
              "Стоимость доставки",
              "Безопасность полетов",
              "Возврат и гарантия",
              "Частые вопросы",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-white/60 text-sm hover:text-[#0A84FF] transition-all"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <div
              className="flex items-center gap-3 group cursor-pointer"
              onMouseEnter={() => setPhoneHovered(true)}
              onMouseLeave={() => setPhoneHovered(false)}
            >
              <div className="w-8 h-8 z-0 rounded-full bg-white/5 flex items-center justify-center text-[#0A84FF] border border-white/10 group-hover:scale-110 transition-transform">
                <Phone size={14} />
              </div>
              <span className="text-sm font-bold tracking-wider transition-all">
                {phoneHovered ? "8 (8512) 123-DRON" : "8 (8512) 123-3766"}
              </span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8  z-0   rounded-full bg-white/5 flex items-center justify-center text-[#0A84FF] border border-white/10 group-hover:scale-110 transition-transform">
                <Mail size={14} />
              </div>
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                help@aerolink.ru
              </span>
            </div>
          </div>
        </div>

        {/* Column 4: Subscription + Referral */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Будьте в курсе</h3>
            <p className="text-white/60 text-xs mb-4">
              Первый заказ — со скидкой 20%. И бонус за друга.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Email или Telegram"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 ring-[#0A84FF]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                />
              </div>
              <button className="w-12 h-12 bg-[#0A84FF] rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all group overflow-hidden">
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* Referral Glassmorphism Card */}
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                <Users size={16} />
              </div>
              <p className="text-[10px] font-bold leading-tight">
                Пригласите друга — <br />
                <span className="text-[#0A84FF]">получите 200 ₽</span>
              </p>
            </div>
            <div className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2 border border-white/5">
              <span className="text-xs font-mono font-bold tracking-widest text-white/80">
                AERO-XXXX
              </span>
              <button
                onClick={() => copyToClipboard("AERO-XXXX")}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40 hover:text-white"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
          © 2025 AeroLink Express. All Rights Reserved.
        </p>
        <div className="flex gap-6">
          <a
            href="#"
            className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
          >
            Конфиденциальность
          </a>
          <a
            href="#"
            className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
          >
            Условия AeroOS
          </a>
          <a
            href="#"
            className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
          >
            Астрахань, Россия
          </a>
        </div>
      </div>
    </footer>
  );
}

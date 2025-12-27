"use client";

import { useState, useEffect } from "react";
import { Navigation, Activity, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HomeSection from "@/components/HomeSection";
import CatalogSection from "@/components/CatalogSection";
import DashboardSection from "../components/UserDash/DashboardSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AeroNestSection from "@/components/AeroNestSection";
import EnergyTransparencySection from "@/components/EnergyTransparencySection";
import GreenMissionSection from "@/components/GreenMissionSection";
import Iridescence from "@/components/Iridescence";
import LandingPage from "@/components/LandingPage";

interface ActiveOrder {
  id: string;
  status: string;
  address: string;
  amount: number;
  createdAt: string;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Функция для навигации с учетом авторизации
  const handleTabChange = (tab: string) => {
    if (session?.user?.id) {
      // Если пользователь авторизован, используем URL-навигацию
      if (tab === "catalog") {
        router.push(`/${session.user.id}/catalog`);
      } else if (tab === "dashboard") {
        router.push(`/${session.user.id}/dashboard`);
      } else {
        setActiveTab(tab);
      }
    } else {
      // Если не авторизован, используем табы
      setActiveTab(tab);
    }
  };

  // Используем данные из сессии или дефолтные значения
  const user = {
    name: session?.user?.name || "Гость",
    rank: "Дронолюб",
    level: 4,
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Загружаем активный заказ пользователя только один раз при входе
  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!session?.user?.id) {
        setActiveOrder(null);
        return;
      }

      try {
        setOrderLoading(true);
        const response = await fetch("/api/orders/active");
        const data = await response.json();

        if (data.success) {
          setActiveOrder(data.order);
        } else {
          setActiveOrder(null);
        }
      } catch (error) {
        console.error("Ошибка при загрузке активного заказа:", error);
        setActiveOrder(null);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchActiveOrder();
  }, [session?.user?.id]);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: "Ожидание", color: "text-yellow-600" },
      CONFIRMED: { label: "В сборке", color: "text-blue-600" },
      IN_FLIGHT: { label: "В полете", color: "text-purple-600" },
    };
    return statusMap[status] || { label: status, color: "text-gray-600" };
  };

  const calculateTimeRemaining = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    // Примерное время доставки в зависимости от статуса
    if (diffMins < 5) return "5-7 мин";
    if (diffMins < 10) return "3-5 мин";
    return "1-3 мин";
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${
        activeTab === "home" ? "bg-[#F8FAFC]" : "bg-gray-50"
      }`}
    >
      {/* Navigation Bar */}
      <Header
        isScrolled={isScrolled}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        userName={user.name}
      />

      <div className="fixed inset-0 w-full h-full z-0 bg-black">
        <Iridescence
          color={[1, 1, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      {/* Live Map Preview (Small Overlay) */}
      {activeOrder && !orderLoading && (
        <div
          className="fixed bottom-8 left-8 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl hidden lg:block cursor-pointer hover:bg-white transition-all group z-50"
          onClick={() => {
            if (session?.user?.id) {
              router.push(`/${session.user.id}/dashboard`);
            } else {
              setActiveTab("dashboard");
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-lg overflow-hidden border border-blue-200 flex items-center justify-center">
                {activeOrder.status === "IN_FLIGHT" ? (
                  <Navigation
                    size={20}
                    className="text-blue-600 animate-pulse rotate-45"
                  />
                ) : (
                  <Package size={20} className="text-blue-600 animate-pulse" />
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none mb-1">
                {activeOrder.status === "IN_FLIGHT"
                  ? "Live Map"
                  : "Активный заказ"}
              </p>
              <p className="text-xs font-semibold text-[#0D1B2A]">
                Заказ #{activeOrder.id.slice(-6).toUpperCase()} •{" "}
                {getStatusLabel(activeOrder.status).label}
              </p>
              <p className="text-[10px] text-gray-500 italic">
                {activeOrder.address.length > 25
                  ? `${activeOrder.address.substring(0, 25)}...`
                  : activeOrder.address}{" "}
                • {calculateTimeRemaining(activeOrder.createdAt)} до цели
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Main Content Area */}
      <main className="pt-20  relative z-10 flex-1">
        {activeTab === "home" && (
          <>
            <HomeSection onStart={() => handleTabChange("catalog")} />
            <AeroNestSection />
            <EnergyTransparencySection />
            <GreenMissionSection />
          </>
        )}
        {activeTab === "catalog" && <CatalogSection />}
        {activeTab === "busnes" && <LandingPage />}
        {activeTab === "dashboard" && <DashboardSection user={user} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Floating Emergency Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#EF4444] text-white rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
        <div className="absolute -top-12 right-0 bg-white text-[#EF4444] text-xs font-bold px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-red-100">
          Срочно? 🚨
        </div>
        <Activity size={28} />
      </button>
    </div>
  );
}

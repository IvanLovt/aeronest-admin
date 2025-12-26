"use client";

import { useState, useEffect } from "react";
import { Navigation, Activity } from "lucide-react";
import { useSession } from "next-auth/react";
import HomeSection from "@/components/HomeSection";
import CatalogSection from "@/components/CatalogSection";
import DashboardSection from "@/components/DashboardSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AeroNestSection from "@/components/AeroNestSection";
import EnergyTransparencySection from "@/components/EnergyTransparencySection";
import GreenMissionSection from "@/components/GreenMissionSection";
import Iridescence from "@/components/Iridescence";

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
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
      <div className="fixed bottom-8 left-8 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl hidden lg:block cursor-pointer hover:bg-white transition-all group z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-lg overflow-hidden border border-blue-200">
              <div className="w-full h-full bg-[url('https://api.placeholder.com/100/100')] bg-cover opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse">
                <Navigation size={16} className="rotate-45" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none mb-1">
              Live Map
            </p>
            <p className="text-xs font-semibold text-[#0D1B2A]">
              Delta-25 #A7 в пути
            </p>
            <p className="text-[10px] text-gray-500 italic">
              Набережная • 3:12 до цели
            </p>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <main className="pt-20 relative z-10">
        {activeTab === "home" && (
          <>
            <HomeSection onStart={() => setActiveTab("catalog")} />
            <AeroNestSection />
            <EnergyTransparencySection />
            <GreenMissionSection />
          </>
        )}
        {activeTab === "catalog" && <CatalogSection />}
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

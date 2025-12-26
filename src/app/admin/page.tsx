"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Settings,
  LayoutDashboard,
  Package,
  Wallet,
  Navigation,
} from "lucide-react";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminDrones from "./components/AdminDrones";
import AllOrders from "./components/AllOrders";
const AdminSidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${
      active
        ? "bg-[#0A84FF] text-white shadow-lg"
        : "text-blue-400 hover:bg-white/5"
    }`}
  >
    <div className="flex items-center gap-4">
      <Icon
        size={20}
        className={
          active
            ? "text-white"
            : "text-blue-400 group-hover:scale-110 transition-transform"
        }
      />
      <span
        className={`font-bold text-sm tracking-wide ${
          active ? "text-white" : "text-blue-400"
        }`}
      >
        {label}
      </span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [section, setSection] = useState("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.email !== "admin@example.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Shield className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-2xl font-bold text-white mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-400 mb-4">
            У вас нет прав доступа к этой странице
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#0A84FF] text-white rounded-lg hover:bg-[#0971d1] transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A84FF] rounded-xl flex items-center justify-center text-white">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Панель администратора
                </h1>
                <p className="text-sm text-gray-400">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut({ callbackUrl: "/" });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#0A84FF] transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-[1600px] mx-auto px-6 flex gap-8 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-72 flex flex-col gap-2 bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
            <AdminSidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={section === "dashboard"}
              onClick={() => setSection("dashboard")}
            />
            <AdminSidebarItem
              icon={Users}
              label="Пользователи"
              active={section === "users"}
              onClick={() => setSection("users")}
            />
            <AdminSidebarItem
              icon={Package}
              label="Заказы"
              active={section === "orders"}
              onClick={() => setSection("orders")}
              badge="7"
            />
            <AdminSidebarItem
              icon={Navigation}
              label="Дроны"
              active={section === "drones"}
              onClick={() => setSection("drones")}
            />
            <AdminSidebarItem
              icon={Wallet}
              label="Финансы"
              active={section === "finance"}
              onClick={() => setSection("finance")}
            />
            <div className="my-4 border-t border-gray-700"></div>
            <AdminSidebarItem
              icon={Settings}
              label="Настройки"
              active={section === "settings"}
              onClick={() => setSection("settings")}
            />

            {/* Баланс Компании */}
            <div className="mt-8 p-6 rounded-[32px] bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                Кошелек оператора
              </p>
              <p className="text-2xl font-mono font-bold text-white">
                ₽128 450.00
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-1 flex-1 bg-blue-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-gray-700 rounded-full"></div>
                <div className="h-1 flex-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </aside>

          {/* Main Admin Area */}
          <div className="flex-1 space-y-8">
            {section === "dashboard" && <AdminDashboard />}
            {section === "users" && <AdminUsers />}

            {section === "orders" && <AllOrders />}
            {section === "drones" && <AdminDrones />}
            {section === "finance" && (
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Финансы</h2>
                <p className="text-gray-300">Финансовые операции</p>
              </div>
            )}
            {section === "settings" && (
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Настройки</h2>
                <p className="text-gray-300">Настройки системы</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

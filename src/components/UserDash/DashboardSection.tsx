"use client";

import {
  LayoutDashboard,
  History,
  Wallet,
  Settings,
  Users,
  MapPin,
  Leaf,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import OrderHistory from "./OrderHistory";

interface User {
  name: string;
  rank: string;
  level: number;
}

interface DashboardSectionProps {
  user?: User;
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <div
        className={`w-12 h-12 ${
          colorClasses[color as keyof typeof colorClasses]
        } rounded-2xl flex items-center justify-center mb-4`}
      >
        <Icon size={24} />
      </div>
      <p className="text-2xl font-bold text-[#0D1B2A] mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

interface TableRowProps {
  name: string;
  status: string;
  amount: string;
  color: string;
}

function TableRow({ name, status, amount, color }: TableRowProps) {
  const statusColors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-8 py-4">
        <p className="font-bold text-[#0D1B2A]">{name}</p>
      </td>
      <td className="px-8 py-4">
        <span
          className={`text-xs px-3 py-1 rounded-full font-bold ${
            statusColors[color as keyof typeof statusColors]
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-8 py-4 text-right">
        <span className="font-bold text-[#0D1B2A]">{amount}</span>
      </td>
    </tr>
  );
}

export default function DashboardSection({
  user: userProp,
}: DashboardSectionProps) {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<string>("0 ₽");
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [userLevel, setUserLevel] = useState<number>(1);

  // Используем данные из сессии или переданные пропсы
  const user = userProp || {
    name: session?.user?.name || "Гость",
    rank: "Дронолюб",
    level: userLevel,
  };

  // Загружаем баланс из БД и количество заказов для расчета уровня
  useEffect(() => {
    const fetchBalance = async () => {
      if (!session?.user?.id) {
        setBalanceLoading(false);
        return;
      }

      try {
        setBalanceLoading(true);
        const response = await fetch("/api/user/balance");
        const data = await response.json();

        if (data.success && data.balance !== undefined) {
          // Форматируем баланс: добавляем пробелы для тысяч и символ ₽
          const balanceValue = parseFloat(data.balance || "0");
          const formattedBalance = balanceValue
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
            .replace(/\.00$/, "");
          setBalance(`${formattedBalance} ₽`);
        } else {
          setBalance("0 ₽");
        }
      } catch (error) {
        console.error("Ошибка при загрузке баланса:", error);
        setBalance("0 ₽");
      } finally {
        setBalanceLoading(false);
      }
    };

    const fetchOrdersCount = async () => {
      if (!session?.user?.id) {
        setUserLevel(1);
        return;
      }

      try {
        const response = await fetch("/api/orders/my");
        const data = await response.json();

        if (data.success && Array.isArray(data.orders)) {
          const count = data.orders.length;
          // Рассчитываем уровень: level 1 по умолчанию, каждые 8 заказов = +1 уровень
          const calculatedLevel = 1 + Math.floor(count / 8);
          setUserLevel(calculatedLevel);
        } else {
          setUserLevel(1);
        }
      } catch (error) {
        console.error("Ошибка при загрузке количества заказов:", error);
        setUserLevel(1);
      }
    };

    fetchBalance();
    fetchOrdersCount();
  }, [session?.user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-500">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Обзор", section: "overview" },
            { icon: MapPin, label: "Мои адреса", section: "addresses" },
            { icon: Wallet, label: "Кошелек", section: "wallet" },
            { icon: History, label: "История заказов", section: "orders" },
            { icon: Users, label: "Рефералы", section: "referrals" },
            { icon: Settings, label: "Настройки", section: "settings" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(item.section)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeSection === item.section
                  ? "bg-[#0A84FF] text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-500 hover:bg-white hover:text-[#0A84FF]"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {activeSection === "overview" && (
            <>
              <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div>
                  <h2 className="text-3xl font-bold text-[#0D1B2A]">
                    Привет, {user.name}!
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Сегодня отличная погода для полетов: +18°C, штиль.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Твой Ранг
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-3 py-1 bg-blue-50 text-[#0A84FF] rounded-lg font-bold text-sm border border-blue-100">
                      {user.rank}
                    </div>
                    <span className="text-sm font-bold text-[#0D1B2A]">
                      Уровень {user.level}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                  icon={History}
                  label="Экономлено времени"
                  value="4 ч 12 мин"
                  color="blue"
                />
                <StatCard
                  icon={Leaf}
                  label="CO₂ сэкономлено"
                  value="8.3 кг"
                  color="green"
                />
                <StatCard
                  icon={Wallet}
                  label="Баланс кошелька"
                  value={balanceLoading ? "Загрузка..." : balance}
                  color="indigo"
                />
              </div>

              {/* Active System Map Component Simulation */}
              <div className="bg-[#0D1B2A] rounded-[40px] p-8 text-white relative overflow-hidden h-[300px]">
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">Радар полетов</h3>
                      <p className="text-white/40 text-xs">
                        В реальном времени • Астрахань Центр
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/10">
                        12 активных дронов
                      </div>
                    </div>
                  </div>

                  {/* Schematic Map Decor */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                    <div className="w-[400px] h-[400px] border border-white/20 rounded-full animate-[ping_10s_linear_infinite]"></div>
                    <div className="w-[200px] h-[200px] border border-white/40 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-[#0A84FF] rounded-full shadow-[0_0_20px_#0A84FF]"></div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">
                        Последний маршрут
                      </p>
                      <p className="text-sm font-bold text-[#0A84FF]">
                        Хаб Южный → Адм. Набережная
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-[#0A84FF] text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform">
                      Открыть полную карту
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-[#0D1B2A]">
                    Последняя активность
                  </h3>
                  <button
                    onClick={() => setActiveSection("orders")}
                    className="text-xs font-bold text-[#0A84FF] hover:underline"
                  >
                    Вся история
                  </button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                      <th className="px-8 py-4">Объект</th>
                      <th className="px-8 py-4">Статус</th>
                      <th className="px-8 py-4 text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <TableRow
                      name="Заказ #A7721 (Додо Пицца)"
                      status="Выполнено"
                      amount="-280 ₽"
                      color="green"
                    />
                    <TableRow
                      name="Пополнение через СБП"
                      status="Зачислено"
                      amount="+500 ₽"
                      color="blue"
                    />
                    <TableRow
                      name="Заказ #A7690 (Аптека 36.6)"
                      status="Выполнено"
                      amount="-120 ₽"
                      color="green"
                    />
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === "orders" && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#0D1B2A]">
                  История заказов
                </h2>
                <p className="text-gray-500 mt-1">
                  Все ваши заказы и их статусы
                </p>
              </div>
              <OrderHistory />
            </div>
          )}

          {activeSection !== "overview" && activeSection !== "orders" && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-gray-500">
                Раздел &quot;{activeSection}&quot; в разработке
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

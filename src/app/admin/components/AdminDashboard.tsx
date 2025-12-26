"use client";

import {
  Download,
  Plus,
  Package,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Компонент KPI карточки
const KPICard = ({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  color: "blue" | "indigo" | "green" | "orange";
}) => {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    indigo: "bg-indigo-500/20 text-indigo-400",
    green: "bg-green-500/20 text-green-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}
        >
          <Icon size={24} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className="text-xs text-gray-500">{trend}</div>
    </div>
  );
};

// Компонент алерта
const AlertItem = ({
  type,
  title,
  time,
  desc,
}: {
  type: "error" | "warning" | "success";
  title: string;
  time: string;
  desc: string;
}) => {
  const typeClasses = {
    error: "border-red-500/30 bg-red-500/10",
    warning: "border-orange-500/30 bg-orange-500/10",
    success: "border-green-500/30 bg-green-500/10",
  };

  return (
    <div
      className={`p-4 rounded-xl border ${typeClasses[type]} transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-sm text-white">{title}</h4>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <p className="text-xs text-gray-300">{desc}</p>
    </div>
  );
};

// Компонент статуса заказа
const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusLabels: Record<string, string> = {
    completed: "Завершен",
    pending: "Ожидает",
    in_progress: "В пути",
    cancelled: "Отменен",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
        statusClasses[status] || statusClasses.pending
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

// Мок данные заказов
const MOCK_ORDERS = [
  {
    id: "ORD-2024-001",
    user: "Иван Петров",
    address: "ул. Ленина, 15",
    drone: "DRN-012",
    status: "completed",
    amount: "1,250",
    time: "10:24",
  },
  {
    id: "ORD-2024-002",
    user: "Мария Сидорова",
    address: "пр. Мира, 42",
    drone: "DRN-008",
    status: "in_progress",
    amount: "890",
    time: "10:18",
  },
  {
    id: "ORD-2024-003",
    user: "Алексей Козлов",
    address: "ул. Пушкина, 7",
    drone: "DRN-005",
    status: "pending",
    amount: "2,100",
    time: "10:05",
  },
  {
    id: "ORD-2024-004",
    user: "Елена Волкова",
    address: "пр. Гагарина, 33",
    drone: "DRN-003",
    status: "completed",
    amount: "1,750",
    time: "09:52",
  },
  {
    id: "ORD-2024-005",
    user: "Дмитрий Соколов",
    address: "ул. Садовая, 21",
    drone: "DRN-009",
    status: "in_progress",
    amount: "950",
    time: "09:45",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            Здоровье системы
          </h1>
          <p className="text-white/40 text-sm">Обновлено: сегодня, 11:24:05</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-white">
            <Download size={18} />
          </button>
          <button className="px-6 py-3 bg-blue-500 rounded-xl font-bold text-sm text-white shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <Plus size={18} /> Создать промо
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Активных заказов"
          value="24"
          trend="+2 за 10 мин"
          icon={Package}
          color="blue"
        />
        <KPICard
          label="Активных пользователей"
          value="842"
          trend="+14 сегодня"
          icon={Users}
          color="indigo"
        />
        <KPICard
          label="Доставки (успех)"
          value="98.7%"
          trend="1 893 всего"
          icon={CheckCircle2}
          color="green"
        />
        <KPICard
          label="Выручка 24ч"
          value="₽42 310"
          trend="+12% к вчера"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Карта (Мок) */}
        <div className="xl:col-span-2 bg-[#141f3a] rounded-[40px] p-1 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            <div className="px-4 py-2 bg-[#0F172A]/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                Астрахань: Live
              </span>
            </div>
          </div>
          <div className="h-[500px] w-full bg-[#0a1120] rounded-[38px] flex items-center justify-center relative bg-[radial-gradient(#1e2d4e_1px,transparent_1px)] bg-size-[20px_20px]">
            {/* Декоративные точки-дроны */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-green-500 rounded-full ring-4 ring-green-500/20 animate-bounce"></div>
            <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-green-500 rounded-full ring-4 ring-green-500/20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-orange-500 rounded-full ring-4 ring-orange-500/20 animate-pulse"></div>
            <p className="text-white/10 font-black text-6xl uppercase tracking-tighter opacity-20 pointer-events-none select-none">
              MAP VIEWPORT
            </p>
          </div>
        </div>

        {/* Алерты */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold px-2 text-white">
            Системные алерты
          </h3>
          <div className="space-y-4">
            <AlertItem
              type="error"
              title="DRN-012: Низкий заряд"
              time="3 мин назад"
              desc="Заряд 12%, требуется экстренный возврат в Южный хаб."
            />
            <AlertItem
              type="warning"
              title="Склад «Центральный»"
              time="15 мин назад"
              desc="Осталось всего 3 свободных слота для дронов."
            />
            <AlertItem
              type="success"
              title="Новый VIP"
              time="1ч назад"
              desc="Пользователь @ivan_astr совершил 50-ю доставку."
            />
          </div>
        </div>
      </div>

      {/* Последние заказы */}
      <div className="bg-[#141f3a] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Последние заказы</h3>
          <button className="text-blue-400 text-sm font-bold flex items-center gap-2">
            Все заказы <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">ID / Пользователь</th>
                <th className="px-8 py-6">Адрес</th>
                <th className="px-8 py-6">Дрон</th>
                <th className="px-8 py-6">Статус</th>
                <th className="px-8 py-6">Сумма</th>
                <th className="px-8 py-6">Время</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_ORDERS.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="px-8 py-5">
                    <div className="font-mono text-blue-400 text-xs mb-1">
                      {order.id}
                    </div>
                    <div className="font-bold text-sm text-white">
                      {order.user}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-white/50">
                    {order.address}
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold border border-white/10 text-white">
                      {order.drone}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-8 py-5 font-mono font-bold text-white">
                    ₽{order.amount}
                  </td>
                  <td className="px-8 py-5 text-xs text-white/30">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

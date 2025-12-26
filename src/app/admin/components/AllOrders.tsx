"use client";

import { Search, Filter, ArrowRight, Package, Clock } from "lucide-react";

// Компонент статуса заказа
const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    delivered: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    in_flight: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    confirmed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusLabels: Record<string, string> = {
    delivered: "Доставлен",
    pending: "Ожидает",
    in_flight: "В полете",
    confirmed: "Подтвержден",
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

const MOCK_ORDERS = [
  {
    id: "ORD-789",
    user: "Иван А.",
    address: "ул. Набережная, 15",
    drone: "DRN-007",
    status: "delivered",
    amount: 850,
    time: "10:15",
  },
  {
    id: "ORD-790",
    user: "Мария С.",
    address: "ул. Ленина, 42",
    drone: "DRN-012",
    status: "in_flight",
    amount: 1200,
    time: "10:45",
  },
  {
    id: "ORD-791",
    user: "Олег К.",
    address: "пр-т Гужвина, 6",
    drone: "DRN-003",
    status: "confirmed",
    amount: 450,
    time: "11:02",
  },
  {
    id: "ORD-792",
    user: "Анна В.",
    address: "ул. Савушкина, 10",
    drone: "DRN-007",
    status: "pending",
    amount: 2100,
    time: "11:15",
  },
  {
    id: "ORD-793",
    user: "Дмитрий П.",
    address: "ул. Комсомольская, 8",
    drone: "DRN-005",
    status: "delivered",
    amount: 1750,
    time: "11:30",
  },
  {
    id: "ORD-794",
    user: "Елена М.",
    address: "пр-т Ленина, 25",
    drone: "DRN-009",
    status: "in_flight",
    amount: 950,
    time: "11:45",
  },
  {
    id: "ORD-795",
    user: "Алексей Р.",
    address: "ул. Мира, 12",
    drone: "DRN-002",
    status: "pending",
    amount: 3200,
    time: "12:00",
  },
];

export default function AllOrders() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Все заказы</h1>
          <p className="text-white/40 text-sm">
            Управление и мониторинг всех заказов системы
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              size={18}
            />
            <input
              type="text"
              placeholder="Поиск по ID, пользователю..."
              className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500 outline-none w-64 text-sm transition-all text-white placeholder:text-white/30"
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all text-white">
            <Filter size={18} /> Фильтры
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-blue-400" size={24} />
            <span className="text-2xl font-bold text-white">
              {MOCK_ORDERS.length}
            </span>
          </div>
          <p className="text-sm text-gray-400">Всего заказов</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <span className="text-2xl font-bold text-white">
              {MOCK_ORDERS.filter((o) => o.status === "delivered").length}
            </span>
          </div>
          <p className="text-sm text-gray-400">Доставлено</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            </div>
            <span className="text-2xl font-bold text-white">
              {MOCK_ORDERS.filter((o) => o.status === "in_flight").length}
            </span>
          </div>
          <p className="text-sm text-gray-400">В полете</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-400" size={24} />
            <span className="text-2xl font-bold text-white">
              {MOCK_ORDERS.filter((o) => o.status === "pending").length}
            </span>
          </div>
          <p className="text-sm text-gray-400">Ожидают</p>
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="bg-[#141f3a] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Список заказов</h3>
          <button className="text-blue-400 text-sm font-bold flex items-center gap-2 hover:text-blue-300 transition-colors">
            Экспорт <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">ID / Пользователь</th>
                <th className="px-8 py-6">Адрес доставки</th>
                <th className="px-8 py-6">Дрон</th>
                <th className="px-8 py-6">Статус</th>
                <th className="px-8 py-6">Сумма</th>
                <th className="px-8 py-6">Время</th>
                <th className="px-8 py-6">Действия</th>
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
                    ₽{order.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-xs text-white/30">
                    {order.time}
                  </td>
                  <td className="px-8 py-5">
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all text-xs font-bold">
                      Детали
                    </button>
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

"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import {
  Search,
  Filter,
  ArrowRight,
  Package,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ves?: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
  user: string;
  userEmail?: string;
  address: string;
  addressTitle?: string;
}

// Компонент статуса заказа
const StatusBadge = ({ status }: { status: string }) => {
  // Нормализуем статус к нижнему регистру для стилей
  const normalizedStatus = status.toLowerCase();

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
        statusClasses[normalizedStatus] || statusClasses.pending
      }`}
    >
      {statusLabels[normalizedStatus] || status}
    </span>
  );
};

// Функция форматирования даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Только что";
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AllOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch<{ orders: Order[] }>({
    url: "/api/admin/orders",
  });

  const orders = (data as any)?.orders || data || [];

  // Фильтрация заказов по поисковому запросу
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.user.toLowerCase().includes(query) ||
      order.userEmail?.toLowerCase().includes(query) ||
      order.address.toLowerCase().includes(query)
    );
  });

  // Функция для обновления статуса заказа
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      setOpenDropdown(null);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем данные через refetch
        await refetch();
      } else {
        console.error("Ошибка при обновлении статуса:", data.error);
        alert(data.error || "Ошибка при обновлении статуса");
      }
    } catch (err) {
      console.error("Ошибка при обновлении статуса:", err);
      alert("Не удалось обновить статус заказа");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Доступные статусы
  const statusOptions = [
    { value: "PENDING", label: "Ожидает" },
    { value: "CONFIRMED", label: "Подтвержден" },
    { value: "IN_FLIGHT", label: "В полете" },
    { value: "DELIVERED", label: "Доставлен" },
    { value: "CANCELLED", label: "Отменен" },
  ];

  // Статистика
  const totalOrders = orders.length;
  const deliveredCount = orders.filter(
    (o) => o.status.toLowerCase() === "delivered"
  ).length;
  const inFlightCount = orders.filter(
    (o) => o.status.toLowerCase() === "in_flight"
  ).length;
  const pendingCount = orders.filter(
    (o) => o.status.toLowerCase() === "pending"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 font-bold">{error}</p>
      </div>
    );
  }

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <span className="text-2xl font-bold text-white">{totalOrders}</span>
          </div>
          <p className="text-sm text-gray-400">Всего заказов</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <span className="text-2xl font-bold text-white">
              {deliveredCount}
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
              {inFlightCount}
            </span>
          </div>
          <p className="text-sm text-gray-400">В полете</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-400" size={24} />
            <span className="text-2xl font-bold text-white">
              {pendingCount}
            </span>
          </div>
          <p className="text-sm text-gray-400">Ожидают</p>
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="bg-[#141f3a] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xl font-bold text-white">
            Список заказов ({filteredOrders.length})
          </h3>
          <button className="text-blue-400 text-sm font-bold flex items-center gap-2 hover:text-blue-300 transition-colors">
            Экспорт <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 font-bold">
                {searchQuery ? "Заказы не найдены" : "Заказов пока нет"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="px-8 py-6">ID заказа/ Пользователь</th>
                  <th className="px-8 py-6">Адрес доставки</th>
                  <th className="px-8 py-6">Дрон</th>
                  <th className="px-8 py-6">Статус</th>
                  <th className="px-8 py-6">Сумма</th>
                  <th className="px-8 py-6">Время</th>
                  <th className="px-8 py-6">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
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
                      <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-bold border border-white/10 text-white">
                        DR-001
                      </span>
                    </td>
                    <td
                      className="px-8 py-5
                    "
                    >
                      <div className="relative">
                        {updatingStatus === order.id ? (
                          <div className="flex items-center gap-8">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <StatusBadge status={order.status} />
                          </div>
                        ) : (
                          <div className="relative group">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === order.id ? null : order.id
                                )
                              }
                              className="flex items-center gap-8 hover:opacity-80 transition-opacity"
                            >
                              <StatusBadge status={order.status} />
                              <ChevronDown
                                size={14}
                                className={`text-white/30 transition-transform ${
                                  openDropdown === order.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {openDropdown === order.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdown(null)}
                                />
                                <div className="absolute top-full left-0 mt-2 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                                  {statusOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() =>
                                        handleStatusUpdate(
                                          order.id,
                                          option.value
                                        )
                                      }
                                      disabled={
                                        order.status.toUpperCase() ===
                                        option.value
                                      }
                                      className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${
                                        order.status.toUpperCase() ===
                                        option.value
                                          ? "bg-blue-500/20 text-blue-400 cursor-not-allowed"
                                          : "text-white hover:bg-white/10"
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-white">
                      ₽{order.amount.toLocaleString("ru-RU")}
                    </td>
                    <td className="px-8 py-5 text-xs text-white/30">
                      {formatDate(order.createdAt)}
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
          )}
        </div>
      </div>
    </div>
  );
}

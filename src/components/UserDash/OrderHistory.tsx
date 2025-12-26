"use client";

import { useEffect, useState } from "react";
import { Package, MapPin, Calendar, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  count: number;
  ves?: number;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
  address: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Ожидание", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "В сборке", color: "bg-blue-100 text-blue-700" },
  IN_FLIGHT: { label: "В полете", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Доставлено", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Отменено", color: "bg-red-100 text-red-700" },
};

export default function OrderHistory() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/orders/my");
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || "Ошибка при загрузке заказов");
        }
      } catch (err) {
        console.error("Ошибка при загрузке заказов:", err);
        setError("Не удалось загрузить заказы");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session?.user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A84FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-bold">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">
          Заказов пока нет
        </h3>
        <p className="text-gray-500">
          Ваши заказы будут отображаться здесь после оформления
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = statusLabels[order.status] || statusLabels.PENDING;

        return (
          <div
            key={order.id}
            className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Заголовок заказа */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">
                    Заказ #{order.id.slice(-6).toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{order.address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                  <p className="text-xl font-bold text-[#0D1B2A] mt-2">
                    {formatPrice(order.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Список товаров */}
            <div className="p-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Товары ({order.items.length})
              </h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-[#0D1B2A]">{item.name}</p>
                      {item.ves && (
                        <p className="text-xs text-gray-500">
                          Вес: {item.ves} г
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-[#0D1B2A]">
                        {item.count} × {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        = {formatPrice(item.price * item.count)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

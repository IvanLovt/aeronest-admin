"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Activity,
  Zap,
  ChevronRight,
  ShoppingCart,
  Pizza,
  Pill,
  Leaf,
  Package,
  UtensilsCrossed,
  Store,
} from "lucide-react";

// Маппинг названий иконок на компоненты
const iconMap: Record<string, React.ElementType> = {
  "shopping-cart": ShoppingCart,
  pizza: Pizza,
  pill: Pill,
  leaf: Leaf,
  package: Package,
  pancake: UtensilsCrossed,
  default: Store,
};

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  min_order: string;
  delivery_time: string;
  icon_name: string | null;
  description: string;
}

export default function CatalogSection() {
  const [filter, setFilter] = useState("all");
  const [partners, setPartners] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const categoryParam = filter !== "all" ? `?category=${filter}` : "";
        const response = await fetch(`/api/catalog${categoryParam}`);
        const result = await response.json();

        if (result.success && result.data) {
          setPartners(result.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки каталога:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [filter]);

  const filtered = partners;

  // Функция для получения иконки
  const getIcon = (iconName: string | null) => {
    if (!iconName) {
      const IconComponent = iconMap.default;
      return <IconComponent size={32} className="text-gray-400" />;
    }
    const IconComponent = iconMap[iconName] || iconMap.default;
    return <IconComponent size={32} className="text-gray-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-[#0D1B2A]">
            Витрина партнеров
          </h2>
          <p className="text-gray-500 mt-1">
            Выберите магазин, остальное сделает AeroLink
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto max-w-full">
          {[
            { id: "all", label: "Все" },
            { id: "food", label: "Продукты" },
            { id: "rest", label: "Рестораны" },
            { id: "med", label: "Аптеки" },
            { id: "other", label: "Другое" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filter === f.id
                  ? "bg-[#0A84FF] text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-500 hover:text-[#0A84FF]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Address Bar */}
      <div className="bg-[#0D1B2A] rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="flex-1 w-full relative">
          <MapPin
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A84FF]"
            size={20}
          />
          <input
            type="text"
            placeholder="Введите адрес доставки (Астрахань, ул. Кирова...)"
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ring-[#0A84FF]/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white/80">
          <Activity size={20} className="text-[#10B981]" />
          <span className="text-sm font-mono uppercase tracking-wider">
            AeroOS: <span className="text-white font-bold">Оптимально</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF]"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Магазины не найдены</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  {getIcon(p.icon_name)}
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#10B981] rounded-full text-[10px] font-bold border border-green-100 mb-1">
                    <Zap size={10} fill="currentColor" />
                    {p.delivery_time}
                  </div>
                  <p className="text-xs text-gray-400">Мин: {p.min_order}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">
                {p.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {p.description}
              </p>
              <button className="w-full py-4 bg-gray-50 group-hover:bg-[#0A84FF] group-hover:text-white text-[#0D1B2A] rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                Перейти к заказу
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

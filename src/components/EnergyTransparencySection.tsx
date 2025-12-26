"use client";

import { FileText, Sun, Battery, Navigation, Leaf } from "lucide-react";

export default function EnergyTransparencySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Энергетическая прозрачность
            </h2>
            <p className="text-gray-500">
              Live-дашборд обновляется каждые 5 минут из нашей EMS-системы.
            </p>
          </div>
          <button className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
            <FileText size={18} /> Скачать отчет за месяц (PDF)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Солнечная генерация",
              val: "3.2 кВт",
              sub: "28.7 кВт·ч за сутки",
              icon: Sun,
            },
            {
              label: "Заряд хаба",
              val: "84%",
              sub: "Оптимальный уровень",
              icon: Battery,
            },
            {
              label: "Полёты на «Зелени»",
              val: "7",
              sub: "41 полет за сегодня",
              icon: Navigation,
            },
            {
              label: "CO₂ сэкономлено",
              val: "0.9 кг",
              sub: "12.1 кг за сутки",
              icon: Leaf,
            },
          ].map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className="p-8 bg-gray-50 rounded-[32px] border border-gray-100"
              >
                <IconComponent size={20} className="text-blue-500 mb-4" />
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  {item.label}
                </p>
                <p className="text-3xl font-bold mb-1">{item.val}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

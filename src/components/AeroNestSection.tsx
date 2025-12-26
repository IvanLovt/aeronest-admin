"use client";

import { Sun, Battery, Zap, Cpu } from "lucide-react";

export default function AeroNestSection() {
  return (
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">«Гнездо-Энерго»</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Наш хаб — это автономный микрогрид, который обеспечивает бесперебойную
          работу флота даже при полном блэкауте.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Sun,
            label: "Крыша",
            desc: "Солнечные панели (15 кВт)",
            color: "orange",
          },
          {
            icon: Battery,
            label: "Подвал",
            desc: "LiFePO₄-накопитель (100 кВт·ч)",
            color: "blue",
          },
          {
            icon: Zap,
            label: "Зарядная зона",
            desc: "8 умных станций 2.0",
            color: "indigo",
          },
          {
            icon: Cpu,
            label: "EMS-панель",
            desc: "Потребление vs Генерация",
            color: "green",
          },
        ].map((item, i) => {
          const IconComponent = item.icon;
          return (
            <div
              key={i}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-help group"
            >
              <div
                className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${
                  item.color === "orange"
                    ? "bg-orange-50 text-orange-500"
                    : item.color === "blue"
                    ? "bg-blue-50 text-blue-500"
                    : item.color === "indigo"
                    ? "bg-indigo-50 text-indigo-500"
                    : "bg-green-50 text-green-500"
                }`}
              >
                <IconComponent size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="max-w-3xl mx-auto mt-16 p-8 bg-[#0D1B2A] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mb-2">
            Микрогрид AeroLink
          </p>
          <h3 className="text-xl font-bold">
            Вы в Астрахани? Приходите на экскурсию!
          </h3>
        </div>
        <button className="px-8 py-4 bg-blue-500 rounded-2xl font-bold hover:bg-blue-600 transition-all whitespace-nowrap">
          Записаться на тур
        </button>
      </div>
    </section>
  );
}

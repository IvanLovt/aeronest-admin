"use client";

import { Leaf, MapPin, Users } from "lucide-react";

export default function GreenMissionSection() {
  return (
    <section className="py-24 bg-[#0D1B2A] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500 rounded-full blur-[120px]"></div>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Мы не просто экономим ваше время.{" "}
            <span className="text-green-400">Мы экономим будущее.</span>
          </h2>
          <p className="text-white/60 text-lg">
            К 2027 году AeroLink сократит выбросы CO₂ в Астрахани на 210 тонн в
            год, обучив сотни школьников основам энергоэффективности.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
              <Leaf size={24} />
            </div>
            <h4 className="text-xl font-bold">1 полёт = 0.23 кг CO₂</h4>
            <p className="text-white/40 text-sm">
              Против 1.1 кг у автомобиля при аналогичной доставке.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
              <MapPin size={24} />
            </div>
            <h4 className="text-xl font-bold">Зелёная логистика</h4>
            <p className="text-white/40 text-sm">
              15% городской доставки перейдет в «чистое небо».
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400">
              <Users size={24} />
            </div>
            <h4 className="text-xl font-bold">100 школьников</h4>
            <p className="text-white/40 text-sm">
              Ежегодные курсы по энергоэффективности и БПЛА.
            </p>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          <span className="font-bold text-xs uppercase tracking-widest">
            Поддержано:
          </span>
          <span className="text-sm font-bold">Минэнерго РФ</span>
          <span className="text-sm font-bold">Астраханский эко-фонд</span>
          <span className="text-sm font-bold">Skolkovo Green</span>
        </div>
      </div>
    </section>
  );
}

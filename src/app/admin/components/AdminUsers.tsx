"use client";

import { Search, Filter, Eye, Lock } from "lucide-react";

export default function AdminUsers() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          Управление пользователями
        </h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              size={18}
            />
            <input
              type="text"
              placeholder="Поиск по email, ID..."
              className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500 outline-none w-64 text-sm transition-all text-white placeholder:text-white/30"
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all text-white">
            <Filter size={18} /> Фильтры
          </button>
        </div>
      </div>

      <div className="bg-[#141f3a] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0F172A]">
            <tr className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              <th className="px-8 py-6">Пользователь</th>
              <th className="px-8 py-6">Роль</th>
              <th className="px-8 py-6 text-center">Заказов</th>
              <th className="px-8 py-6">Баланс</th>
              <th className="px-8 py-6">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              {
                name: "Иван Макаров",
                email: "ivan@astr.ru",
                role: "VIP",
                orders: 42,
                balance: 1240,
              },
              {
                name: "Елена С.",
                email: "elena@gmail.com",
                role: "USER",
                orders: 3,
                balance: 150,
              },
              {
                name: "Дмитрий В.",
                email: "dmitry@tech.io",
                role: "ADMIN",
                orders: 128,
                balance: 0,
              },
            ].map((u, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">
                        {u.name}
                      </div>
                      <div className="text-xs text-white/30">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      u.role === "ADMIN"
                        ? "border-purple-500/30 text-purple-400 bg-purple-500/5"
                        : u.role === "VIP"
                        ? "border-orange-500/30 text-orange-400 bg-orange-500/5"
                        : "border-white/10 text-white/50"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-center font-mono font-bold text-blue-400">
                  {u.orders}
                </td>
                <td className="px-8 py-6 font-mono font-bold tracking-tight text-white">
                  ₽{u.balance}
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/50 transition-all text-white">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-red-500/50 transition-all text-red-400">
                      <Lock size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

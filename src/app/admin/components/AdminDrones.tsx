"use client";

import { Navigation, Plus } from "lucide-react";

// Мок данные дронов
const MOCK_DRONES = [
  {
    id: "DRN-001",
    model: "DJI Mavic 3 Pro",
    status: "in_flight",
    battery: 85,
  },
  {
    id: "DRN-002",
    model: "DJI Phantom 4",
    status: "idle",
    battery: 45,
  },
  {
    id: "DRN-003",
    model: "DJI Mini 3",
    status: "warning",
    battery: 15,
  },
  {
    id: "DRN-004",
    model: "DJI Air 2S",
    status: "in_flight",
    battery: 72,
  },
  {
    id: "DRN-005",
    model: "DJI Mavic 3 Pro",
    status: "idle",
    battery: 90,
  },
  {
    id: "DRN-006",
    model: "DJI Phantom 4",
    status: "in_flight",
    battery: 60,
  },
];

export default function AdminDrones() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-white">Управление флотом</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MOCK_DRONES.map((drone) => (
          <div
            key={drone.id}
            className="p-8 bg-[#141f3a] rounded-[40px] border border-white/5 shadow-2xl group hover:border-blue-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-mono text-xs text-blue-400 mb-1">
                  {drone.id}
                </p>
                <h3 className="text-xl font-bold text-white">{drone.model}</h3>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  drone.status === "in_flight"
                    ? "bg-green-500/20 text-green-400"
                    : drone.status === "warning"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 text-white/30"
                }`}
              >
                <Navigation
                  className={drone.status === "in_flight" ? "rotate-45" : ""}
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Заряд:</span>
                <span
                  className={`font-bold ${
                    drone.battery < 20 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {drone.battery}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    drone.battery < 20 ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${drone.battery}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="py-3 bg-white/5 rounded-xl border border-white/5 font-bold text-xs text-white hover:bg-white/10 transition-all">
                ТРЕКИНГ
              </button>
              <button className="py-3 bg-white/5 rounded-xl border border-white/5 font-bold text-xs text-white hover:bg-white/10 transition-all">
                ТО
              </button>
            </div>
          </div>
        ))}
        <button className="p-8 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4 text-white/20 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase">
            Добавить дрон
          </span>
        </button>
      </div>
    </div>
  );
}

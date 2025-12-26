"use client";

import { useEffect, useState } from "react";
import { Globe, ShieldCheck, Calendar } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  image: string;
  cooperationDate: Date | string;
  description: string;
}

interface PartnerCardProps {
  partner: Partner;
}

const levelConfig = {
  bronze: { bg: "bg-amber-900/30", text: "text-amber-400", label: "Бронзовый" },
  silver: { bg: "bg-gray-400/20", text: "text-gray-300", label: "Серебряный" },
  gold: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Золотой" },
  platinum: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-300",
    label: "Платиновый",
  },
};

// Определяем уровень партнера на основе даты сотрудничества
function getPartnerLevel(
  cooperationDate: Date | string
): "bronze" | "silver" | "gold" | "platinum" {
  const date =
    typeof cooperationDate === "string"
      ? new Date(cooperationDate)
      : cooperationDate;
  const now = new Date();
  const yearsOfCooperation =
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);

  if (yearsOfCooperation >= 3) return "platinum";
  if (yearsOfCooperation >= 2) return "gold";
  if (yearsOfCooperation >= 1) return "silver";
  return "bronze";
}

function PartnerCard({ partner }: PartnerCardProps) {
  const level = getPartnerLevel(partner.cooperationDate);
  const config = levelConfig[level];

  const cooperationDate =
    typeof partner.cooperationDate === "string"
      ? new Date(partner.cooperationDate)
      : partner.cooperationDate;

  const formattedDate = cooperationDate.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="neumorphic-card relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg">
      {/* Уголок уровня */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${config.bg} rotate-45 flex items-center justify-center`}
      >
        <span className={`text-xs font-bold ${config.text} -rotate-45`}>
          {config.label}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.image}
                alt={partner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback на placeholder если изображение не загрузилось
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/64";
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="font-semibold text-lg text-white">
                {partner.name}
              </h3>
            </div>

            <p className="mt-2 text-sm text-slate-400 line-clamp-2">
              {partner.description}
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>
                  Сотрудничество с:{" "}
                  <span className="font-medium text-white">
                    {formattedDate}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>
                  Доставка:{" "}
                  <span className="font-medium text-cyan-300">Astradron</span>
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-600/20 hover:bg-blue-600/40 rounded-lg border border-blue-500/30 text-blue-300 transition-all">
                ЛК партнёра
              </button>
              <button className="px-3 py-1.5 text-sm bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300 transition-all">
                API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerShow() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPartners() {
      try {
        setLoading(true);
        const response = await fetch("/api/partners");
        const data = await response.json();

        if (data.success) {
          setPartners(data.partners);
        } else {
          setError(data.error || "Не удалось загрузить партнеров");
        }
      } catch (err) {
        console.error("Ошибка при загрузке партнеров:", err);
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-700/50 rounded-lg animate-pulse"
            >
              <div className="p-5">
                <div className="h-32 bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold">Ошибка загрузки партнеров</p>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center text-slate-400">
          <p className="text-lg">Партнеры не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-white mb-8">Наши партнеры</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}

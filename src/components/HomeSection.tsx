"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Leaf,
  Play,
  Navigation,
  Activity,
} from "lucide-react";

interface HomeSectionProps {
  onStart: () => void;
}

interface Partner {
  id: string;
  name: string;
  image: string;
  cooperationDate: Date | string;
  description: string;
}

export default function HomeSection({ onStart }: HomeSectionProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        console.log("Загрузка партнеров...");
        const response = await fetch("/api/partners");

        if (!response.ok) {
          console.error("Ошибка HTTP:", response.status, response.statusText);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Данные получены:", data);

        if (data.success && data.partners && Array.isArray(data.partners)) {
          // Берем первые 5 партнеров для отображения
          const partnersToShow = data.partners.slice(0, 5);
          console.log(
            "Партнеры для отображения:",
            partnersToShow.length,
            partnersToShow
          );
          if (partnersToShow.length > 0) {
            setPartners(partnersToShow);
          } else {
            console.warn("Массив партнеров пуст");
          }
        } else {
          console.error(
            "Ошибка в данных:",
            data.error || "Неизвестная ошибка",
            data
          );
        }
      } catch (err) {
        console.error("Ошибка при загрузке партнеров:", err);
        if (err instanceof Error) {
          console.error("Детали:", err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5">
            <div className="w-full h-full border-[1px] border-blue-500 rounded-full scale-110"></div>
            <div className="w-full h-full border-[1px] border-blue-500 rounded-full scale-125 absolute top-0"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0A84FF] rounded-full text-xs font-bold mb-6 border border-blue-100">
              <Zap size={14} fill="currentColor" />
              <span>ДОСТАВКА ЗА 7-22 МИНУТЫ</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold text-[#0D1B2A] leading-[1.1] mb-6">
              Дрон прилетит <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A84FF] to-[#6366F1]">
                раньше тапок
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              Сверхбыстрая доставка грузов до 25 кг по Астрахани и островам.
              Технологии AeroLink теперь у вашего окна.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onStart}
                className="px-8 py-4 bg-[#0A84FF] text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                Заказать за 30 сек
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white text-[#0D1B2A] rounded-2xl font-bold text-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0A84FF] group-hover:scale-110 transition-transform">
                  <Play size={14} fill="currentColor" />
                </div>
                Как это работает
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Main Drone Visual Placeholder */}
            <div className="relative z-10 transform hover:rotate-2 transition-transform duration-700">
              <div className="w-[500px] h-[350px] bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm rounded-[40px] border border-white/40 shadow-2xl flex items-center justify-center p-8">
                <div className="text-center">
                  <Navigation
                    className="mx-auto text-[#0A84FF] rotate-45 mb-4 animate-bounce"
                    size={80}
                    strokeWidth={1}
                  />
                  <p className="font-mono text-sm text-[#0D1B2A]/40 uppercase tracking-widest">
                    AeroNest Delta-25 v1.0
                  </p>
                </div>
              </div>
              {/* Float Cards */}
              <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-pulse">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Статус груза
                </p>
                <p className="text-sm font-bold text-[#10B981]">В ПОЛЕТЕ</p>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Скорость ветра
                    </p>
                    <p className="text-sm font-bold text-[#0D1B2A]">
                      3.2 м/с — Оптимально
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Slider */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-12">
            Нам доверяют лучшие
          </p>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              {partners.map((partner) => {
                try {
                  const cooperationDate =
                    typeof partner.cooperationDate === "string"
                      ? new Date(partner.cooperationDate)
                      : partner.cooperationDate instanceof Date
                      ? partner.cooperationDate
                      : new Date(partner.cooperationDate);

                  const yearsOfCooperation =
                    (new Date().getTime() - cooperationDate.getTime()) /
                    (1000 * 60 * 60 * 24 * 365);

                  return (
                    <div
                      key={partner.id}
                      className="group relative bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 mb-4 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200 group-hover:scale-110 transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              partner.image || "https://via.placeholder.com/64"
                            }
                            alt={partner.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/64";
                            }}
                          />
                        </div>
                        <h3 className="font-bold text-lg text-[#0D1B2A] mb-1">
                          {partner.name}
                        </h3>
                        {yearsOfCooperation >= 1 && (
                          <p className="text-xs text-gray-500">
                            {Math.floor(yearsOfCooperation)}{" "}
                            {Math.floor(yearsOfCooperation) === 1
                              ? "год"
                              : Math.floor(yearsOfCooperation) < 5
                              ? "года"
                              : "лет"}{" "}
                            сотрудничества
                          </p>
                        )}
                      </div>
                      {yearsOfCooperation >= 3 && (
                        <div className="absolute top-2 right-2">
                          <ShieldCheck
                            className="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                          />
                        </div>
                      )}
                    </div>
                  );
                } catch (error) {
                  console.error(
                    "Ошибка при рендеринге партнера:",
                    partner,
                    error
                  );
                  return (
                    <div
                      key={partner.id}
                      className="group relative bg-white p-6 rounded-2xl border border-gray-200"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 mb-4 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              partner.image || "https://via.placeholder.com/64"
                            }
                            alt={partner.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-bold text-lg text-[#0D1B2A]">
                          {partner.name}
                        </h3>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>Партнеры не найдены</p>
              <p className="text-xs mt-2">Проверьте консоль для деталей</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0D1B2A] mb-4">
              Почему AeroLink?
            </h2>
            <p className="text-gray-500">
              Доставка будущего, доступная в Астрахани уже сегодня.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Безопасно",
                desc: "Двойное резервирование систем и парашют для каждого груза.",
              },
              {
                icon: Zap,
                title: "Молниеносно",
                desc: "Забудьте о пробках. 7–22 минуты в любую точку города.",
              },
              {
                icon: Leaf,
                title: "Экологично",
                desc: "Полностью электрический флот. Ноль выбросов CO2.",
              },
              {
                icon: Activity,
                title: "Прозрачно",
                desc: "Следите за дроном в реальном времени через AeroOS.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group"
              >
                <div className="w-14 h-14 bg-blue-50 text-[#0A84FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

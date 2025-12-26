"use client";

import {
  Zap,
  Navigation,
  Package,
  Code,
  Truck,
  Building2,
  Timer,
  DollarSign,
  Leaf,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface ServiceCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
}

function ServiceCard({ icon: Icon, title, desc }: ServiceCardProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
        <Icon size={24} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-black mb-3 tracking-tighter">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

interface CompareRowProps {
  label: string;
  drone: string;
  car: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  highlighted?: boolean;
}

function CompareRow({
  label,
  drone,
  car,
  icon: Icon,
  highlighted,
}: CompareRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-6 rounded-2xl ${
        highlighted ? "bg-blue-600/20" : "bg-white/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className="text-blue-400" />
        <span className="text-white/80 font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-white font-black text-lg">{drone}</p>
          <p className="text-white/40 text-xs">Дрон</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 font-bold">{car}</p>
          <p className="text-white/30 text-xs">Авто</p>
        </div>
      </div>
    </div>
  );
}

interface VacancyRowProps {
  title: string;
  salary: string;
  type: string;
  requirements: string;
}

function VacancyRow({ title, salary, type, requirements }: VacancyRowProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all flex justify-between items-center">
      <div>
        <h3 className="text-lg font-black mb-2 tracking-tighter">{title}</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-600 font-bold">{salary}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{type}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{requirements}</span>
        </div>
      </div>
      <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
        Откликнуться
      </button>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Услуги */}
      <section id="services" className="py-32 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tighter mb-4">
              Услуги для вашего роста
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Мы берем на себя всю логистику «последней мили», чтобы вы могли
              сосредоточиться на продукте.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              icon={Package}
              title="Доставка партнеров"
              desc="Заказ через ваш сайт → дрон вылетает через 60 секунд. Полная автоматизация."
            />
            <ServiceCard
              icon={Code}
              title="API и Webhooks"
              desc="Управляйте логистикой программно. Статусы, трекинг и счета в вашей CRM."
            />
            <ServiceCard
              icon={Truck}
              title="Выделенный флот"
              desc="Аренда брендированного дрона и пилота на смену. Идеально для крупных сетей."
            />
            <ServiceCard
              icon={Building2}
              title="B2G Решения"
              desc="Срочная доставка анализов, документов и медикаментов госструктурам."
            />
          </div>
        </div>
      </section>

      {/* Сравнение ROI */}
      <section id="compare" className="py-32 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0F172A] rounded-[50px] p-12 text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[120px]"></div>
            <h2 className="text-3xl font-black mb-12 text-center">
              Почему AeroLink выгоднее?
            </h2>

            <div className="space-y-4">
              <CompareRow
                label="Среднее время"
                drone="12 минут"
                car="45–60 минут"
                icon={Timer}
              />
              <CompareRow
                label="Стоимость заказа"
                drone="от ₽75"
                car="от ₽180"
                icon={DollarSign}
              />
              <CompareRow
                label="CO₂ выбросы"
                drone="12 г"
                car="210 г"
                icon={Leaf}
              />
              <CompareRow
                label="Конверсия"
                drone="+24%"
                car="База"
                icon={TrendingUp}
                highlighted
              />
            </div>
          </div>
        </div>
      </section>

      {/* Офис в Астрахани */}
      <section className="py-32 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <div
              className="h-64 bg-gray-200 rounded-3xl bg-cover bg-center shadow-lg"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600)",
              }}
            ></div>
            <div
              className="h-64 bg-gray-200 rounded-3xl mt-8 bg-cover bg-center shadow-lg"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600)",
              }}
            ></div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-black mb-6 tracking-tighter">
              Наш дом — Астрахань.
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Мы не стартап-фантом. Наш R&D центр и ангар площадью 1200 м²
              находятся в сердце Каспийской столицы. Здесь мы проектируем рамы,
              печатаем компоненты на 3D-принтерах и обучаем нейросети для
              навигации в условиях степного ветра.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-black text-blue-600">1.2к м²</p>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Лаборатория
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-blue-600">24/7</p>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Мониторинг
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Вакансии */}
      <section id="vacancies" className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-4">
                Присоединяйтесь к команде
              </h2>
              <p className="text-gray-500">
                Мы ищем тех, кто готов менять реальность, а не просто писать
                код.
              </p>
            </div>
            <button className="text-blue-600 font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase text-xs tracking-widest">
              Все вакансии <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid gap-4">
            <VacancyRow
              title="Middle+ Full-stack Developer"
              salary="от ₽120 000"
              type="Гибрид"
              requirements="Next.js, Drizzle, TS"
            />
            <VacancyRow
              title="FPV-пилот (2 позиции)"
              salary="от ₽85 000+"
              type="Смены 8/2"
              requirements="Лицензия РПВС, опыт полётов"
            />
            <VacancyRow
              title="SEO / Product Marketer"
              salary="от ₽90 000"
              type="Офис (Астрахань)"
              requirements="Аналитика, продвижение B2B"
            />
            <VacancyRow
              title="Механик-конструктор"
              salary="от ₽100 000"
              type="R&D Центр"
              requirements="Ремонт дронов, SolidWorks"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

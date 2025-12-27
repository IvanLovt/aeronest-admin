"use client";

import { useState } from "react";
import { Search, Plus, Loader2, Copy, Check } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";

interface Referral {
  id: string;
  refCode: string;
  userId: string;
  referredUserId: string | null;
  date: string;
  conditions: string | null;
  maxUses: string | null;
  usesCount: number;
  createdAt: string;
  updatedAt: string;
  ownerEmail: string | null;
  ownerName: string | null;
  referredEmail: string | null;
  referredName: string | null;
}

export default function ReferalOption() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    refCode: "",
    userId: "",
    conditions: "",
    maxUses: "",
  });

  const {
    data,
    loading,
    error: fetchError,
    refetch,
  } = useFetch<{
    referrals: Referral[];
  }>({
    url: "/api/admin/referrals",
  });

  const referrals: Referral[] = Array.isArray(
    (data as { referrals?: Referral[] })?.referrals
  )
    ? (data as { referrals: Referral[] }).referrals
    : Array.isArray(data)
    ? (data as Referral[])
    : [];

  // Фильтрация по поисковому запросу
  const filteredReferrals = referrals.filter((referral) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      referral.refCode.toLowerCase().includes(query) ||
      referral.ownerEmail?.toLowerCase().includes(query) ||
      referral.ownerName?.toLowerCase().includes(query) ||
      referral.userId.toLowerCase().includes(query) ||
      referral.referredEmail?.toLowerCase().includes(query) ||
      referral.referredName?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refCode: formData.refCode.trim(),
          userId: formData.userId.trim(),
          conditions: formData.conditions.trim() || null,
          maxUses: formData.maxUses.trim() || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Реферальный код успешно создан!");
        setFormData({
          refCode: "",
          userId: "",
          conditions: "",
          maxUses: "",
        });
        setIsModalOpen(false);
        refetch();
      } else {
        setError(result.error || "Ошибка при создании реферального кода");
      }
    } catch (err) {
      console.error("Ошибка при создании реферального кода:", err);
      setError("Не удалось создать реферальный код");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Ошибка при копировании:", err);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 font-bold">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          Управление реферальными кодами
        </h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              size={18}
            />
            <input
              type="text"
              placeholder="Поиск по коду, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500 outline-none w-64 text-sm transition-all text-white placeholder:text-white/30"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-500 rounded-xl font-bold text-sm text-white shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-600 transition-all"
          >
            <Plus size={18} />
            Создать код
          </button>
        </div>
      </div>

      {/* Уведомления */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <p className="text-green-400 font-bold">{success}</p>
        </div>
      )}

      {/* Таблица реферальных кодов */}
      <div className="bg-[#141f3a] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0F172A]">
            <tr className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              <th className="px-8 py-6">Реферальный код</th>
              <th className="px-8 py-6">Владелец</th>
              <th className="px-8 py-6">Приглашенный</th>
              <th className="px-8 py-6">Использования</th>
              <th className="px-8 py-6">Условия</th>
              <th className="px-8 py-6">Дата регистрации</th>
              <th className="px-8 py-6">Создан</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-12 text-center">
                  <p className="text-white/50 font-bold">
                    {searchQuery
                      ? "Реферальные коды не найдены"
                      : "Реферальных кодов пока нет"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => (
                <tr
                  key={referral.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400">
                        {referral.refCode}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(referral.refCode, referral.id)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      >
                        {copiedId === referral.id ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} className="text-white/50" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {referral.ownerName || "Неизвестно"}
                      </div>
                      <div className="text-xs text-white/30">
                        {referral.ownerEmail || referral.userId.slice(-8)}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {referral.referredUserId ? (
                      <div>
                        <div className="font-bold text-sm text-white">
                          {referral.referredName || "Неизвестно"}
                        </div>
                        <div className="text-xs text-white/30">
                          {referral.referredEmail ||
                            referral.referredUserId.slice(-8)}
                        </div>
                        <div className="text-[10px] text-white/20 mt-1">
                          {formatDate(referral.date)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/30 text-sm">
                        Не использован
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-bold text-white">
                        {referral.usesCount}
                        {referral.maxUses ? ` / ${referral.maxUses}` : " / ∞"}
                      </div>
                      {referral.maxUses &&
                        parseInt(referral.maxUses, 10) <=
                          referral.usesCount && (
                          <span className="text-[10px] text-red-400">
                            Лимит достигнут
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-white/60 max-w-xs truncate">
                      {referral.conditions || "—"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {referral.referredUserId ? (
                      <div className="text-xs text-white/50">
                        {formatDate(referral.date)}
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-white/50">
                      {formatDate(referral.createdAt)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно для создания реферального кода */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-[#141f3a] rounded-[40px] border border-white/10 shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Создать реферальный код
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">
                  Реферальный код *
                </label>
                <input
                  type="text"
                  value={formData.refCode}
                  onChange={(e) =>
                    setFormData({ ...formData, refCode: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white placeholder:text-white/30"
                  placeholder="Например: REF123456"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">
                  ID пользователя (владелец кода) *
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white placeholder:text-white/30"
                  placeholder="Введите ID пользователя"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">
                  Максимальное количество использований (необязательно)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white placeholder:text-white/30"
                  placeholder="Оставьте пустым для неограниченного использования"
                />
                <p className="text-xs text-white/40 mt-1">
                  Если не указано, код можно использовать неограниченное
                  количество раз
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/70 mb-2">
                  Условия (необязательно)
                </label>
                <textarea
                  value={formData.conditions}
                  onChange={(e) =>
                    setFormData({ ...formData, conditions: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white placeholder:text-white/30 resize-none"
                  placeholder="Описание условий использования кода"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 rounded-xl font-bold text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Создание...
                    </>
                  ) : (
                    "Создать"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

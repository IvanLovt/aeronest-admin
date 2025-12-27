"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useFetch } from "@/hooks/useFetch";

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  ordersCount: number;
  userLevel: number;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { data, loading, error, refetch } = useFetch<{ users: User[] }>({
    url: "/api/admin/users",
  });

  const users: User[] = Array.isArray((data as { users?: User[] })?.users)
    ? (data as { users: User[] }).users
    : Array.isArray(data)
    ? (data as User[])
    : [];

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  const formatBalance = (balance: number) => {
    return balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({
      userId: user.id,
      userName: user.name || user.email,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${deleteConfirm.userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка при удалении пользователя");
      }

      // Обновляем список пользователей
      refetch();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Ошибка при удалении пользователя"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 font-bold">{error}</p>
      </div>
    );
  }

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <th className="px-8 py-6">Email</th>
              <th className="px-8 py-6">Роль</th>
              <th className="px-8 py-6 text-center">Заказов</th>
              <th className="px-8 py-6">Баланс</th>
              <th className="px-8 py-6">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center">
                  <p className="text-white/50 font-bold">
                    {searchQuery
                      ? "Пользователи не найдены"
                      : "Пользователей пока нет"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                        {user.name[0]?.toUpperCase() ||
                          user.email[0]?.toUpperCase() ||
                          "?"}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-white/20 font-mono mt-1">
                          ID: {user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-white/80 font-medium">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        user.role === "ADMIN"
                          ? "border-purple-500/30 text-purple-400 bg-purple-500/5"
                          : user.role === "VIP"
                          ? "border-orange-500/30 text-orange-400 bg-orange-500/5"
                          : "border-white/10 text-white/50"
                      }`}
                    >
                      {user.role}
                    </span>
                    <div className="text-[10px] text-white/30 mt-1">
                      Уровень {user.userLevel}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-mono font-bold text-blue-400">
                    {user.ordersCount}
                  </td>
                  <td className="px-8 py-6 font-mono font-bold tracking-tight text-white">
                    ₽{formatBalance(user.balance)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/50 transition-all text-white">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-red-500/50 transition-all text-red-400 hover:bg-red-500/10"
                        title="Удалить пользователя"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141f3a] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="text-red-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Подтверждение удаления
                </h3>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-white/70 mb-6">
              Вы уверены, что хотите удалить пользователя{" "}
              <span className="font-bold text-white">
                {deleteConfirm.userName}
              </span>
              ? Это действие нельзя отменить. Все связанные данные (заказы,
              адреса) также будут удалены.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all text-red-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Удаление...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Удалить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

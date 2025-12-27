"use client";

import { useState } from "react";
import { MapPin, Plus, Edit, Trash2, Loader2, Star } from "lucide-react";
import { useFetchWithAuth } from "@/hooks/useFetchWithAuth";
import AddAddress from "./AddAdress";

interface Address {
  id: string;
  title: string;
  street: string;
  building: string | null;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  comment: string | null;
  coords: number[] | null;
  isDefault: boolean;
  createdAt: string;
}

export default function TableOrder() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    street: "",
    building: "",
    entrance: "",
    floor: "",
    apartment: "",
    comment: "",
    isDefault: false,
  });

  const {
    data,
    loading,
    error: fetchError,
    refetch,
  } = useFetchWithAuth<{
    addresses: Address[];
  }>({
    url: "/api/user/addresses",
  });

  // Используем ошибку из fetch или локальную ошибку
  const displayError = error || fetchError;

  const addresses: Address[] = Array.isArray(
    (data as { addresses?: Address[] })?.addresses
  )
    ? (data as { addresses: Address[] }).addresses
    : Array.isArray(data)
    ? (data as Address[])
    : [];

  const formatAddress = (address: Address) => {
    const parts = [address.street];
    if (address.building) parts.push(`д. ${address.building}`);
    if (address.entrance) parts.push(`подъезд ${address.entrance}`);
    if (address.floor) parts.push(`эт. ${address.floor}`);
    if (address.apartment) parts.push(`кв. ${address.apartment}`);
    return parts.join(", ");
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.street.trim()) {
      setError("Название и улица обязательны для заполнения");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          coords: [0, 0], // Дефолтные координаты (можно улучшить с геокодингом)
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем список адресов
        refetch();
        // Закрываем модальное окно и сбрасываем форму
        setIsModalOpen(false);
        setFormData({
          title: "",
          street: "",
          building: "",
          entrance: "",
          floor: "",
          apartment: "",
          comment: "",
          isDefault: false,
        });
      } else {
        setError(data.error || "Ошибка при добавлении адреса");
      }
    } catch (err) {
      console.error("Ошибка при добавлении адреса:", err);
      setError("Не удалось добавить адрес");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот адрес?")) {
      return;
    }

    try {
      setDeletingId(addressId);
      setError(null);

      console.log("🗑️ Отправка запроса на удаление адреса:", addressId);

      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      });

      console.log("📡 Ответ сервера:", response.status, response.statusText);

      const data = await response.json();
      console.log("📦 Данные ответа:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        // Обновляем список адресов
        refetch();
        console.log("✅ Адрес успешно удален из списка");
      } else {
        setError(data.error || "Ошибка при удалении адреса");
      }
    } catch (err) {
      console.error("❌ Ошибка при удалении адреса:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось удалить адрес";
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A84FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Отображение ошибки как уведомление */}
      {displayError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-red-800 font-bold mb-1">Ошибка</h3>
              <p className="text-red-700 text-sm">{displayError}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
              }}
              className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Заголовок и кнопка добавления */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#0D1B2A]">Мои адреса</h2>
          <p className="text-gray-500 mt-1">Управляйте адресами доставки</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#0A84FF] text-white rounded-2xl font-bold hover:bg-[#0971d1] transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          Добавить адрес
        </button>
      </div>

      {/* Список адресов */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-[#0D1B2A] mb-2">
            Адресов пока нет
          </h3>
          <p className="text-gray-500 mb-6">
            Добавьте адрес доставки для быстрого оформления заказов
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#0A84FF] text-white rounded-xl font-bold hover:bg-[#0971d1] transition-all"
          >
            Добавить первый адрес
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 pb-[500px]">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {address.isDefault && (
                    <Star
                      size={18}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  )}
                  <h3 className="text-lg font-bold text-[#0D1B2A]">
                    {address.title}
                  </h3>
                </div>
                {address.isDefault && (
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold">
                    По умолчанию
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3 mb-4">
                <MapPin size={20} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[#0D1B2A] font-medium">
                    {formatAddress(address)}
                  </p>
                  {address.comment && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {address.comment}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0A84FF] transition-colors">
                  <Edit size={16} />
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === address.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
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
          ))}
        </div>
      )}

      {/* Модальное окно для добавления адреса */}
      <AddAddress
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formData={formData}
        setFormData={setFormData}
        handleAddAddress={handleAddAddress}
        isSubmitting={isSubmitting}
        setError={setError}
      />
    </div>
  );
}

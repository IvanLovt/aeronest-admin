"use client";

import { X, Loader2 } from "lucide-react";

interface AddAddressProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  formData: {
    title: string;
    street: string;
    building: string;
    entrance: string;
    floor: string;
    apartment: string;
    comment: string;
    isDefault: boolean;
  };
  setFormData: (data: {
    title: string;
    street: string;
    building: string;
    entrance: string;
    floor: string;
    apartment: string;
    comment: string;
    isDefault: boolean;
  }) => void;
  handleAddAddress: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  setError: (error: string | null) => void;
}

export default function AddAddress({
  isModalOpen,
  setIsModalOpen,
  formData,
  setFormData,
  handleAddAddress,
  isSubmitting,
  setError,
}: AddAddressProps) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-[#0D1B2A]">
            Добавить новый адрес
          </h3>
          <button
            onClick={() => {
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
              setError(null);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleAddAddress} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
              Название адреса <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Например: Дом, Офис"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
              Улица <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder="Название улицы"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
                Дом
              </label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
                placeholder="Номер дома"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
                Квартира
              </label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) =>
                  setFormData({ ...formData, apartment: e.target.value })
                }
                placeholder="Номер квартиры"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
                Подъезд
              </label>
              <input
                type="text"
                value={formData.entrance}
                onChange={(e) =>
                  setFormData({ ...formData, entrance: e.target.value })
                }
                placeholder="Номер подъезда"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
                Этаж
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder="Номер этажа"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0D1B2A] mb-2">
              Комментарий
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              placeholder="Дополнительная информация для курьера"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0A84FF] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="w-4 h-4 text-[#0A84FF] border-gray-300 rounded focus:ring-[#0A84FF]"
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium text-[#0D1B2A] cursor-pointer"
            >
              Сделать адресом по умолчанию
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
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
                setError(null);
              }}
              className="flex-1 px-6 py-3 border border-gray-200 text-[#0D1B2A] rounded-xl font-bold hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#0A84FF] text-white rounded-xl font-bold hover:bg-[#0971d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Добавление...
                </>
              ) : (
                "Добавить адрес"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, MinusCircle, ShoppingBag, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import ItemCart from "./ItemCart";

interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  count: number;
  ves: number;
}

interface WindowCartProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
  catalogId?: string;
}

interface Item {
  id: string;
  name: string;
  price: string;
  ves: string;
}

export default function WindowCart({
  isOpen,
  onClose,
  partnerName = "Партнер",
  catalogId,
}: WindowCartProps) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Загружаем товары из БД при открытии модального окна
  useEffect(() => {
    if (isOpen && catalogId) {
      const fetchItems = async () => {
        setItemsLoading(true);
        try {
          const response = await fetch(`/api/items?catalogId=${catalogId}`);
          const data = await response.json();

          if (data.success && data.data) {
            setItems(data.data);
          } else {
            console.error("Ошибка загрузки товаров:", data.error);
            setItems([]);
          }
        } catch (error) {
          console.error("Ошибка при загрузке товаров:", error);
          setItems([]);
        } finally {
          setItemsLoading(false);
        }
      };

      fetchItems();
    } else if (isOpen && !catalogId) {
      // Если catalogId не передан, очищаем товары
      setItems([]);
    }
  }, [isOpen, catalogId]);

  const addToCart = (item: Omit<CartItem, "count">) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, count: cartItem.count + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, count: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === itemId);
      if (existingItem && existingItem.count > 1) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, count: item.count - 1 } : item
        );
      }
      return prevCart.filter((item) => item.id !== itemId);
    });
  };

  const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
  const totalVes = cart.reduce((sum, item) => sum + item.ves * item.count, 0);
  const basePrice = cart.reduce(
    (sum, item) => sum + item.price * item.count,
    0
  );

  // Проверяем перевес (больше 24 кг = 24000 г)
  const isOverweight = totalVes > 24000;
  const overweightFee = isOverweight ? basePrice * 0.2 : 0;
  const totalPrice = basePrice + overweightFee;

  // Форматируем вес для отображения
  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} кг`;
    }
    return `${grams} г`;
  };

  const handleSubmit = async () => {
    if (cart.length === 0 || !address) return;

    setError(null);
    setLoading(true);

    try {
      // Получаем текущий баланс
      const balanceResponse = await fetch("/api/user/balance");
      const balanceData = await balanceResponse.json();

      if (!balanceData.success) {
        setError("Ошибка при получении баланса");
        setLoading(false);
        return;
      }

      const currentBalance = parseFloat(balanceData.balance || "0");

      // Проверяем достаточность средств
      if (currentBalance < totalPrice) {
        setError("Пополните баланс");
        setLoading(false);
        return;
      }

      // Списание средств
      const deductResponse = await fetch("/api/user/balance/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const deductData = await deductResponse.json();

      if (!deductData.success) {
        if (deductData.error === "Недостаточно средств") {
          setError("Пополните баланс");
        } else {
          setError(deductData.error || "Ошибка при списании средств");
        }
        setLoading(false);
        return;
      }

      // Создаем заказ в БД
      if (!session?.user?.id) {
        setError("Ошибка: пользователь не авторизован");
        setLoading(false);
        return;
      }

      const createOrderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            weight: item.weight,
            ves: item.ves,
            count: item.count,
          })),
          amount: totalPrice,
          deliveryTime,
        }),
      });

      const createOrderData = await createOrderResponse.json();

      if (!createOrderData.success) {
        console.error("Ошибка при создании заказа:", createOrderData.error);
        setError(
          createOrderData.error ||
            "Ошибка при создании заказа. Средства списаны."
        );
        setLoading(false);
        return;
      }

      // Заказ успешно оформлен
      console.log("Заказ отправлен:", {
        orderId: createOrderData.orderId,
        cart,
        address,
        deliveryTime,
        totalPrice,
        newBalance: deductData.newBalance,
      });

      // Очистка формы после отправки
      setCart([]);
      setAddress("");
      setDeliveryTime("");
      setError(null);
      onClose();
    } catch (err) {
      console.error("Ошибка при оформлении заказа:", err);
      setError("Ошибка при оформлении заказа. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 flex justify-between items-center border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-black tracking-tighter">
              Оформление доставки
            </h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {partnerName} • Экспресс
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
          {/* Form Side */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Адрес доставки
              </label>
              <input
                type="text"
                placeholder="ул. Адмиралтейская, 1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Время доставки
              </label>
              <input
                type="time"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Доступные товары
              </label>
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ItemCart items={items} onAddToCart={addToCart} />
              )}
            </div>
          </div>

          {/* Summary Side */}
          <div className="bg-blue-50/50 rounded-3xl p-6 h-fit sticky top-0">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShoppingBag size={16} /> Ваш заказ
            </h4>

            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold py-8 text-center uppercase tracking-widest">
                Корзина пуста
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-black border border-blue-100">
                        x{item.count}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">
                        ₽{item.price * item.count}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <MinusCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-blue-100 pt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Предметов:</span>
                <span>{totalCount} шт.</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Вес:</span>
                <span>{formatWeight(totalVes)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Время полета:</span>
                <span>~12 минут</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Стоимость товаров:</span>
                <span>₽{basePrice}</span>
              </div>
              {isOverweight && (
                <div className="flex justify-between text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                  <span>Доплата за перевес (+20%):</span>
                  <span>+₽{Math.round(overweightFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black uppercase">Итого:</span>
                <span className="text-xl font-black text-blue-600 tracking-tighter">
                  ₽{Math.round(totalPrice)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <p className="text-sm font-bold text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={cart.length === 0 || !address || loading}
              className="w-full mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
            >
              {loading ? "Обработка..." : "Запустить дрон"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

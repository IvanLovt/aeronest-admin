"use client";

import { PlusCircle } from "lucide-react";

interface Item {
  id: string;
  name: string;
  price: string;
  ves: string;
}

interface ItemCartProps {
  items: Item[];
  onAddToCart: (item: {
    id: string;
    name: string;
    price: number;
    weight: string;
    ves: number;
  }) => void;
}

export default function ItemCart({ items, onAddToCart }: ItemCartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Товары не найдены
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div>
            <p className="text-sm font-bold leading-none">{item.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
              ₽{item.price} • {item.ves}г
            </p>
          </div>
          <button
            onClick={() =>
              onAddToCart({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                weight: `${item.ves}г`,
                ves: parseFloat(item.ves),
              })
            }
            className="text-blue-600 hover:scale-110 transition-transform"
          >
            <PlusCircle size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}

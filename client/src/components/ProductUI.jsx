import { useState } from "react";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useStore } from "../store.jsx";


export function ProductImage({ p, className = "", emojiClass = "text-7xl", mode = "fit" }) {
  const [failed, setFailed] = useState(false);
  if (failed || !p.image) return <span className={emojiClass}>{p.emoji || "📦"}</span>;

  if (mode === "fill")
    return (
      <img
        src={p.image}
        alt={p.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    );

  return (
    <>
      <img
        src={p.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-lg"
      />
      <img
        src={p.image}
        alt={p.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-contain ${className}`}
      />
    </>
  );
}

export function Stars({ value, size = 14 }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
      ))}
    </span>
  );
}


export function AddToCart({ product, large = false }) {
  const { cart, addToCart, changeQty } = useStore();
  const qty = cart.find((i) => i.id === product.id)?.qty || 0;
  const size = large ? "h-12 w-48 text-base" : "h-9 w-24 text-sm";

  if (qty === 0)
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
        }}
        className={`flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 font-medium text-white hover:bg-indigo-700 active:scale-95 ${size}`}
      >
        <ShoppingCart size={large ? 20 : 16} /> {large ? "Add to Cart" : "Add"}
      </button>
    );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center overflow-hidden rounded-lg border border-indigo-600 text-indigo-600 ${size}`}
    >
      <button
        onClick={() => changeQty(product.id, -1)}
        aria-label="Decrease quantity"
        className="flex h-full flex-1 items-center justify-center hover:bg-indigo-50"
      >
        <Minus size={large ? 18 : 14} />
      </button>
      <span className="w-8 text-center font-semibold">{qty}</span>
      <button
        onClick={() => changeQty(product.id, 1)}
        aria-label="Increase quantity"
        className="flex h-full flex-1 items-center justify-center hover:bg-indigo-50"
      >
        <Plus size={large ? 18 : 14} />
      </button>
    </div>
  );
}
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "../store.jsx";
import { ProductImage } from "../components/ProductUI.jsx";

export default function Cart() {
  const { auth, cart, changeQty, removeItem, cartTotal } = useStore();
  const navigate = useNavigate();

  if (!cart.length)
    return (
      <p className="py-20 text-center text-slate-500">
        Your cart is empty.{" "}
        <Link to="/" className="text-indigo-600 underline">
          Go shopping
        </Link>
      </p>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Your Cart</h1>

      <div className="divide-y rounded-xl border bg-white">
        {cart.map((i) => (
          <div key={i.id} className="flex items-center gap-3 p-3">
            <Link
              to={`/product/${i.id}`}
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100"
            >
              <ProductImage p={i} emojiClass="text-3xl" />
            </Link>
            <div className="flex-1">
              <Link to={`/product/${i.id}`} className="font-medium hover:text-indigo-600">
                {i.name}
              </Link>
              <p className="text-sm text-slate-500">₹{i.price.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => changeQty(i.id, -1)} aria-label="Decrease quantity" className="rounded border p-1">
                <Minus size={14} />
              </button>
              <span className="w-5 text-center">{i.qty}</span>
              <button onClick={() => changeQty(i.id, 1)} aria-label="Increase quantity" className="rounded border p-1">
                <Plus size={14} />
              </button>
            </div>
            <button onClick={() => removeItem(i.id)} aria-label="Remove item" className="text-rose-500">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border bg-white p-4">
        <span className="text-lg font-bold">Total: ₹{cartTotal.toLocaleString("en-IN")}</span>
        <button
          onClick={() => navigate(auth ? "/checkout" : "/login")}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          {auth ? "Proceed to Checkout" : "Login to checkout"}
        </button>
      </div>
    </div>
  );
}
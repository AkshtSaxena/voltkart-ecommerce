import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "../store.jsx";

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="toast-in fixed left-1/2 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg"
    >
      <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-slate-800">Product added to cart successfully</p>
        <p className="truncate text-slate-500">{toast.text}</p>
      </div>
      <Link to="/cart" className="shrink-0 text-sm font-medium text-indigo-600 hover:underline">
        View cart
      </Link>
    </div>
  );
}